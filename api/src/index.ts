import * as ioServer from 'socket.io';
import * as http from 'http';
const socketPort = 3003;

export const run = () => {

    const httpServer = http.createServer();
    const io = ioServer(httpServer);

    io.on('connection', client => {

        console.log('client connected.');

        client.on('myevent', function(data){
            console.log('client data: ');
            console.log(data);
        });

        client.on('disconnect', function(){
            console.log('client was disconnected.')
        });

    });

    httpServer.listen(socketPort);
};
