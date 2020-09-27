import { Collection } from '@shared/collection';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'protractor';

import { RoomListItem } from '../models/room-list-item.model';
import { Room } from '../models/room.model';
import { SocketClientService } from '../services/core/socket-client.service';

/**
 * RoomsRepository
 */
export class RoomsRepository extends EventEmitter {

    rooms: Collection<RoomListItem>;

    constructor (private client: SocketClientService) {

        super();

        this.rooms = new Collection<RoomListItem>([], 'name');
    }

    /**
     * Attach events
     */
    attachEvents() {
        this.client.on('room:open', this.onRoomOpen);
        this.client.on('room:close', this.onRoomClose);
        this.client.on('room:players', this.onRoomPlayers);
        this.client.on('room:game', this.onRoomGame);
        this.client.on('room:config:open', this.onRoomConfigOpen);
    }

    /**
     * Attach events
     */
    detachEvents() {
        this.client.off('room:open', this.onRoomOpen);
        this.client.off('room:close', this.onRoomClose);
        this.client.off('room:players', this.onRoomPlayers);
        this.client.off('room:game', this.onRoomGame);
        this.client.off('room:config:open', this.onRoomConfigOpen);
    }

    /**
     * Get all
     */
    all(): Collection<RoomListItem> {
        return this.rooms;
    }

    /**
     * Get
     */
    get(name: string): RoomListItem {
        return this.rooms.getById(name);
    }

    /**
     * Create
     */
    create(name: string, callback: (arg: any) => any) {
        if (typeof (name) === 'string') {
            name = name.substr(0, Room.prototype.maxLength).trim();
        }
        this.client.addEvent('room:create', { name }, callback);
    }

    /**
     * Create room proxy object from data
     */
    createRoom(data: any): RoomListItem {
        return new RoomListItem(data.name, data.players, data.game, data.open);
    }

    /**
     * Pause
     */
    stop() {
        this.detachEvents();
        this.rooms.clear();
    }

    // EVENTS:

    /**
     * On room open
     */
    @boundMethod
    onRoomOpen({ detail }: { detail: any }): boolean {
        const room = this.createRoom(detail);

        if (this.rooms.add(room)) {
            this.emit('room:open', { room });
            return true;
        }
        return false;
    }

    /**
     * On close room
     */
    @boundMethod
    onRoomClose({ detail }: { detail: any }): boolean {
        const room = this.get(detail.name);

        if (room && this.rooms.remove(room)) {
            this.emit('room:close', room);
            return true;
        }
        return false;
    }

    /**
     * On room config open change
     */
    @boundMethod
    onRoomConfigOpen({ detail }: { detail: any }): boolean {
        const room = this.get(detail.name);

        if (room) {
            room.open = detail.open;
            this.emit('room:config:open', room);
            return true;
        }
        return false;
    }

    /**
     * On room players change
     */
    @boundMethod
    onRoomPlayers({ detail }: { detail: any }): boolean {
        const room = this.get(detail.name);

        if (room) {
            room.players = detail.players;
            this.emit('room:players', room);
            return true;
        }
        return false;
    }

    /**
     * On room game change
     */
    @boundMethod
    onRoomGame({ detail }: { detail: any }): boolean {
        const room = this.get(detail.name);

        if (room) {
            room.game = detail.game;
            this.emit('room:game', room);
            return true;
        }
        return false;
    }

    /**
     * Start
     */
    @boundMethod
    start() {
        if (this.client.connected) {
            this.attachEvents();
            this.client.addEvent('room:fetch');
        } else {
            this.client.on('connected', this.start);
        }
    }
}
