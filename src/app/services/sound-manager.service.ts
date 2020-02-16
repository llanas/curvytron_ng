import { Injectable } from '@angular/core';

import { ProfileService } from './profile.service';

@Injectable({
    providedIn: 'root'
})
export class SoundManagerService {

    /**
     * Volume
     */
    static volume = 0.5;

    /**
     * Sounds
     */
    static sounds = [
        { id: 'death', src: 'death.ogg' },
        { id: 'win', src: 'win.ogg' },
        { id: 'notice', src: 'notice.ogg' },
        { id: 'bonus-clear', src: 'bonus-clear.ogg' },
        { id: 'bonus-pop', src: 'bonus-pop.ogg' }
    ];

    /**
     * Directory
     */
    static directory = 'sounds/';

    active: boolean;

    /**
     * Toggle active
     */
    static toggle = function () {
        this.setActive(!this.active);
    };

    constructor (private profile: ProfileService) {

        this.active = this.profile.sound;

        createjs.Sound.alternateExtensions = ['mp3'];
        createjs.Sound.registerSounds(SoundManagerService.sounds, SoundManagerService.directory);
        createjs.Sound.setVolume(this.active ? SoundManagerService.volume : 0);
    }

    /**
     * Play a sound
     */
    play(sound: string) {
        if (this.active) {
            createjs.Sound.play(sound);
        }
    }

    /**
     * Sound manager
     */
    stop() {
        createjs.Sound.stop();
    }

    /**
     * Set active/inactive
     */
    setActive(active: boolean) {
        this.active = active ? true : false;
        this.setVolume(this.active ? SoundManagerService.volume : 0);
        this.profile.setSound(this.active);
    }

    /**
     * Set volume
     */
    setVolume(volume: number) {
        createjs.Sound.setVolume(typeof (volume) !== 'undefined' ? volume : SoundManagerService.volume);
    }
}
