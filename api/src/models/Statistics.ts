export default class Statistics {
    totalProcessingTime: number;
    completedClientsCounter: number;
    requestsCounter: number;
    nServers: number;

    absBandwidthTimerId;

    constructor({nServers}) {
        this.totalProcessingTime = 0;
        this.completedClientsCounter = 0;
        this.requestsCounter = 0;
        this.nServers = nServers;
    }

    upCompletedClients() {
        this.completedClientsCounter++;
    }

    upRequests() {
        this.requestsCounter++;
    }

    isEqualCompletedClients(n: number) {
        return this.completedClientsCounter === +n;
    }

    subscribeToAbsBandwidth(callback = Function(), interval = 300) {

        const {nServers} = this;

        let time = 0;
        this.absBandwidthTimerId = setInterval(() => {

            time += interval;

            const absBandwidth = this.totalProcessingTime / nServers / time;
            callback({
                type: 'load_line',
                absBandwidth
            });

            // console.log(`**** Absolute bandwidth = ${ absBandwidth }`);

        }, interval);
    }

    unsubscribeFromAbsBandwidth() {
        clearInterval(this.absBandwidthTimerId);
    }


}