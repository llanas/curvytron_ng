import { BaseBonusManager } from '@shared/manager/BaseBonusManager';
import { BaseBonus } from '@shared/model/BaseBonus';
import { boundMethod } from 'autobind-decorator';

import { Body } from '../core/Body';
import { World } from '../core/World';
import { Avatar } from '../models/Avatar';
import { Bonus } from '../models/bonus/Bonus';
import { Game } from '../models/Game';

/**
 * Bonus Manager
 */
export class BonusManager extends BaseBonusManager {

    world: World;
    popingTimeout: any = null;
    bonusTypes: any;

    constructor(game: Game, bonuses: any, rate: number) {

        super(game);

        this.world = new World(this.game.size, 1);
        this.bonusTypes = bonuses;
        this.bonusPopingTime = this.bonusPopingTime - ((this.bonusPopingTime / 2) * rate);
    }

    /**
     * Start
     */
    start() {
        super.start();
        this.world.activate();
        if (this.bonusTypes.length) {
            this.popingTimeout = setTimeout(this.popBonus, this.getRandomPopingTime());
        }
    }

    /**
     * Stop
     */
    stop() {
        if (this.popingTimeout) {
            this.popingTimeout = clearTimeout(this.popingTimeout);
        }
        super.stop();
    }

    /**
     * Clear
     */
    clear() {
        this.world.clear();
        super.clear();
    }

    /**
     * Get random position
     */
    getRandomPosition(radius: number, border: number): number[] {
        const margin = radius + border * this.game.world.size;
        const body = new Body(this.game.world.getRandomPoint(margin), this.game.world.getRandomPoint(margin), margin);
        while (!this.game.world.testBody(body) || !this.world.testBody(body)) {
            body.x = this.game.world.getRandomPoint(margin);
            body.y = this.game.world.getRandomPoint(margin);
        }
        return [body.x, body.y];
    }

    /**
     * Test if an avatar catches a bonus
     */
    testCatch(avatar: Avatar) {
        if (avatar.body) {
            const body = this.world.getBody(avatar.body);
            const bonus = body ? body.data : null;
            if (bonus && this.remove(bonus)) {
                bonus.applyTo(avatar, this.game);
            }
        }
    }

    /**
     * Add bonus
     */
    add(bonus: Bonus) {
        if (super.add(bonus)) {
            this.world.addBody(bonus.body);
            this.emit('bonus:pop', bonus);
            return true;
        }
        return false;
    }

    /**
     *  Remove bonus
     */
    remove(bonus: Bonus) {
        if (super.remove(bonus)) {
            this.world.removeBody(bonus.body);
            this.emit('bonus:clear', bonus);
            return true;
        }
        return false;
    }

    /**
     * Get random printing time
     */
    getRandomPopingTime(): number {
        return this.bonusPopingTime * (1 + Math.random());
    }

    /**
     * Get random bonus type
     */
    getRandomBonusType(): Bonus {
        if (!this.bonusTypes.length) {
            return null;
        }
        const total = this.bonusTypes.length;
        const pot = [];
        const bonuses = [];
        let probability: number;
        let bonusType: Bonus;

        let i = 0;
        for (; i < total; i++) {
            bonusType = this.bonusTypes[i];
            probability = bonusType.getProbability(this.game);
            if (probability > 0) {
                bonuses.push(bonusType);
                pot.push(probability + (i > 0 ? pot[pot.length - 1] : 0));
            }
        }
        const value = Math.random() * pot[pot.length - 1];
        for (i = 0; i < total; i++) {
            if (value < pot[i]) {
                return bonuses[i];
            }
        }
        return null;
    }

    /**
     * Update size
     */
    setSize() {
        this.world.clear();
        this.world = new World(this.game.size, 1);
    }


    /**
     * Make a bonus 'pop'
     */
    @boundMethod
    popBonus() {
        if (this.bonusTypes.length) {
            this.popingTimeout = setTimeout(this.popBonus, this.getRandomPopingTime());

            if (this.bonuses.count() < this.bonusCap) {
                const bonusType = this.getRandomBonusType();

                if (bonusType) {
                    const position = this.getRandomPosition(BaseBonus.radius, this.bonusPopingMargin);
                    const bonus = bonusType.constructor.call(position[0], position[1]);
                    this.add(bonus);
                }
            }
        }
    }
}










