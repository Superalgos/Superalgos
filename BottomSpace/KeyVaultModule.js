
function newKeyVaultModule() {

    const MODULE_NAME = "Key Vault Module Button";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 50;
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topLeft.x + thisObject.container.frame.width * 2;
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    container.isDraggeable = false;
    container.isClickeable = true;

    let icon;
    let canDrawIcon = false;

    return thisObject;

    function initialize(callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            if (window.canvasApp.executingAt === 'Master App') {
                return;
            }

            icon = new Image();

            icon.onload = onImageLoad;

            function onImageLoad() {
                canDrawIcon = true;
            }

            icon.src = window.canvasApp.urlPrefix + "Images/Icons/key-vault-module.png";

            thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);

            if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE); }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err.message = " + err.message); }
            if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE); }
        }
    }

    function onClick() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onClick -> Entering function."); }

            window.open('https://keyVault.advancedalgos.net', '_blank');


        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onClick -> err.message = " + err.message); }

        }
    }

    function getContainer(point) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] getContainer -> Entering function."); }

            let container;

            /* First we check if this point is inside this object UI. */

            if (thisObject.container.frame.isThisPointHere(point, true) === true) {

                return this.container;

            } else {

                /* This point does not belong to this space. */

                return undefined;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] getContainer -> err.message = " + err.message); }

        }
    }

    function draw() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            thisObject.container.frame.draw(false, false);

            if (canDrawIcon === false) { return; }

            let breakpointsHeight = 15;

            let imageHeight = 15;
            let imageWidth = 15;

            let imagePoint = {
                x: 10,
                y: thisObject.container.frame.height / 2 - imageHeight / 2 + breakpointsHeight
            };

            imagePoint = thisObject.container.frame.frameThisPoint(imagePoint);

            browserCanvasContext.drawImage(icon, imagePoint.x, imagePoint.y, imageWidth, imageHeight);


        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err.message = " + err.message); }

        }
    }
}