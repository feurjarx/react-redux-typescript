class HRow {
    families = {};

    rowKey: string;

    constructor(rowKey: string) {
        this.rowKey = rowKey;
    }

    getSize() {
        let result = 0;

        const {families} = this;
        for (let familyKey in families) {
            const family = families[familyKey];
            for (let fieldName in family) {
                result += family[fieldName].fieldSize;
            }
        }

        return result;
    }
}
export default HRow;