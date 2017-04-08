import DistributionBehavior from "./DistributionBehavior";
import HRow from "../../HRow";

export default class HashDistribution implements DistributionBehavior {
    getSlaveServerNo(hRow: HRow, totalSlavesNumber: number) {
        return +('0x' + hRow.rowKey) % totalSlavesNumber;
    }
}