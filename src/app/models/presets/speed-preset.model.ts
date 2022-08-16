import BasePreset from '@shared/model/BasePreset';

export default class SpeedPreset extends BasePreset {

    /**
     * Name
     */
    static presetName = 'Speed of light';

    /**
     * Bonuses
     */
    static bonuses = [
        'BonusSelfFast',
        'BonusEnemyFast'
    ];

    constructor () {
        super();
    }
}
