exports.newEventServerData = function newEventServerData() {
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        sendEventServerData: sendEventServerData,
    };

    let socketClient;
    let WEB_SOCKET;

    return thisObject;

    function initialize(pSocketClient, pWEB_SOCKET) {
        socketClient = pSocketClient;
        WEB_SOCKET = pWEB_SOCKET;
    }

    function finalize() {
        // Limpiar recursos si es necesario
    }

    function sendEventServerData() {
        try {
            let eventHandlers = PL.servers.EVENT_SERVER.eventHandlers;

            let eventHandlersData = [];

            for (let [eventHandlerName, eventHandler] of eventHandlers) {
                let listeners = eventHandler.listeners.map(listener => {
                    return {
                        eventHandlerName: listener[0],
                        eventType: listener[1],
                        callerId: listener[2],
                        extraData0: listener[4],
                        extraData1: listener[5],
                        extraData2: listener[6]
                    };
                });

                eventHandlersData.push({
                    eventHandlerName: eventHandlerName,
                    deleteWhenAllListenersAreGone: eventHandler.deleteWhenAllListenersAreGone,
                    listeners: listeners
                });
            }
            let messageToSend = `${new Date().toISOString()}|*|Platform|*|Data|*|EventServerData|*|${JSON.stringify(eventHandlersData)}`;

            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                socketClient.send(messageToSend);
                //SA.logger.info('[INFO] Event Server data sent successfully.', eventHandlersData);
            } else {
                SA.logger.warn('[WARN] WebSocket is not open. Could not send Event Server data.');
            }
        } catch (err) {
            SA.logger.error('[ERROR] Error sending Event Server data:', err);
        }
    }
};
