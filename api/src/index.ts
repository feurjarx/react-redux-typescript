import * as ioServer from 'socket.io';
import * as http from 'http';

import {
    EVENT_IO_LIFE,
    EVENT_IO_CONNECTION,
    EVENT_IO_DISCONNECT,
    EVENT_IO_THE_END,
    EVENT_IO_PRELIFE,
    EVENT_IO_LOGS
} from './constants/events';

import ioConfig from './configs/socket.io'


import {Life} from "./models/Life";
import SocketLogEmitter from "./services/SocketLogEmitter";

export const run = () => {

    const httpServer = http.createServer();
    const io = ioServer(httpServer);
    let life: Life;

    io.on(EVENT_IO_CONNECTION, client => {

        SocketLogEmitter.instance
            .init(client, EVENT_IO_LOGS)
            .enable();

        console.log(false, 'browser client connected.');

        client.on(EVENT_IO_LIFE,
            (data) => {

                if (!life || !life.active) {

                    if (life) {
                        life.destroy();
                    }

                    life = new Life();
                    life
                        .onLifeInfo((browserData, type) => {
                            client.emit(EVENT_IO_LIFE, browserData, type);
                        })
                        .onLifeComplete(() => {
                            client.emit(EVENT_IO_THE_END);
                        })
                        .onBigDataInfo(browserData => (
                            client.emit(EVENT_IO_PRELIFE, browserData)
                        ))
                        .live(data);
                }
            }
        );

        client.on(EVENT_IO_DISCONNECT, () => {
            console.log('browser client was disconnected.');
        });
    });

    httpServer.listen(ioConfig.port);
};

//run();