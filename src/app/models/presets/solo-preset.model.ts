import BasePreset from '@shared/model/BasePreset';

export default class SoloPreset extends BasePreset {

    /**
     * Name
     */
    static presetName = 'Solo';

    /**
     * Bonuses
     */
    static bonuses = [
        'BonusSelfSmall',
        'BonusSelfSlow',
        'BonusSelfFast',
        'BonusSelfMaster',
        'BonusGameBorderless',
        'BonusGameClear'
    ];

    constructor () {
        super();
    }
}
