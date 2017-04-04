export default {
    getNonRepetitiveCombinationsFromArray(arr: Array<any>) {

        const length = arr.length;
        const result = [];
        for (let i = 0; i < length; i++) {
            for (let j = i + 1; j <= length; j++) {
                result.push(arr.slice(i, j));
            }
        }

        return result;
    }
}