import { Player } from '../player.model';
import Message from './message.model';

export default class MessageKick extends Message {

    /**
     * Message type
     */
    static type = 'kick';

    /**
     * Default icon
     */
    static icon = 'icon-megaphone';

    target: Player;

    constructor (target: Player) {
        super();

        this.target = target;
    }
}
