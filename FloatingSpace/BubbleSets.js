
function newBubbleSets() {

    const MODULE_NAME = "Bubble Sets";
    const INFO_LOG = true;
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

    function createBubbleSet(pPayload, pEventHandler, callBackFunction) {

        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> Entering function."); }

        let bubbleSet = {
            imageId: pPayload.profile.imageId,
            floatingBubbles: [],
            payload: pPayload,
            handle: Math.floor((Math.random() * 10000000) + 1)
        };

        bubbleSets.push(bubbleSet);

        pEventHandler.listenToEvent("Bubbles Changed", onBubblesChanged, bubbleSets.length - 1)

        callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE, bubbleSet.handle);

        function onBubblesChanged(pNewBubbles, pBubbleSetIndex) {

            if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Entering function."); }
            if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> pNewBubbles.length = " + pNewBubbles.length); }
            if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> pBubbleSetIndex = " + pBubbleSetIndex); }

            let bubbleSet = bubbleSets[pBubbleSetIndex];
            let found = false;
            let newFloatingBubbles;

            /* First we remove the old bubbles. */

            if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles."); }

            newFloatingBubbles = []; // We will create a new array of Floating Bubbles as a result of this operation.

            for (let j = 0; j < bubbleSet.floatingBubbles.length; j++) {

                found = false;

                let floatingBubble = bubbleSet.floatingBubbles[j];
                let floatingBubbleKey = floatingBubble.date.toString() + floatingBubble.rate.toString();

                if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> j = " + j); }

                for (let i = 0; i < pNewBubbles.length; i++) {

                    let plotterBubble = pNewBubbles[i];
                    let plotterBubbleKey = plotterBubble.date.toString() + plotterBubble.rate.toString();

                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> i = " + i); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> floatingBubbleKey = " + floatingBubbleKey); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> plotterBubbleKey = " + plotterBubbleKey); }

                    if (plotterBubbleKey === floatingBubbleKey) {

                        found = true;

                        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> found = " + found); }
                        break;
                    }
                }

                if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> End of For i."); }
                if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> found = " + found); }

                if (found === false) {

                    floatingLayer.removeFloatingObject(floatingBubble.floatingHandle);

                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> floatingBubble.floatingHandle = " + floatingBubble.floatingHandle); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> Removed from Layer."); }

                } else {

                    newFloatingBubbles.push(floatingBubble);

                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> floatingBubble.floatingHandle = " + floatingBubble.floatingHandle); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> Added to newFloatingBubbles."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> newFloatingBubbles.length = " + newFloatingBubbles.length); }

                }
            }

            bubbleSet.floatingBubbles = newFloatingBubbles;

            if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Remove old Bubbles -> bubbleSet.floatingBubbles.length = " + bubbleSet.floatingBubbles.length); }

            /* Second we add the new bubbles. */

            if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles."); }

            newFloatingBubbles = []; // We will create a new array of Floating Bubbles as a result of this operation.

            for (let i = 0; i < pNewBubbles.length; i++) {

                found = false;

                let plotterBubble = pNewBubbles[i];
                let plotterBubbleKey = plotterBubble.date.toString() + plotterBubble.rate.toString();
                let floatingBubble;
                let floatingBubbleKey;

                if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> i = " + i); }

                for (let j = 0; j < bubbleSet.floatingBubbles.length; j++) {

                    floatingBubble = bubbleSet.floatingBubbles[j];
                    floatingBubbleKey = floatingBubble.date.toString() + floatingBubble.rate.toString();

                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> j = " + j); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> floatingBubbleKey = " + floatingBubbleKey); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> plotterBubbleKey = " + plotterBubbleKey); }

                    if (plotterBubbleKey === floatingBubbleKey) {

                        found = true;

                        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> found = " + found); }
                        break;
                    }
                }

                if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> End of For j."); }
                if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> found = " + found); }

                if (found === false) {

                    let floatingObject = newFloatingObject();
                    floatingObject.initialize("Bubble", onInitialized);

                    function onInitialized(err) {

                        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> Entering function."); }

                        floatingObject.payload = bubbleSet.payload;
                        floatingObject.payloadBubbleIndex = i;
                        floatingObject.payload.profile.imageId = bubbleSet.imageId;

                        floatingObject.friction = .995;

                        floatingObject.initializeMass(200);

                        let bodyText = pNewBubbles[i].body;
                        let radius;

                        if (bodyText.length < 100) {
                            radius = 100;
                        } else {
                            radius = bodyText.length;
                        }

                        floatingObject.initializeRadius(radius);
                        floatingObject.initializeImageSize(15);

                        floatingObject.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        floatingObject.labelStrokeStyle = 'rgba(60, 60, 60, 0.50)';

                        floatingLayer.addFloatingObject(floatingObject);

                        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> New Bubble added to Layer."); }

                        plotterBubble.floatingHandle = floatingObject.handle;

                        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> plotterBubble.floatingHandle = " + plotterBubble.floatingHandle); }

                        newFloatingBubbles.push(plotterBubble);

                        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> Added to newFloatingBubbles."); }
                        if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> newFloatingBubbles.length = " + newFloatingBubbles.length); }

                    }

                } else {

                    newFloatingBubbles.push(floatingBubble);

                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> Old Bubble Kept."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> floatingBubble.floatingHandle = " + floatingBubble.floatingHandle); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> Added to newFloatingBubbles."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> onInitialized -> newFloatingBubbles.length = " + newFloatingBubbles.length); }

                }
            }

            bubbleSet.floatingBubbles = newFloatingBubbles;

            if (INFO_LOG === true) { logger.write("[INFO] createBubbleSet -> onBubblesChanged -> Add new Bubbles -> bubbleSet.floatingBubbles.length = " + bubbleSet.floatingBubbles.length); }

        }
    }

    function destroyBubbleSet(pHandle) {

        if (INFO_LOG === true) { logger.write("[INFO] destroyBubbleSet -> Entering function."); }

        for (let i = 0; i < bubbleSets.length; i++) {

            let bubbleSet = bubbleSets[i];

            if (bubbleSet.handle === pHandle) {

                for (let j = 0; j < bubbleSet.floatingBubbles.length; j++) {

                    let floatingBubble = bubbleSet.floatingBubbles[j];

                    floatingLayer.removeFloatingObject(floatingBubble.floatingHandle);
                }

                bubbleSets.splice(i, 1);  // Delete item from array.
                return;
            }
        }
    }
}


