import { Collection } from '@shared/collection';

import { Player } from './player.model';

/**
 * Distant client
 */
export class Client {

    id: string;
    players = new Collection<Player>();
    master = false;
    active: boolean;

    constructor (id: string, active = true) {
        this.id = id;
        this.active = active;
    }

    /**
     * Set master
     */
    setMaster(master: boolean) {
        this.master = master;
    }
}
