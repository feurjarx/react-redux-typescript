import Server from "../Server";
import {ServerData} from "../../../typings/index";
import HRow from "../HRow";
import HRegion from "../HRegion";

import helpers from '../../helpers/index';
const {range} = helpers;

export default class RegionServer extends Server {
    regions: Array<HRegion>;

    hdd: number;
    maxRegions: number;

    regionMaxSize: number;

    constructor(provider, serverData: ServerData) {
        super(provider);

        this.regions = [];

        const {hdd, maxRegions} = serverData;
        this.hdd = hdd;
        this.maxRegions = maxRegions;

        const regionMaxSize = Math.round(hdd / maxRegions);
        this.regions = range(0, maxRegions)
            .map(id => new HRegion(id, this.id, regionMaxSize));

        this.regionMaxSize = regionMaxSize;
    };

    save(hRow: HRow) {

        const {regions} = this;

        for (let i = 0; i < regions.length; i++) {
            const region = regions[i];
            if (region.isFitIn(hRow.getSize())) {
                region.add(hRow);
                break;

            } else {

                this.split(region);
            }
        }
    }

    split(hRegion: HRegion) {

        if (Object.keys(hRegion.rows).length) {

            const rowsList = hRegion.popHalf();
            const {regions} = this;

            const filledRegionsIds = regions
                .filter(r => r.id != hRegion.id)
                .map(r => r.id);

            for (let i = 0; i < rowsList.length; i++) {
                const regionId = filledRegionsIds[i % filledRegionsIds.length];
                regions[regionId].add(rowsList[i]);
            }
        }
    }

}