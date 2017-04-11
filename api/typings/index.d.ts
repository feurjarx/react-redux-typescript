export interface TableField {
    name: string;
    type: string;
    length: number;
    isPrimary: boolean;
    indexed: boolean;
    familyName: string;
}

export interface TableData {
    name: string;
    fields: Array<TableField>;
}

export interface ServerData {
    name: string;
    hdd: number;
    distanceToMaster: number;
    replicationNumber?: number;
    maxRegions?: number;
    pDie?: number;
    isMaster?: boolean;
}

export interface SqlParts {
    from: Array<string>;
    select: Array<string>;
    where: string;
}

export interface Criteria {
    table: string;
    field: string;
    operator: string;
    value: any;
    isPrimaryField: boolean;
}