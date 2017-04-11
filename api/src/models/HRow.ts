class HRow {
    families = {};
    tableName: string;

    rowKey: string;

    static getGuideArrowKey({table, field, value}) {
        return [table, field , value].join('*');
    }

    constructor(rowKey: string, tableName: string) {
        this.rowKey = rowKey;
        this.tableName = tableName;
    }

    getFirstVersionValueFromCell(rowCell) {
        const {versions} = rowCell;
        const tsList = Object.keys(versions);
        return versions[tsList[0]];
    }

    getFields() {
        const result = [];

        for (let familyName in this.families) {
            for (let fieldName in this.families[familyName]) {
                result.push({
                    table: this.tableName,
                    field: fieldName,
                    value: this.getValueByFieldName(fieldName)
                });
            }
        }

        return result;
    }

    getFieldsValuesMap() {

        const map = {};

        for (let familyName in this.families) {
            for (let fieldName in this.families[familyName]) {
                map[fieldName] = this.getValueByFieldName(fieldName);
            }
        }

        return map;
    }

    getValueByFieldName(name: string) {
        let result = null;
        for (let it in this.families) {
            const rowCell = this.families[it][name];
            if (rowCell) {
                result = this.getFirstVersionValueFromCell(rowCell);
                break;
            }
        }

        return result;
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