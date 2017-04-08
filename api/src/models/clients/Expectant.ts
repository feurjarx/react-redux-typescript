import Client from "../Client";
import {Subscription} from "rxjs";
import {RABBITMQ_QUEUE_MASTER_SERVER} from  "../../constants/rabbitmq";

export default class ExpectantClient extends Client {

    private subscription: Subscription;

    constructor(provider = null) {
        super(provider);
    }

    requestsToMasterServer(nRequests = 1, callback = Function()) {

        const {requestTimeLimit} = this;
        let requestsReverseCounter = nRequests;

        const observable = this.provider
            .publishAndWait(RABBITMQ_QUEUE_MASTER_SERVER, {
                clientId: this.id,
                last: requestsReverseCounter <= 1,
                requestTimeLimit
            });

        this.subscription = observable
            .subscribe(response => {
                switch (response.type) {
                    case 'sent':
                        console.log(`Клиент #${ this.id } выполнил запрос.`);
                        break;

                    case 'received':

                        console.log(`Клиент #${ this.id } получил ответ от мастера. Обрабатывал запрос регион-сервер #${response.slaveServerId}`);

                        requestsReverseCounter--;
                        if (requestsReverseCounter > 0) {

                            console.log(`Клиенту #${ this.id } осталось ${requestsReverseCounter} запросов. Далее, следующий запрос...`);

                            response.repeat({
                                clientId: this.id,
                                last: requestsReverseCounter <= 1
                            });

                        } else {
                            response.type = 'stopped';
                            this.stop();
                        }

                        break;

                    default:
                        throw new Error(`Unexpected response type from server. Type: ${ response.type }`);
                }

                callback(response);
            });
    }

    stop() {
        this.provider.destroy();
        this.subscription.unsubscribe();
        console.log(`Клиент #${ this.id } отключен.`);
    }


}