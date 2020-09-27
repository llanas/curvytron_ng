import { Component, OnInit } from '@angular/core';
import { Collection } from '@shared/collection';
import { BaseRoom } from '@shared/model/BaseRoom';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { RoomListItem } from '../../models/room-list-item.model';
import { RoomsRepository } from '../../repositories/rooms.repository';
import { SocketClientService } from '../../services/core/socket-client.service';

@Component({
    selector: 'app-rooms',
    templateUrl: './rooms.component.html',
    styleUrls: ['./rooms.component.scss']
})
export class RoomsComponent extends EventEmitter implements OnInit {

    name: string;
    repository: RoomsRepository;
    roomName: string;
    rooms: Collection<RoomListItem>;

    get roomMaxLength() {
        return BaseRoom.maxLength;
    }

    constructor (private socketClient: SocketClientService) {

        super();

        this.repository = new RoomsRepository(this.socketClient);

        // Binding:
        // this.$scope.$on('$destroy', this.detachEvents);
        // this.$location.search('password', null);

        // Hydrating the scope:
        this.rooms = this.repository.rooms;
        this.roomName = '';

        // this.$parent.profile = true;

        this.attachEvents();
    }

    ngOnInit(): void {
        document.body.classList.remove('game-mode');
    }

    /**
     * Attach Events
     */
    attachEvents() {
        // this.repository.on('room:open', this.requestDigestScope);
        // this.repository.on('room:close', this.requestDigestScope);
        // this.repository.on('room:players', this.requestDigestScope);
        // this.repository.on('room:game', this.requestDigestScope);
        // this.repository.on('room:config:open', this.requestDigestScope);
        this.repository.start();
    }

    /**
     * Attach Events
     */
    @boundMethod
    detachEvents() {
        this.repository.stop();

        // this.repository.off('room:open', this.requestDigestScope);
        // this.repository.off('room:close', this.requestDigestScope);
        // this.repository.off('room:players', this.requestDigestScope);
        // this.repository.off('room:game', this.requestDigestScope);
        // this.repository.off('room:config:open', this.requestDigestScope);
    }

    /**
     * Create a room
     */
    @boundMethod
    createRoom() {
        this.repository.create(this.roomName, this.onCreateRoom);
    }

    /**
     * On create Room
     */
    @boundMethod
    onCreateRoom({ success, room }: { success: boolean; room: BaseRoom; }) {
        if (success) {
            this.name = null;
            this.joinRoom(this.repository.createRoom(room));
            this.applyScope();
        } else {
            console.error('Could not create room %s', this.name);
        }
    }

    applyScope() {
        throw new Error('Method not implemented.');
    }

    /**
     * Join a room
     */
    @boundMethod
    joinRoom(room: RoomListItem) {
        if (room.open) {
            // this.$location.path(room.getUrl());
        } else if (room.password && room.password.match(new RegExp('[0-9]{4}'))) {
            // this.$location.path(room.getUrl()).search('password', room.password);
        }
    }

    /**
     * Quick play
     */
    @boundMethod
    quickPlay() {
        const room = this.repository.rooms.filter(function () { return !this.game; }).getRandomItem();

        if (room) {
            this.joinRoom(room);
        } else {
            this.roomName = 'Hello Curvytron!';
            this.createRoom();
        }
    }
}
