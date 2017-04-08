export default class SocketLogEmitter {
    private static _instance: SocketLogEmitter;

    static get instance() {
        if (!this._instance) {
            this._instance = new SocketLogEmitter();
        }

        return this._instance;
    }

    private consoleLog;
    private counter = 0;
    private batch = [];
    private batchSize = 10;
    private emitter;
    private eventName: string;

    constructor() {
        this.consoleLog = console.log;
    }

    setBatchSize(v: number) {
        this.batchSize = v;
    }

    init(emmiter, eventName: string) {
        this.emitter = emmiter;
        this.eventName = eventName;

        return this;
    }

    enable() {
        const {emitter, eventName} = this;
        if (![emitter, eventName].every(it => it)) {
            throw  new Error('Not inited instance');
        }

        const {consoleLog} = this;
        console.log = (...args) => {

            if (args[0] === false) {
                args.shift();
                consoleLog.apply(console, args);

            } else {

                consoleLog.apply(console, args);

                this.batch.push(`${new Date().toLocaleTimeString()}: ${args.join(',')}`);

                let {counter} = this;
                counter = (counter + 1) % this.batchSize;
                if (counter === 0) {
                    emitter.emit(eventName, JSON.stringify(this.batch));
                    this.batch = [];
                }

                this.counter = counter;
            }
        };
    }

    emitForce() {
        const {emitter, eventName, batch} = this;
        emitter.emit(eventName, JSON.stringify(batch));
        this.batch = [];
    }

    disable() {
        console.log = this.consoleLog;
        this.counter = 0;
        this.batch = [];
    }
}