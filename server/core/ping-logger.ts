import { EventEmitter } from 'shared/core/event-emitter';

export class PingLogger extends EventEmitter {

    static frequency = 1000;

    socket: WebSocket;
    interval = null;

    constructor(socket: WebSocket) {
        super();
        this.socket = socket;
    }

    /**
     * Start ping
     */
    start() {
        if (!this.interval) {
            this.interval = setInterval(this.ping, PingLogger.frequency);
        }
    }

    /**
     * Stop ping
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    /**
     * Pong
     */
    pong(ping: number) {
        this.emit('latency', new Date().getTime() - ping);
    }

    /**
     * Ping
     */
    ping() {
        const ping = new Date().getTime();
        // TODO : A voir comment simuler un test de ping
        // this.socket.ping(null, () => this.pong(ping));
    }
}
