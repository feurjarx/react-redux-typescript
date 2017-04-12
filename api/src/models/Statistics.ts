export default class Statistics {

    private completedClientsCounter: number;
    private requestsCounter: number;
    private unsuccessfulRequestsCounter: number;
    private absBandwidthTimerId;

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
        return this.completedClientsCounter === this.nClients;
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
        if (this.absBandwidthTimerId) {
            clearInterval(this.absBandwidthTimerId);
        }
    }


}