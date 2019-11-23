import { EventEmitter } from '@shared/core/event-emitter';

export abstract class SocketClient extends EventEmitter {

    id: string = null;
    socket: WebSocket;
    interval: number;
    events = [];
    callbacks = {};
    loop = null;
    connected = true;
    callCount = 0;

    constructor(socket: WebSocket, interval: number = 0) {

        super();

        this.socket = socket;
        this.interval = interval;

        this.attachEvents();
        this.start();
    }

    /**
     * On socket close
     */
    onClose() {
        this.connected = false;
        this.emit('close', this);
        this.stop();
        this.detachEvents();
    }

    /**
     * Set interval
     */
    setInterval(interval: number) {
        this.stop();
        this.flush();

        this.interval = typeof (interval) === 'number' ? interval : 0;

        this.start();
    }

    /**
     * Start
     */
    start() {
        if (this.interval && !this.loop) {
            this.loop = setInterval(this.flush, this.interval);
            this.flush();
        }
    }

    /**
     * Stop
     */
    stop() {
        if (this.loop) {
            clearInterval(this.loop);
            this.loop = null;
        }
    }

    /**
     * Attach events
     */
    attachEvents() {
        this.socket.addEventListener('message', this.onMessage);
        this.socket.addEventListener('close', this.onClose);
    }

    /**
     * Detach events
     */
    detachEvents() {
        this.socket.removeEventListener('message', this.onMessage);
        this.socket.removeEventListener('close', this.onClose);
    }

    /**
     * Add an event to the list
     * 
     * @param name Name of the event
     * @param data Data to bind to this event
     * @param callback Function to execute
     * @param force IDFK
     */
    addEvent(name: string, data: object, callback: () => any, force: boolean) {
        const event: any[] = [name];

        if (typeof (data) !== 'undefined') {
            event[1] = data;
        }

        if (typeof (callback) === 'function') {
            event[2] = this.indexCallback(callback);
        }

        if (!this.interval || (typeof (force) !== 'undefined' && force)) {
            this.sendEvents([event]);
        } else {
            this.events.push(event);
            this.start();
        }
    }

    /**
     * Add an event to the list
     */
    addEvents(sources: any[], force: boolean) {
        const events = [];

        for (const source of sources) {
            events.push(source);
        }

        if (!this.interval || force) {
            this.sendEvents(events);
        } else {
            Array.prototype.push.apply(this.events, events);
            this.start();
        }
    }

    /**
     * Index a new callback
     */
    indexCallback(callback: (data: any) => any) {
        const index = this.callCount++;
        this.callbacks[index] = callback;
        return index;
    }

    /**
     * Add a callback
     */
    addCallback(id: number, data: object) {
        const event: any[] = [id];
        if (typeof (data) !== 'undefined') {
            event[1] = data;
        }
        this.sendEvents([event]);
    }

    /**
     * Send an event
     */
    sendEvents(events: any) {
        this.socket.send(JSON.stringify(events));
    }

    /**
     * Play an indexed callback
     */
    playCallback(id: number, data: object | null) {
        if (typeof (this.callbacks[id]) !== 'undefined') {
            this.callbacks[id](data);
            delete this.callbacks[id];
        }
    }

    /**
     * Create callback
     */
    createCallback(id: number): (data: any) => any {
        const client = this;
        return (data) => client.addCallback(id, data);
    }

    /**
     * Object version of the client
     */
    serialize(): object {
        return { id: this.id };
    }

    /**
     * Send Events
     */
    flush() {
        if (this.events.length > 0) {
            this.sendEvents(this.events);
            this.events.length = 0;
        }
    }

    onMessage(e: MessageEvent) {

        for (const data of JSON.parse(e.data)) {
            const name = data[0];

            if (typeof (name) === 'string') {
                if (data.length === 3) {
                    this.emit(name, [data[1], this.createCallback(data[2])]);
                } else {
                    this.emit(name, data[1]);
                }
            } else {
                this.playCallback(name, typeof (data[1]) !== 'undefined' ? data[1] : null);
            }
        }
    }
}
