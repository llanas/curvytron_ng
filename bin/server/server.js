"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var express = __importStar(require("express"));
var http = __importStar(require("http"));
var collection_1 = require("shared/collection");
var Server = /** @class */ (function () {
    function Server(port) {
        this.app = express();
        this.server = new http.Server(this.app);
        this.server.listen(port);
        this.clients = new collection_1.Collection([], 'id', true);
        console.log('listening on port : %s', port);
    }
    Server.build = function (port) {
        Server.instance = new Server(port);
    };
    return Server;
}());
Server.build(8080);
