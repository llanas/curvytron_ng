"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var event_emitter_1 = require("shared/core/event-emitter");
var SocketClient = /** @class */ (function (_super) {
    __extends(SocketClient, _super);
    function SocketClient(socket, interval) {
        if (interval === void 0) { interval = 0; }
        var _this = _super.call(this) || this;
        _this.id = null;
        _this.events = [];
        _this.callbacks = {};
        _this.loop = null;
        _this.connected = true;
        _this.callCount = 0;
        _this.socket = socket;
        _this.interval = interval;
        _this.attachEvents();
        _this.start();
        return _this;
    }
    /**
     * On socket close
     */
    SocketClient.prototype.onClose = function () {
        this.connected = false;
        this.emit('close', this);
        this.stop();
        this.detachEvents();
    };
    /**
     * Set interval
     */
    SocketClient.prototype.setInterval = function (interval) {
        this.stop();
        this.flush();
        this.interval = typeof (interval) === 'number' ? interval : 0;
        this.start();
    };
    /**
     * Start
     */
    SocketClient.prototype.start = function () {
        if (this.interval && !this.loop) {
            this.loop = setInterval(this.flush, this.interval);
            this.flush();
        }
    };
    /**
     * Stop
     */
    SocketClient.prototype.stop = function () {
        if (this.loop) {
            clearInterval(this.loop);
            this.loop = null;
        }
    };
    /**
     * Attach events
     */
    SocketClient.prototype.attachEvents = function () {
        this.socket.addEventListener('message', this.onMessage);
        this.socket.addEventListener('close', this.onClose);
    };
    /**
     * Detach events
     */
    SocketClient.prototype.detachEvents = function () {
        this.socket.removeEventListener('message', this.onMessage);
        this.socket.removeEventListener('close', this.onClose);
    };
    /**
     * Add an event to the list
     *
     * @param name Name of the event
     * @param data Data to bind to this event
     * @param callback Function to execute
     * @param force IDFK
     */
    SocketClient.prototype.addEvent = function (name, data, callback, force) {
        var event = [name];
        if (typeof (data) !== 'undefined') {
            event[1] = data;
        }
        if (typeof (callback) === 'function') {
            event[2] = this.indexCallback(callback);
        }
        if (!this.interval || (typeof (force) !== 'undefined' && force)) {
            this.sendEvents([event]);
        }
        else {
            this.events.push(event);
            this.start();
        }
    };
    /**
     * Add an event to the list
     */
    SocketClient.prototype.addEvents = function (sources, force) {
        var events = [];
        for (var _i = 0, sources_1 = sources; _i < sources_1.length; _i++) {
            var source = sources_1[_i];
            events.push(source);
        }
        if (!this.interval || force) {
            this.sendEvents(events);
        }
        else {
            Array.prototype.push.apply(this.events, events);
            this.start();
        }
    };
    /**
     * Index a new callback
     */
    SocketClient.prototype.indexCallback = function (callback) {
        var index = this.callCount++;
        this.callbacks[index] = callback;
        return index;
    };
    /**
     * Add a callback
     */
    SocketClient.prototype.addCallback = function (id, data) {
        var event = [id];
        if (typeof (data) !== 'undefined') {
            event[1] = data;
        }
        this.sendEvents([event]);
    };
    /**
     * Send an event
     */
    SocketClient.prototype.sendEvents = function (events) {
        this.socket.send(JSON.stringify(events));
    };
    /**
     * Play an indexed callback
     */
    SocketClient.prototype.playCallback = function (id, data) {
        if (typeof (this.callbacks[id]) !== 'undefined') {
            this.callbacks[id](data);
            delete this.callbacks[id];
        }
    };
    /**
     * Create callback
     */
    SocketClient.prototype.createCallback = function (id) {
        var client = this;
        return function (data) { return client.addCallback(id, data); };
    };
    /**
     * Object version of the client
     */
    SocketClient.prototype.serialize = function () {
        return { id: this.id };
    };
    /**
     * Send Events
     */
    SocketClient.prototype.flush = function () {
        if (this.events.length > 0) {
            this.sendEvents(this.events);
            this.events.length = 0;
        }
    };
    SocketClient.prototype.onMessage = function (e) {
        for (var _i = 0, _a = JSON.parse(e.data); _i < _a.length; _i++) {
            var data = _a[_i];
            var name_1 = data[0];
            if (typeof (name_1) === 'string') {
                if (data.length === 3) {
                    this.emit(name_1, [data[1], this.createCallback(data[2])]);
                }
                else {
                    this.emit(name_1, data[1]);
                }
            }
            else {
                this.playCallback(name_1, typeof (data[1]) !== 'undefined' ? data[1] : null);
            }
        }
    };
    return SocketClient;
}(event_emitter_1.EventEmitter));
exports.SocketClient = SocketClient;
