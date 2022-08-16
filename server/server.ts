import 'module-alias/register';

import { Collection } from '@shared/collection';
import { BaseSocketClient } from '@shared/core/BaseSocketClient';
import { boundMethod } from 'autobind-decorator';
import { EventEmitter } from 'events';
import * as http from 'http';
import * as WebSocket from 'ws';

import { RoomsController } from './controller/RoomsController';
import { ServerSocketClient } from './core/ServerSocketClient';
import { RoomRepository } from './repository/RoomRepository';

export class CurvytronServer extends EventEmitter {

    app: any;
    server: http.Server;
    socket: WebSocket.Server;

    clients: Collection<BaseSocketClient>;

    roomRepository: RoomRepository;
    roomsController: RoomsController;

    constructor (port: number) {

        super();

        this.socket = new WebSocket.Server({ port });
        console.log('Listening on port : ' + port);
        this.socket.on('connection', this.onSocketConnection);
        this.socket.on('error', (error, errorCode) => console.log('Error: ' + errorCode));
        this.clients = new Collection<ServerSocketClient>([], 'id', true);

        this.roomRepository = new RoomRepository();
        this.roomsController = new RoomsController(this.roomRepository);
    }

    @boundMethod
    onSocketConnection(ws: WebSocket, request: http.IncomingMessage) {
        const client = new ServerSocketClient(ws, 1, '127.0.0.1');
        this.clients.add(client);
        client.on('close', this.onSocketDisconnection);

        this.roomsController.attach(client);
        this.emit('client', client);

        console.log('Client %s connected.', client.id);
    }

    @boundMethod
    onSocketDisconnection(client: ServerSocketClient) {
        console.log('Client %s disconnected.', client.id);
        this.clients.remove(client);
    }
}

exports.module = new CurvytronServer(8090);
