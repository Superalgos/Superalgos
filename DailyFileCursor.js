
function newDailyFilesCursor() {

    const CURSOR_SIZE = 30;

    let dailyFiles = new Map;
    let cursorDate = new Date(INITIAL_DATE);

    let dailyFilesCursor = {
        setDatetime: setDatetime,
        dailyFiles: undefined,
        initialize: initialize
    }

    dailyFilesCursor.dailyFiles = dailyFiles;

    let marketId;
    let exchangeId;

    let server = newFileServer();

    return dailyFilesCursor;

    function initialize(exchange, market, callBackFunction) {

        marketId = market;
        exchangeId = exchange;

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

                if (dailyFilesCursor.dailyFiles.get(dateString) === undefined) {

                    server.getDailyFile(exchangeId, marketId, targetDate, newDailyFilesReady)

                } else {

                    controlLoop();
                }

            }

        }

        function newDailyFilesReady(dailyFileReceived) {

            dailyFilesCursor.dailyFiles.set(dateString, dailyFileReceived);

            controlLoop();

        }


        function controlLoop() {

            if (j === 3) { // We call the callBack after we have the first few files.

                if (callBackFunction !== undefined) {

                    callBackFunction();

                }

            }

            i++;

            if (i < CURSOR_SIZE) {

                getNextFile();

            }

        }
    }

    function collectGarbage() {

        date = removeTime(cursorDate);

        let minDate = date.valueOf() - CURSOR_SIZE / 2 * 24 * 60 * 60 * 1000;
        let maxDate = date.valueOf() + CURSOR_SIZE / 2 * 24 * 60 * 60 * 1000;

        for (let key of dailyFilesCursor.dailyFiles.keys()) {

            let keyDate = new Date(key);

            if (keyDate.valueOf() < minDate || keyDate.valueOf() > maxDate) {

                dailyFilesCursor.dailyFiles.delete(key);

            }

        }

    }

}