import { Collection } from '@shared/collection';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

import { BaseGame } from './BaseGame';
import { BasePlayer, SerializedBasePlayer } from './BasePlayer';
import { BaseRoomConfig, SerializedBaseRoomConfig } from './BaseRoomConfig';

/**
 * Base Room
 */
export class BaseRoom extends EventEmitter {

    /**
     * Number of player needed to start a room
     */
    static minPlayer = 1;

    /**
     * Max length for name
     */
    static maxLength = 25;

    /**
     * Launch time
     */
    static launchTime = 5000;

    name: string;
    players: Collection<BasePlayer>;
    config: BaseRoomConfig;
    game: BaseGame;
    minPlayer: number;
    maxLength: number;
    launchTime: number;
    open: boolean;

    constructor(name: string) {

        super();

        this.name = name;
        this.players = new Collection<BasePlayer>([], 'id', true);
        this.config = new BaseRoomConfig(this);
        this.open = this.config.open;
    }

    /**
     * Add player
     */
    addPlayer(player: BasePlayer) {
        return this.players.add(player);
    }

    /**
     * Equal
     */
    equal(room: BaseRoom): boolean {
        return room ? this.name === room.name : false;
    }

    /**
     * Is name available?
     */
    isNameAvailable(name: string): boolean {
        return !this.players.match(() => this.name === name);
    }

    /**
     * Remove player
     */
    removePlayer(player: BasePlayer) {
        return this.players.remove(player);
    }

    /**
     * Is ready
     */
    isReady(): boolean {
        return !this.game && this.players.count() >= this.minPlayer && this.players.filter(function () {
            return !this.ready;
        }).isEmpty();
    }

    /**
     * Start warmpup
     */
    newGame(): BaseGame | null {
        if (!this.game) {
            this.game = new BaseGame(this);
            this.game.on('end', this.closeGame);
            this.emit('game:new', { room: this, game: this.game });
            return this.game;
        }
        return null;
    }

    /**
     * Close game
     */
    @boundMethod
    closeGame() {
        if (this.game) {

            delete this.game;

            this.emit('game:end', { room: this });

            this.players = this.players.filter(function () {
                return this.client;
            });

            for (let i = this.players.items.length - 1; i >= 0; i--) {
                this.players.items[i].reset();
            }
        }
    }

    /**
     * Serialize
     */
    serialize(full = false): SerializedBaseRoom {
        return {
            name: this.name,
            players: full ? this.players.map<SerializedBasePlayer>(function () {
                return this.serialize();
            }).items : this.players.count(),
            game: this.game ? true : false,
            open: this.config.open,
            config: (full) ? this.config.serialize() : null
        };
    }
}

export interface SerializedBaseRoom {
    name: string;
    players: SerializedBasePlayer[] | number;
    game: boolean;
    open: boolean;
    config: SerializedBaseRoomConfig | null;
}
