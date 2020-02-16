import { Injectable } from '@angular/core';

import { ProfileService } from './profile.service';

@Injectable({
    providedIn: 'root'
})
export class RadioService {

    active = false;
    enabled: boolean;
    element: HTMLVideoElement;
    volume: number;
    source: any;

    constructor (private profile: ProfileService) {
        this.enabled = this.profile.radio;
        this.element = this.getVideo();
        this.resolve();
    }

    /**
     * Get video
     */
    getVideo(): HTMLVideoElement {
        const video = document.createElement('video');
        const source = document.createElement('source');
        video.appendChild(source);
        video.name = 'media';
        video.autoplay = true;
        video.volume = this.volume;
        source.type = 'audio/mpeg';
        return video;
    }

    /**
     * Set enabled/disabled (controlled by the user)
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled ? true : false;
        this.profile.setRadio(this.enabled);
        this.resolve();
    }

    /**
     * Set active/inactive (controlled by the game)
     */
    setActive(active: boolean) {
        this.active = active ? true : false;
        this.resolve();
    }

    /**
     * Set volume
     */
    setVolume(volume: number) {
        this.element.volume = typeof (volume) !== 'undefined' ? volume : this.volume;
    }

    /**
     * Resolve radio status
     */
    resolve() {
        if (this.active && this.enabled) {
            this.play();
        } else {
            this.stop();
        }
    }

    /**
     * Play
     */
    play() {
        this.element.src = this.source;
    }

    /**
     * Stop
     */
    stop() {
        this.element.src = '';
    }
}
