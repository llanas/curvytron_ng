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
var PingLogger = /** @class */ (function (_super) {
    __extends(PingLogger, _super);
    function PingLogger(socket) {
        var _this = _super.call(this) || this;
        _this.interval = null;
        _this.socket = socket;
        return _this;
    }
    /**
     * Start ping
     */
    PingLogger.prototype.start = function () {
        if (!this.interval) {
            this.interval = setInterval(this.ping, PingLogger.frequency);
        }
    };
    /**
     * Stop ping
     */
    PingLogger.prototype.stop = function () {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    };
    /**
     * Pong
     */
    PingLogger.prototype.pong = function (ping) {
        this.emit('latency', new Date().getTime() - ping);
    };
    /**
     * Ping
     */
    PingLogger.prototype.ping = function () {
        var ping = new Date().getTime();
        // TODO : A voir comment simuler un test de ping
        // this.socket.ping(null, () => this.pong(ping));
    };
    PingLogger.frequency = 1000;
    return PingLogger;
}(event_emitter_1.EventEmitter));
exports.PingLogger = PingLogger;
