import * as io from 'socket.io-client';
import {
    EVENT_IO_LIFE,
    EVENT_IO_PRELIFE,
    EVENT_IO_LOGS,
    EVENT_IO_THE_END,
    EVENT_IO_DISCONNECT
} from "../constants/events";

import {stopStopwatch, startStopwatch} from "./index";
import {
    CHART_TYPE_REQUESTS_DIAGRAM,
    CHART_TYPE_SLAVES_LOAD,
    PROCESS_ACTIVATED
} from "../constants";
import {
    PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM,
    PUSH_NEW_ITEMS_TO_SLAVES_LOAD_CHART,
    UPDATE_REGIONS_PIES_CHARTS,
    PUSH_LOGS_BATCH_TO_CONSOLE_DRAWER,
    INIT_CHARTS_DATA
} from "../constants/actions";
import {SHARDING_TYPE_DEFAULT} from "../constants/index";

let socket;

export function initConnection(url) {
    socket = io.connect(url);

    return (dispatch) => {

        socket.on(EVENT_IO_LIFE, (data, type) => {
            switch (type) {
                case CHART_TYPE_REQUESTS_DIAGRAM:
                    dispatch(pushNewItemToRequestsDiagram(data));
                    break;
                case CHART_TYPE_SLAVES_LOAD:
                    dispatch(pushNewItemsToSlavesLoadChart(data));
                    break;
                default:
                    throw new Error('Unknown life data type');
            }
        });

        socket.on(EVENT_IO_PRELIFE, (data) => dispatch(updateRegionsPiesCharts(data)));
        socket.on(EVENT_IO_LOGS, (logsJson) => dispatch(pushLogsBatchToConsoleDrawer(logsJson)));
        socket.on(EVENT_IO_THE_END, () => {
            dispatch(stopStopwatch());
            dispatch(processActivated(false));
        });
        socket.on(EVENT_IO_DISCONNECT, () => {
            dispatch(stopStopwatch());
            dispatch(processActivated(false));
        });
    }
}

export function processActivated(activated) {
    return {
        type: PROCESS_ACTIVATED,
        activated
    }
}

export function sendDataToServer(fdsData) {
    return (dispatch) => {

        const {nClients, requestsLimit} = fdsData;
        const servers = fdsData.servers.filter(s => !s.isMaster);

        dispatch(initChartsData({
            serversIds: servers.map(s => s.name),
            requestsDiagramMaxValue: (+requestsLimit * +nClients) * 2
        }));

        const clients = [];
        for (let i = 0; i < nClients; i++) {
            const nRequests = Math.round(Math.random() * +requestsLimit) || 1;
            clients.push({nRequests});
        }

        fdsData.tables.forEach(table => {
            const {sharding} = table;
            if (sharding.type === SHARDING_TYPE_DEFAULT) {
                sharding.fieldName = null;
                sharding.serverId = null;
            }
        });

        socket.emit(EVENT_IO_LIFE, {
            ...fdsData,
            clients,
            requestsLimit
        });

        dispatch(startStopwatch());
        dispatch(processActivated(true));
    };
}

export function pushLogsBatchToConsoleDrawer(logsJson) {
    return {
        type: PUSH_LOGS_BATCH_TO_CONSOLE_DRAWER,
        logsJson
    };
}

export function pushNewItemToRequestsDiagram(data) {
    return {
        type: PUSH_NEW_ITEM_TO_REQUESTS_DIAGRAM,
        data
    };
}

export function pushNewItemsToSlavesLoadChart(data) {
    return {
        type: PUSH_NEW_ITEMS_TO_SLAVES_LOAD_CHART,
        data
    };
}

export function updateRegionsPiesCharts(data) {
    return {
        type: UPDATE_REGIONS_PIES_CHARTS,
        data
    };
}

export function initChartsData(data) {
    return {
        type: INIT_CHARTS_DATA,
        data
    };
}