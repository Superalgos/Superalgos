
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

    function createBubbleSet(pPayload, pEventHandler, callBackFunction) {

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

            let bubbleSet = bubbleSets[pBubbleSetIndex];
            let found = false;

            /* First we add the new bubbles. */

            let newFloatingBubbles = []; // We will create a new array of Floating Bubbles as a result of this operation.

            for (let i = 0; i < pNewBubbles.length; i++) {

                let plotterBubble = pNewBubbles[i];
                let plotterBubbleKey = plotterBubble.date.toString() + plotterBubble.rate.toString();
                let found = false;

                for (let j = 0; j < bubbleSet.floatingBubbles.length; j++) {

                    let floatingBubble = bubbleSet.floatingBubbles[j];
                    let floatingBubbleKey = floatingBubble.date.toString() + floatingBubble.rate.toString();

                    if (plotterBubbleKey === floatingBubbleKey) {

                        found = true;
                        break;

                    }
                }

                if (found === false) {

                    let floatingObject = newFloatingObject();
                    floatingObject.initialize("Bubble", onInitialized);

                    function onInitialized(err) {

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
                        plotterBubble.floatingHandle = floatingObject.handle;

                    }

                } 

                newFloatingBubbles.push(plotterBubble);

            }

            bubbleSet.floatingBubbles = newFloatingBubbles;

            /* Second we remove the old bubbles. */

            newFloatingBubbles = []; // We will create a new array of Floating Bubbles as a result of this operation.
            found = false;

            for (let j = 0; j < bubbleSet.floatingBubbles.length; j++) {

                let floatingBubble = bubbleSet.floatingBubbles[j];
                let floatingBubbleKey = floatingBubble.date.toString() + floatingBubble.rate.toString();

                for (let i = 0; i < pNewBubbles.length; i++) {

                    let plotterBubble = pNewBubbles[i];
                    let plotterBubbleKey = plotterBubble.date.toString() + plotterBubble.rate.toString();

                    if (plotterBubbleKey === floatingBubbleKey) {

                        found = true;
                        break;

                    }
                }

                if (found === false) {

                    floatingLayer.removeFloatingObject(floatingBubble.floatingHandle);

                } else {

                    newFloatingBubbles.push(floatingBubble);
                }
            }

            bubbleSet.floatingBubbles = newFloatingBubbles;
        }
    }

    function destroyBubbleSet(pHandle) {

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


