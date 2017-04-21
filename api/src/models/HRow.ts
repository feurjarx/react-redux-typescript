import {SQL_LITERAL_ALL} from "../constants/index";
import {HRowCell, HRowSelecting, HRowArrow, TableField} from "../../typings/index";
import {FIELD_TYPE_NUMBER, FIELD_TYPE_STRING} from "../constants/index";
import {random, generateWord} from "../helpers/index";

export default class HRow {
    families = {};
    tableName: string;

    id = Date.now();
    rowKey: string;

    indexedFields: Array<string>;

    static calcArrowKey({table, field, value}) {
        return [table, field , value].join('*');
    }

    static calcFamilyKey(fieldsNames) {
        return fieldsNames.sort().join('=').toUpperCase();
    }

    static getFieldTypeByNameMap(fields: Array<TableField>) {
        let map = {};
        fields.forEach(f => map[f.name] = f.type)
        return map;
    }

    /**
     * @see https://habrastorage.org/getpro/habr/post_images/72f/db4/418/72fdb44187d02c8affdc9740eb691115.png
     * @param fields
     * @returns {Array}
     */
    private static getFamiliesFromFields(fields: Array<TableField>): Array<Array<string>> {
        return fields
            .map(f => f.familyName)
            .filter((f, i, list) => list.indexOf(f) === i)
            .map(familyName => (
                fields
                    .filter(f => f.familyName === familyName)
                    .map(f => f.name)
            ));
    }

    static getSizeByFieldNameMap(id: number, fields: Array<TableField>) {

        const map = {};

        fields.forEach(field => {

            const {type, isPrimary} = field;

            let fieldSize;
            if (isPrimary) {
                fieldSize = String(id).length;

            } else {

                let maxFieldSize = field.length;
                if (!maxFieldSize) {
                    if (type === FIELD_TYPE_STRING) {
                        maxFieldSize = 255;
                    }
                    if (type === FIELD_TYPE_NUMBER) {
                        maxFieldSize = 11;
                    }
                }

                fieldSize = random(maxFieldSize);
            }

            map[field.name] = fieldSize;
        });

        return map;
    }

    constructor(rowKey: string, tableName: string) {
        this.rowKey = rowKey;
        this.tableName = tableName;
    }

    define(fields: Array<TableField>) {

        const fieldTypeByNameMap = HRow.getFieldTypeByNameMap(fields);
        const sizeByFieldNameMap = HRow.getSizeByFieldNameMap(this.id, fields);

        this.indexedFields = fields
            .filter(f => f.indexed || f.isPrimary)
            .map(f => f.name);

        HRow
            .getFamiliesFromFields(fields)
            .forEach(fieldsNames => {

                const fieldsValues = {};
                fieldsNames.forEach(fieldName => {

                    let fieldValue = null;
                    switch (fieldTypeByNameMap[fieldName]) {
                        case FIELD_TYPE_NUMBER:
                            fieldValue = random(10);
                            break;
                        case FIELD_TYPE_STRING:
                            fieldValue = generateWord(3);
                            break;
                    }

                    fieldsValues[fieldName] = {
                        fieldSize: sizeByFieldNameMap[fieldName],
                        versions: {
                            [Date.now()]: fieldValue
                        }
                    };
                });

                const familyKey = HRow.calcFamilyKey(fieldsNames);
                this.families[familyKey] = fieldsValues;
            });
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

    getIndexedArrowKeys() {
        const result = [];

        this.getArrowsFromFields().forEach(arrow => {
            if (this.indexedFields.indexOf(arrow.field) >= 0) {
                result.push(HRow.calcArrowKey(arrow));
            }
        });

        return result;
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