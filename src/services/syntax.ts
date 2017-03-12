import {Syntax} from "../../typings/syntax";
import WordData = Syntax.WordData;

export default class SyntaxService {

    static ranges = [{
        from: 0,
        to: 1,
        ends: {
            1: {
                man: '',
                feminine: 'a'
            },
            2: {
                man: '',
                neuter: undefined
            },
            3: {
                feminine: undefined
            }
        }
    }, {
        from: 1,
        to: 4,
        ends: {
            1: {
                man: 'а',
                feminine: 'и'
            },
            2: {
                man: 'а',
                neuter: undefined
            },
            3: {
                feminine: undefined
            }
        }
    }, {
        from: 4,
        to: 10,
        ends: {
            1: {
                man: 'ов',
                feminine: ''
            },
            2: {
                man: 'ов',
                neuter: undefined
            },
            3: {
                feminine: undefined
            }
        }
    }];

    static getNormalizedNounByValue(value: number, { root, kind, declension }: WordData) {
        return this.findRangeByValue(range => root + range.ends[declension][kind], { value });
    }

    static getWordByRange(ranges, value: number) {
        return this.findRangeByValue(range => range.word, { value, ranges});
    }

    private static findRangeByValue(fn, { value, ranges = null }) {

        let result: string = null;

        ranges = ranges || this.ranges;

        for (let i = 0; i < ranges.length; i++) {

            const { from, to } = this.ranges[i];

            if ([11,12,13,14].indexOf(value % 100) >= 0) {

                if (from + 1 > 4) {
                    result = fn(ranges[i]);
                    break;
                }

            } else {

                const digit = value % 10 || 10;
                if (from < digit && digit <= to) {
                    result = fn(ranges[i]);
                    break;
                }
            }
        }

        return result;
    }
}