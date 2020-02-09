import { EventEmitter } from 'events';

import { BaseAvatar } from './BaseAvatar';
import { BaseGame } from './BaseGame';

export interface IBaseBonus {
    clear(): void;
    applyTo(avatar: BaseAvatar, game: BaseGame): number;
    getProbability(game: BaseGame): number;
    getEffects(avatar: BaseAvatar): any[];
}

/**
 * BaseBonus
 */
export class BaseBonus extends EventEmitter implements IBaseBonus {

    /**
     * Target affected
     */
    static affect = 'self';

    /**
     * Radius
     */
    static radius = 3;

    /**
     * Effect duration
     */
    static duration = 5000;

    /**
     * Probability to appear
     */
    static probability = 1;

    x: number;
    y: number;
    id: string = null;
    probability: number;
    affect: string;
    radius: number;
    duration: number;

    constructor(x: number, y: number) {

        super();

        this.x = x;
        this.y = y;
    }

    clear(): void {
        throw new Error('Method not implemented.');
    }

    applyTo(avatar: any, game: any): number {
        throw new Error('Method not implemented.');
    }

    getProbability(game: any): number {
        throw new Error('Method not implemented.');
    }

    getEffects(avatar: any): any[] {
        throw new Error('Method not implemented.');
    }
}
