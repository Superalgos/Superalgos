
function newFileCursor() {

    let files = new Map;
    let cursorDate;

    let fileCursor = {
        setDatetime: setDatetime,
        files: undefined,
        initialize: initialize
    }

    fileCursor.files = files;

    let minCursorSize = 10;
    let maxCursorSize = 30;

    let market;
    let exchange;
    let fileCloud;
    let product;
    let periodName;

    return fileCursor;

    function initialize(pFileCloud, pProduct, pExchange, pMarket, pPeriodName, pCursorDate, callBackFunction) {

        market = pMarket;
        exchange = pExchange;
        fileCloud = pFileCloud;
        product = pProduct;
        periodName = pPeriodName;
        cursorDate = pCursorDate;

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
            targetDate.setUTCDate(targetDate.getUTCDate() + j);

            /* Small algorith to allow load first the current date, then alternate between the most forwad and the most backwards ones. */
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

                if (fileCursor.files.get(dateString) === undefined) { // We dont reload files we already have. 

                    fileCloud.getFile(product, exchange, market, periodName, targetDate, onFileReceived);

                } else {

                    controlLoop();
                }

            }

        }

        function onFileReceived(file) {

            fileCursor.files.set(dateString, file);

            controlLoop();

        }


        function controlLoop() {

            if (callBackFunction !== undefined) {

                callBackFunction();

            }

            i++;

            if (i < minCursorSize) {

                getNextFile();

            }

        }
    }

    function collectGarbage() {

        date = removeTime(cursorDate);

        let minDate = date.valueOf() - maxCursorSize * ONE_DAY_IN_MILISECONDS / 2;
        let maxDate = date.valueOf() + maxCursorSize * ONE_DAY_IN_MILISECONDS / 2;

        for (let key of fileCursor.files.keys()) {

            let keyDate = new Date(key);

            if (keyDate.valueOf() < minDate || keyDate.valueOf() > maxDate) {

                fileCursor.files.delete(key);

            }

        }

    }

}