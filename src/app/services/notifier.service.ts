import { Injectable } from '@angular/core';
import { boundMethod } from 'autobind-decorator';

import { ActivityWatcherService } from './activity-watcher.service';
import { SoundManagerService } from './sound-manager.service';

@Injectable({
    providedIn: 'root'
})
export class NotifierService {

    /**
     * Default message duration
     */
    static duration = 5000;

    element: HTMLTitleElement;
    title: any;
    timeout: any;

    constructor (private sound: SoundManagerService, private watcher: ActivityWatcherService) {

        this.element = document.getElementsByTagName('title')[0];
        this.title = this.element.text;
        this.timeout = null;

        this.clear = this.clear.bind(this);
    }

    /**
     * Notify
     */
    notify(message: string, duration?: number, sound?: string) {
        if (!this.watcher.isActive() || !this.watcher.isFocused()) {
            this.display(message, duration);
        }

        this.sound.play(typeof (sound) === 'string' ? sound : 'notice');
    }

    /**
     * Notify inactive
     */
    notifyInactive(message: string, duration: number, sound: string) {
        if (!this.watcher.isActive() || !this.watcher.isFocused()) {
            this.display(message, duration);
            this.sound.play(typeof (sound) === 'string' ? sound : 'notice');
        }
    }

    /**
     * Set message
     */
    display(message: string, duration: number) {
        this.clearTimeout();
        this.write(message);
        setTimeout(this.clear, typeof (duration) === 'number' ? duration : NotifierService.duration);
    }

    /**
     * Write a message in the title
     */
    write(message: string) {
        this.element.text = message + ' - ' + this.title;
    }

    /**
     * Clear timeout
     */
    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    /**
     * Clear the title
     */
    @boundMethod
    clear() {
        this.clearTimeout();
        this.element.text = this.title;
    }
}
