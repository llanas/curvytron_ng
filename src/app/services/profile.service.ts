import { Injectable } from '@angular/core';
import { BasePlayer } from '@shared/model/BasePlayer';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { PlayerControl } from '../models/player-control.model';

@Injectable({
    providedIn: 'root'
})
export class ProfileService extends EventEmitter {

    /**
     * Local storage key
     */
    static localKey = 'PROFILE';

    name: any = null;
    color: any = null;
    sound = true;
    radio = false;
    loading = false;
    controls: any[];
    controller: any;

    constructor () {

        super();

        this.name = null;
        this.color = null;
        this.sound = true;
        this.radio = false;
        this.loading = false;
        this.controls = [
            new PlayerControl(37, 'icon-left-dir'),
            new PlayerControl(39, 'icon-right-dir')
        ];
        // Binding
        const labels = ['Left', 'Right'];
        for (let i = this.controls.length - 1; i >= 0; i--) {
            this.controls[i].label = labels[i];
            this.controls[i].on('change', this.onControlChange);
        }
        this.load();
        this.persist();
    }

    /**
     * Get data
     */
    serialize() {
        return {
            name: this.name,
            color: this.color,
            sound: this.sound,
            radio: this.radio,
            controls: this.getMapping()
        };
    }

    /**
     * Unserialize
     */
    unserialize({ name, color, sound, radio, controls }: { name: any; color: any; sound: any; radio: any; controls: any; }) {
        if (typeof (name) !== 'undefined') {
            this.setName(name);
        }
        if (typeof (color) !== 'undefined') {
            this.setColor(color);
        }
        if (typeof (sound) !== 'undefined') {
            this.setSound(sound);
        }
        if (typeof (radio) !== 'undefined') {
            this.setRadio(radio);
        }
        if (typeof (controls) !== 'undefined') {
            this.setControls(controls);
        }
    }

    /**
     * Persist
     */
    persist() {
        if (this.loading) {
            return;
        }
        if (this.isValid()) {
            window.localStorage.setItem(ProfileService.localKey, JSON.stringify(this.serialize()));
            this.emit('change');
        } else {
            this.load();
        }
    }

    localKey(localKey: any, arg1: string) {
        throw new Error('Method not implemented.');
    }

    /**
     * Persist
     */
    load() {
        this.loading = true;
        const data = window.localStorage.getItem(ProfileService.localKey);
        if (data) {
            this.unserialize(JSON.parse(data));
            this.emit('change');
        }
        if (!this.color) {
            this.setColor(BasePlayer.getRandomColor());
        }
        this.loading = false;
    }

    /**
     * Get mapping
     */
    getMapping(): any[] {
        const mapping = new Array(this.controls.length);
        for (let i = this.controls.length - 1; i >= 0; i--) {
            mapping[i] = this.controls[i].getMapping();
        }
        return mapping;
    }

    /**
     * Set name
     */
    setName(name: string) {
        name = name.trim();
        if (name.length && this.name !== name) {
            this.name = name;
            this.persist();
        }
    }

    /**
     * Set color
     */
    setColor(color: string) {
        if (BasePlayer.validateColor(color)) {
            this.color = color;
            this.persist();
        }
    }

    /**
     * Set controls
     */
    setControls(controls: string | any[]) {
        for (let i = controls.length - 1; i >= 0; i--) {
            this.controls[i].loadMapping(controls[i]);
        }
        this.persist();
    }

    /**
     * Set sound
     */
    setSound(sound: boolean) {
        if (this.sound !== sound) {
            this.sound = sound;
            this.persist();
        }
    }

    /**
     * Set radio
     */
    setRadio(radio: boolean) {
        if (this.radio !== radio) {
            this.radio = radio;
            this.persist();
        }
    }

    /**
     * Is profile complete?
     */
    isComplete(): boolean {
        return this.name && this.color;
    }

    /**
     * Is profile valid?
     */
    isValid(): boolean {
        if (!this.name || !this.name.trim().length) {
            return false;
        }
        if (!this.color || !BasePlayer.validateColor(this.color)) {
            return false;
        }
        return true;
    }

    /**
     *
     * Profile
     */
    @boundMethod
    onControlChange() {
        this.persist();
    }
}
