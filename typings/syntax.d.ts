export declare namespace Syntax {
    export interface WordData {
        root?: string;
        kind?: string;
        declension?: number;

        word?: string;
        digitsRange?: {
            from: number;
            to?: number;
        };
    }
}