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
