import { BaseSocketClient } from '@shared/core/BaseSocketClient';
import { EventEmitter } from 'events';

import { BaseAvatar } from './BaseAvatar';

/**
 * BasePlayer
 */
export class BasePlayer extends EventEmitter {

    /**
     * Max length for name
     */
    static maxLength = 25;

    /**
     * Max length for color
     */
    static colorMaxLength = 20;

    client: BaseSocketClient;
    name: string;
    color: string;
    ready: boolean;

    id: string = null;
    avatar: BaseAvatar = null;

    maxLength: number;
    colorMaxLength: number;

    constructor(client: BaseSocketClient, name: string, color: string, ready = false) {

        super();

        this.client = client;
        this.name = name;
        this.color = typeof (color) !== 'undefined' && this.validateColor(color) ? color : this.getRandomColor();
    }

    /**
     * Set name
     */
    setName(name: string) {
        this.name = name;
    }

    /**
     * Set color
     */
    setColor(color: string): boolean {
        if (!this.validateColor(color, true)) {
            return false;
        }
        this.color = color;
        return true;
    }

    /**
     * Equal
     */
    equal(player: BasePlayer): boolean {
        return this.id === player.id;
    }

    /**
     * Toggle Ready
     */
    toggleReady(toggle: boolean) {
        this.ready = typeof (toggle) !== 'undefined' ? (toggle ? true : false) : !this.ready;
    }

    /**
     * Get avatar
     */
    getAvatar(): BaseAvatar {
        if (!this.avatar) {
            this.avatar = new BaseAvatar(this);
        }
        return this.avatar;
    }

    /**
     * Reset player after a game
     */
    reset() {
        this.avatar.destroy();
        this.avatar = null;
        this.ready = false;
    }

    /**
     * Get random Color
     */
    getRandomColor(): string {
        let color = '';
        const randomNum = () => Math.ceil(Math.random() * 255).toString(16);
        while (!this.validateColor(color, true)) {
            color = '#' + randomNum() + randomNum() + randomNum();
        }
        return color;
    }

    /**
     * Validate color
     */
    validateColor(color: string, yiq?: any /* NFC */): boolean {
        if (typeof (color) !== 'string') {
            return false;
        }
        const matches = color.match(new RegExp('^#([a-fA-F0-9]{2})([a-fA-F0-9]{2})([a-fA-F0-9]{2})$'));
        if (matches && yiq) {
            const ratio = ((parseInt(matches[1], 16) * 0.4) + (parseInt(matches[2], 16) * 0.5) + (parseInt(matches[3], 16) * 0.3)) / 255;
            return ratio > 0.3;
        }
        return matches ? true : false;
    }

    /**
     * Serialize
     */
    serialize(): SerializedBasePlayer {
        return {
            client: this.client.id,
            id: this.id,
            name: this.name,
            color: this.color,
            ready: this.ready
        };
    }
}

export interface SerializedBasePlayer {
    client: string; // ClientId
    id: string;
    name: string;
    color: string;
    ready: boolean;
}
