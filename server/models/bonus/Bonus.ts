import { BaseBonus } from '@shared/model/BaseBonus';
import { Body } from 'core/Body';
import { Avatar } from 'models/Avatar';
import { Game } from 'models/Game';

/**
 * Bonus
 */
export class Bonus extends BaseBonus {

    body: Body;
    target: Avatar = null;
    timeout: any = null;

    constructor(x: number, y: number) {

        super(x, y);
        this.body = new Body(this.x, this.y, this.radius, this);
    }

    /**
     * Apply bonus callback
     */
    applyTo(avatar: Avatar, game: Game) {
        this.target = this.getTarget(avatar, game);
        if (this.duration) {
            this.timeout = setTimeout(this.off, this.duration);
        }
        return 0;
    }

    getTarget(avatar: Avatar, game: Game): Avatar {
        throw new Error('Method not implemented.');
    }
}
