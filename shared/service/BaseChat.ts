import { Collection } from '@shared/collection';
import { EventEmitter } from 'events';

import { BaseMessage } from '../model/BaseMessage';

/**
 * BaseChat system
 */
export class BaseChat extends EventEmitter {

    messages: Collection<BaseMessage>;

    constructor () {
        super();
        this.messages = new Collection([], 'id', true);
    }

    /**
     * Add message
     */
    addMessage(message: BaseMessage) {
        if (!this.isValid(message)) {
            return false;
        }
        this.messages.add(message);
        this.emit('message', message);
        return true;
    }

    /**
     * Is message valid?
     */
    isValid(message: BaseMessage): boolean {
        return true;
    }

    /**
     * Clear messages
     */
    clearMessages() {
        this.messages.clear();
    }

    /**
     * Serialize
     */
    serialize(max: number = this.messages.items.length) {
        const length = this.messages.items.length;
        const limit = Math.min(max, length);
        const min = length - limit;
        const messages = new Array(length);
        for (let i = length - 1; i >= min; i--) {
            messages[i] = this.messages.items[i].serialize();
        }
        return messages;
    }
}
