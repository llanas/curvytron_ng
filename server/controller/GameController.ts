import { Collection } from '@shared/collection';
import { ServerSocketClient } from 'core/ServerSocketClient';
import { SocketGroup } from 'core/SocketGroup';
import { Avatar } from 'models/Avatar';
import { AvatarBody } from 'models/AvatarBody';
import { Bonus } from 'models/bonus/Bonus';
import { Game } from 'models/Game';
import { Player } from 'models/Player';

/**
 * Game Controller
 */
export class GameController {

    /**
     * Waiting time
     */
    static waitingTime = 30000;

    game: Game;

    clients: Collection<ServerSocketClient>;
    socketGroup: SocketGroup;
    compressor: any;
    waiting: any;
    callbacks: { onReady(): void; onMove(data: any): void; onSpeeding(data: any): void; };

    constructor(game: Game) {


        this.game = game;
        this.clients = new Collection();
        this.socketGroup = new SocketGroup(this.clients);
        this.compressor = new Compressor();
        this.waiting = null;

        const controller = this;
        this.callbacks = {
            onReady() { controller.onReady(this); },
            onMove(data) { controller.onMove(this, data); },
            onSpeeding(data) { controller.onSpeeding(this, data); }
        };

        this.loadGame();
    }

    /**
     * Load game
     */
    loadGame() {

        this.game.on('game:start', this.onGameStart);
        this.game.on('game:stop', this.onGameStop);
        this.game.on('end', this.onEnd);
        this.game.on('clear', this.onClear);
        this.game.on('player:leave', this.onPlayerLeave);
        this.game.on('round:new', this.onRoundNew);
        this.game.on('round:end', this.onRoundEnd);
        this.game.on('borderless', this.onBorderless);
        this.game.bonusManager.on('bonus:pop', this.onBonusPop);
        this.game.bonusManager.on('bonus:clear', this.onBonusClear);

        for (let i = this.game.room.controller.clients.items.length - 1; i >= 0; i--) {
            this.attach(this.game.room.controller.clients.items[i]);
        }

        this.waiting = setTimeout(this.stopWaiting, GameController.waitingTime);
    }

    waitingTime(): number {
        throw new Error('Method not implemented.');
    }

    /**
     * Remove game
     */
    unloadGame() {
        this.game.removeListener('game:start', this.onGameStart);
        this.game.removeListener('game:stop', this.onGameStop);
        this.game.removeListener('end', this.onEnd);
        this.game.removeListener('clear', this.onClear);
        this.game.removeListener('player:leave', this.onPlayerLeave);
        this.game.removeListener('round:new', this.onRoundNew);
        this.game.removeListener('round:end', this.onRoundEnd);
        this.game.removeListener('borderless', this.onBorderless);
        this.game.bonusManager.removeListener('bonus:pop', this.onBonusPop);
        this.game.bonusManager.removeListener('bonus:clear', this.onBonusClear);

        for (let i = this.clients.items.length - 1; i >= 0; i--) {
            this.detach(this.clients.items[i]);
        }
    }

    /**
     * Attach events
     */
    attach(client: ServerSocketClient) {
        if (this.clients.add(client)) {
            this.attachEvents(client);
            this.socketGroup.addEvent('game:spectators', this.countSpectators());
            client.pingLogger.start();
        }
    }

    /**
     * Attach events
     */
    detach(client: ServerSocketClient) {
        this.detachEvents(client);
        if (this.clients.remove(client)) {
            for (let i = client.players.items.length - 1; i >= 0; i--) {
                if (client.players.items[i].avatar) {
                    this.game.removeAvatar(client.players.items[i].avatar);
                }
            }
            this.socketGroup.addEvent('game:spectators', this.countSpectators());
            client.pingLogger.stop();
        }
    }

    /**
     * Detach events
     */
    attachEvents(client: ServerSocketClient) {
        client.on('ready', this.callbacks.onReady);
        if (!client.players.isEmpty()) {
            client.on('player:move', this.callbacks.onMove);
            client.on('player:speeding', this.callbacks.onSpeeding);
        }
        for (let avatar, i = client.players.items.length - 1; i >= 0; i--) {
            avatar = client.players.items[i].getAvatar();
            avatar.on('die', this.onDie);
            avatar.on('position', this.onPosition);
            avatar.on('angle', this.onAngle);
            avatar.on('point', this.onPoint);
            avatar.on('score', this.onScore);
            avatar.on('score:round', this.onRoundScore);
            avatar.on('property', this.onProperty);
            avatar.bonusStack.on('change', this.onBonusStack);
        }
    }

    /**
     * Detach events
     */
    detachEvents(client: ServerSocketClient) {
        let avatar;
        client.removeListener('ready', this.callbacks.onReady);
        if (!client.players.isEmpty()) {
            client.removeListener('player:move', this.callbacks.onMove);
        }
        for (let i = client.players.items.length - 1; i >= 0; i--) {
            avatar = client.players.items[i].avatar;
            if (avatar) {
                avatar.removeListener('die', this.onDie);
                avatar.removeListener('position', this.onPosition);
                avatar.removeListener('point', this.onPoint);
                avatar.removeListener('score', this.onScore);
                avatar.removeListener('score:round', this.onRoundScore);
                avatar.removeListener('property', this.onProperty);
                avatar.bonusStack.removeListener('change', this.onBonusStack);
            }
        }
    }

    /**
     * Attach spectator
     */
    attachSpectator(client: ServerSocketClient) {
        const properties = {
            angle: 'angle',
            radius: 'radius',
            color: 'color',
            printing: 'printing',
            score: 'score'
        };
        const events: any[] = [];
        events.push(['spectate', {
            inRound: this.game.inRound,
            rendered: this.game.rendered ? true : false,
            maxScore: this.game.maxScore
        }]);

        let avatar: Avatar;
        let bonus;
        let i;
        for (i = this.game.avatars.items.length - 1; i >= 0; i--) {
            avatar = this.game.avatars.items[i];
            events.push(['position', [avatar.id, this.compressor.compress(avatar.x), this.compressor.compress(avatar.y)]]);
            for (const property in properties) {
                if (properties.hasOwnProperty(property)) {
                    events.push(['property', { avatar: avatar.id, property, value: avatar[properties[property]] }]);
                }
            }
            if (!avatar.alive) {
                events.push(['die', { avatar: avatar.id }]);
            }
        }
        if (this.game.inRound) {
            for (i = this.game.bonusManager.bonuses.items.length - 1; i >= 0; i--) {
                bonus = this.game.bonusManager.bonuses.items[i];
                events.push(['bonus:pop', [
                    bonus.id,
                    this.compressor.compress(bonus.x),
                    this.compressor.compress(bonus.y),
                    bonus.constructor.name
                ]]);
            }
        } else {
            this.socketGroup.addEvent('round:end', this.game.roundWinner ? this.game.roundWinner.id : null);
        }
        events.push(['game:spectators', this.countSpectators()]);
        client.addEvents(events);
    }

    /**
     * Count spectators
     */
    countSpectators(): number {
        return this.clients.filter(function () { return !this.isPlaying(); }).count();
    }

    /**
     * On game loaded
     */
    onReady(client: ServerSocketClient) {
        if (this.game.started) {
            this.attachSpectator(client);
        } else {
            for (let avatar: Avatar, i = client.players.items.length - 1; i >= 0; i--) {
                avatar = client.players.items[i].getAvatar();
                avatar.ready = true;
                this.socketGroup.addEvent('ready', avatar.id);
            }
            this.checkReady();
        }
    }

    /**
     * Check if all players are ready
     */
    checkReady() {
        if (this.game.isReady()) {
            this.waiting = clearTimeout(this.waiting);
            this.game.newRound();
        }
    }

    /**
     * On move
     */
    onMove(client: ServerSocketClient, { avatar, move }: { avatar: number, move: number }) {
        const player = client.players.getById(avatar);
        if (player && player.avatar) {
            player.avatar.updateAngularVelocity(move);
        }
    }

    /**
     * On move
     */
    onSpeeding(client: ServerSocketClient, { avatar, speeding }: { avatar: number, speeding: number }) {
        const player = client.players.getById(avatar);
        if (player && player.avatar) {
            player.avatar.updateSpeeding(speeding);
        }
    }

    /**
     * On player leave
     */
    onPlayerLeave(this: GameController, { player }: { player: Player }) {
        this.socketGroup.addEvent('game:leave', player.id);
    }

    /**
     * Stop waiting for loading players
     */
    stopWaiting(this: GameController) {
        if (this.waiting && !this.game.isReady()) {
            this.waiting = clearTimeout(this.waiting);

            const avatars = this.game.getLoadingAvatars();

            for (let i = avatars.items.length - 1; i >= 0; i--) {
                this.detach(avatars.items[i].player.client);
            }

            this.checkReady();
        }
    }

    /**
     * On point
     */
    onPoint(this: GameController, { avatar, important }: { avatar: Avatar, important: boolean }) {
        if (!!important) {
            this.socketGroup.addEvent('point', avatar.id);
        }
    }

    /**
     * On position
     */
    onPosition(this: GameController, avatar: Avatar) {
        this.socketGroup.addEvent('position', [
            avatar.id,
            this.compressor.compress(avatar.x),
            this.compressor.compress(avatar.y)
        ]);
    }

    /**
     * On angle
     */
    onAngle(this: GameController, avatar: Avatar) {
        this.socketGroup.addEvent('angle', [
            avatar.id,
            this.compressor.compress(avatar.angle)
        ]);
    }

    /**
     * On die
     */
    onDie(this: GameController, { avatar, killer }: { avatar: Avatar, killer: AvatarBody }) {
        this.socketGroup.addEvent('die', [
            avatar.id,
            killer ? killer.id : null,
            killer.isOld()
        ]);
    }

    /**
     * On bonus pop
     */
    onBonusPop(this: GameController, bonus: Bonus) {
        this.socketGroup.addEvent('bonus:pop', [
            bonus.id,
            this.compressor.compress(bonus.x),
            this.compressor.compress(bonus.y),
            bonus.constructor.name
        ]);
    }

    /**
     * On bonus clear
     */
    onBonusClear(this: GameController, bonus: Bonus) {
        this.socketGroup.addEvent('bonus:clear', bonus.id);
    }

    /**
     * On score
     */
    onScore(this: GameController, avatar: Avatar) {
        this.socketGroup.addEvent('score', [avatar.id, avatar.score]);
    }

    /**
     * On round score
     */
    onRoundScore(this: GameController, avatar: Avatar) {
        this.socketGroup.addEvent('score:round', [avatar.id, avatar.roundScore]);
    }

    /**
     * On property
     */
    onProperty(this: GameController, { avatar, property, value }: { avatar: Avatar, property: any, value: any }) {
        this.socketGroup.addEvent('property', [
            avatar.id,
            property,
            value
        ]);
    }

    /**
     * On bonus stack add
     */
    onBonusStack(this: GameController, { avatar, method, bonus }: { avatar: Avatar, method: any, bonus: Bonus }) {
        this.socketGroup.addEvent('bonus:stack', [
            avatar.id,
            method,
            bonus.id,
            bonus.constructor.name,
            bonus.duration
        ]);
    }

    // Game events:

    /**
     * On game start
     */
    onGameStart(this: GameController) {
        this.socketGroup.addEvent('game:start');
    }

    /**
     * On game stop
     */
    onGameStop(this: GameController) {
        this.socketGroup.addEvent('game:stop');
    }

    /**
     * On round new
     */
    onRoundNew(this: GameController) {
        this.socketGroup.addEvent('round:new');
    }

    /**
     * On round end
     */
    onRoundEnd(this: GameController, { winner }: { winner: Avatar }) {
        this.socketGroup.addEvent('round:end', winner ? winner.id : null);
    }

    /**
     * On clear
     */
    onClear(this: GameController) {
        this.socketGroup.addEvent('clear');
    }

    /**
     * On borderless
     */
    onBorderless(this: GameController, data: any) {
        this.socketGroup.addEvent('borderless', data);
    }

    /**
     * On end
     */
    onEnd(this: GameController) {
        this.socketGroup.addEvent('end');
        this.unloadGame();
    }
}
