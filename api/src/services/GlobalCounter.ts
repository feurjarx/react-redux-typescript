export class GlobalCounter {

    private static map = new Map<string, number>();

    static init(countId: string) {
        this.map.set(countId, 0);
    }

    static reset() {
        this.map.clear();
    }

    static up(countId) {
        const count = this.map.get(countId);
        this.map.set(countId, count + 1);

        console.log(false, `*** GLOBAL COUNTER: ${String(countId).toUpperCase()} = ${count + 1} ***`);
    }


}