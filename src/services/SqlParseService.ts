import {prettylog} from "../helpers/index";
const lexer = require('sql-parser/lib/lexer');

export default class SqlParseService {

    private static demultiplex(parts) {

        const selectParts = [];
        const fromParts = [];
        const joinParts = [];
        const otherParts = [];

        let isSelect = false;
        let isFrom = false;
        let isJoin = false;

        parts.forEach(part => {
            const type = part[0];

            if (type === 'SELECT') {
                isSelect = true;
            }

            if (type === 'FROM') {
                isSelect = false;
                isFrom = true;
            }

            if (type === 'JOIN') {
                isSelect = false;
                isFrom = false;
                isJoin = true;
            }

            if (['WHERE','JOIN','GROUP', 'LIMIT', 'OFFSET'].indexOf(type) >= 0) {
                isFrom = false;
            }

            if (['WHERE','GROUP', 'LIMIT', 'OFFSET'].indexOf(type) >= 0) {
                isJoin = false;
            }

            switch (true) {
                case isSelect:
                    selectParts.push(part);
                    break;
                case isFrom:
                    fromParts.push(part);
                    break;
                case isJoin:
                    joinParts.push(part);
                    break;
                default:
                    otherParts.push(part);
            }
        });

        return {fromParts, joinParts, selectParts, otherParts};
    }

    private static normalizeOrder(parts) {
        const {
            fromParts,
            joinParts,
            selectParts,
            otherParts
        } = this.demultiplex(parts);

        return [
            ...[
                ...[
                    ...fromParts,
                    ...joinParts
                ],
                ...selectParts
            ],
            ...otherParts
        ];
    }

    static sqlQuery2Json(query) {
        const aliasMaps = {
            direct: {},
            reverse: {},
        };

        let json: {
            from?: Array<string>,
            select?: Array<string>,
            join?: Array<string>,
        } = {};

        const {normalizeOrder} = this;

        try {
            const parts = normalizeOrder.call(this, lexer.tokenize(query));
            // console.table(parts);

            let key = null;

            let waitingKey = null;
            let beforeDot = null;
            let afterDot = null;

            for (let i = 0; i < parts.length; i++) {

                const part = parts[i];
                const type = part[0];

                switch (type) {
                    case 'SELECT':
                        key = type.toLowerCase();
                        json[key] = [];
                        continue;
                    case 'FROM':
                        key = type.toLowerCase();
                        json[key] = [parts[i + 1][1]];
                        continue;

                    case 'JOIN':
                        key = type.toLowerCase();
                        json.from.push(parts[i + 1][1]);
                        break;

                    case 'GROUP':
                        key = type.toLowerCase();
                        json[key] = [];
                        continue;

                    case 'WHERE':
                        key = type.toLowerCase();
                        json[key] = '';
                        continue;

                    case 'OFFSET':
                    case 'LIMIT':
                        if (parts[i + 1][0] === 'NUMBER') {
                            json[type.toLowerCase()] = parts[i+1][1];
                        }

                        continue;

                    case 'EOF':
                        continue;

                    default:

                        if (waitingKey && type === 'LITERAL') {
                            aliasMaps.direct[waitingKey] = part[1];
                            aliasMaps.reverse[part[1]] = waitingKey;
                            waitingKey = null;
                        }

                        if (type === 'AS') {
                            waitingKey = parts[i - 1][1];
                            aliasMaps.direct[waitingKey] = null;
                        }
                }

                if (!key) {
                    continue;
                }

                switch (key.toUpperCase()) {
                    case 'GROUP':
                    case 'SELECT':
                        if (['BY', 'SEPARATOR'].indexOf(type) >= 0) {
                            continue;
                        }

                        if (type === 'STAR') {

                            json[key].push('*');

                        } else {

                            if (type === 'LITERAL') {
                                if (parts[i + 1][0] === 'DOT') {
                                    beforeDot = aliasMaps.reverse[part[1]];
                                    if (!beforeDot) {
                                        beforeDot = part[1];
                                    }

                                    afterDot = parts[i + 2][1];
                                    i+=2;

                                } else {
                                    beforeDot = json.from[0];
                                    afterDot = part[1];
                                }
                            }

                            json[key].push(beforeDot + '.' + afterDot);
                        }

                        break;

                    case 'FROM':
                        break;

                    case 'WHERE':

                        if (['OPERATOR', 'CONDITIONAL', 'SUB_SELECT_OP'].indexOf(type) >= 0) {

                            json[key] += ' ' + part[1] + ' ';

                        } else {

                            let rightConcat = null;
                            if (type === 'LITERAL'
                                &&
                                parts[i + 1][0] === 'DOT'
                                &&
                                aliasMaps.reverse[part[1]]
                            ) {
                                rightConcat = aliasMaps.reverse[part[1]];
                            } else {
                                rightConcat = part[1];
                            }

                            if (['STRING','DBLSTRING'].indexOf(type) >= 0) {
                                rightConcat = "'" + rightConcat + "'";
                            }

                            json[key] += rightConcat;
                        }
                        break;
                    //
                    default:
                }
            }

        } catch (e) {
            throw e;
        }

        return json;
    }
}