import * as ioServer from 'socket.io';
import * as http from 'http';

import {
    EVENT_IO_LIFE,
    EVENT_IO_CONNECTION,
    EVENT_IO_DISCONNECT,
    EVENT_IO_THE_END,
    EVENT_IO_LOAD_LINE,
    EVENT_IO_PRELIFE
} from './constants/events';

import ioConfig from './configs/socket.io'

import {Life} from "./models/Life";
import {composition} from "./helpers/index";

export const run = () => {

    const httpServer = http.createServer();
    const io = ioServer(httpServer);

    io.on(EVENT_IO_CONNECTION, client => {

        console.log('browser client connected.');

        const life = new Life();

        client.on(EVENT_IO_LIFE, composition(
            (data) => {
                life.preLive(
                    data,
                    browserData => client.emit(EVENT_IO_PRELIFE, browserData)
                );
            },
            (data) => {

                life
                    .live(data)
                    .onLifeInfo(browserData => {
                        if (browserData.type === 'load_line') {
                            client.emit(EVENT_IO_LOAD_LINE, browserData);
                        } else {
                            client.emit(EVENT_IO_LIFE, browserData);
                        }
                    })
                    .onLifeComplete(() => {
                        client.emit(EVENT_IO_THE_END);
                    });
            }
        ));

        client.on(EVENT_IO_DISCONNECT, () => {
            console.log('browser client was disconnected.');
        });
    });

    httpServer.listen(ioConfig.port);
};

run();