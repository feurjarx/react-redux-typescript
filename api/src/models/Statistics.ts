export default class Statistics {

    static ABS_BANDWIDTH = 'abs_bandwidth';
    static SLAVES_LAST_PROCESSING_TIME_LIST = 'slaves_last_processing_time_list';

    private completedClientsCounter: number;
    private requestsCounter: number;
    private unsuccessfulRequestsCounter: number;

    private timersIdsMap = {};

    private slavesLastProcessingTimeList = [];

    nServers: number;
    nClients: number;

    totalProcessingTime: number;

    constructor({nServers, nClients}) {

        this.unsuccessfulRequestsCounter = 0;
        this.completedClientsCounter = 0;
        this.totalProcessingTime = 0;
        this.requestsCounter = 0;

        this.nServers = nServers;
        this.nClients = nClients;

        this.slavesLastProcessingTimeList = [];
        for (let i = 0; i < nServers - 1; i++) {
            this.slavesLastProcessingTimeList[i] = 0;
        }
    }

    setLastProcessingTime(idx, v) {
        this.slavesLastProcessingTimeList[idx] = v;
    }

    upUnsuccessufulRequests() {
        this.unsuccessfulRequestsCounter++;
    }

    upCompletedClients() {
        this.completedClientsCounter++;
    }

    upRequests() {
        this.requestsCounter++;
    }

    isEqualCompletedClients() {
        return this.completedClientsCounter >= this.nClients;
    }

    subscribeToProp(propName: string, callback = Function(), interval = 100) {
        const {timersIdsMap} = this;

        let loopFn: Function;
        let time = 0;

        switch (propName) {
            case Statistics.ABS_BANDWIDTH:
                loopFn = () => {
                    const absBandwidth = this.totalProcessingTime / this.nServers / time;
                    callback({
                        type: 'load_line',
                        absBandwidth
                    });
                };

                break;

            case Statistics.SLAVES_LAST_PROCESSING_TIME_LIST:
                loopFn = () => callback(this.slavesLastProcessingTimeList);
                break;

            default:
                throw new Error('Unexpected subscription property');
        }

        timersIdsMap[propName] = setInterval(loopFn, interval);
    }

    unsubscribeFromProp(propName: string) {
        clearInterval(this.timersIdsMap[propName]);
    }


}