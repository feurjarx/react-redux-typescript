import DistributionBehavior from "./behaviors/DistributionBehavior";
import HRow from "../HRow";

export default class HashDistribution implements DistributionBehavior {
    getRegionServerNo(hRow: HRow, totalRegionServersNumbers: number) {
        return +('0x' + hRow.rowKey) % totalRegionServersNumbers;
    }
}