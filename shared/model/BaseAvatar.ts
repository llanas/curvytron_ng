import { EventEmitter } from 'events';

import { BaseBonusStack } from './BaseBonusStack';
import { BasePlayer } from './BasePlayer';
import { BaseTrail } from './BaseTrail';

/**
 * Base Avatar
 */
export class BaseAvatar extends EventEmitter {


    static staminaBase = 3;
    static staminaThreshold = 1;

    /**
     * Movement velocity
     */
    static velocity = 16;

    /**
     * Turn velocity
     */
    static angularVelocityBase = 2.8 / 1000;

    /**
     * Radius
     */
    static radius = 0.6;

    /**
     * Number of trail points that don't kill the player
     */
    static trailLatency = 3;

    /**
     * Inverted controls
     */
    static inverse = false;

    /**
     * Invincible
     */
    static invincible = false;

    /**
     * Type of tunrn: round or straight
     */
    static directionInLoop = true;


    id: string;
    name: string;
    color: string;

    player: BasePlayer;

    x = 0;
    y = 0;
    trail: any;
    bonusStack: any;
    angle = 0;
    velocityX = 0;
    velocityY = 0;
    angularVelocity = 0;
    alive = true;
    printing = false;
    score = 0;
    roundScore = 0;
    ready = false;
    present = true;
    speeding = 1;
    stamina = 3;
    staminaDate = Date.now();

    inverse: any;
    angularVelocityBase: any;
    staminaThreshold: any;
    directionInLoop: any;
    velocity: number;
    staminaBase: any;
    radius: number;
    invincible: boolean;
    body: any;
    trailLatency: number;


    constructor(player: BasePlayer) {

        super();

        this.id = player.id;
        this.name = player.name;
        this.color = player.color;
        this.player = player;
        this.trail = new BaseTrail(this);
        this.bonusStack = new BaseBonusStack(this);
        // useless too? this.updateVelocities();
    }

    /**
     * Equal
     */
    equal(avatar: BaseAvatar): boolean {
        return this.id === avatar.id;
    }

    /**
     * Set Point
     */
    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    /**
     * Add point
     */
    addPoint(x: number, y: number) {
        this.trail.addPoint(x, y);
    }

    /**
     * Update angular velocity
     */
    updateAngularVelocity(factor?: number) {
        if (typeof (factor) === 'undefined') {
            if (this.angularVelocity === 0) {
                return;
            }
            factor = (this.angularVelocity > 0 ? 1 : -1) * (this.inverse ? -1 : 1);
        }
        this.setAngularVelocity(factor * this.angularVelocityBase * (this.inverse ? -1 : 1));
    }

    /**
     * Update speeding called when player starts to change speeding
     */
    updateSpeeding(speeding: number) {
        if (typeof (speeding) === 'undefined' || this.stamina < BaseAvatar.prototype.staminaThreshold) {
            this.speeding = 1;
        } else if (speeding > 1) {
            this.speeding = 1.3;
        } else if (speeding < 1) {
            this.speeding = 0.7;
        } else {
            this.speeding = 1;
        }
        this.updateVelocities();
    }

    /**
     * Set angular velocity
     */
    setAngularVelocity(angularVelocity: number) {
        this.angularVelocity = angularVelocity;
    }

    /**
     * Set angle
     */
    setAngle(angle: number) {
        if (this.angle !== angle) {
            this.angle = angle;
            this.updateVelocities();
        }
    }

    /**
     * Update
     */
    update(step: number) { }

    /**
     * Add angle
     */
    updateAngle(step: number) {
        if (this.angularVelocity) {
            if (this.directionInLoop) {
                this.setAngle(this.angle + this.angularVelocity * step);
            } else {
                this.setAngle(this.angle + this.angularVelocity);
                this.updateAngularVelocity(0);
            }
        }
    }

    /**
     * Update position
     */
    updatePosition(step: number) {
        this.setPosition(this.x + this.velocityX * step, this.y + this.velocityY * step);
    }

    /**
     * Set velocity
     */
    setVelocity(velocity: number) {
        velocity = Math.max(velocity, BaseAvatar.prototype.velocity / 2);
        if (this.velocity !== velocity) {
            this.velocity = velocity;
            this.updateVelocities();
        }
    }

    setStamina(stamina: number) {
        this.stamina = stamina;
        console.log('stamina ' + stamina);
    }

    /**
     * Update velocities
     */
    updateVelocities() {
        let speeding = 1;
        if (this.speeding > 1.01 || this.speeding < 0.99) {
            if (this.stamina > 0) {
                speeding = this.speeding;
                if (this.staminaDate < (Date.now() - 500)) {
                    this.stamina = this.stamina - 0.5;
                    this.staminaDate = Date.now();
                }
            } else {
                console.log('No stamina !');
                this.speeding = 1;
            }
        } else if (this.stamina < BaseAvatar.prototype.staminaBase) {
            if (this.staminaDate < (Date.now() - 500)) {
                this.stamina = this.stamina + 0.16;
                this.staminaDate = Date.now();
            }
        } else if (this.stamina > BaseAvatar.prototype.staminaBase) {
            this.stamina = BaseAvatar.prototype.staminaBase;
        }
        const velocity = this.velocity * speeding / 1000;
        this.velocityX = Math.cos(this.angle) * velocity;
        this.velocityY = Math.sin(this.angle) * velocity;
        this.updateBaseAngularVelocity();
    }

    /**
     * Update base angular velocity
     */
    updateBaseAngularVelocity() {
        if (this.directionInLoop) {
            const ratio = this.velocity / BaseAvatar.prototype.velocity;
            this.angularVelocityBase = ratio * BaseAvatar.prototype.angularVelocityBase + Math.log(1 / ratio) / 1000;
            this.updateAngularVelocity();
        }
    }

    /**
     * Set radius
     */
    setRadius(radius: number) {
        this.radius = Math.max(radius, BaseAvatar.prototype.radius / 8);
    }

    /**
     * Set inverse
     */
    setInverse(inverse: number) {
        if (this.inverse !== inverse) {
            this.inverse = inverse ? true : false;
            this.updateAngularVelocity();
        }
    }

    /**
     * Set invincible
     */
    setInvincible(invincible: number) {
        this.invincible = invincible ? true : false;
    }

    /**
     * Get distance
     */
    getDistance(fromX: number, fromY: number, toX: number, toY: number): number {
        return Math.sqrt(Math.pow(fromX - toX, 2) + Math.pow(fromY - toY, 2));
    }

    /**
     * Die
     */
    die() {
        this.bonusStack.clear();
        this.alive = false;
        this.addPoint(this.x, this.y);
    }

    /**
     * Set printing
     */
    setPrinting(printing: boolean) {
        printing = printing ? true : false;
        if (this.printing !== printing) {
            this.printing = printing;
            this.addPoint(this.x, this.y);
            if (!this.printing) {
                this.trail.clear();
            }
        }
    }

    /**
     * This score
     */
    addScore(score: number) {
        this.setRoundScore(this.roundScore + score);
    }

    /**
     * Resolve score
     */
    resolveScore() {
        this.setScore(this.score + this.roundScore);
        this.roundScore = 0;
    }

    /**
     * This round score
     */
    setRoundScore(score: number) {
        this.roundScore = score;
    }

    /**
     * This score
     */
    setScore(score: number) {
        this.score = score;
    }

    /**
     * Set color
     */
    setColor(color: string) {
        this.color = color;
    }

    /**
     * Clear
     */
    clear() {
        this.bonusStack.clear();
        this.x = this.radius;
        this.y = this.radius;
        this.angle = 0;
        this.velocityX = 0;
        this.velocityY = 0;
        this.angularVelocity = 0;
        this.roundScore = 0;
        this.velocity = BaseAvatar.velocity;
        this.alive = true;
        this.printing = false;
        this.color = this.player.color;
        this.radius = BaseAvatar.radius;
        this.inverse = BaseAvatar.inverse;
        this.invincible = BaseAvatar.invincible;
        this.directionInLoop = BaseAvatar.directionInLoop;
        this.angularVelocityBase = BaseAvatar.angularVelocityBase;
        if (this.body) {
            this.body.radius = BaseAvatar.radius;
        }
        // useless? this.updateVelocities();
    }

    /**
     * Destroy
     */
    destroy() {
        this.clear();
        this.present = false;
        this.alive = false;
    }

    /**
     * Serialize
     */
    serialize(): SerializedBaseAvatar {
        return {
            id: this.id,
            name: this.name,
            color: this.color,
            score: this.score
        };
    }
}

export interface SerializedBaseAvatar {
    id: string;
    name: string;
    color: string;
    score: number;
}
