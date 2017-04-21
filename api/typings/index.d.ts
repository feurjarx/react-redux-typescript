export interface TableField {
    name: string;
    type: string;
    length?: number;
    isPrimary?: boolean;
    indexed?: boolean;
    familyName?: string;
}

export interface TableData {
    name: string;
    tableSize: number;
    fields: Array<TableField>;
    sharding?: {
        type?: string;
        serverId?: any;
    }
}

export interface ServerData {
    name: string;
    hdd: number;
    distanceToMasterKm: number;
    replicationNumber?: number;
    maxRegions?: number;
    pDie?: number;
    isMaster?: boolean;
}

export interface SqlQueryParts {
    from: Array<string>;
    select: Array<string>;
    where: string;
    join: any;
    raw: string;
}

export interface Criteria {
    table: string;
    field: string;
    operator: string;
    value: any;
    isPrimaryField: boolean;
}

export interface ClientRequestFromMaster {
    onReply: Function;
    clientId: any;
    subKey: string;
    sqlQueryParts: SqlQueryParts;
}

export interface HRowCell {
    fieldSize: number;
    versions: {
        [ts: number]: any
    };
}

export interface HRowSelecting {
    valuesMap: {
        [field: string]: HRowCell;
    };
    processingTime: number;
    successful?: boolean;
}

export interface HRowArrow {
    table: string;
    field: string;
    value: any;
}
