
function newBubbleSets() {

    const MODULE_NAME = "Bubble Sets";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        createBubbleSet: createBubbleSet,
        destroyBubbleSet: destroyBubbleSet,
        initialize: initialize
    };

    let bubbleSets = [];

    let floatingLayer;

    return thisObject;

    function initialize(pFloatingLayer, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            floatingLayer = pFloatingLayer;

            callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
        }
    }

    function createBubbleSet(pPlotterBubbles) {

        let bubbleSet = {
            floatingBubbles: [],
            plotterBubbles: pPlotterBubbles,
            handle: Math.floor((Math.random() * 10000000) + 1)
        };

        bubbleSets.push(bubbleSet);

        return bubbleSet.handle;
    }

    function destroyBubbleSet(pHandle) {

        for (let i = 0; i < bubbleSets.length; i++) {

            let bubbleSet = bubbleSets[i];

            if (bubbleSet.handle === pHandle) {
                bubbleSets.splice(i, 1);  // Delete item from array.
                return;
            }
        }
    }
}


