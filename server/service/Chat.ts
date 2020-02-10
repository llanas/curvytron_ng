import { Collection } from '@shared/collection';
import { BaseChat } from '@shared/service/BaseChat';
import { Message } from 'models/Message';

import { FloodFilter } from './FloodFilter';

/**
 * Chat system
 */
export class Chat extends BaseChat {

    floodFilter: any;
    messages: Collection<Message>;

    constructor() {

        super();

        this.floodFilter = new FloodFilter(this.messages);
    }

    /**
     * Is message valid?
     */
    isValid(message: Message): boolean {
        const length = message.content.length;
        return length > 0 && length <= Message.maxLength && this.floodFilter.isValid(message);
    }
}
