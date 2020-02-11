import { BaseSocketClient } from '@shared/core/BaseSocketClient';
import { BasePlayer, SerializedBasePlayer } from '@shared/model/BasePlayer';

import { ServerSocketClient } from '../core/ServerSocketClient';

/**
 * Player
 */
export class Player extends BasePlayer {

    client: ServerSocketClient;

    constructor(client: BaseSocketClient, name: string, color: string) {
        super(client, name, color);
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
