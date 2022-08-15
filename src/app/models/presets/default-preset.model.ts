import BasePreset from '@shared/model/BasePreset';

export default class DefaultPreset extends BasePreset {

    /**
     * Name
     */
    static presetName = '';

    /**
     * Bonuses
     */
    static bonuses = [
        'BonusSelfSmall',
        'BonusSelfSlow',
        'BonusSelfFast',
        'BonusSelfMaster',
        'BonusEnemySlow',
        'BonusEnemyFast',
        'BonusEnemyBig',
        'BonusEnemyInverse',
        'BonusEnemyStraightAngle',
        'BonusGameBorderless',
        'BonusAllColor',
        'BonusGameClear'
    ];

    constructor () {
        super();
    }
}
