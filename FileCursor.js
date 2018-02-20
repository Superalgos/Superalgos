
function newFileCursor() {

    

    let dailyFiles = new Map;
    let cursorDate = new Date(INITIAL_DATE);

    let fileCursor = {
        setDatetime: setDatetime,
        dailyFiles: undefined,
        initialize: initialize
    }

    fileCursor.dailyFiles = dailyFiles;

    let market;
    let exchange;
    let cursorSize = 3;

    let server = newFileServer();

    return fileCursor;

    function initialize(pExchange, pMarket, callBackFunction) {

        market = pMarket;
        exchange = pExchange;

        server.initialize();

        getFiles(callBackFunction);

    }

    function setDatetime(datetime) {

        if (datetime === undefined) { return; }

        cursorDate = datetime;

        getFiles();

        collectGarbage();
    }

    function getFiles(callBackFunction) {

        let i = 0;
        let j = 0;

        let dateString;

        getNextFile();

        function getNextFile() {

            let targetDate = new Date(cursorDate);
            targetDate.setDate(targetDate.getDate() + j);

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

            dateString = targetDate.getUTCFullYear() + '-' + pad(targetDate.getUTCMonth() + 1, 2) + '-' + pad(targetDate.getUTCDate(), 2);

            let currentDay = Math.trunc((new Date()).valueOf() / (24 * 60 * 60 * 1000));
            let targetDay = Math.trunc(targetDate.valueOf() / (24 * 60 * 60 * 1000));

            if (targetDay > currentDay) {

                controlLoop();

            } else {

                if (fileCursor.dailyFiles.get(dateString) === undefined) {

                    server.getDailyFile(exchange, market, targetDate, newDailyFilesReady)

                } else {

                    controlLoop();
                }

            }

        }

        function newDailyFilesReady(dailyFileReceived) {

            fileCursor.dailyFiles.set(dateString, dailyFileReceived);

            controlLoop();

        }


        function controlLoop() {

            if (j === 3) { // We call the callBack after we have the first few files.

                if (callBackFunction !== undefined) {

                    callBackFunction();

                    if (market === INITIAL_DEFAULT_MARKET) {  // This is when we dont need a splash screen anymore!

                        splashScreenNeeded = false;

                    }

                }

            }

            i++;

            if (i < cursorSize) {

                getNextFile();

            }

        }
    }

    function collectGarbage() {

        date = removeTime(cursorDate);

        let minDate = date.valueOf() - cursorSize / 2 * 24 * 60 * 60 * 1000;
        let maxDate = date.valueOf() + cursorSize / 2 * 24 * 60 * 60 * 1000;

        for (let key of fileCursor.dailyFiles.keys()) {

            let keyDate = new Date(key);

            if (keyDate.valueOf() < minDate || keyDate.valueOf() > maxDate) {

                fileCursor.dailyFiles.delete(key);

            }

        }

    }

}