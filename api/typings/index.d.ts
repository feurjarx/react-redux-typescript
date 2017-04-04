import HRow from "../src/models/HRow";
export interface TableField {
    name: string;
    type: string;
    length: number;
    isPrimary: boolean;
    indexed: boolean;
    familyName: string; // TODO: it new
}

export interface TableData {
    name: string;
    fields: Array<TableField>;
}

export interface ServerData {
    name: string;
    hdd: number;
    distanceToMaster: number;
    // tables?: Array<string>;
    replicationNumber?: number;
    maxRegions?: number; // TODO: it new
    pDie?: number;
    isMaster?: boolean;
}