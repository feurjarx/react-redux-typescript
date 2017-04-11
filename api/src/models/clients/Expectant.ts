import Client from "../Client";
import {Subscription} from "rxjs";
import {RABBITMQ_QUEUE_MASTER_SERVER} from  "../../constants/rabbitmq";
import {SqlParts} from "../../../typings/index";
import {random} from "../../helpers/index";

export default class ExpectantClient extends Client {

    private subscription: Subscription;
    private sqls: Array<SqlParts>;

    constructor(provider, sqls) {
        super(provider);

        this.sqls = sqls;
    }

    getRandomSqlParts() {
        const {sqls} = this;
        const idx = random(sqls.length - 1);
        return sqls[idx];
    }

    requestsToMasterServer(nRequests = 1, callback = Function()) {

        const {requestTimeLimit} = this;
        let requestsReverseCounter = nRequests;

        const observable = this.provider
            .publishAndWait(RABBITMQ_QUEUE_MASTER_SERVER, {
                clientId: this.id,
                last: requestsReverseCounter <= 1,
                requestTimeLimit,
                sqlParts: this.getRandomSqlParts(),
            });

        this.subscription = observable
            .subscribe(response => {

                switch (response.type) {
                    case 'sent':
                        console.log(`Клиент #${ this.id } выполнил запрос: ${response.sqlParts.raw}`);
                        break;

                    case 'received':

                        if (response.slavesNames) {
                            console.log(`Клиент #${ this.id } получил ответ от мастера. Обрабатывали запрос #${response.slavesNames.join(',')}`);
                        } else {
                            console.log(`Клиент #${ this.id } получил ответ от мастера. Не найдено подходящего регион-сервера`);
                        }

                        requestsReverseCounter--;
                        if (requestsReverseCounter > 0) {

                            console.log(`Клиенту #${ this.id } осталось ${requestsReverseCounter} запросов. Далее, следующий запрос...`);

                            response.repeat({
                                clientId: this.id,
                                last: requestsReverseCounter <= 1,
                                sqlParts: this.getRandomSqlParts()
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