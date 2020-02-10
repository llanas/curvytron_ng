import { Collection } from '@shared/collection';
import { Message } from 'models/Message';

/**
 * Chat flood filter
 */
export class FloodFilter {

    /**
     * Number of message allowed
     */
    static toleranceTotal = 3;

    /**
     * Range of time for tolerance
     */
    static toleranceRange = 2000;

    messages: Collection<Message>;

    constructor(messages: Collection<Message>) {

        this.messages = messages;
    }

    /**
     * Is message valid?
     */
    isValid(message: Message): boolean {
        const history = this.getClientHistory(message.client.id, new Date().getTime() - FloodFilter.toleranceRange);
        return history < FloodFilter.toleranceTotal;
    }

    /**
     * Get client history
     */
    getClientHistory(id: string, max: number) {
        let history = 0;
        let message: Message;
        const length = this.messages.count();
        for (let i = length - 1; i >= 0; i--) {
            message = this.messages[i];
            if (message.client.id === id) {
                history++;
            }
            if (message.creation < max) {
                break;
            }
        }
        return history;
    }
}



