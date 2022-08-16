import { BasePlayer, SerializedBasePlayer } from '@shared/model/BasePlayer';

import { ServerSocketClient } from '../core/ServerSocketClient';

/**
 * Player
 */
export class Player extends BasePlayer {

    client: ServerSocketClient;

    constructor (client: ServerSocketClient, name: string, color: string) {
        super(client.id, name, color);
    }

    /**
     * Serialize
     */
    serialize(): SerializedPlayer {
        const data = super.serialize() as SerializedPlayer;
        data.active = this.client.active;
        return data;
    }
}

export interface SerializedPlayer extends SerializedBasePlayer {
    active: boolean;
}
