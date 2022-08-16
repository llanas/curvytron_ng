import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';

/**
 * FPS Logger
 */
export class BaseFPSLogger extends EventEmitter {

    interval: NodeJS.Timeout | null = null;
    frames = 0;
    frequency = 0;

    constructor () {

        super();

        this.start();
    }

    /**
     * Start
     */
    start() {
        if (!this.interval) {
            this.frames = 0;
            this.interval = setInterval(this.log, 1000);
        }
    }

    /**
     * Stop
     */
    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
            this.frequency = 0;
        }
    }

    /**
     * End frame
     */
    @boundMethod
    onFrame() {
        this.frames++;
    }

    /**
     * Log
     */
    @boundMethod
    log() {
        this.frequency = this.frames;
        this.frames = 0;
    }
}
