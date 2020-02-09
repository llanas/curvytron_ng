import 'module-alias/register';

import { Collection } from '@shared/collection';
import { BaseSocketClient } from '@shared/core/BaseSocketClient';
import * as express from 'express';
import * as http from 'http';
import { RoomRepository } from 'repository/RoomRepository';
import * as WebSocket from 'ws';

import { ServerSocketClient } from './core/ServerSocketClient';

class Server {

    app: any;
    server: http.Server;
    socket: WebSocket.Server;

    clients: Collection<BaseSocketClient>;

    roomRepository: RoomRepository;

    constructor(port: number) {

        this.app = express();
        this.server = new http.Server(this.app);
        this.socket = new WebSocket.Server({ port });
        console.log('Listening on port : ' + port);
        this.socket.on('connection', this.onSocketConnection);
        this.clients = new Collection<ServerSocketClient>([], 'id', true);


    }

    onSocketConnection(this: Server, ws: WebSocket, request: http.IncomingMessage) {
        const client = new ServerSocketClient(ws, 1, '127.0.0.1');
        this.clients.add(client);
        client.on('close', this.onSocketDisconnection);

        ws.on('message', (message: string) => {
            console.log('received: %s', message);
            ws.send(`hello, you sent -> ${message}`);
        });
        ws.send('Hi there, I am a WebSocket server');
    }

    onSocketDisconnection(this: Server, client: ServerSocketClient) {
        console.log('Client %s disconnected.', client.id);
        this.clients.remove(client);
    }
}

new Server(8090);
