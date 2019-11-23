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
var collection_1 = require("shared/collection");
var socket_client_1 = require("shared/core/socket-client");
var tickrate_logger_1 = require("shared/services/tickrate-logger");
var ping_logger_1 = require("./ping-logger");
var ServerSocketClient = /** @class */ (function (_super) {
    __extends(ServerSocketClient, _super);
    function ServerSocketClient(socket, interval, ip) {
        var _this = _super.call(this, socket, interval) || this;
        _this.active = true;
        _this.ip = ip;
        _this.id = null;
        _this.active = true;
        _this.players = new collection_1.Collection([], 'id');
        _this.pingLogger = new ping_logger_1.PingLogger(_this.socket);
        _this.tickrate = new tickrate_logger_1.TickrateLogger();
        _this.on('whoami', _this.identify);
        _this.on('activity', _this.onActivity);
        _this.pingLogger.on('latency', _this.onLatency);
        return _this;
    }
    /**
     * Is this client playing?
     */
    ServerSocketClient.prototype.isPlaying = function () {
        return !this.players.isEmpty();
    };
    /**
     * Clear players
     */
    ServerSocketClient.prototype.clearPlayers = function () {
        this.emit('players:clear', this);
        this.players.clear();
    };
    /**
     * Send an event
     */
    ServerSocketClient.prototype.sendEvents = function (events) {
        this.tickrate.tick(events);
        _super.prototype.sendEvents.call(this, events);
    };
    /**
     * Stop
     */
    ServerSocketClient.prototype.stop = function () {
        _super.prototype.stop.call(this);
        this.pingLogger.stop();
        this.tickrate.stop();
    };
    /**
     * Object version of the client
     */
    ServerSocketClient.prototype.serialize = function () {
        var data = _super.prototype.serialize.call(this);
        data.active = this.active;
        return data;
    };
    /**
     * On ping logger latency value
     */
    ServerSocketClient.prototype.onLatency = function (latency) {
        this.addEvent('latency', latency, null, true);
    };
    /**
     * Who am I?
     */
    ServerSocketClient.prototype.identify = function (event) {
        event[1](this.id);
    };
    /**
     * On activity change
     */
    ServerSocketClient.prototype.onActivity = function (active) {
        this.active = active;
    };
    ServerSocketClient.pingInterval = 1000;
    return ServerSocketClient;
}(socket_client_1.SocketClient));
exports.ServerSocketClient = ServerSocketClient;
