import { Injectable } from '@angular/core';
import { Collection } from '@shared/collection';
import { BaseMessage } from '@shared/model/BaseMessage';
import { BaseChat } from '@shared/service/BaseChat';
import { boundMethod } from 'autobind-decorator';

import MessageKick from '../models/messages/message-kick.model';
import MessagePlayer from '../models/messages/message-player.model';
import MessageRoomMaster from '../models/messages/message-room-master.model';
import MessageTip from '../models/messages/message-tip.model';
import MessageVoteKick from '../models/messages/message-vote-kick.model';
import Message from '../models/messages/message.model';
import { Player } from '../models/player.model';
import { RoomRepository } from '../repositories/room.repository';
import { SocketClientService } from './core/socket-client.service';

@Injectable({
    providedIn: 'root'
})
export class ChatService extends BaseChat {

    message: MessagePlayer;
    room: any;
    element: any;
    auto: boolean;
    sources: any;
    muted: any[];

    constructor (private client: SocketClientService,
        private repository: RoomRepository) {

        super();

        this.messages.index = false;

        this.client = client;
        this.message = new MessagePlayer(this.client);
        this.room = null;
        this.element = null;
        this.auto = true;
        this.sources = new Collection([], 'id', true);
        this.muted = [];

        this.attachEvents();
    }
    /**
     * Attach events
     */
    attachEvents() {
        this.client.on('room:talk', this.onTalk);
        this.repository.on('room:join', this.setRoom);
        this.repository.on('room:leave', this.setRoom);
        this.repository.on('vote:new', this.onVoteNew);
        this.repository.on('room:kick', this.onKick);
        this.repository.on('room:master', this.onRoomMaster);
    }

    /**
     * Detach events
     */
    detachEvents() {
        this.client.off('room:talk', this.onTalk);
        this.repository.off('room:join', this.setRoom);
        this.repository.off('room:leave', this.setRoom);
        this.repository.off('vote:new', this.onVoteNew);
        this.repository.off('room:kick', this.onKick);
        this.repository.off('room:master', this.onRoomMaster);
    }
    /**
     * Set player
     */
    setPlayer(player: Player) {
        if (this.room) {
            this.message.player = player;
        }
    }
    /**
     * Set DOM element
     */
    setElement(element) {
        this.element = element;
        this.element.addEventListener('scroll', this.onActivity);

        setTimeout(this.scrollDown, 0);
    }

    /**
     * Add message
     */
    addMessage(message: BaseMessage): boolean {
        this.sources.add(message);

        if (super.addMessage(message) && this.auto) {
            this.scrollDown();
        } else {
            return false;
        }
        return true;
    }

    /**
     * Remove message
     */
    removeMessage(message: BaseMessage) {
        this.sources.remove(message);
        this.messages.remove(message);
    }

    /**
     * Get player from message data
     */
    getPlayer(data: any): Player | any {
        const player = this.room.getPlayerByClient(data.client);

        if (player) {
            return player;
        }

        return {
            name: typeof (data.name) === 'string' ? data.name : Message.name + ' ' + data.client,
            color: typeof (data.color) === 'string' ? data.color : Message.color
        };
    }

    /**
     * Add tutorial message
     */
    addTip() {
        this.addMessage(new MessageTip());
    }

    /**
     * Is message valid
     */
    isValid(message: MessagePlayer): boolean {
        if (!(message instanceof MessagePlayer)) {
            return true;
        }

        // TODO check if message.id === client.id?
        return this.isAllowed(message.id);
    }

    /**
     * Clear messages
     */
    clearMessages() {
        super.clearMessages();
        this.sources.clear();
        this.addTip();
    }

    /**
     * Mute/Unmute a client
     */
    toggleMute(clientId: number) {
        const index = this.muted.indexOf(clientId);
        const exists = index >= 0;

        if (exists) {
            this.muted.splice(index, 1);
        } else {
            this.muted.push(clientId);
        }

        this.filterMessages();

        return !exists;
    }

    /**
     * Is this client allowed to talk?
     */
    isAllowed(clientId: number | any): boolean {
        return this.muted.indexOf(clientId) < 0;
    }

    /**
     * Filter messages
     */
    filterMessages() {
        const length = this.sources.count();

        this.messages.clear();

        for (let message, i = 0; i < length; i++) {
            message = this.sources.items[i];
            if (!(message instanceof MessagePlayer) || this.isAllowed(message.id)) {
                this.messages.add(message);
            }
        }
    }

    /**
     * Clear
     */
    clear() {
        this.clearMessages();

        if (this.element) {
            this.element.removeEventListener('scroll', this.onActivity);
        }

        this.message.clear();
        this.muted.length = 0;
        this.room = null;
        this.element = null;
    }

    /**
     * Set room
     */
    @boundMethod
    setRoom() {
        this.room = this.repository.room;

        if (this.room) {
            this.clearMessages();
        } else {
            this.clear();
        }
    }

    /**
     * Scroll down
     */
    @boundMethod
    scrollDown() {
        if (this.element) {
            this.element.scrollTop = this.element.scrollHeight;
        }
    }

    /**
     * Talk
     */
    @boundMethod
    talk() {

        if (this.message.content.length) {
            this.client.addEvent(
                'room:talk',
                this.message.content.substr(0, Message.maxLength),
                (result) => {
                    if (result.success) {
                        this.message.clear();
                    } else {
                        console.error('Could not send %s', this.message);
                    }
                }
            );
        }
    }

    /**
     * On talk
     */
    @boundMethod
    onTalk(e: any) {
        if (typeof (e.detail) !== 'undefined' && e.detail) {
            this.addMessage(new MessagePlayer(
                e.detail.client,
                e.detail.content,
                this.getPlayer(e.detail),
                e.detail.creation
            ));
        }
    }

    /**
     * On new vote
     */
    @boundMethod
    onVoteNew(e: any) {
        this.addMessage(new MessageVoteKick(e.detail.target));
    }

    /**
     * On kick
     */
    @boundMethod
    onKick(e: any) {
        this.addMessage(new MessageKick(e.detail));
    }

    /**
     * On room master
     */
    @boundMethod
    onRoomMaster(e: any) {
        if (e.detail.master) {
            this.addMessage(new MessageRoomMaster(e.detail.master));
        }
    }

    /**
     * On activity
     */
    @boundMethod
    onActivity(e: any) {
        if (this.element) {
            this.auto = this.element.scrollTop === this.element.scrollHeight - this.element.clientHeight;
        }
    }
}
