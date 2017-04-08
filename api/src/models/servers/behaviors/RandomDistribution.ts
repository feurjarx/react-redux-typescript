import DistributionBehavior from "./DistributionBehavior";
import {random} from '../../../helpers/index'
export default class RandomDistribution implements DistributionBehavior {
    getSlaveServerNo(_, totalSlavesNumber: number) {
        return random(totalSlavesNumber - 1);
    }
}