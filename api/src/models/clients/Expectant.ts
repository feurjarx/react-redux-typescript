import Client from "../Client";
import {Subscription} from "rxjs";
import {RABBITMQ_QUEUE_MASTER_SERVER} from  "../../constants/rabbitmq";
import {SqlQueryParts} from "../../../typings/index";
import {random} from "../../helpers/index";
import {RESPONSE_TYPE_STOPPED, RESPONSE_TYPE_RECEIVED, RESPONSE_TYPE_SENT} from "../../constants/index";

export default class ExpectantClient extends Client {

    private subscription: Subscription;
    private sqls: Array<SqlQueryParts>;

    constructor(provider, sqls) {
        super(provider);

        this.sqls = sqls;
    }

    getRandomSqlQueryParts() {
        const {sqls} = this;
        const idx = random(sqls.length - 1);
        return sqls[idx];
    }

    requestsToMasterServer(nRequests = 1, callback = Function()) {

        const {requestTimeLimit} = this;
        let requestsReverseCounter = nRequests;

        this.subscription = this.provider
            .publishAndWait(RABBITMQ_QUEUE_MASTER_SERVER, {
                clientId: this.id,
                last: requestsReverseCounter <= 1,
                requestTimeLimit,
                sqlQueryParts: this.getRandomSqlQueryParts(),
            })
            .subscribe(response => {

                switch (response.type) {
                    case RESPONSE_TYPE_SENT:
                        console.log(`Клиент #${ this.id } выполнил запрос: ${response.sqlQueryParts.raw}`);
                        break;

                    case RESPONSE_TYPE_RECEIVED:

                        if (response.slavesNames) {
                            console.log(`Клиент #${ this.id } получил ответ от мастера. Обрабатывали запрос: ${response.slavesNames.join(',')}`);
                        } else {
                            console.log(`Клиент #${ this.id } получил ответ от мастера. Не найдено подходящего регион-сервера`);
                        }

                        requestsReverseCounter--;
                        if (requestsReverseCounter > 0) {

                            console.log(`Клиенту #${ this.id } осталось ${requestsReverseCounter} запросов. Далее, следующий запрос...`);

                            response.repeat({
                                clientId: this.id,
                                last: requestsReverseCounter <= 1,
                                sqlQueryParts: this.getRandomSqlQueryParts()
                            });

                        } else {
                            response.type = RESPONSE_TYPE_STOPPED;
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