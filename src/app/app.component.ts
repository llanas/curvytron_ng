import { Component } from '@angular/core';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { SocketClientService } from './services/core/socket-client.service';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent extends EventEmitter {
    title = 'curvytron-ng';

    status: string;
    profile: boolean;

    constructor (private client: SocketClientService) {

        super();

        // Hydrate scope
        this.status = 'connecting';
        this.profile = false;

        this.client.on('connected', this.onConnect);
        this.client.on('disconnected', this.onDisconnect);
    }

    ngOnInit() {
    }

    /**
     * On connect
     */
    @boundMethod
    onConnect() {
        this.status = 'online';
        this.profile = true;
    }

    /**
     * On disconnect
     */
    @boundMethod
    onDisconnect() {
        document.body.classList.remove('game-mode');
        this.status = 'disconnected';
    }

    /**
     * Reload
     */
    @boundMethod
    reload() {
        window.location.reload();
    }
}
