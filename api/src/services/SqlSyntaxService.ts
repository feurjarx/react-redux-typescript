import {qtrim} from "../helpers/index";
import {Criteria} from "../../typings/index";
import {SQL_OPERATOR_EQ, SQL_OPERATORS} from "../constants/index";
export default class SqlSyntaxService {
    private static _instance;

    static get instance() {
        if (!this._instance) {
            this._instance = new SqlSyntaxService();
        }

        return this._instance;
    }

    getAndsListFromWhere(where = ''): Array<Criteria[]> {
        where = where.toLowerCase();

        const ins = [];
        const ors = [];

        where.split('or').forEach((orCase: string) => {
            orCase = orCase.trim();

            const ands: Array<Criteria> = [];
            orCase.split('and').forEach((andCase: string) => {
                andCase = andCase.trim();

                for (let i = 0; i < SQL_OPERATORS.length; i++) {
                    const operator = SQL_OPERATORS[i];

                    let [left, value] = andCase.split(operator).map(it => it.trim());
                    if (value) {

                        if (operator === 'in') {
                            ins.push(andCase);
                            continue;
                        }

                        const [table, field] = left.split('.');

                        value = qtrim(value);

                        ands.push({
                            table,
                            field,
                            operator,
                            value,
                            isPrimaryField: field === 'id'
                        });

                        break;
                    }
                }
            });

            if (ands.length) {
                ors.push(ands);
            }
        });

        // operator IN transformation to {'or', '='}
        ins.forEach(inItem => {
            let [left, right] = inItem.split('in').map(it => it.trim());
            const [table, field] = left.split('.');

            right = right.slice(1, -1); // remove '(' and ')'
            const inValues = right.split(',');
            inValues.forEach(v => {
                ors.push([{
                    table,
                    field,
                    operator: SQL_OPERATOR_EQ,
                    value: qtrim(v),
                    isPrimaryField: field === 'id'
                }])
            });
        });

        return ors;
    }
}