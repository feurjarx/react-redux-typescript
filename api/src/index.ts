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

export const run = () => {

    const httpServer = http.createServer();
    const io = ioServer(httpServer);

    io.on(EVENT_IO_CONNECTION, client => {

        console.log('browser client connected.');

        let life: Life;
        client.on(EVENT_IO_LIFE,
            (data) => {
                if (life) {
                    life.destroy();
                }

                life = new Life();
                life
                    .onLifeInfo(browserData => {
                        if (browserData.type === 'load_line') {
                            client.emit(EVENT_IO_LOAD_LINE, browserData);
                        } else {
                            client.emit(EVENT_IO_LIFE, browserData);
                        }
                    })
                    .onLifeComplete(() => {
                        client.emit(EVENT_IO_THE_END);
                    })
                    .onBigDataInfo(browserData => (
                        client.emit(EVENT_IO_PRELIFE, browserData)
                    ))
                    .live(data);
            }
        );

        client.on(EVENT_IO_DISCONNECT, () => {
            console.log('browser client was disconnected.');
        });
    });

    httpServer.listen(ioConfig.port);
};

run();