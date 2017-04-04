const md5 = require('md5/md5');

export default {
    random(max: number) {
        return Math.round(Math.random() * max);
    },

    randomByRange(min: number, max: number) {
        // TODO: make it
    },

    hash(...args) {
        return md5(args.join(','));
    },

    range(min: number, max: number) {
        const length = max - min;
        return String(min)
            .repeat(length)
            .split('')
            .map((it,i) => +it + i);
    }
}
