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

export function range(min: number, max: number) {
    const length = max - min;

    return String(min)
        .repeat(length)
        .split('')
        .map((it,i) => +it + i);
}
