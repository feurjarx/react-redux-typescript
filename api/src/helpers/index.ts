const md5 = require('md5/md5');

export function composition(...fns) {
    return (...args) => fns.forEach(f => f.apply(null, args))
}

export function random(max: number) {
    return Math.round(Math.random() * max);
}

export function hash(...args) {
    return md5(args.join(','));
}

export function range(min: number, max: number): Array<number> {
    const length = max - min;

    return (min + ',')
        .repeat(length)
        .slice(0, -1)
        .split(',')
        .map((it,i) => +it + i);
}

export function generateWord(length, abc = "ABCDEFGH") {

    let word = '';
    for (let i = 0; i < length; i++) {
        word += abc.charAt(Math.floor(Math.random() * abc.length));
    }

    return word;
}