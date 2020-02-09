import { EventEmitter } from 'events';

import { BaseBonus } from './BaseBonus';
import { BaseRoom } from './BaseRoom';

export interface IBaseRoomConfig {
    getBonuses(): BaseBonus[];
}

/**
 * Base room configuration
 */
export class BaseRoomConfig extends EventEmitter implements IBaseRoomConfig {

    private static passwordLength = 4;

    room: BaseRoom;
    maxScore: number;
    variables: { bonusRate: number; };
    open: boolean;
    password: string;
    bonuses: {
        BonusSelfSmall: boolean;
        BonusSelfSlow: boolean;
        BonusSelfFast: boolean;
        BonusSelfMaster: boolean;
        BonusEnemySlow: boolean;
        BonusEnemyFast: boolean;
        BonusEnemyBig: boolean;
        BonusEnemyInverse: boolean;
        BonusEnemyStraightAngle: boolean;
        BonusGameBorderless: boolean;
        BonusAllColor: boolean;
        BonusGameClear: boolean;
    };


    constructor(room: BaseRoom) {

        super();

        this.room = room;
        this.maxScore = null;
        this.open = true;
        this.password = null;
        this.variables = {
            bonusRate: 0
        };
        this.bonuses = {
            BonusSelfSmall: true,
            BonusSelfSlow: true,
            BonusSelfFast: true,
            BonusSelfMaster: true,
            BonusEnemySlow: true,
            BonusEnemyFast: true,
            BonusEnemyBig: true,
            BonusEnemyInverse: true,
            BonusEnemyStraightAngle: true,
            BonusGameBorderless: true,
            BonusAllColor: true,
            BonusGameClear: true
        };
    }

    getBonuses(): BaseBonus[] {
        throw new Error('Method not implemented.');
    }

    /**
     * Set max score
     */
    setMaxScore(maxScore: number) {
        maxScore = parseInt('' + maxScore, 10);
        this.maxScore = maxScore ? maxScore : null;
        return true;
    }

    /**
     * Variable exists
     */
    variableExists(variable: string): boolean {
        return typeof (this.variables[variable]) !== 'undefined';
    }

    /**
     * Set variable
     */
    setVariable(variable: string, value: string): boolean {
        if (!this.variableExists(variable)) {
            return false;
        }
        const parsedValue = parseFloat(value);
        if (-1 > parsedValue || parsedValue > 1) {
            return false;
        }
        this.variables[variable] = parsedValue;
        return true;
    }

    /**
     * Get variable
     */
    getVariable(variable: string): string {
        if (!this.variableExists(variable)) {
            return;
        }
        return this.variables[variable];
    }

    /**
     * Bonus exists
     */
    bonusExists(bonus: string): boolean {
        return typeof (this.bonuses[bonus]) !== 'undefined';
    }

    /**
     * Toggle bonus
     */
    toggleBonus(bonus: string): boolean {
        if (!this.bonusExists(bonus)) {
            return false;
        }
        this.bonuses[bonus] = !this.bonuses[bonus];
        return true;
    }

    /**
     * Get bonus value
     */
    getBonus(bonus: string): boolean {
        if (!this.bonusExists(bonus)) {
            return;
        }
        return this.bonuses[bonus];
    }

    /**
     * Set bonus value
     */
    setBonus(bonus: string, value: boolean): boolean {
        if (!this.bonusExists(bonus)) {
            return;
        }
        this.bonuses[bonus] = value ? true : false;
    }

    /**
     * Get max score
     */
    getMaxScore(): number {
        return this.maxScore ? this.maxScore : this.getDefaultMaxScore();
    }

    /**
     * Get max score
     */
    getDefaultMaxScore(): number {
        return Math.max(1, (this.room.players.count() - 1) * 10);
    }

    /**
     * Authorise joinning the room
     */
    allow(password: string): boolean {
        return this.open || this.password === password;
    }

    /**
     * Generate password
     */
    generatePassword(): string {
        let password = '';
        for (let i = 0; i < BaseRoomConfig.passwordLength; i++) {
            password += Math.ceil(Math.random() * 9).toString();
        }
        return password;
    }

    /**
     * Serialize
     */
    serialize(): SerializedBaseRoomConfig {
        return {
            maxScore: this.maxScore,
            variables: this.variables,
            bonuses: this.bonuses,
            open: this.open,
            password: this.password
        };
    }
}

export interface SerializedBaseRoomConfig {
    maxScore: number;
    variables: {
        bonusRate: number;
    };
    open: boolean;
    password: string;
    bonuses: {
        BonusSelfSmall: boolean;
        BonusSelfSlow: boolean;
        BonusSelfFast: boolean;
        BonusSelfMaster: boolean;
        BonusEnemySlow: boolean;
        BonusEnemyFast: boolean;
        BonusEnemyBig: boolean;
        BonusEnemyInverse: boolean;
        BonusEnemyStraightAngle: boolean;
        BonusGameBorderless: boolean;
        BonusAllColor: boolean;
        BonusGameClear: boolean;
    };
}
