import {SqlQueryParts} from "../../../../../typings/index";
interface SlaveSelectingBehavior {
    title?: string;
    sqls?: Array<SqlQueryParts>;
    getSlaveServerId?(...args);
}

export default SlaveSelectingBehavior;