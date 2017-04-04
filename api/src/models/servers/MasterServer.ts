import Server from "../Server";
import {ServerData} from "../../../typings/index";
import RegionServer from "./RegionServer";
import HRow from "../HRow";
import DistributionBehavior from "../servers/behaviors/DistributionBehavior";
import HRegion from "./HRegion";

class MasterServer extends Server {

    isMaster: boolean;

    distrubutionBehavior: DistributionBehavior;

    subordinates: Array<RegionServer>;

    registry: Array<HRegion>; // ???

    constructor(provider, serverData: ServerData) {
        super(provider);

        const {isMaster} = serverData;
        this.isMaster = isMaster;
        this.subordinates = [];
    };

    save(hRow: HRow) {
        const {getRegionServerNo} = this.distrubutionBehavior;
        const serverRegionNo = getRegionServerNo(hRow, this.subordinates.length);
        this.subordinates[serverRegionNo].save(hRow);
    }
}

export default MasterServer;