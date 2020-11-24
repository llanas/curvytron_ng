import { Collection } from '@shared/collection';
import { BasePlayer } from '@shared/model/BasePlayer';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { Client } from '../models/client.model';
import { Player } from '../models/player.model';
import { Room } from '../models/room.model';
import { SocketClientService } from '../services/core/socket-client.service';

/**
 * Room Repository
 */
export class RoomRepository extends EventEmitter {

    room: any;
    master: any;
    clients: any;
    playerCache: any;

    constructor (private client: SocketClientService) {

        super();

        this.room = null;
        this.master = null;
        this.clients = new Collection();
        this.playerCache = new Collection();
    }

    /**
     * Attach events
     */
    attachEvents() {
        this.client.on('client:add', this.onClientAdd);
        this.client.on('client:remove', this.onClientRemove);
        this.client.on('room:master', this.onRoomMaster);
        this.client.on('room:join', this.onJoinRoom);
        this.client.on('room:leave', this.onLeaveRoom);
        this.client.on('room:game:start', this.onGameStart);
        this.client.on('player:ready', this.onPlayerReady);
        this.client.on('player:color', this.onPlayerColor);
        this.client.on('player:name', this.onPlayerName);
        this.client.on('room:config:open', this.onConfigOpen);
        this.client.on('room:config:max-score', this.onConfigMaxScore);
        this.client.on('room:config:variable', this.onConfigVariable);
        this.client.on('room:config:bonus', this.onConfigBonus);
        this.client.on('room:launch:start', this.forwardEvent);
        this.client.on('room:launch:cancel', this.forwardEvent);
        this.client.on('room:kick', this.onKick);
        this.client.on('vote:new', this.onVote);
        this.client.on('vote:close', this.onVote);
        this.client.on('client:activity', this.onClientActivity);
    }
    /**
     * Attach events
     */
    detachEvents() {
        this.client.off('client:add', this.onClientAdd);
        this.client.off('client:remove', this.onClientRemove);
        this.client.off('room:master', this.onRoomMaster);
        this.client.off('room:join', this.onJoinRoom);
        this.client.off('room:leave', this.onLeaveRoom);
        this.client.off('room:game:start', this.onGameStart);
        this.client.off('player:ready', this.onPlayerReady);
        this.client.off('player:color', this.onPlayerColor);
        this.client.off('player:name', this.onPlayerName);
        this.client.off('room:config:open', this.onConfigOpen);
        this.client.off('room:config:max-score', this.onConfigMaxScore);
        this.client.off('room:config:variable', this.onConfigVariable);
        this.client.off('room:config:bonus', this.onConfigBonus);
        this.client.off('room:launch:start', this.forwardEvent);
        this.client.off('room:launch:cancel', this.forwardEvent);
        this.client.off('room:kick', this.onKick);
        this.client.off('vote:new', this.onVote);
        this.client.off('vote:close', this.onVote);
        this.client.off('client:activity', this.onClientActivity);
    }

    /**
     * Join room
     */
    join(name, password, callback) {

        if (this.room && this.room.name === name) {
            return callback({ success: true, room: this.room });
        }

        this.client.addEvent('room:join', { name, password }, (result) => {
            if (result.success) {
                const clients = this.createClients(result.clients);
                const master = clients.getById(result.master);
                const room = this.createRoom(result.room, clients);
                const messages = result.messages.length;

                this.setRoom(room, clients, master);
                callback({ success: true, room });

                for (let m = 0; m < messages; m++) {
                    this.client.emit('room:talk', result.messages[m]);
                }

                for (let v = result.votes.length - 1; v >= 0; v--) {
                    this.client.emit('vote:new', result.votes[v]);
                }
            } else {
                callback({
                    success: false,
                    name,
                    error: typeof (result.error) !== 'undefined' ? result.error : 'Unknown error'
                });
            }
        });
    }

    /**
     * Create clients
     */
    createClients(data) {
        const clients = new Collection();

        for (let i = data.length - 1; i >= 0; i--) {
            clients.add(new Client(data[i].id, data[i].active));
        }

        return clients;
    }

    /**
     * Create room from server data
     */
    createRoom(data, clients) {
        const room = new Room(data.name);
        const length = data.players.length;

        for (let client, i = 0; i < length; i++) {
            client = clients.getById(data.players[i].client);

            if (client) {
                room.addPlayer(new Player(
                    data.players[i].id,
                    client,
                    data.players[i].name,
                    data.players[i].color,
                    data.players[i].ready
                ));
            } else {
                console.error('Could not find a client:', data.players[i].client, clients);
            }
        }

        room.config.setOpen(data.config.open);
        room.config.setPassword(data.config.password);
        room.config.setMaxScore(data.config.maxScore);

        for (const variable in data.config.variables) {
            if (data.config.variables.hasOwnProperty(variable)) {
                room.config.setVariable(variable, data.config.variables[variable]);
            }
        }

        for (const bonus in data.config.bonuses) {
            if (data.config.bonuses.hasOwnProperty(bonus)) {
                room.config.setBonus(bonus, data.config.bonuses[bonus]);
            }
        }

        return room;
    }

    /**
     * Set current room
     */
    setRoom(room, clients, master) {
        if (!this.room || !this.room.equal(room)) {
            this.room = room;
            this.clients = clients;
            this.emit(this.room ? 'room:join' : 'room:leave');
            this.setRoomMaster(master);
        }
    }

    /**
     * Set room master
     */
    setRoomMaster(master) {
        if (this.master) {
            this.master.setMaster(false);
        }

        this.master = master;

        if (this.master) {
            this.master.setMaster(true);
        }

        this.emit('room:master', { master: this.master });
    }

    /**
     * Am I the room master?
     */
    amIMaster() {
        const client = this.clients.getById(this.client.id);

        return client && client.master;
    }

    /**
     * Add player
     */
    addPlayer(name, color, callback) {
        this.client.addEvent('player:add', {
            name: name.substr(0, Player.prototype.maxLength),
            color: color ? color.substr(0, Player.prototype.colorMaxLength) : null
        }, callback);
    }

    /**
     * Remove player
     */
    removePlayer(player, callback) {
        this.client.addEvent('player:remove', { player: player.id }, callback);
    }

    /**
     * Kick player
     */
    kickPlayer(player: Player, callback: (arg: any) => any) {
        this.client.addEvent('player:kick', { player: player.id },
            (result) => {
                player.kicked = result.kicked;
                callback(result);
            }
        );
    }

    /**
     * Leave
     */
    leave() {
        this.client.addEvent('room:leave');
        this.stop();
        this.emit('room:leave');
    }

    /**
     * Set color
     */
    setColor(player: Player, color: string, callback: (arg: any) => any) {
        this.client.addEvent('room:color', {
            player: player.id,
            color: color.substr(0, Player.prototype.colorMaxLength)
        }, (result) => {
            if (!result.success) {
                console.error('Could not set color %s for player %s', player.color, player.name);
            }
            player.color = result.color;
            callback(result);
        });
    }

    /**
     * Set name
     */
    setName(player: Player, name: string, callback: (arg: any) => any) {
        name = name.substr(0, BasePlayer.maxLength).trim();

        if (name !== player.name) {
            this.client.addEvent('room:name', { player, name }, callback);
        }
    }

    /**
     * Set ready
     */
    setReady(player: Player, callback: (arg: any) => any) {
        this.client.addEvent('room:ready', { player }, callback);
    }

    /**
     * Set config open
     */
    setConfigOpen(open: boolean, callback: (arg: any) => any) {
        this.client.addEvent('room:config:open', { open: open ? true : false }, callback);
    }

    /**
     * Set config max score
     */
    setConfigMaxScore(maxScore: number | string, callback: (arg: any) => any) {
        if (typeof maxScore === 'number') {
            maxScore = '' + maxScore;
        }
        this.client.addEvent('room:config:max-score', { maxScore: parseInt(maxScore, 10) }, callback);
    }

    /**
     * Set config speed
     */
    setConfigVariable(variable, value, callback: (arg: any) => any) {
        this.client.addEvent('room:config:variable', { variable, value: parseFloat(value) }, callback);
    }

    /**
     * Set config bonus
     */
    setConfigBonus(bonus: string, callback: (arg: any) => any) {
        this.client.addEvent('room:config:bonus', { bonus }, callback);
    }

    /**
     * Launch
     */
    launch() {
        this.client.addEvent('room:launch');
    }

    /**
     * Pause
     */
    stop() {
        this.detachEvents();
        this.playerCache.clear();
        this.setRoom(null, new Collection(), null);
    }

    // EVENTS:

    /**
     * On client add
     */
    @boundMethod
    onClientAdd(e: any) {
        this.clients.add(new Client(e.detail));
    }

    /**
     * On client remove
     */
    @boundMethod
    onClientRemove(e: any) {
        this.clients.removeById(e.detail);
    }

    /**
     * On join room
     */
    @boundMethod
    onJoinRoom(e: any) {
        const data = e.detail;
        const player = new Player(
            data.player.id,
            this.clients.getById(data.player.client),
            data.player.name,
            data.player.color,
            data.player.ready
        );

        if (this.room.addPlayer(player)) {
            this.emit('player:join', { player });
        }
    }

    /**
     * On leave room
     */
    @boundMethod
    onLeaveRoom(e: any) {
        const player = this.room.players.getById(e.detail.player);

        if (player && this.room.removePlayer(player)) {
            this.playerCache.add(player);
            this.emit('player:leave', { player });
        }
    }

    /**
     * On client changes activity
     */
    @boundMethod
    onClientActivity(e: any) {
        const client = this.clients.getById(e.detail.client);

        if (client) {
            client.active = e.detail.active;
            this.emit('client:activity', { client, active: client.active });
        }
    }

    /**
     * On player change color
     */
    @boundMethod
    onPlayerColor(e: any) {
        const data = e.detail;
        const player = this.room.players.getById(data.player);

        if (player) {
            player.setColor(data.color);
            this.emit('player:color', { player });
        }
    }

    /**
     * On player change name
     */
    @boundMethod
    onPlayerName(e: any) {
        const data = e.detail;
        const player = this.room.players.getById(data.player);

        if (player) {
            player.setName(data.name);
            this.emit('player:name', { player });
        }
    }

    /**
     * On player toggle ready
     */
    @boundMethod
    onPlayerReady(e: any) {
        const data = e.detail;
        const player = this.room.players.getById(data.player);

        if (player) {
            player.toggleReady(data.ready);
            this.emit('player:ready', { player });
        }
    }

    /**
     * On game master
     */
    @boundMethod
    onRoomMaster(e: any) {
        const master = this.clients.getById(e.detail.client);

        if (master) {
            this.setRoomMaster(master);
        }
    }

    /**
     * On config open
     */
    @boundMethod
    onConfigOpen(e: any) {
        const data = e.detail;

        this.room.config.setOpen(data.open);
        this.room.config.setPassword(data.password);

        this.emit('room:config:open', { open: data.open, password: data.password });
    }

    /**
     * On config max score
     */
    @boundMethod
    onConfigMaxScore(e: any) {
        const data = e.detail;

        this.room.config.setMaxScore(data.maxScore);
        this.emit('config:max-score', { maxScore: data.maxScore });
    }

    /**
     * On config variable
     */
    @boundMethod
    onConfigVariable(e: any) {
        const data = e.detail;

        this.room.config.setVariable(data.variable, data.value);
        this.emit('config:variable', { variable: data.variable, value: data.value });
    }

    /**
     * On config bonus
     */
    @boundMethod
    onConfigBonus(e: any) {
        const data = e.detail;

        this.room.config.setBonus(data.bonus, data.enabled);
        this.emit('config:bonus', { bonus: data.bonus, enabled: data.enabled });
    }

    /**
     * On room game start
     */
    @boundMethod
    onGameStart(e: Event) {
        this.room.newGame();
        this.emit('room:game:start');
    }

    /**
     * On vote
     */
    @boundMethod
    onVote(e: any) {
        let player = this.room.players.getById(e.detail.target);

        if (!player) {
            player = this.playerCache.getById(e.detail.target);
        }

        if (player) {
            player.vote = e.type === 'vote:new';
            this.emit(e.type, { target: player, result: e.detail.result });
        }
    }

    /**
     * On kick
     */
    @boundMethod
    onKick(e: any) {
        let player = this.room.players.getById(e.detail);

        if (!player) {
            player = this.playerCache.getById(e.detail);
        }

        if (player) {
            this.emit(e.type, player);
        }
    }

    /**
     * Forward event
     */
    @boundMethod
    forwardEvent(e: any) {
        this.emit(e.type, e.detail);
    }

    /**
     * Start
     */
    @boundMethod
    start() {
        if (this.client.connected) {
            this.attachEvents();
        } else {
            this.client.on('connected', this.start);
        }
    }

}
