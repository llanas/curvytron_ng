import 'module-alias/register';

import { Collection } from '@shared/collection';
import { SocketClient } from '@shared/core/socket-client';
import * as express from 'express';
import * as http from 'http';

import { ServerSocketClient } from './core/server-socker-client';

class Server {

    private static instance: Server;

    app: any;
    server: http.Server;
    clients: Collection<SocketClient>;

    constructor(port: number) {

        this.app = express();
        this.server = new http.Server(this.app);
        this.server.listen(port);

        this.clients = new Collection<ServerSocketClient>([], 'id', true);
        console.log('listening on port : %s', port);
    }

    static build(port: number) {
        Server.instance = new Server(port);
    }
}

Server.build(8080);
