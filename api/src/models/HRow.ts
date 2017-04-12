import {SQL_LITERAL_ALL} from "../constants/index";
import {HRowCell, HRowSelecting, HRowArrow} from "../../typings/index";

export default class HRow {
    families = {};
    tableName: string;

    rowKey: string;

    static calcArrowKey({table, field, value}) {
        return [table, field , value].join('*');
    }

    static calcFamilyKey(fieldsNames) {
        return fieldsNames.sort().join('=').toUpperCase();
    }

    constructor(rowKey: string, tableName: string) {
        this.rowKey = rowKey;
        this.tableName = tableName;
    }

    private getSelectingByFamilyKey(familyKey: string): HRowSelecting {
        const valuesMap = {};
        let processingTimeCounter = 0;
        let successful = false;

        const family = this.families[familyKey];
        if (family) {
            for (let fieldName in family) {
                const hCell = family[fieldName] as HRowCell;
                valuesMap[fieldName] = Object.assign({}, hCell);
                processingTimeCounter++; // read value
            }

            successful = true;
        }

        return {
            processingTime: processingTimeCounter,
            valuesMap,
            successful
        };
    }

    private getSelectingByFieldsNames(fieldsNames: Array<string>): HRowSelecting {
        let processingTimeCounter = 0;
        let valuesMap = {};

        let successful = true;

        for (let familyName in this.families) {
            const family = this.families[familyName];

            for (let fieldName in family) {
                if (fieldsNames.indexOf(fieldName) >= 0) {
                    const hCell = family[fieldName] as HRowCell;
                    valuesMap[fieldName] = Object.assign({}, hCell);
                    processingTimeCounter++; // read value
                } else {
                    successful = false;
                }

                processingTimeCounter++;
            }
        }

        return {
            processingTime: processingTimeCounter,
            valuesMap,
            successful
        };
    }

    readBySelect(selectItems: Array<string>): HRowSelecting {

        let selecting: HRowSelecting;
        if (selectItems[0] === SQL_LITERAL_ALL) {
            selecting = this.getSelectingByFieldsNames(this.getFieldsNames());

        } else {

            const joinedFieldsNamesMap = {};
            const fieldsNames = [];

            selectItems.map(selectItem => {

                let [tableName, fieldName] = selectItem.split('.').map(it => it.trim());
                if (tableName === this.tableName) {
                    fieldsNames.push(fieldName);

                } else {

                    // INNER JOIN CASE
                    if (!joinedFieldsNamesMap[tableName]) {
                        joinedFieldsNamesMap[tableName] = [];
                    }

                    joinedFieldsNamesMap[tableName].push(fieldName);
                }
            });

            const familyKey = HRow.calcFamilyKey(fieldsNames);
            selecting = this.getSelectingByFamilyKey(familyKey);
            if (!selecting.successful) {
                selecting = this.getSelectingByFieldsNames(fieldsNames);
            }
        }

        return selecting;
    }

    getArrowKeys() {
        const result = [];

        this.getArrowsFromFields().forEach(arrow => {
            result.push(HRow.calcArrowKey(arrow));
        });

        return result;
    }

    getFirstValueFromCell(rowCell) {
        const {versions} = rowCell;
        const tsList = Object.keys(versions);
        return versions[tsList[0]];
    }

    getFieldsNames() {
        const result = [];

        for (let familyName in this.families) {
            for (let fieldName in this.families[familyName]) {
                result.push(fieldName);
            }
        }

        return result;
    }

    getArrowsFromFields(): Array<HRowArrow> {
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

    getValueByFieldName(name: string) {
        let result = null;
        for (let it in this.families) {
            const rowCell = this.families[it][name];
            if (rowCell) {
                result = this.getFirstValueFromCell(rowCell);
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