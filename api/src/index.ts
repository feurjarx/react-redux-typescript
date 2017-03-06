import * as ioServer from 'socket.io';
import * as http from 'http';

import {

    EVENT_IO_LIFE,
    EVENT_IO_CONNECTION,
    EVENT_IO_DISCONNECT

} from './constants/events';

import ioConfig from './configs/socket.io'

import {Life} from "./models/Life";

export const run = () => {

    const httpServer = http.createServer();
    const io = ioServer(httpServer);

    io.on(EVENT_IO_CONNECTION, client => {

        console.log('browser client connected.');

        const life = new Life();

        client.on(EVENT_IO_LIFE, data => {
            life.clear();
            life.live(data, browserData => client.emit(EVENT_IO_LIFE, browserData));
        });

        client.on(EVENT_IO_DISCONNECT, () => {
            life.clear();
            console.log('browser client was disconnected.');
        });
    });

    httpServer.listen(ioConfig.port);
};

run();