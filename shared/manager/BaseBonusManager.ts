import { Collection } from '@shared/collection';
import { BaseBonus } from '@shared/model/BaseBonus';
import { BaseGame } from '@shared/model/BaseGame';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

/**
 * Base Bonus Manager
 */
export class BaseBonusManager extends EventEmitter {

    /**
     * Maximum number of bonus on the map at the same time
     */
    static bonusCap = 20;

    /**
     * Interval between two bonus pop (will vary from a factor x1 to x3)
     */
    static bonusPopingTime = 3000;

    /**
     * Margin from bonus to trails
     */
    static bonusPopingMargin = 0.01;



    game: BaseGame;
    bonuses: Collection<BaseBonus>;
    bonusCap: number;
    bonusPopingTime: number;
    bonusPopingMargin: number;

    constructor(game: BaseGame) {

        super();

        this.game = game;
        this.bonuses = new Collection<BaseBonus>([], 'id', true);
        this.clear = this.clear.bind(this);
    }

    /**
     * Start
     */
    start() {
        this.clear();
    }

    /**
     * Stop
     */
    stop() {
        this.clear();
    }

    /**
     * Add bonus
     */
    add(bonus: BaseBonus): boolean {
        return this.bonuses.add(bonus);
    }

    /**
     * Remove bonus
     */
    remove(bonus: BaseBonus): boolean {
        bonus.clear();
        return this.bonuses.remove(bonus);
    }

    /**
     * Clear bonuses
     */
    @boundMethod
    clear() {
        for (let i = this.bonuses.items.length - 1; i >= 0; i--) {
            this.bonuses.items[i].clear();
        }
        this.bonuses.clear();
    }
}
