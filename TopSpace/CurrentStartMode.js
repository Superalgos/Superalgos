
function newCurrentStartMode() {

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 150;
    thisObject.container.frame.height = TOP_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topLeft.x + thisObject.container.frame.width * 3;
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    container.isDraggeable = false;
    container.isClickeable = true;

    return thisObject;

    function initialize() {

        window.CURRENT_START_MODE = window.localStorage.getItem("currentStartMode");

        if (window.CURRENT_START_MODE === null) {
            window.CURRENT_START_MODE = "Backtest";
        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
    }

    function onClick() {

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken === null || sessionToken === "") {
            /* not logged in */
            return;
        }

        if (window.CURRENT_BOT_DISPLAY_NAME === "") { return; }

        switch (window.CURRENT_START_MODE) {

            case "Backtest": {
                window.CURRENT_START_MODE = "Live";
                break;
            }
            case "Live": {
                window.CURRENT_START_MODE = "Competition";
                break;
            }
            case "Competition": {
                window.CURRENT_START_MODE = "Backtest";
                break;
            }
        }

    }

    function getContainer(point) {

        let container;

        /* First we check if this point is inside this object UI. */

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {

            return this.container;

        } else {

            /* This point does not belong to this space. */

            return undefined;
        }

    }

    function draw() {

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken === null || sessionToken === "") {
            /* not logged in */
            return;
        }

        if (window.CURRENT_BOT_DISPLAY_NAME === "") { return;}

        thisObject.container.frame.draw(false, false);

        let fontSize = 12;
        let label = window.CURRENT_START_MODE + " Mode";
        if (label === "undefined Mode") { label = "" };

        let point = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize / 3,
            y: (thisObject.container.frame.height / 2) + 12
        };

        point = thisObject.container.frame.frameThisPoint(point);

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY;
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)';
        browserCanvasContext.fillText(label, point.x, point.y);
    }
}