import { Injectable } from '@angular/core';
import { BaseSocketClient } from '@shared/core/BaseSocketClient';
import { boundMethod } from 'autobind-decorator';

@Injectable({
    providedIn: 'root'
})
export class SocketClientService extends BaseSocketClient {

    constructor () {

        const protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
        // super(new window.WebSocket(protocol + document.location.host + document.location.pathname, ['websocket']));
        // tslint:disable-next-line: no-string-literal
        const socket = window['WebSocket'] || window['MozWebSocket'];
        super(new socket(protocol + 'localhost:8090', ['websocket']));

        this.id = null;
        this.connected = false;

        this.socket.addEventListener('open', this.onOpen);
        this.socket.addEventListener('error', this.onError);
        this.socket.addEventListener('close', this.onClose);
    }

    /**
     * On open
     */
    onClose(e?: Event) {
        console.info('Disconnected.');
        this.connected = false;
        this.id = null;
        this.stop();
        this.emit('disconnected');
    }


    /**
     * On open
     */
    @boundMethod
    onOpen(e: WebSocket) {
        console.info('Socket open.');
        this.addEvent('whoami', null, this.onConnection);
    }

    /**
     * On socket connection
     */
    @boundMethod
    onConnection(id: string) {
        console.info('Connected with id "%s".', id);

        this.id = id;
        this.connected = true;

        this.start();
        this.emit('connected');
    }


    /**
     * On error
     */
    @boundMethod
    onError(e: Event) {
        console.error(e);

        if (!this.connected) {
            this.onClose();
        }
    }
}
