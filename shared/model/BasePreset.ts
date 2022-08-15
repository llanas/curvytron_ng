export default class BasePreset {

    static presetName = '';
    static bonuses = [];

    constructor () { }

    /**
     * Has onus
     */
    hasBonus(bonus: string): boolean {
        return BasePreset.bonuses.indexOf(bonus) > -1;
    }
}