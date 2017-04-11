import {SqlParts} from "../../../../../typings/index";
interface SlaveSelectingBehavior {
    title?: string;
    sqls?: Array<SqlParts>;
    getSlaveServerId?(...args);
}

export default SlaveSelectingBehavior;