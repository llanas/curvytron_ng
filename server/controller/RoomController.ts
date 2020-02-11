import { Collection } from '@shared/collection';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { ServerSocketClient } from '../core/ServerSocketClient';
import { SocketGroup } from '../core/SocketGroup';
import { KickManager } from '../manager/kickManager';
import { KickVote } from '../models/KickVote';
import { Message } from '../models/Message';
import { Player } from '../models/Player';
import { Room } from '../models/Room';
import { Chat } from '../service/Chat';

/**
 * Room Controller
 */
export class RoomController extends EventEmitter {

    /**
     * Time before closing an empty room
     */
    static timeToClose = 10000;

    room: Room;
    clients: Collection<ServerSocketClient>;

    roomMaster: ServerSocketClient = null;
    launching: NodeJS.Timeout | void = null;

    socketGroup: SocketGroup;
    kickManager: KickManager;
    chat: Chat;

    callbacks: any;

    constructor(room: Room) {

        super();

        this.room = room;
        this.clients = new Collection<ServerSocketClient>();
        this.socketGroup = new SocketGroup(this.clients);
        this.kickManager = new KickManager(this);
        this.chat = new Chat();

        const controller = this;
        this.callbacks = {
            onTalk(data) { controller.onTalk(this, data[0], data[1]); },
            onPlayerAdd(data) { controller.onPlayerAdd(this, data[0], data[1]); },
            onPlayerRemove(data) { controller.onPlayerRemove(this, data[0], data[1]); },
            onReady(data) { controller.onReady(this, data[0], data[1]); },
            onKickVote(data) { controller.onKickVote(this, data[0], data[1]); },
            onName(data) { controller.onName(this, data[0], data[1]); },
            onColor(data) { controller.onColor(this, data[0], data[1]); },
            onLeave() { controller.onLeave(this); },
            onActivity() { controller.onActivity(this); },
            onConfigOpen(data) { controller.onConfigOpen(this, data[0], data[1]); },
            onConfigMaxScore(data) { controller.onConfigMaxScore(this, data[0], data[1]); },
            onConfigVariable(data) { controller.onConfigVariable(this, data[0], data[1]); },
            onConfigBonus(data) { controller.onConfigBonus(this, data[0], data[1]); },
            onLaunch(data) { controller.onLaunch(this); }
        };

        this.loadRoom();
        this.promptCheckForClose();
    }

    /**
     * Attach events
     */
    attach(client: ServerSocketClient, callback: (arg: any) => any) {
        if (this.clients.add(client)) {
            this.attachEvents(client);
            this.onClientAdd(client);
            callback({
                success: true,
                room: this.room.serialize(),
                master: this.roomMaster ? this.roomMaster.id : null,
                clients: this.clients.map(function () { return this.serialize(); }).items,
                messages: this.chat.serialize(100),
                votes: this.kickManager.votes.map(function () { return this.serialize(); }).items
            });
            this.socketGroup.addEvent('client:add', client.id);
            this.emit('client:add', { room: this.room, client });
        } else {
            callback({ success: false, error: 'Client ' + client.id + ' already in the room.' });
        }
        this.checkIntegrity();
    }

    /**
     * Attach events
     */
    detach(client: ServerSocketClient) {
        if (this.clients.remove(client)) {
            if (this.room.game) {
                this.room.game.controller.detach(client);
            }
            client.clearPlayers();
            this.detachEvents(client);
            this.promptCheckForClose();
            this.socketGroup.addEvent('client:remove', client.id);
            this.emit('client:remove', { room: this.room, client });
        }
        this.checkIntegrity();
    }

    /**
     * Detach events
     */
    attachEvents(client: ServerSocketClient) {
        client.on('close', this.callbacks.onLeave);
        client.on('activity', this.callbacks.onActivity);
        client.on('room:leave', this.callbacks.onLeave);
        client.on('room:talk', this.callbacks.onTalk);
        client.on('player:add', this.callbacks.onPlayerAdd);
        client.on('player:remove', this.callbacks.onPlayerRemove);
        client.on('player:kick', this.callbacks.onKickVote);
        client.on('room:ready', this.callbacks.onReady);
        client.on('room:color', this.callbacks.onColor);
        client.on('room:name', this.callbacks.onName);
        client.on('players:clear', this.onPlayersClear);
    }

    /**
     * Detach events
     */
    detachEvents(client: ServerSocketClient) {
        client.removeListener('close', this.callbacks.onLeave);
        client.removeListener('activity', this.callbacks.onActivity);
        client.removeListener('room:leave', this.callbacks.onLeave);
        client.removeListener('room:talk', this.callbacks.onTalk);
        client.removeListener('player:add', this.callbacks.onPlayerAdd);
        client.removeListener('player:remove', this.callbacks.onPlayerRemove);
        client.removeListener('player:kick', this.callbacks.onKickVote);
        client.removeListener('room:ready', this.callbacks.onReady);
        client.removeListener('room:color', this.callbacks.onColor);
        client.removeListener('room:name', this.callbacks.onName);
        client.removeListener('players:clear', this.onPlayersClear);
    }

    /**
     * Remove player
     */
    removePlayer(player: Player) {
        const client = player.client;
        if (this.room.removePlayer(player) && client) {
            client.players.remove(player);
            if (!client.isPlaying()) {
                this.kickManager.removeClient(client);
                if (this.roomMaster && this.roomMaster.id === client.id) {
                    this.removeRoomMaster();
                }
            }
        }
    }

    /**
     * Nominate game master
     */
    nominateRoomMaster() {
        if (this.clients.isEmpty() || this.roomMaster) {
            return;
        }
        const roomMaster = this.clients.match(function () { return this.active && this.isPlaying(); });
        this.setRoomMaster(roomMaster);
    }

    /**
     * Set game master
     */
    setRoomMaster(client: ServerSocketClient) {
        if (!this.roomMaster && client) {
            this.roomMaster = client;
            this.roomMaster.on('close', this.removeRoomMaster);
            this.roomMaster.on('room:leave', this.removeRoomMaster);
            this.roomMaster.on('room:config:open', this.callbacks.onConfigOpen);
            this.roomMaster.on('room:config:max-score', this.callbacks.onConfigMaxScore);
            this.roomMaster.on('room:config:variable', this.callbacks.onConfigVariable);
            this.roomMaster.on('room:config:bonus', this.callbacks.onConfigBonus);
            this.roomMaster.on('room:launch', this.callbacks.onLaunch);
            this.socketGroup.addEvent('room:master', { client: client.id });
        }
    }

    /**
     * Is the given client the game master?
     */
    isRoomMaster(client: ServerSocketClient): boolean {
        return this.roomMaster.id === client.id;
    }

    /**
     * Initialise a new client
     */
    onClientAdd(client: ServerSocketClient) {
        client.clearPlayers();
        if (this.room.game) {
            this.room.game.controller.attach(client);
            client.addEvent('room:game:start');
        }
        this.socketGroup.addEvent('client:add', { client: client.serialize() });
        this.nominateRoomMaster();
    }

    /**
     * Prompt a check for close
     */
    promptCheckForClose() {
        if (this.clients.isEmpty()) {
            setTimeout(this.checkForClose, RoomController.timeToClose);
        }
    }

    /**
     * Check integrity
     */
    checkIntegrity() {
        for (let player: Player, i = this.room.players.items.length - 1; i >= 0; i--) {
            player = this.room.players.items[i];
            if (!player.client || !this.clients.exists(player.client)) {
                console.error('"Lost" player removed.');
                this.removePlayer(player);
            }
        }
    }

    /**
     * Start launch
     */
    startLaunch() {
        if (!this.launching) {
            this.launching = setTimeout(this.launch, this.room.launchTime);
            this.socketGroup.addEvent('room:launch:start');
        }
    }

    /**
     * Cancel launch
     */
    cancelLaunch() {
        if (this.launching) {
            this.launching = clearTimeout(this.launching);
            this.socketGroup.addEvent('room:launch:cancel');
        }
    }

    // Events:

    /**
     * On client leave
     */
    onLeave(client: ServerSocketClient) {
        this.detach(client);
    }

    /**
     * On client activity change
     */
    onActivity(client: ServerSocketClient) {
        this.socketGroup.addEvent('client:activity', {
            client: client.id,
            active: client.active
        });
    }

    /**
     * On add player to room
     */
    onPlayerAdd(client: ServerSocketClient, data: any, callback: (arg: any) => any): () => any {
        const name = data.name.substr(0, Player.prototype.maxLength).trim();
        const color = typeof (data.color) !== 'undefined' ? data.color : null;
        if (!name.length) {
            return callback({ success: false, error: 'Invalid name.' });
        }
        if (this.room.game) {
            return callback({ success: false, error: 'Game already started.' });
        }
        if (!this.room.isNameAvailable(name)) {
            return callback({ success: false, error: 'This username is already used.' });
        }
        if (!this.clients.exists(client)) {
            console.error('Unknown client.');
            return callback({ success: false, error: 'Unknown client' });
        }
        const player = new Player(client, name, color);
        if (this.room.addPlayer(player)) {
            client.players.add(player);
            this.emit('player:add', { room: this.room, player });
            callback({ success: true });
            this.nominateRoomMaster();
        } else {
            return callback({ success: false, error: 'Could not add player.' });
        }
    }

    /**
     * On remove player from room
     */
    onPlayerRemove(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const player = client.players.getById(data.player);
        if (player) {
            this.removePlayer(player);
            this.emit('player:remove', { room: this.room, player });
        }
        callback({ success: player ? true : false });
    }

    /**
     * On talk
     */
    onTalk(client: ServerSocketClient, content: string, callback: (arg: any) => any) {
        const message = new Message(client, content.substr(0, Message.maxLength));
        const success = this.chat.addMessage(message);
        callback({ success });
        if (success) {
            this.socketGroup.addEvent('room:talk', message.serialize());
        }
    }

    /**
     * On player change color
     */
    onColor(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const player = client.players.getById(data.player);
        const color = data.color;
        if (!player) {
            return callback({ success: false });
        }
        if (player.setColor(color)) {
            callback({ success: true, color: player.color });
            this.socketGroup.addEvent('player:color', { player: player.id, color: player.color });
        } else {
            callback({ success: false, color: player.color });
        }
    }

    /**
     * On player change name
     */
    onName(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const player = client.players.getById(data.player);
        const name = data.name.substr(0, Player.prototype.maxLength).trim();
        if (!player) {
            return callback({ success: false, error: 'Unknown player: "' + name + '"' });
        }
        if (!name.length) {
            return callback({ success: false, error: 'Invalid name.', name: player.name });
        }
        if (!this.room.isNameAvailable(name)) {
            return callback({ success: false, error: 'This username is already used.', name: player.name });
        }
        player.setName(name);
        callback({ success: true, name: player.name });
        this.socketGroup.addEvent('player:name', { player: player.id, name: player.name });
    }

    /**
     * On player ready
     */
    onReady(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const player = client.players.getById(data.player);
        if (player) {
            player.toggleReady();
            callback({ success: true, ready: player.ready });
            this.socketGroup.addEvent('player:ready', { player: player.id, ready: player.ready });
            if (this.room.isReady()) {
                this.launch();
            }
        } else {
            callback({ success: false, error: 'Player with id "' + data.player + '" not found' });
        }
    }

    /**
     * On kick vote
     */
    onKickVote(client: ServerSocketClient, data: any, callback: (arg: any) => any): () => any {
        if (client.isPlaying()) {
            const player = this.room.players.getById(data.player);
            if (player) {
                if (this.isRoomMaster(client)) {
                    this.onKick(player);
                    return callback({ success: true, kicked: true });
                } else {
                    const kickVote = this.kickManager.vote(client, player);
                    return callback({ success: true, kicked: kickVote.hasVote(client) });
                }
            }
        }
        return callback({ success: false, kicked: false });
    }

    /**
     * On config open
     */
    onConfigOpen(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const success = this.isRoomMaster(client) && this.room.config.setOpen(data.open);
        callback({
            success,
            open: this.room.config.open,
            password: this.room.config.password
        });
        if (success) {
            this.socketGroup.addEvent('room:config:open', {
                open: this.room.config.open,
                password: this.room.config.password
            });
        }
    }

    /**
     * On config max score
     */
    onConfigMaxScore(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const success = this.isRoomMaster(client) && this.room.config.setMaxScore(data.maxScore);
        callback({ success, maxScore: this.room.config.maxScore });
        if (success) {
            this.socketGroup.addEvent('room:config:max-score', { maxScore: this.room.config.maxScore });
        }
    }

    /**
     * On config speed
     */
    onConfigVariable(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const success = this.isRoomMaster(client) && this.room.config.setVariable(data.variable, data.value);
        callback({ success, value: this.room.config.getVariable(data.variable) });
        if (success) {
            this.socketGroup.addEvent('room:config:variable', {
                variable: data.variable,
                value: this.room.config.getVariable(data.variable)
            });
        }
    }

    /**
     * On config bonus
     */
    onConfigBonus(client: ServerSocketClient, data: any, callback: (arg: any) => any) {
        const success = this.isRoomMaster(client) && this.room.config.toggleBonus(data.bonus);
        callback({ success, enabled: this.room.config.getBonus(data.bonus) });
        if (success) {
            this.socketGroup.addEvent('room:config:bonus', {
                bonus: data.bonus,
                enabled: this.room.config.getBonus(data.bonus)
            });
        }
    }

    /**
     * On launch
     */
    onLaunch(client: ServerSocketClient) {
        if (this.isRoomMaster(client)) {
            if (this.launching) {
                this.cancelLaunch();
            } else {
                this.startLaunch();
            }
        }
    }

    /**
     * Load room
     */
    @boundMethod
    loadRoom() {
        this.room.on('close', this.unloadRoom);
        this.room.on('player:join', this.onPlayerJoin);
        this.room.on('player:leave', this.onPlayerLeave);
        this.room.on('game:new', this.onGame);
        this.kickManager.on('kick', this.onKick);
        this.kickManager.on('vote:new', this.onVoteNew);
        this.kickManager.on('vote:close', this.onVoteClose);
    }

    /**
     * Unload room
     */
    @boundMethod
    unloadRoom() {
        this.room.removeListener('close', this.unloadRoom);
        this.room.removeListener('player:join', this.onPlayerJoin);
        this.room.removeListener('player:leave', this.onPlayerLeave);
        this.room.removeListener('game:new', this.onGame);
        this.kickManager.removeListener('kick', this.onKick);
        this.kickManager.removeListener('vote:new', this.onVoteNew);
        this.kickManager.removeListener('vote:close', this.onVoteClose);
        this.kickManager.clear();
    }

    /**
     * Remove game master
     */
    @boundMethod
    removeRoomMaster() {
        if (this.roomMaster) {
            this.roomMaster.removeListener('close', this.removeRoomMaster);
            this.roomMaster.removeListener('room:leave', this.removeRoomMaster);
            this.roomMaster.removeListener('room:config:open', this.callbacks.onConfigOpen);
            this.roomMaster.removeListener('room:config:max-score', this.callbacks.onConfigMaxScore);
            this.roomMaster.removeListener('room:config:variable', this.callbacks.onConfigVariable);
            this.roomMaster.removeListener('room:config:bonus', this.callbacks.onConfigBonus);
            this.roomMaster.removeListener('room:launch', this.callbacks.onLaunch);
            this.roomMaster = null;
            this.nominateRoomMaster();
        }
    }

    /**
     * Check is room is empty and shoul be closed
     */
    @boundMethod
    checkForClose() {
        if (this.clients.isEmpty()) {
            this.room.close();
        }
    }

    /**
     * Launch
     */
    @boundMethod
    launch() {
        if (this.launching) {
            this.launching = clearTimeout(this.launching);
        }

        this.room.newGame();
    }

    /**
     * On client clear players
     */
    @boundMethod
    onPlayersClear(client: ServerSocketClient) {
        for (let i = client.players.items.length - 1; i >= 0; i--) {
            this.removePlayer(client.players.items[i]);
        }
    }

    /**
     * On player join
     */
    @boundMethod
    onPlayerJoin(data: any) {
        this.socketGroup.addEvent('room:join', { player: data.player.serialize() });
    }

    /**
     * On player leave
     */
    @boundMethod
    onPlayerLeave(data: any) {
        this.socketGroup.addEvent('room:leave', { player: data.player.id });

        if (this.room.isReady()) {
            this.room.newGame();
        }
    }

    /**
     * Warm up room
     */
    @boundMethod
    onGame() {
        this.socketGroup.addEvent('room:game:start');
    }

    /**
     * On kick
     */
    @boundMethod
    onKick(player: Player) {
        this.socketGroup.addEvent('room:kick', player.id);
        this.removePlayer(player);
    }

    /**
     * On new vote
     */
    @boundMethod
    onVoteNew(kickVote: KickVote) {
        this.socketGroup.addEvent('vote:new', kickVote.serialize());
    }

    /**
     * On vote close
     */
    @boundMethod
    onVoteClose(kickVote: KickVote) {
        this.socketGroup.addEvent('vote:close', kickVote.serialize());
    }

}
