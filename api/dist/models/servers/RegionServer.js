"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Server_1 = require("../Server");
var HRegion_1 = require("./HRegion");
var index_1 = require("../../helpers/index");
var range = index_1.default.range;
var RegionServer = (function (_super) {
    __extends(RegionServer, _super);
    function RegionServer(provider, serverData) {
        var _this = _super.call(this, provider) || this;
        _this.regions = [];
        var hdd = serverData.hdd, maxRegions = serverData.maxRegions;
        _this.hdd = hdd;
        _this.maxRegions = maxRegions;
        var regionMaxSize = Math.round(hdd / maxRegions);
        _this.regions = range(0, maxRegions)
            .map(function (id) { return new HRegion_1.default(id, _this.id, regionMaxSize); });
        _this.regionMaxSize = regionMaxSize;
        return _this;
    }
    ;
    RegionServer.prototype.save = function (hRow) {
        var regions = this.regions;
        for (var i = 0; i < regions.length; i++) {
            var region = regions[i];
            if (region.isFitIn(hRow.getSize())) {
                region.add(hRow);
                break;
            }
            else {
                this.split(region);
            }
        }
    };
    RegionServer.prototype.split = function (hRegion) {
        if (Object.keys(hRegion.rows).length) {
            var rowsList = hRegion.popHalf();
            var regions = this.regions;
            var filledRegionsIds = regions
                .filter(function (r) { return r.id != hRegion.id; })
                .map(function (r) { return r.id; });
            for (var i = 0; i < rowsList.length; i++) {
                var regionId = filledRegionsIds[i % filledRegionsIds.length];
                regions[regionId].add(rowsList[i]);
            }
        }
    };
    return RegionServer;
}(Server_1.default));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RegionServer;
