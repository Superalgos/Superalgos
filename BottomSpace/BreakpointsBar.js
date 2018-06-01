
function newBreakpointsBar() {

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = browserCanvasContext.width;
    thisObject.container.frame.height = 15;

    container.frame.position.x = 0;
    container.frame.position.y = 0;

    container.isDraggeable = false;
    container.isClickeable = true;

    let logo;
    let canDrawLogo = false;

    let datetime;
    let timePeriod;

    return thisObject;

    function initialize() {

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        timePeriod = INITIAL_TIME_PERIOD;

    }

    function onZoomChanged(event) {

        timePeriod = recalculatePeriod(event.newLevel);

    }

    function setDatetime(pDatetime) {

        datetime = new Date(pDatetime);
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

        let opacity = 1;

        browserCanvasContext.beginPath();

        let zeroPoint = {
            x: 0,
            y: 0
        };

        zeroPoint = thisObject.container.frame.frameThisPoint(zeroPoint);

        let breakpointsHeight = 15;

        browserCanvasContext.closePath();

        browserCanvasContext.fill();
    }
}