
function newFileCursor() {

    let files = new Map;
    let cursorDate;

    let fileCursor = {
        setDatetime: setDatetime,
        setTimePeriod: setTimePeriod,
        files: undefined,
        getExpectedFiles: getExpectedFiles,
        initialize: initialize
    }

    fileCursor.files = files;

    let minCursorSize = 10;
    let maxCursorSize = 30;

    let market;
    let exchange;
    let fileCloud;
    let devTeam;
    let bot;
    let thisSet;
    let periodName;
    let timePeriod;

    return fileCursor;

    function initialize(pFileCloud, pDevTeam, pBot, pSet, pExchange, pMarket, pPeriodName, pTimePeriod, pCursorDate, pCurrentTimePeriod, callBackFunction) {

        market = pMarket;
        exchange = pExchange;
        fileCloud = pFileCloud;
        devTeam = pDevTeam;
        bot = pBot;
        thisSet = pSet;
        periodName = pPeriodName;
        cursorDate = pCursorDate;
        timePeriod = pTimePeriod;

        setTimePeriod(pCurrentTimePeriod, pCursorDate, callBackFunction);

    }

    function setTimePeriod(pTimePeriod, pDatetime, callBackFunction) {

        /*

        We are implementing here an algorithm designed to save bandwidth, memory and processing power at the browser.
        We say there is a saving mode where the cursor is running at a minimum size. When the end user aproaches the time period the cursor
        is set, then it should exit the saving mode and go to its actual size.

        To do this we are going to measure the distance from the Time Period received to the one the cursors was initialized with.
        If these periods are consecutive, it means that the cursor should exit saving mode and load its full size.

        */

        cursorDate = pDatetime; // Adjust the cursor date to the one received.

        let positionA;

        for (let i = 0; i < dailyFilePeriods.length; i++) {

            let period = dailyFilePeriods[i];

            if (period[0] === pTimePeriod) {

                positionA = i;

            }

            if (period[0] === timePeriod) {

                positionB = i;

            }
        }

        if (Math.abs(positionB - positionA) <= 1) {

            exitSavingMode();
            //console.log("File Cursor with period " + periodName + " EXITED saving mode after being notified the user is at period " + convertTimePeriodToName(pTimePeriod));

        } else {

            enterSavingMode();
            //console.log("File Cursor with period " + periodName + " ENTERED saving mode after being notified the user is at period " + convertTimePeriodToName(pTimePeriod));

        }

        getFiles(callBackFunction);

        collectGarbage();

        function enterSavingMode() {

            switch (timePeriod) {

                case _45_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 30;
                    }
                    break;
                case _40_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 20;
                    }
                    break;
                case _30_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _20_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _15_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _10_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _5_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _4_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _3_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _2_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                case _1_MINUTE_IN_MILISECONDS:
                    {
                        minCursorSize = 3;
                        maxCursorSize = 15;
                    }
                    break;
                default:
            }
        }

        function exitSavingMode() {

            switch (timePeriod) {

                case _45_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 15;
                        maxCursorSize = 30;
                    }
                    break;
                case _40_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 13;
                        maxCursorSize = 20;
                    }
                    break;
                case _30_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 11;
                        maxCursorSize = 15;
                    }
                    break;
                case _20_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 9;
                        maxCursorSize = 15;
                    }
                    break;
                case _15_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 7;
                        maxCursorSize = 15;
                    }
                    break;
                case _10_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 7;
                        maxCursorSize = 15;
                    }
                    break;
                case _5_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 5;
                        maxCursorSize = 15;
                    }
                    break;
                case _4_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 5;
                        maxCursorSize = 15;
                    }
                    break;
                case _3_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 5;
                        maxCursorSize = 15;
                    }
                    break;
                case _2_MINUTES_IN_MILISECONDS:
                    {
                        minCursorSize = 5;
                        maxCursorSize = 15;
                    }
                    break;
                case _1_MINUTE_IN_MILISECONDS:
                    {
                        minCursorSize = 5;
                        maxCursorSize = 15;
                    }
                    break;
                default:
            }
        }
    }



    function setDatetime(pDatetime, callBackFunction) {

        if (pDatetime === undefined) { return; }

        cursorDate = pDatetime;

        getFiles(callBackFunction);

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

                    fileCloud.getFile(devTeam, bot, thisSet, exchange, market, periodName, targetDate, onFileReceived);

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

    function getExpectedFiles() {

        return minCursorSize;

    }

}