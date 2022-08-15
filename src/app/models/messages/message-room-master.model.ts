import { Client } from '../client.model';
import { Player } from '../player.model';
import Message from './message.model';

export default class MessageRoomMaster extends Message {

    /**
     * Message type
     */
    static type = 'room-master';

    /**
     * Default icon
     */
    static icon = 'icon-megaphone';

    client: Client;
    target: Player;

    constructor (client: Client) {

        super();

        this.client = client;
        this.target = this.getPlayer();
    }
    /**
     * Get target
     */
    getTarget(): Player {
        const player = this.getPlayer();

        return player ? player : this.target;
    }
    /**
     * Get player
     */
    getPlayer(): Player {
        return this.client.players.getFirst();
    }
}
