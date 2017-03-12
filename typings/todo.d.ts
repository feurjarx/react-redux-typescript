export declare namespace Todo {
    export interface Item {
        text: string;
        completed?: boolean;
    }

    export interface State {
        visibilityFilter: VisibilityFilter;
        todos: Array<Item>;
    }

    export type VisibilityFilter = 'all' | 'active' | 'completed';
}

export declare namespace Monitor {
    export interface Item {
        id: number;
        requestCounter: number;
        name?: string;
    }
}

export declare namespace Life {
    export interface Params {
        nClients: number;
        nServers: number;
        requestsLimit: number;
    }
}

