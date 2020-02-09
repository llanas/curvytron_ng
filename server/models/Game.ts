import { BaseGame } from '@shared/model/BaseGame';

import { Room } from './Room';

/**
 * Game
 */
export class Game extends BaseGame {
    constructor(room: Room) {
        super(room);
        // BaseGame.call(this, room);
        // this.world = new World(this.size);
        // this.deaths = new Collection([], 'id');
        // this.controller = new GameController(this);
        // this.bonusStack = new GameBonusStack(this);
        // this.roundWinner = null;
        // this.gameWinner = null;
        // this.deathInFrame = false;
        // this.onPoint = this.onPoint.bind(this);
        // var avatar, i;
        // for (i = this.avatars.items.length - 1; i >= 0; i--) {
        //     avatar = this.avatars.items[i];
        //     avatar.clear();
        //     avatar.on('point', this.onPoint);
        // }
    }
    /**
     * Update
     *
     * @param {Number} step
     */
    update(step) {
        var score = this.deaths.count(), avatar, border, i, borderX, borderY, borderAxis, position, killer;
        this.deathInFrame = false;
        for (i = this.avatars.items.length - 1; i >= 0; i--) {
            avatar = this.avatars.items[i];
            dead = false;
            if (avatar.alive) {
                avatar.update(step);
                border = this.world.getBoundIntersect(avatar.body, this.borderless ? 0 : avatar.radius);
                if (border) {
                    if (this.borderless) {
                        position = this.world.getOposite(border[0], border[1]);
                        avatar.setPosition(position[0], position[1]);
                    }
                    else {
                        this.kill(avatar, null, score);
                    }
                }
                else {
                    if (!avatar.invincible) {
                        killer = this.world.getBody(avatar.body);
                        if (killer) {
                            this.kill(avatar, killer, score);
                        }
                    }
                }
                if (avatar.alive) {
                    avatar.printManager.test();
                    this.bonusManager.testCatch(avatar);
                }
            }
        }
        if (this.deathInFrame) {
            this.checkRoundEnd();
        }
    }
    /**
     * Kill an avatar
     *
     * @param {Avatar} avatar
     * @param {Body|null} killer
     * @param {Number} score
     */
    kill(avatar, killer, score) {
        avatar.die(killer);
        avatar.addScore(score);
        this.deaths.add(avatar);
        this.deathInFrame = true;
    }
    /**
     * Remove a avatar from the game
     *
     * @param {Avatar} avatar
     */
    removeAvatar(avatar) {
        BaseGame.prototype.removeAvatar.call(this, avatar);
        this.emit('player:leave', { player: avatar.player });
        this.checkRoundEnd();
    }
    /**
     * Is done
     *
     * @return {Boolean}
     */
    isWon() {
        var present = this.getPresentAvatars().count();
        if (present <= 0) {
            return true;
        }
        if (this.avatars.count() > 1 && present <= 1) {
            return true;
        }
        var maxScore = this.maxScore, players = this.avatars.filter(function () { return this.present && this.score >= maxScore; });
        if (players.count() === 0) {
            return null;
        }
        if (players.count() === 1) {
            return players.getFirst();
        }
        this.sortAvatars(players);
        return players.items[0].score === players.items[1].score ? null : players.getFirst();
    }
    /**
     * Check if the round should end
     */
    checkRoundEnd() {
        if (!this.inRound) {
            return;
        }
        var alive = false;
        for (var i = this.avatars.items.length - 1; i >= 0; i--) {
            if (this.avatars.items[i].alive) {
                if (!alive) {
                    alive = true;
                }
                else {
                    return;
                }
            }
        }
        this.endRound();
    }
    /**
     * Resolve scores
     */
    resolveScores() {
        var winner;
        if (this.avatars.count() === 1) {
            winner = this.avatars.getFirst();
        }
        else {
            winner = this.avatars.match(function () { return this.alive; });
        }
        if (winner) {
            winner.addScore(Math.max(this.avatars.count() - 1, 1));
            this.roundWinner = winner;
        }
        for (var i = this.avatars.items.length - 1; i >= 0; i--) {
            this.avatars.items[i].resolveScore();
        }
    }
    /**
     * Clear trails
     */
    clearTrails() {
        this.world.clear();
        this.world.activate();
        this.emit('clear', { game: this });
    }
    /**
     * Update size
     */
    setSize() {
        BaseGame.prototype.setSize.call(this);
        this.world.clear();
        this.world = new World(this.size);
        this.bonusManager.setSize();
    }
    /**
     * Check end of round
     */
    onRoundEnd() {
        this.resolveScores();
        this.emit('round:end', { winner: this.roundWinner });
    }
    /**
     * New round
     */
    onRoundNew() {
        this.emit('round:new', { game: this });
        BaseGame.prototype.onRoundNew.call(this);
        var avatar, position, i;
        this.roundWinner = null;
        this.world.clear();
        this.deaths.clear();
        this.bonusStack.clear();
        for (i = this.avatars.items.length - 1; i >= 0; i--) {
            avatar = this.avatars.items[i];
            if (avatar.present) {
                position = this.world.getRandomPosition(avatar.radius, this.spawnMargin);
                avatar.setPosition(position[0], position[1]);
                avatar.setAngle(this.world.getRandomDirection(avatar.x, avatar.y, this.spawnAngleMargin));
            }
            else {
                this.deaths.add(avatar);
            }
        }
    }
    /**
     * On start
     */
    onStart() {
        this.emit('game:start', { game: this });
        for (var avatar, i = this.avatars.items.length - 1; i >= 0; i--) {
            avatar = this.avatars.items[i];
            setTimeout(avatar.printManager.start, 3000);
        }
        this.world.activate();
        BaseGame.prototype.onStart.call(this);
    }
    /**
     * On stop
     */
    onStop() {
        this.emit('game:stop', { game: this });
        BaseGame.prototype.onStop.call(this);
        var won = this.isWon();
        if (won) {
            if (won instanceof Avatar) {
                this.gameWinner = won;
            }
            this.end();
        }
        else {
            this.newRound();
        }
    }
    /**
     * Set borderless
     *
     * @param {Boolean} borderless
     */
    setBorderless(borderless) {
        if (this.borderless !== borderless) {
            BaseGame.prototype.setBorderless.call(this, borderless);
            this.emit('borderless', this.borderless);
        }
    }
    /**
     * FIN DU GAME
     */
    end() {
        if (BaseGame.prototype.end.call(this)) {
            this.avatars.clear();
            this.world.clear();
            delete this.world;
            delete this.avatars;
            delete this.deaths;
            delete this.bonusManager;
            delete this.controller;
        }
    }
}

Game.prototype = Object.create(BaseGame.prototype);
Game.prototype.constructor = Game;




/**
 * On avatar add point
 *
 * @param {Object} data
 */
Game.prototype.onPoint = function (data) {
    if (this.started && this.world.active) {
        this.world.addBody(new AvatarBody(data.x, data.y, data.avatar));
    }
};
