"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Event Emitter
 */
var EventEmitter = /** @class */ (function () {
    /**
     * Constructor
     */
    function EventEmitter() {
        this.eventMap = {};
        this.on = this.addEventListener;
        this.off = this.removeEventListener;
    }
    /**
     * Emit a new event
     */
    EventEmitter.prototype.emit = function (name, data) {
        if (!this.eventMap.hasOwnProperty(name)) {
            return;
        }
        var callbacks = this.eventMap[name];
        var event = { type: name, detail: data };
        for (var length_1 = callbacks.length, i = 0; i < length_1; i++) {
            this.handle(callbacks[i], event);
        }
    };
    /**
     * Call the given callback
     */
    EventEmitter.prototype.handle = function (callback, event) {
        callback(event);
    };
    /**
     * Add a listener
     */
    EventEmitter.prototype.addEventListener = function (name, callback) {
        if (!this.eventMap.hasOwnProperty(name)) {
            this.eventMap[name] = [];
        }
        if (this.eventMap[name].indexOf(callback) < 0) {
            this.eventMap[name].push(callback);
        }
    };
    /**
     * Remove a listener
     */
    EventEmitter.prototype.removeEventListener = function (name, callback) {
        if (!this.eventMap.hasOwnProperty(name)) {
            return;
        }
        var callbacks = this.eventMap[name];
        var index = callbacks.indexOf(callback);
        if (index >= 0) {
            callbacks.splice(index, 1);
        }
        if (callbacks.length === 0) {
            delete this.eventMap[name];
        }
    };
    return EventEmitter;
}());
exports.EventEmitter = EventEmitter;
