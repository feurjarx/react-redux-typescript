import HRow from "../HRow";
class HRegion {
    id: number;

    rows: {[rowKey: string]: HRow} = {};

    freeSpace: number;
    maxSize: number;

    serverId: any;

    constructor(id: number, serverId: number, maxSize: number) {
        this.id = id;
        this.maxSize = maxSize;
        this.serverId = serverId;

        this.freeSpace = maxSize;
    }

    isFitIn(requiredSize: number) {
        return  this.freeSpace - requiredSize > 0;
    }

    add(hRow) {

        const {rows} = this;
        rows[hRow.rowKey] = hRow;

        this.freeSpace -= hRow.getSize();
    }

    popHalf() {

        const {rows} = this;

        const result = [];

        const rowsKeys = Object.keys(rows);
        const midIdx = Math.round(rowsKeys.length / 2);

        rowsKeys.forEach((rowKey, i) => {
            if (i > midIdx) {
                const hRow = rows[rowKey];
                result.push(hRow);

                delete this.rows[rowKey];
            }
        });

        this.updateFreeSize();

        return result;
    }

    updateFreeSize() {
        const {rows, maxSize} = this;
        let freeSpace = maxSize;
        for (let rowKey in rows) {
            freeSpace -= rows[rowKey].getSize();
        }

        this.freeSpace = freeSpace;
    }

}
export default HRegion;