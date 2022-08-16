import BasePreset from '@shared/model/BasePreset';
import { BaseRoomConfig } from '@shared/model/BaseRoomConfig';

import CustomPreset from './presets/custom-preset.model';
import DefaultPreset from './presets/default-preset.model';
import EmptyPreset from './presets/empty-preset.model';
import SizePreset from './presets/size-preset.model';
import SoloPreset from './presets/solo-preset.model';
import SpeedPreset from './presets/speed-preset.model';
import { Room } from './room.model';

export default class RoomConfig extends BaseRoomConfig {

    /**
     * Bonus classes
     */
    static bonusClasses = {
        BonusSelfSmall: 'bonus-self-small',
        BonusSelfSlow: 'bonus-self-slow',
        BonusSelfFast: 'bonus-self-fast',
        BonusSelfMaster: 'bonus-self-master',
        BonusEnemySlow: 'bonus-enemy-slow',
        BonusEnemyFast: 'bonus-enemy-fast',
        BonusEnemyBig: 'bonus-enemy-big',
        BonusEnemyInverse: 'bonus-enemy-inverse',
        BonusEnemyStraightAngle: 'bonus-enemy-straight-angle',
        BonusGameBorderless: 'bonus-game-borderless',
        BonusAllColor: 'bonus-all-color',
        BonusGameClear: 'bonus-all-clear'
    };

    /**
     * Variables names
     */
    static variablesNames = {
        bonusRate: 'Bonus quantity'
    };

    /**
     * Presets
     */
    static presets = [
        new DefaultPreset(),
        new SpeedPreset(),
        new SizePreset(),
        new SoloPreset(),
        new EmptyPreset()
    ];

    preset: any;
    customPreset: any;
    password: any;
    bonuses: any;
    presets: any;

    constructor (room: Room) {

        super(room);

        this.preset = this.getDefaultPreset();
        this.customPreset = new CustomPreset();
    }

    /**
     * Set open
     */
    setOpen(open: boolean) {
        this.open = open;
    }

    /**
     * Set password
     */
    setPassword(password: string) {
        this.password = password;
    }

    /**
     * Get available bonuses
     */
    getBonuses(): Array<any> {
        const bonuses = [];

        for (const bonus in this.bonuses) {
            if (this.bonuses[bonus]) {
                bonuses.push(bonus);
            }
        }

        return bonuses.sort();
    }

    /**
     * Set bonus value
     */
    setBonus(bonus: string, value: boolean): boolean {
        if (super.setBonus(bonus, value)) {
            return;
        }
        this.checkPresets();
    }

    /**
     * Check preset
     */
    checkPresets() {
        const bonuses = this.getBonuses();
        let preset;

        for (let i = this.presets.length - 1; i >= 0; i--) {
            preset = this.presets[i];
            if (this.bonusesMatch(preset.bonuses, bonuses)) {
                this.preset = preset;

                return;
            }
        }

        this.preset = this.customPreset;
    }

    /**
     * Bonuses match
     */
    bonusesMatch(listA: Array<any>, listB: Array<any>): boolean {
        if (typeof (listA) !== 'object' || typeof (listA) !== 'object') {
            return false;
        }

        return listA.length === listB.length && listA.sort().toString() === listB.sort().toString();
    }

    /**
     * IS default preset
     */
    isDefaultPreset(): boolean {
        return this.preset === this.getDefaultPreset();
    }

    /**
     * Get default preset
     */
    getDefaultPreset(): BasePreset {
        return this.presets[0];
    }

    /**
     * Get custom preset
     */
    getCustomPreset(): CustomPreset {
        return this.customPreset;
    }
}
