import {count} from "rxjs/operator/count";
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

export const SocketLogger = (function () {

    const consoleLog = console.log;
    let counter = 0;
    const batch = [];

    function batchClear() {
        while (batch.length) {
            batch.pop();
        }
    }

    function enable(client, eventName: string, batchSize = 10, delimiter = '<br>') {
        console.log = (...args) => {
            consoleLog.apply(console, args);
            if (args[0] !== false) {

                const log = args.join(',');
                batch.push(log);
                counter++;

                if (counter % batchSize === 0) {
                    client.emit(eventName, batch.join(delimiter));
                    batchClear();
                }
            }
        };
    }

    function disable() {
        console.log = consoleLog;
        counter = 0;
        batchClear();
    }

    return {
        disable,
        enable
    }
}());