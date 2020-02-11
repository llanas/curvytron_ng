import { boundMethod } from 'autobind-decorator';

import { Avatar } from '../models/Avatar';

/**
 * Print Manager
 */
export class PrintManager {

    /**
     * Hole distance
     */
    static holeDistance = 5;

    /**
     * Print distance
     */
    static printDistance = 60;


    avatar: Avatar;
    active = false;
    lastX = 0;
    lastY = 0;
    distance = 0;
    printDistance: number;
    holeDistance: number;

    constructor(avatar: Avatar) {
        this.avatar = avatar;
    }

    /**
     * Toggle print
     */
    togglePrinting() {
        this.setPrinting(!this.avatar.printing);
    }

    /**
     * Set print
     */
    setPrinting(printing: any) {
        this.avatar.setPrinting(printing);
        this.distance = this.getRandomDistance();
    }

    /**
     * Get random printing time
     */
    getRandomDistance(): number {
        if (this.avatar.printing) {
            return this.printDistance * (0.3 + Math.random() * 0.7);
        } else {
            return this.holeDistance * (0.8 + Math.random() * 0.5);
        }
    }

    /**
     * Stop
     */
    stop() {
        if (this.active) {
            this.active = false;
            this.setPrinting(false);
            this.clear();
        }
    }

    /**
     * Test
     */
    test() {
        if (this.active) {
            this.distance -= this.getDistance(this.lastX, this.lastY, this.avatar.x, this.avatar.y);
            this.lastX = this.avatar.x;
            this.lastY = this.avatar.y;
            if (this.distance <= 0) {
                this.togglePrinting();
            }
        }
    }

    /**
     * Get distance
     */
    getDistance(fromX: number, fromY: number, toX: number, toY: number): number {
        return Math.sqrt(Math.pow(fromX - toX, 2) + Math.pow(fromY - toY, 2));
    }

    /**
     * Clear
     */
    clear() {
        this.active = false;
        this.distance = 0;
        this.lastX = 0;
        this.lastY = 0;
    }

    /**
     * Start
     */
    @boundMethod
    start() {
        if (!this.active) {
            this.active = true;
            this.lastX = this.avatar.x;
            this.lastY = this.avatar.y;
            this.setPrinting(true);
        }
    }
}
