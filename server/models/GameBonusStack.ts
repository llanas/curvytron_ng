import { BaseBonusStack } from '@shared/model/BaseBonusStack';

import { Bonus } from './bonus/Bonus';
import { Game } from './Game';

/**
 * Game Bonus Stack
 */
export class GameBonusStack extends BaseBonusStack {

    constructor(game: Game) {
        super(game);
    }

    /**
     * Add bonus to the stack
     */
    add(bonus: Bonus) {
        super.add(bonus);
    }

    /**
     * Remove bonus from the stack
     */
    remove(bonus: Bonus) {
        super.remove(bonus);
    }

    /**
     * Apply the value to target's property
     */
    apply(property: string, value: number) {
        switch (property) {
            case 'borderless':
                this.target.setBorderless(!!value);
                break;
            default:
                super.apply(property, value);
                break;
        }
    }
}
