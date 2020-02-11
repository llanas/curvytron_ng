import { Collection } from '@shared/collection';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { ServerSocketClient } from '../core/ServerSocketClient';
import { Player } from './Player';

/**
 * Kick vote
 */
export class KickVote extends EventEmitter {

    /**
     * Time before an empty vote is closed
     */
    static timeToClose = 10000;

    id: string;
    target: Player;
    votes: Collection<ServerSocketClient>;
    total: number;
    closed = false;
    result = false;
    timeout: NodeJS.Timer;

    constructor(player: Player, total: number) {

        super();

        this.id = player.id;
        this.target = player;
        this.votes = new Collection<ServerSocketClient>();
        this.total = parseInt('' + total, 10);
        this.timeout = null;
    }

    /**
     * Set total
     */
    setTotal(total: number): KickVote {
        if (this.closed) {
            return this;
        }
        this.total = total;
        this.check();
        return this;
    }

    /**
     * Toggle vote
     */
    toggleVote(client: ServerSocketClient): KickVote {
        if (this.closed) {
            return this;
        }
        if (this.hasVote(client)) {
            this.votes.remove(client);
        } else {
            this.votes.add(client);
        }
        this.check();
        return this;
    }

    /**
     * Remove client
     */
    removeClient(client: ServerSocketClient) {
        const result = this.votes.remove(client);
        this.check();
        return result;
    }

    /**
     * Check
     */
    check() {
        if (this.closed) {
            return;
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        if (this.votes.count() > this.total / 2) {
            this.result = true;
            this.close();
        } else if (this.votes.isEmpty()) {
            // this.timeout = setTimeout(this.close, this.timeToClose);
            throw new Error('FIXME !');
        }
    }

    timeToClose(close?: any, timeToClose?: any): any {
        throw new Error('Method not implemented.');
    }

    /**
     * Has vote
     */
    hasVote(client: ServerSocketClient): boolean {
        return this.votes.exists(client);
    }

    /**
     * Serialize
     */
    serialize() {
        return {
            target: this.target.id,
            result: this.result
        };
    }

    @boundMethod
    close() {
        this.closed = true;
        this.votes.clear();
        this.emit('close', this);
    }
}
