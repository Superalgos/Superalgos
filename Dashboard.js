
let canvas;
let markets;
let ecosystem = newEcosystem();
let cloudVM = newCloudVM();
let INITIAL_ZOOM_LEVEL = -26;       // This is the zoom level at the view port in which the APP starts.
let INITIAL_TIME_PERIOD = recalculatePeriod(INITIAL_ZOOM_LEVEL);  // This value will be overwritten at the viewPort.initialize if the user had a prevous session with this same browser.
let viewPort = newViewPort();

function newDashboard() {

    const MODULE_NAME = "Dashboard";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        start: start
    };

    const DEBUG_START_UP_DELAY = 0; //3000; // This is a waiting time in case there is a need to debug the very first steps of initialization, to be able to hit F12 on time.

    return thisObject;

    function start() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] start -> Entering function."); }

            /* Here we will setup the global eventHandler that will enable the Canvas App to react to events happening outside its execution scope. */

            window.canvasApp.eventHandler = newEventHandler();
            window.canvasApp.eventHandler.listenToEvent("User Profile Changed", userProfileChanged);
            window.canvasApp.eventHandler.listenToEvent("Browser Resized", browserResized);

            /* Next we start the App*/

            setTimeout(delayedStart, DEBUG_START_UP_DELAY);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] start -> err = " + err); }

        }
    }


    function delayedStart() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] delayedStart -> Entering function."); }

            /* For now, we are supporting only one market. */

            let market = {
                id: 2,
                assetA: "USDT",
                assetB: "BTC"
            };

            markets = new Map();

            markets.set(market.id, market);

            canvas = newCanvas();
            canvas.initialize();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] delayedStart -> err = " + err); }

        }
    }

    function userProfileChanged() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] userProfileChanged -> Entering function."); }

            canvas.topSpace.initialize();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] userProfileChanged -> err = " + err); }

        }

    }

    function browserResized() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] browserResized -> Entering function."); }

            browserCanvas = document.getElementById('canvas');

            browserCanvas.width = window.innerWidth;
            browserCanvas.height = window.innerHeight - window.canvasApp.topMargin;

            viewPort.initialize();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] browserResized -> err = " + err); }

        }

    }
}



