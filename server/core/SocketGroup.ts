import { Collection } from '@shared/collection';

import { ServerSocketClient } from './ServerSocketClient';

/**
 * Socket group
 */
export class SocketGroup {

    clients: Collection<ServerSocketClient>;

    constructor(clients = new Collection<ServerSocketClient>()) {
        this.clients = clients;
    }

    /**
     * Add a listener
     */
    on(name: string, callback: () => any) {
        for (let i = this.clients.items.length - 1; i >= 0; i--) {
            this.clients.items[i].on(name, callback);
        }
    }

    /**
     * Remove a listener
     */
    removeListener(name: string, callback: () => any) {
        for (let i = this.clients.items.length - 1; i >= 0; i--) {
            this.clients.items[i].removeListener(name, callback);
        }
    }

    /**
     * Add a group of events event to the list
     */
    addEvents(events: any[], force: boolean) {
        for (let i = this.clients.items.length - 1; i >= 0; i--) {
            this.clients.items[i].addEvents(events, force);
        }
    }
    /**
     * Add an event to the list
     */
    addEvent(name: string, data?: any, callback?: () => any, force?: boolean) {
        for (let i = this.clients.items.length - 1; i >= 0; i--) {
            this.clients.items[i].addEvent(name, data, callback, force);
        }
    }
}
