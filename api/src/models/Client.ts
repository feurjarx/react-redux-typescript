import {IQueue} from "../services/IQueue";
import rabbitmqConfig from "../configs/rabbitmq";

export default class Client {
    id: number;

    provider: IQueue;

    constructor(provider) {
        this.id = new Date().getTime();
        this.provider = provider;
    }

    requestServer(data: string = 'Hello world') {

        const { queueName } = rabbitmqConfig;

        this.provider
            .publish(queueName, data)
            .then(() => {
                console.log(`Client #${ this.id } request done.`);
            });
    }
}