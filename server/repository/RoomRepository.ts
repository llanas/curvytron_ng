import { Collection } from '@shared/collection';
import { EventEmitter } from 'events';
import { Room } from 'models/Room';

/**
 * Room Repository
 */
export class RoomRepository extends EventEmitter {

    generator: any;
    rooms: any;

    constructor() {

        super();

        this.generator = new RoomNameGenerator();
        this.rooms = new Collection([], 'name');
        this.onRoomClose = this.onRoomClose.bind(this);
    }

    /**
     * Create a room
     */
    create(name: string): Room | boolean {
        if (typeof (name) === 'undefined' || !name) {
            name = this.getRandomRoomName();
        }
        const room = new Room(name);
        if (!this.rooms.add(room)) {
            return false;
        }
        room.on('close', this.onRoomClose);
        this.emit('room:open', { room });
        return room;
    }

    /**
     * Delete a room
     */
    remove(room: Room) {
        if (this.rooms.remove(room)) {
            this.emit('room:close', { room });
            return true;
        }
        return false;
    }

    /**
     * Get by name
     */
    get(name: string): Room {
        return this.rooms.getById(name);
    }

    /**
     * Get all
     */
    all(): Room[] {
        return this.rooms.items;
    }

    /**
     * Get random room name
     */
    getRandomRoomName(): string {
        let name = this.generator.getName();
        while (this.rooms.ids.indexOf(name) >= 0) {
            name = this.generator.getName();
        }
        return name;
    }

    onRoomClose(this: RoomRepository, { room }: { room: Room }) {
        this.remove(room);
    }
}
