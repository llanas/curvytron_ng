import { BaseAvatar } from '@shared/model/BaseAvatar';
import { PrintManager } from 'manager/PrintManager';

import { AvatarBody } from './AvatarBody';
import { Player } from './Player';

/**
 * Avatar
 */
export class Avatar extends BaseAvatar {

    bodyCount: number;
    printManager: any;
    body: AvatarBody;

    /** OVERRIDE */
    player: Player;


    constructor(player: Player) {

        super(player);

        this.bodyCount = 0;
        this.body = new AvatarBody(this.x, this.y, this);
        this.printManager = new PrintManager(this);
    }

    /**
     * Update
     */
    update(step: number) {
        if (this.alive) {
            this.updateAngle(step);
            this.updatePosition(step);
            this.updateVelocities();
            this.emit('property', { avatar: this, property: 'stamina', value: this.stamina });
            if (this.printing && this.isTimeToDraw()) {
                this.addPoint(this.x, this.y);
            }
        }
    }

    /**
     * Is time to draw?
     */
    isTimeToDraw(): boolean {
        if (this.trail.lastX === null) {
            return true;
        }
        return this.getDistance(this.trail.lastX, this.trail.lastY, this.x, this.y) > this.radius;
    }

    /**
     * Set position
     */
    setPosition(x: number, y: number) {
        super.setPosition(x, y);
        this.body.x = this.x;
        this.body.y = this.y;
        this.body.num = this.bodyCount;
        this.emit('position', this);
    }

    /**
     * Set velocity
     */
    setVelocity(velocity: number) {
        if (this.velocity !== velocity) {
            super.setVelocity(velocity);
            this.emit('property', { avatar: this, property: 'velocity', value: this.velocity });
        }
    }

    /**
     * Set angle
     */
    setAngle(angle: number) {
        if (this.angle !== angle) {
            super.setAngle(angle);
            this.emit('angle', this);
        }
    }

    /**
     * Set angular velocity
     */
    setAngularVelocity(angularVelocity: number) {
        if (this.angularVelocity !== angularVelocity) {
            super.setAngularVelocity(angularVelocity);
        }
    }

    /**
     * Set angular velocity
     */
    setRadius(radius: number) {
        if (this.radius !== radius) {
            super.setRadius(radius);
            this.body.radius = this.radius;
            this.emit('property', { avatar: this, property: 'radius', value: this.radius });
        }
    }

    /**
     * Set invincible
     */
    setInvincible(invincible: number) {
        super.setInvincible(invincible);
        this.emit('property', { avatar: this, property: 'invincible', value: this.invincible });
    }

    /**
     * Set inverse
     */
    setInverse(inverse: number) {
        super.setInverse(inverse);
        this.emit('property', { avatar: this, property: 'inverse', value: this.inverse });
    }

    /**
     * Set color
     */
    setColor(color: string) {
        this.color = color;
        this.emit('property', { avatar: this, property: 'color', value: this.color });
    }

    /**
     * Add point
     */
    addPoint(x: number, y: number, important: boolean = false) {
        super.addPoint(x, y);
        this.emit('point', { avatar: this, x, y, important });
    }

    /**
     * Set printing
     */
    setPrinting(printing: boolean) {
        super.setPrinting(printing);
        this.emit('property', { avatar: this, property: 'printing', value: this.printing });
    }

    /**
     * Die
     */
    die(body?: AvatarBody | null) {
        super.die();
        this.printManager.stop();
        this.emit('die', {
            avatar: this,
            killer: body ? body.data : null,
            old: body ? body.isOld() : null
        });
    }

    /**
     * Set score
     */
    setScore(score: number) {
        super.setScore(score);
        this.emit('score', this);
    }

    /**
     * Set round score
     */
    setRoundScore(score: number) {
        super.setRoundScore(score);
        this.emit('score:round', this);
    }

    /**
     * Clear
     */
    clear() {
        super.clear.call(this);
        if (this.body) {
            this.body.radius = BaseAvatar.radius;
        }
        this.printManager.stop();
        this.bodyCount = 0;
    }
}
