import {random, hash, range, generateWord} from "../helpers/index";
import HRow from "./HRow";
import MasterServer from "./servers/MasterServer";
import {RandomSharding} from "./servers/behaviors/sharding";
import {TableField} from "../../typings/index";
import {FIELD_TYPE_NUMBER, FIELD_TYPE_STRING, HDD_ASPECT_RATIO} from "../constants/index";

export default class MapGenerator {

    calcRowSizesInfo(rowId, fields, ) {

        let rowSize = 0;
        const sizeByFieldNameMap = {};

        fields.forEach(f => {

            const {type, isPrimary} = f;
            let fieldSize;
            if (isPrimary) {
                fieldSize = String(rowId).length;

            } else {

                let maxFieldSize = f.length;
                if (!maxFieldSize) {
                    if (type === 'Строковый') {
                        maxFieldSize = 255;
                    }
                    if (type === 'Числовой') {
                        maxFieldSize = 11;
                    }
                }

                fieldSize = random(maxFieldSize);
            }

            sizeByFieldNameMap[f.name] = fieldSize;

            rowSize += fieldSize;
        });

        return {
            rowSize,
            sizeByFieldNameMap
        };
    }

    /**
     * @see https://habrastorage.org/getpro/habr/post_images/72f/db4/418/72fdb44187d02c8affdc9740eb691115.png
     * @param fields
     * @returns {Array}
     */
    private static getFamilies(fields): Array<Array<string>> {

        const result = [];

        const familiesNames = fields
            // .filter(f => f.familyName && !f.isPrimary)
            .map(f => f.familyName)
            .filter((f, i, list) => list.indexOf(f) === i);

        familiesNames.forEach(familyName => {
            const fieldsNames = fields
                .filter(f => f.familyName === familyName)
                .map(f => f.name);

            result.push(fieldsNames)
        });

        return result;
    }

    static getFieldsFamilyKey(fieldsNames) {
        return fieldsNames.join('=').toUpperCase();
    }

    static getFieldTypeByNameMap(fields: Array<TableField>) {
        let map = {};
        fields.forEach(f => map[f.name] = f.type)
        return map;
    }

    static fillRegions({tables}, masterServer: MasterServer) {

        const generator = new MapGenerator();
        // const hTables = {};
        // const maxTableSize = dbSize / tables.length; // avg

        tables.forEach(table => {

            const {fields, sharding} = table;
            const tableSize = HDD_ASPECT_RATIO * table.tableSize;
            const tableName = table.name;
            // hTables[tableName] = {};

            const families = this.getFamilies(fields);
            const fieldTypeByNameMap = this.getFieldTypeByNameMap(fields);

            let tableSizeCounter = 0;
            for (let i = 0; tableSizeCounter < tableSize; i++) {

                const id = i + 1;

                let rowSizesInfo = generator.calcRowSizesInfo(id, fields);
                const {sizeByFieldNameMap} = rowSizesInfo;

                const rowKey = hash(tableName, id, Date.now());
                const hRow = new HRow(rowKey, tableName);

                // fill one hRow
                families.forEach(fieldsNames => {

                    const familyKey = this.getFieldsFamilyKey(fieldsNames);
                    const fieldsValues = {};
                    fieldsNames.forEach(fieldName => {
                        let fieldValue = null;
                        switch (fieldTypeByNameMap[fieldName]) {
                            case FIELD_TYPE_NUMBER:
                                fieldValue = random(100);
                                break;
                            case FIELD_TYPE_STRING:
                                fieldValue = generateWord(4);
                                break;
                        }

                        const fieldSize = sizeByFieldNameMap[fieldName];
                        fieldsValues[fieldName] = {
                            fieldSize,
                            versions: {
                                [Date.now()]: fieldValue
                            }
                        };
                    });

                    hRow.families[familyKey] = fieldsValues;
                });

                // hTables[tableName][rowKey] = hRow;
                masterServer.setSharding(sharding);
                masterServer.save(hRow, sharding);
                tableSizeCounter += rowSizesInfo.rowSize;
            }
        });

        // return hTables; // logical data struct
    }
}