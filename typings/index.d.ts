export interface ServerData {
    name: string;
    isMaster: boolean;
    hdd?: number;
    replicationNumber?: number;
    pDie?: number;
    distanceToMasterKm?: number;
    maxRegions?: number;
}