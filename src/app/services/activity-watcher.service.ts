import { Injectable } from '@angular/core';
import { boundMethod } from 'autobind-decorator';

import { SocketClientService } from './core/socket-client.service';

@Injectable({
    providedIn: 'root'
})
export class ActivityWatcherService {

    /**
     * Tolerated time away from keyboard
     */
    static tolerance = 60000;

    /**
     * Activity check interval
     */
    static checkInterval = 10000;

    focused: boolean;
    active: boolean;
    lastActivity: number;

    interval: number;

    constructor (private socketClient: SocketClientService) {

        this.focused = true;
        this.active = true;
        this.lastActivity = new Date().getTime();
        this.interval = null;

        this.onFocus = this.onFocus.bind(this);
        this.onBlur = this.onBlur.bind(this);
        this.checkInactivity = this.checkInactivity.bind(this);

        window.addEventListener('focus', this.onFocus);
        window.addEventListener('mousemove', this.onFocus);
        window.addEventListener('click', this.onFocus);
        window.addEventListener('keypress', this.onFocus);

        // gamepadListener.addEventListener('gamepad:axis', this.onFocus);
        // gamepadListener.addEventListener('gamepad:button', this.onFocus);

        window.addEventListener('blur', this.onBlur);

        this.interval = window.setInterval(this.checkInactivity, ActivityWatcherService.checkInterval);
    }

    /**
     * Set active
     */
    setActive(active: boolean) {
        active = active ? true : false;

        if (active) {
            this.lastActivity = new Date().getTime();
        }

        if (this.active !== active) {
            this.active = active;
            this.socketClient.addEvent('activity', this.active);

            if (this.active) {
                this.interval = window.setInterval(this.checkInactivity, ActivityWatcherService.checkInterval);
            } else {
                clearInterval(this.interval);
            }
        }
    }

    /**
     * Set focused
     */
    setFocused(focused: boolean) {
        if (this.focused !== focused) {
            this.focused = focused;
        }
    }

    /**
     * Is active?
     */
    isActive(): boolean {
        return this.active;
    }

    /**
     * Is focused?
     */
    isFocused(): boolean {
        return this.focused;
    }

    /**
     * On focus
     */
    @boundMethod
    onFocus(event: Event) {
        this.setFocused(true);
        this.setActive(true);
    }

    /**
     * On blur
     */
    @boundMethod
    onBlur(event: Event) {
        this.setFocused(false);
    }

    /**
     * Check inactivity
     */
    @boundMethod
    checkInactivity() {
        const inactivity = new Date().getTime() - this.lastActivity;

        if (inactivity > ActivityWatcherService.tolerance) {
            this.setActive(false);
        }
    }
}
