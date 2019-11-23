import 'module-alias/register';

import { Collection } from '@shared/collection';
import { SocketClient } from '@shared/core/socket-client';
import * as express from 'express';
import * as http from 'http';
import * as WebSocket from 'ws';

import { ServerSocketClient } from './core/server-socker-client';

class Server {

    app: any;
    server: http.Server;
    socket: WebSocket.Server;
    clients: Collection<SocketClient>;

    constructor(port: number) {

        this.app = express();
        this.server = new http.Server(this.app);
        this.socket = new WebSocket.Server({ port });
        console.log('Listening on port : ' + port);
        this.socket.on('connection', this.newConnection);
        this.clients = new Collection<ServerSocketClient>([], 'id', true);
    }

    newConnection(ws: WebSocket, request: http.IncomingMessage) {
        console.log('Nouvelle connexion');
        ws.on('message', (message: string) => {
            console.log('received: %s', message);
            ws.send(`hello, you sent -> ${message}`);
        });
        ws.send('Hi there, I am a WebSocket server');
    }
}

new Server(8080);
