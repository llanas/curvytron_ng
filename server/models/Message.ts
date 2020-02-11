import { BaseMessage } from '@shared/model/BaseMessage';

import { ServerSocketClient } from '../core/ServerSocketClient';

/**
 * Message
 */
export class Message extends BaseMessage {

    /**
     * Message max length
     */
    static maxLength = 140;

    client: ServerSocketClient;
    content: string;
    creation = new Date().getTime();
    name: any = null;
    color: any = null;

    constructor(client: ServerSocketClient, content: string) {

        super();

        this.client = client;
        this.content = content;
        this.buildPlayer();
    }

    /**
     * Build player
     */
    buildPlayer() {
        const player = this.client.players.getFirst();
        if (player) {
            this.name = player.name;
            this.color = player.color;
        }
    }

    /**
     * Serialize
     */
    serialize(): any {
        if (this.name === null) {
            this.buildPlayer();
        }
        return {
            client: this.client.id,
            content: this.content,
            creation: this.creation,
            name: this.name,
            color: this.color
        };
    }
}
