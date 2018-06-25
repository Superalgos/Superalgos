
function newBottomSpace() {

    var thisObject = {
        deleteTradingHistory: undefined,
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = browserCanvas.width;
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT;

    container.frame.position.x = 0;
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    container.isDraggeable = false;

    return thisObject;

    function initialize() {

        thisObject.deleteTradingHistory = newDeleteTradingHistory();
        thisObject.deleteTradingHistory.initialize();

    }

    function getContainer(point) {

        let container;

        container = thisObject.deleteTradingHistory.getContainer(point);
        if (container !== undefined) { return container; }

        /* The point does not belong to any inner container, so we return the current container. */

        return thisObject.container;

    }

    function draw() {

        thisObject.container.frame.draw(false, false);

        drawBackground();
        thisObject.deleteTradingHistory.draw();

    }

    function drawBackground() {

        let opacity = 1;

        let zeroPoint = {
            x: 0,
            y: 0
        };

        zeroPoint = thisObject.container.frame.frameThisPoint(zeroPoint);

        let breakpointsHeight = 15;

        browserCanvasContext.beginPath();

        browserCanvasContext.rect(zeroPoint.x, zeroPoint.y + breakpointsHeight, zeroPoint.x + thisObject.container.frame.width, zeroPoint.y + thisObject.container.frame.height - breakpointsHeight);
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.DARK +  ', ' + opacity + ')';

        browserCanvasContext.closePath();

        browserCanvasContext.fill();
    }
}