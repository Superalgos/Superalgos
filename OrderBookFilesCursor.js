
function newOrderBookFilesCursor() {

    const CURSOR_SIZE = 1440 * 2;

    let orderBookFiles = new Map;
    let cursorDate = new Date(INITIAL_DATE);

    let orderBookFilesCursor = {
        setDatetime: setDatetime,
        orderBookFiles: undefined,
        initialize: initialize
    }

    orderBookFilesCursor.orderBookFiles = orderBookFiles;

    let marketId;
    let exchangeId;

    let server = newFileServer();

    let working = false;

    return orderBookFilesCursor;

    function initialize(exchange, market) {

        marketId = market;
        exchangeId = exchange;

        server.initialize();

    }

    function setDatetime(datetime) {

        cursorDate = datetime;

        //if (working === false) {

            getFiles();

            working = true

            collectGarbage();

        //}
    }

    function getFiles(callBackFunction) {

        let i = 0;
        let j = 0;

        let dateString;

        getNextFile();

        function getNextFile() {

            let targetDate = new Date(cursorDate);
            targetDate.setMinutes(targetDate.getMinutes() + j);

            if (j === 0) { j++; }
            else {
                if (j < 0) {
                    j = -j;
                    j++;
                }
                else {
                    j = -j;
                }
            }

            dateString = targetDate.getFullYear() + '-' + pad(targetDate.getMonth() + 1, 2) + '-' + pad(targetDate.getDate(), 2) + '-' + pad(targetDate.getHours(), 2) + '-' + pad(targetDate.getMinutes(), 2);

            if (orderBookFilesCursor.orderBookFiles.get(dateString) === undefined) {

                server.getAggregattedOrderBook(exchangeId, marketId, targetDate, newOrderBookFilesReady)

            } else {

                controlLoop();
            }

        }

        function newOrderBookFilesReady(dailyFileReceived) {

            orderBookFilesCursor.orderBookFiles.set(dateString, dailyFileReceived);

            controlLoop();

        }

        function controlLoop() {

            i++;

            if (i < CURSOR_SIZE) {

                getNextFile();

            }

            else {

                if (callBackFunction !== undefined) {

                    callBackFunction();
                }

                working = false;

            }
        }
    }

    function collectGarbage() {

        date = removeTime(cursorDate);

        let minDate = date.valueOf() - CURSOR_SIZE / 2  * 60 * 1000;
        let maxDate = date.valueOf() + CURSOR_SIZE / 2  * 60 * 1000;

        for (let key of orderBookFilesCursor.orderBookFiles.keys()) {

            let keyDate = new Date(key + ':00');

            if (keyDate.valueOf() < minDate || keyDate.valueOf() > maxDate) {

                orderBookFilesCursor.orderBookFiles.delete(key);

            }

        }

    }

}