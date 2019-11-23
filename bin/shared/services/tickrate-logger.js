"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Tickrate Logger
 */
var TickrateLogger = /** @class */ (function () {
    function TickrateLogger() {
        this.interval = null;
        this.frequency = 0;
        this.ticks = [];
        this.start();
    }
    /**
     * Start
     */
    TickrateLogger.prototype.start = function () {
        if (!this.interval) {
            this.interval = setInterval(this.log, 1000);
        }
    };
    /**
     * Stop
     */
    TickrateLogger.prototype.stop = function () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    };
    /**
     * Tick
     */
    TickrateLogger.prototype.tick = function (data) {
        this.ticks.push(data);
    };
    /**
     * Log
     */
    TickrateLogger.prototype.log = function () {
        this.frequency = this.ticks.length;
        this.ticks.length = 0;
    };
    return TickrateLogger;
}());
exports.TickrateLogger = TickrateLogger;
