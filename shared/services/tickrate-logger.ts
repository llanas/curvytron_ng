/**
 * Tickrate Logger
 */
export class TickrateLogger {

    interval = null;
    frequency = 0;
    ticks = [];

    constructor() {
        this.start();
    }

    /**
     * Start
     */
    start() {
        if (!this.interval) {
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
        }
    }

    /**
     * Tick
     */
    tick(data: any) {
        this.ticks.push(data);
    }

    /**
     * Log
     */
    log() {
        this.frequency = this.ticks.length;
        this.ticks.length = 0;
    }
}
