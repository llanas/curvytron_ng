import { Collection } from '@shared/collection';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { RoomController } from '../controller/RoomController';
import { ServerSocketClient } from '../core/ServerSocketClient';
import { KickVote } from '../models/KickVote';
import { Player } from '../models/Player';
import { Room } from '../models/Room';

/**
 * Kick vote manager
 */
export class KickManager extends EventEmitter {

    controller: RoomController;
    room: Room;
    votes: any;

    constructor(controller: RoomController) {

        super();

        this.controller = controller;
        this.room = this.controller.room;
        this.votes = new Collection();
        this.controller.on('client:add', this.updateVotes);
        this.controller.on('client:remove', this.onClientLeave);
        this.controller.on('player:add', this.updateVotes);
        this.controller.on('player:remove', this.onPlayerLeave);
        this.room.on('game:new', this.clear);
    }

    /**
     * Vote
     */
    vote(client: ServerSocketClient, player: Player) {
        return this.getVote(player).toggleVote(client);
    }

    /**
     * Get vote for the given player
     */
    getVote(player: Player): KickVote {
        if (this.votes.indexExists(player.id)) {
            return this.votes.getById(player.id);
        }
        const kickVote = new KickVote(player, this.getTotalClients());
        this.votes.add(kickVote);
        kickVote.on('close', this.onVoteClose);
        this.emit('vote:new', kickVote);
        return kickVote;
    }

    /**
     * Remove client
     */
    removeClient(client: ServerSocketClient) {
        const total = this.getTotalClients();
        let kickVote: KickVote;
        for (let i = this.votes.items.length - 1; i >= 0; i--) {
            kickVote = this.votes.items[i];
            if (kickVote) {
                kickVote.removeClient(client);
                kickVote.setTotal(total);
            }
        }
    }

    /**
     * Get total clients
     */
    getTotalClients(): number {
        return this.controller.clients.filter(function () { return this.isPlaying(); }).count();
    }

    /**
     * On vote close
     */
    @boundMethod
    onVoteClose(kickVote: KickVote) {
        kickVote.removeListener('close', this.onVoteClose);
        this.votes.remove(kickVote);

        if (kickVote.result) {
            this.emit('kick', kickVote.target);
        }

        this.emit('vote:close', kickVote);
    }

    /**
     * On player leave
     */
    @boundMethod
    onPlayerLeave({ player }: { player: Player }) {
        const kickVote = this.votes.getById(player.id);

        if (kickVote) {
            kickVote.close();
        }
    }

    /**
     * On player leave
     */
    @boundMethod
    onClientLeave({ client }: { client: ServerSocketClient }) {
        this.removeClient(client);
    }

    /**
     * Update votes
     */
    @boundMethod
    updateVotes() {
        const total = this.getTotalClients();

        for (let i = this.votes.items.length - 1; i >= 0; i--) {
            this.votes.items[i].setTotal(total);
        }
    }

    /**
     * Clear
     */
    @boundMethod
    clear() {
        for (let i = this.votes.items.length - 1; i >= 0; i--) {
            this.votes.items[i].removeListener('close', this.onVoteClose);
        }

        this.votes.clear();
    }
}
