import { Collection } from '@shared/collection';
import { BaseRoom } from '@shared/model/BaseRoom';

import { Player } from './player.model';



/**
 * Room
 */
export class Room extends BaseRoom {

    // OVERRIDE
    players: Collection<Player>;

    constructor (name: string) {

        super(name);

        this.players.index = false;
    }

    /**
     * Get local players
     */
    getLocalPlayers(): Collection<Player> {
        return this.players.filter(function () { return this.local; });
    }

    /**
     * Get player by client Id
     */
    getPlayerByClient(client: number): Player {
        return this.players.match(function () { return this.client.id === client; });
    }

    /**
     * Get url
     */
    getUrl(): string {
        return '/room/' + encodeURIComponent(this.name);
    }

    /**
     * Get game url
     */
    getGameUrl(): string {
        return '/game/' + encodeURIComponent(this.name);
    }

    /**
     * Close game
     */
    closeGame() {
        for (let i = this.players.items.length - 1; i >= 0; i--) {
            if (!this.players.items[i].avatar.present) {
                this.removePlayer(this.players.items[i]);
            }
        }
        return super.closeGame();
    }
}
