import {IQueue} from "../services/IQueue";
import rabbitmqConfig from "../configs/rabbitmq";

export default class Client {
    id: number;

    protected provider: IQueue;

    constructor(provider = null) {
        this.id = new Date().getTime() % 1000;
        this.provider = provider;
    }

    setProvider(provider: IQueue) {
        this.provider = provider;
    }

    requestServer({message = 'Hello world'}) {

        const { queueName } = rabbitmqConfig;

        this.provider
            .publish(queueName, message)
            .then(() => {
                console.log(`Client #${ this.id } request done.`);
            });
    }
}