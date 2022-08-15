import BasePreset from '@shared/model/BasePreset';

export default class SizePreset extends BasePreset {

    /**
     * Name
     */
    static presetName = 'Super size me';

    /**
     * Bonuses
     */
    static bonuses = [
        'BonusSelfSmall'
    ];

    constructor () {
        super();
    }
}
