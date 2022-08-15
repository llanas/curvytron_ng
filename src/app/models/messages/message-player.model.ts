import { SocketClientService } from 'src/app/services/core/socket-client.service';

import { Player } from '../player.model';
import Message from './message.model';

export default class MessagePlayer extends Message {

    /**
     * Message type
     */
    static type = 'player';

    content: any;
    player: any;

    constructor (private socketClient: SocketClientService,
        content?: string,
        player?: Player,
        creation?: number) {

        super(creation);

        this.content = content;
        this.player = player;
    }

    /**
     * Clear message
     */
    clear() {
        this.content = '';
    }
}
