import Client from "../Client";
import RabbitMQ from "../../services/RabbitMQ";

export default class ExpectantClient extends Client {
    constructor() {
        super(new RabbitMQ());
    }

    accept(callback) {

    }
}