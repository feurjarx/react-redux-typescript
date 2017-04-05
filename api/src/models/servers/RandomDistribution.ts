import DistributionBehavior from "./behaviors/DistributionBehavior";
import {random} from './../../helpers/index'
export default class RandomDistribution implements DistributionBehavior {
    getRegionServerNo(_, totalRegionServersNumbers: number) {
        return random(totalRegionServersNumbers - 1);
    }
}