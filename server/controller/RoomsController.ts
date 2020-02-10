import { boundMethod } from 'autobind-decorator';
import { ServerSocketClient } from 'core/ServerSocketClient';
import { SocketGroup } from 'core/SocketGroup';
import { EventEmitter } from 'events';
import { Room } from 'models/Room';
import { RoomRepository } from 'repository/RoomRepository';

/**
 * Rooms Controller
 */
export class RoomsController extends EventEmitter {

    repository: RoomRepository;
    socketGroup = new SocketGroup();

    callbacks: any;

    constructor(repository: RoomRepository) {

        super();

        this.repository = repository;

        const controller = this;
        this.callbacks = {
            emitAllRooms() { controller.emitAllRooms(this); },
            onCreateRoom(data) { controller.onCreateRoom(data[0], data[1]); },
            onJoinRoom(data) { controller.onJoinRoom(this, data[0], data[1]); }
        };
        this.repository.on('room:open', this.onRoomOpen);
        this.repository.on('room:close', this.onRoomClose);
    }

    /**
     * Attach events
     */
    attach(client: ServerSocketClient) {
        if (this.socketGroup.clients.add(client)) {
            this.attachEvents(client);
        }
    }

    /**
     * Detach events
     */
    attachEvents(client: ServerSocketClient) {
        client.on('close', this.detach);
        client.on('room:fetch', this.callbacks.emitAllRooms);
        client.on('room:create', this.callbacks.onCreateRoom);
        client.on('room:join', this.callbacks.onJoinRoom);
    }

    /**
     * Detach events
     */
    detachEvents(client: ServerSocketClient) {
        client.removeListener('close', this.detach);
        client.removeListener('room:fetch', this.callbacks.emitAllRooms);
        client.removeListener('room:create', this.callbacks.onCreateRoom);
        client.removeListener('room:join', this.callbacks.onJoinRoom);
    }

    /**
     * Emit all rooms to the given client
     */
    emitAllRooms(client: ServerSocketClient) {
        const events = [];
        for (let i = this.repository.rooms.items.length - 1; i >= 0; i--) {
            events.push(['room:open', this.repository.rooms.items[i].serialize(false)]);
        }
        client.addEvents(events);
    }

    // Events:

    /**
     * On new room
     */
    onCreateRoom({ name }: { name: string }, callback: (data: any) => any) {
        const trimedName = name.substr(0, Room.maxLength).trim();
        const room = this.repository.create(trimedName);
        if (room instanceof Room) {
            callback({ success: true, room: room.serialize(false) });
            this.emit('room:new', { room });
        } else {
            callback({ success: false });
        }
    }

    /**
     * On join room
     */
    onJoinRoom(client: ServerSocketClient, { name, password }: { name: string, password: string }, callback: (data: any) => any) {
        const room = this.repository.get(name);
        if (!room) {
            return callback({ success: false, error: 'Unknown room "' + name + '".' });
        }
        const passwordOrNull = typeof (password) !== 'undefined' ? password : null;
        if (!room.config.allow(passwordOrNull)) {
            return callback({ success: false, error: 'Wrong password.' });
        }
        room.controller.attach(client, callback);
    }

    /**
     * Attach events
     */
    @boundMethod
    detach(client: ServerSocketClient) {
        if (this.socketGroup.clients.remove(client)) {
            this.detachEvents(client);
        }
    }

    /**
     * On new room open
     */
    @boundMethod
    onRoomOpen({ room }: { room: Room }) {

        room.on('game:new', this.onRoomGame);
        room.on('game:end', this.onRoomGame);
        room.on('player:join', this.onRoomPlayer);
        room.on('player:leave', this.onRoomPlayer);
        room.config.on('room:config:open', this.onRoomConfigOpen);

        this.socketGroup.addEvent('room:open', room.serialize(false));
    }

    /**
     * On room close
     */
    @boundMethod
    onRoomClose({ room }: { room: Room }) {

        room.removeListener('game:new', this.onRoomGame);
        room.removeListener('game:end', this.onRoomGame);
        room.removeListener('player:join', this.onRoomPlayer);
        room.removeListener('player:leave', this.onRoomPlayer);
        room.config.on('room:config:open', this.onRoomConfigOpen);

        this.socketGroup.addEvent('room:close', { name: room.name });
    }

    /**
     * On room config open
     */
    @boundMethod
    onRoomConfigOpen({ room }: { room: Room }) {
        this.socketGroup.addEvent('room:config:open', { name: room.name, open });
    }

    /**
     * On player leave/join a room
     */
    @boundMethod
    onRoomPlayer({ room }: { room: Room }) {
        const serializedRoom = room.serialize(false);
        this.socketGroup.addEvent('room:players', { name: serializedRoom.name, players: serializedRoom.players });
    }

    /**
     * On room start/end a game
     */
    @boundMethod
    onRoomGame({ room }: { room: Room }) {
        const serializedRoom = room.serialize(false);
        this.socketGroup.addEvent('room:game', { name: serializedRoom.name, game: serializedRoom.game });
    }
}
