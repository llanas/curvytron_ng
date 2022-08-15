import { Player } from '../player.model';
import Message from './message.model';

export default class MessageVoteKick extends Message {

    /**
     * Message type
     */
    static type = 'vote-kick';

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
