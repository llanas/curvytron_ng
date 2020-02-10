import { Collection } from '@shared/collection';
import { BaseSocketClient } from '@shared/core/BaseSocketClient';
import { TickrateLogger } from '@shared/service/TickrateLogger';
import { boundMethod } from 'autobind-decorator';
import * as WebSocket from 'ws';

import { PingLogger } from './PingLogger.ts';

export class ServerSocketClient extends BaseSocketClient {

    static pingInterval = 1000;

    ip: string;
    active = true;
    players: Collection<any>;
    pingLogger: PingLogger;
    tickrate: TickrateLogger;

    constructor(socket: WebSocket, interval: number, ip: string) {

        super(socket, interval);

        this.ip = ip;
        this.id = null;
        this.players = new Collection([], 'id');
        this.pingLogger = new PingLogger(this.socket);
        this.tickrate = new TickrateLogger();
        this.on('whoami', this.identify);
        this.on('activity', this.onActivity);
        this.pingLogger.on('latency', this.onLatency);
    }

    /**
     * Is this client playing?
     */
    isPlaying(): boolean {
        return !this.players.isEmpty();
    }

    /**
     * Clear players
     */
    clearPlayers() {
        this.emit('players:clear', this);
        this.players.clear();
    }

    /**
     * Send an event
     */
    sendEvents(events: any) {
        this.tickrate.tick(events);
        super.sendEvents.call(this, events);
    }
    /**
     * Stop
     */
    stop() {
        super.stop.call(this);
        this.pingLogger.stop();
        this.tickrate.stop();
    }
    /**
     * Object version of the client
     */
    serialize(): any {
        const data = super.serialize.call(this);
        data.active = this.active;
        return data;
    }

    /**
     * On ping logger latency value
     */
    onLatency(latency: any) {
        this.addEvent('latency', latency, null, true);
    }

    /**
     * On activity change
     */
    onActivity(active: any) {
        this.active = active;
    }

    /**
     * Who am I?
     */
    @boundMethod
    identify(event: any) {
        event[1](this.id);
    }
}
