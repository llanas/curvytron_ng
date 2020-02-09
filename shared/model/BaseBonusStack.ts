import { Collection } from '@shared/collection';
import { EventEmitter } from 'events';

import { BaseBonus } from './BaseBonus';

/**
 * Base Bonus Stack
 */
export class BaseBonusStack extends EventEmitter {

    target: any;
    bonuses: Collection<BaseBonus>;

    constructor(target: any) {

        super();

        this.target = target;
        this.bonuses = new Collection<BaseBonus>();
    }

    /**
     * Add bonus to the stack
     */
    add(bonus: BaseBonus) {
        if (this.bonuses.add(bonus)) {
            this.resolve();
        }
    }

    /**
     * Remove bonus from the stack
     */
    remove(bonus: BaseBonus) {
        if (this.bonuses.remove(bonus)) {
            this.resolve(bonus);
        }
    }

    /**
     * Clear
     */
    clear() {
        this.bonuses.clear();
    }

    /**
     * Resolve
     */
    resolve(bonus?: BaseBonus) {

        const properties = {};
        let effects: string | any[];
        let property: string;
        let i: number;
        let j: number;

        if (typeof (bonus) !== 'undefined') {
            effects = bonus.getEffects(this.target);
            for (i = effects.length - 1; i >= 0; i--) {
                property = effects[i][0];
                properties[property] = this.getDefaultProperty(property);
            }
        }
        for (i = this.bonuses.items.length - 1; i >= 0; i--) {
            effects = this.bonuses.items[i].getEffects(this.target);
            for (j = effects.length - 1; j >= 0; j--) {
                property = effects[j][0];
                if (typeof (properties[property]) === 'undefined') {
                    properties[property] = this.getDefaultProperty(property);
                }
                this.append(properties, property, effects[j][1]);
            }
        }
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                this.apply(property, properties[property]);
            }
        }
    }

    /**
     * Apply the value to target's property
     */
    apply(property: string, value: number) {
        this.target[property] = value;
    }

    /**
     * Get default property
     */
    getDefaultProperty(property: string): number {
        return 0;
    }

    /**
     * Append
     */
    append(properties: object, property: string, value: number) {
        properties[property] += value;
    }
}
