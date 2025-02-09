exports.newExamplesData = function newExamplesData() {
    let thisObject = {
        sendExampleData: sendExampleData
    };
    return thisObject;

    function sendExampleData(socketClient, WEB_SOCKET) {
        let oneObjToSend = { 
            example1: 'string data', 
            example2: 79456, 
            example3: { nestedObj1: 'more string data', nestedObj2: 9097789 }
        };

        let twoObjToSend = {
            exampleArray1: [ "data string", "more Data", "hold on one more" ],
            exampleArray2: [ 34, 645, 2354, 58655 ]
        };

        let messageToSend = (new Date()).toISOString() + '|*|Platform|*|Data|*|Example|*|' + JSON.stringify(oneObjToSend) + '|*|' + JSON.stringify(twoObjToSend);

        if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
            socketClient.send(messageToSend);
            //SA.logger.info('[INFO] Example data sent successfully.');
        } else {
            SA.logger.warn('[WARN] WebSocket is not open. Could not send example data.');
        }
    }
};
