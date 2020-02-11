import { Body } from '../core/Body';
import { Avatar } from './Avatar';

/**
 * Avatar body
 */
export class AvatarBody extends Body {

    /**
     * Age considered old
     */
    static oldAge = 2000;

    num: number;
    birth: number;
    oldAge: number;

    constructor(x: number, y: number, avatar: Avatar) {

        super(x, y, avatar.radius, avatar);
        this.num = avatar.bodyCount++;
        this.birth = new Date().getTime();
    }

    /**
     * Match?
     */
    match(body: Body): boolean {
        if ((body instanceof AvatarBody) && this.data.equal(body.data)) {
            return body.num - this.num > this.data.trailLatency;
        }
        return true;
    }
    /**
     * Is old?
     */
    isOld(): boolean {
        return new Date().getTime() - this.birth >= this.oldAge;
    }
}
