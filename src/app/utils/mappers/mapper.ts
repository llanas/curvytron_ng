import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

/**
 * Mapper
 */
export class Mapper extends EventEmitter {

    id: string;
    value: number = null;
    view: any = null;
    listening = false;

    constructor () {
        super();
    }

    /**
     * Mapper
     */
    setValue(value: number) {
        if (this.value !== value) {
            this.value = value;
            this.view = this.guessChar(this.value);
            this.emit('change', { value: this.value, view: this.view });
        }
    }

    /**
     * Kill an event
     */
    kill(e: Event): boolean {
        e.preventDefault();
        return false;
    }

    /**
     * Gues character from Key
     */
    guessChar(key: number): string {
        return key.toString();
    }

    /**
     * Start listening
     */
    @boundMethod
    start() {
        if (!this.listening) {
            this.listening = true;
            this.emit('listening:start');
            return true;
        }
        return false;
    }

    /**
     * Stop listening
     */
    @boundMethod
    stop() {
        if (this.listening) {
            this.listening = false;
            this.emit('listening:stop');
            return true;
        }
        return false;
    }
}
