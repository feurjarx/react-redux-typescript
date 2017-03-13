import Client from "../Client";
import rabbitmqConfig from "../../configs/rabbitmq";
import {Subscription} from "rxjs";

export default class ExpectantClient extends Client {

    requestsNumber: number;
    private subscription: Subscription;

    constructor(provider = null) {
        super(provider);
    }

    requestToServer(requestsNumber = this.requestsNumber) {

        const { queueName } = rabbitmqConfig;

        const { requestTimeLimit } = this;

        const observable = this.provider
            .publishAndWait(queueName, {
                clientId: this.id,
                last: this.requestsNumber <= 1,
                requestTimeLimit
            });

        this.subscription = observable
            .subscribe(response => {

                switch (response.type) {
                    case 'sent':
                        console.log(`Client #${ this.id } request done.`);
                        break;
                    case 'received':

                        console.log(`Client #${ this.id } received response from server.`);

                        requestsNumber--;

                        if (requestsNumber > 0) {
                            response.repeat({
                                clientId: this.id,
                                last: requestsNumber <= 1
                            });
                        } else {
                            this.stop();
                        }

                        break;
                    //...
                    default:
                        throw new Error(`Unexpected response type from server. Type: ${ response.type }`);
                }
            });

        return observable;
    }

    stop() {
        this.provider.destroy();
        this.subscription.unsubscribe();
    }
}