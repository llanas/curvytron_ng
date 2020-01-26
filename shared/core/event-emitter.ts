/**
 * Event Emitter
 */
export class EventEmitter {

    private eventMap = {};

    on = this.addEventListener;
    off = this.removeEventListener;

    /**
     * Constructor
     */
    constructor() { }

    /**
     * Emit a new event
     */
    emit(name: string, ...data: any) {
        if (!this.eventMap.hasOwnProperty(name)) {
            return;
        }

        const callbacks = this.eventMap[name];
        const event = { type: name, detail: data };

        for (let length = callbacks.length, i = 0; i < length; i++) {
            this.handle(callbacks[i], event);
        }
    }

    /**
     * Call the given callback
     */
    handle(callback: (data: any) => any, event: any) {
        callback(event);
    }

    /**
     * Add a listener
     */
    addEventListener(name: string, callback: (data: any) => any) {
        if (!this.eventMap.hasOwnProperty(name)) {
            this.eventMap[name] = [];
        }

        if (this.eventMap[name].indexOf(callback) < 0) {
            this.eventMap[name].push(callback);
        }
    }

    /**
     * Remove a listener
     */
    removeEventListener(name: string, callback: (data: any) => any) {
        if (!this.eventMap.hasOwnProperty(name)) {
            return;
        }

        const callbacks = this.eventMap[name];
        const index = callbacks.indexOf(callback);

        if (index >= 0) {
            callbacks.splice(index, 1);
        }

        if (callbacks.length === 0) {
            delete this.eventMap[name];
        }
    }
}
