import { BaseBonus } from '@shared/model/BaseBonus';
import { BaseRoomConfig } from '@shared/model/BaseRoomConfig';

import { Room } from './Room';

/**
 * Room Configuration
 */
export class RoomConfig extends BaseRoomConfig {

    private static bonusTypes = {
        /* CHANGE TO BONUS CLASS */
        BonusSelfSmall: 'BonusSelfSmall',
        BonusSelfSlow: 'BonusSelfSlow',
        BonusSelfFast: 'BonusSelfFast',
        BonusSelfMaster: 'BonusSelfMaster',
        BonusEnemySlow: 'BonusEnemySlow',
        BonusEnemyFast: 'BonusEnemyFast',
        BonusEnemyBig: 'BonusEnemyBig',
        BonusEnemyInverse: 'BonusEnemyInverse',
        BonusGameBorderless: 'BonusGameBorderless',
        BonusAllColor: 'BonusAllColor',
        BonusGameClear: 'BonusGameClear',
        BonusEnemyStraightAngle: 'BonusEnemyStraightAngle'
    };

    constructor(room: Room) {
        super(room);
    }

    /**
     * Set open
     */
    setOpen(open: boolean) {
        if (this.open !== open) {
            this.open = open;
            this.password = this.open ? null : this.generatePassword();
            this.emit('room:config:open', { room: this.room, open: this.open });
            return true;
        }
        return false;
    }

    /**
     * Get available bonuses
     */
    getBonuses(): BaseBonus[] /* CHANGE TO BONUSE CLASS */ {
        const bonuses = [];
        for (const bonus in this.bonuses) {
            if (this.bonuses[bonus]) {
                bonuses.push(RoomConfig.bonusTypes[bonus]);
            }
        }
        return bonuses;
    }
}
