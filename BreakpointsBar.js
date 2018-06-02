
function newBreakpointsBar() {

    var thisObject = {
        setDatetime: setDatetime,
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
    container.frame.position.y = viewPort.visibleArea.bottomRight.y;

    container.isDraggeable = false;
    container.isClickeable = true;

    let logo;
    let canDrawLogo = false;

    let datetime;
    let timePeriod;
    let timeLineCoordinateSystem;
    let chartContainer;

    let breakpointsByTimePeriod = new Map();

    return thisObject;

    function initialize(pChartContainer, pTimeLineCoordinateSystem) {

        timeLineCoordinateSystem = pTimeLineCoordinateSystem;
        chartContainer = pChartContainer;

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        timePeriod = INITIAL_TIME_PERIOD;

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);

        for (let i = 0; i < marketFilesPeriods.length; i++) {

            let breakpointsMap = new Map();
            breakpointsByTimePeriod.set(marketFilesPeriods[i][0], breakpointsMap);

        }

        for (let i = 0; i < dailyFilePeriods.length; i++) {

            let breakpointsMap = new Map();
            breakpointsByTimePeriod.set(dailyFilePeriods[i][0], breakpointsMap);

        }
    }

    function onClick(pPoint) {

        let point = {
            x: pPoint.x,
            y: pPoint.y
        };

        let miliSeconds = getMilisecondsFromPoint(point, chartContainer, timeLineCoordinateSystem);

        miliSeconds = normalizeX(miliSeconds); // We are now exactly at the middle of the "candle" correspondind to the point clicked.

        let breakpointsMap = breakpointsByTimePeriod.get(timePeriod);
        let breakpoint = breakpointsMap.get(miliSeconds);

        if (breakpoint === undefined) {

            /* The breakpoint didnt exist, then we create one. */
            breakpointsMap.set(miliSeconds, 1);

        } else {

            /* The breakpoint existed, so we remove it. */
            breakpointsMap.set(miliSeconds, undefined);

        }
    }

    function normalizeX(pX) {

        return Math.trunc(pX / timePeriod) * timePeriod + timePeriod / 2; 

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

        /*
        To draw the breakpoints, we will calculate the miliseconds for the first x pixel of the breakpoint bar, and for the last x pixel. Once we have that
        we can create an array with all the possible points for breack points. Finally we can see if brealpoints exists at those points. We plot only the ones
        that exists.
        */

        let breakpointsMap = breakpointsByTimePeriod.get(timePeriod);

        let beginX = {
            x: viewPort.visibleArea.bottomLeft.x,
            y: 0
        };

        let endX = {
            x: viewPort.visibleArea.bottomRight.x,
            y: 0
        };

        let beginMiliseconds = getMilisecondsFromPoint(beginX, chartContainer, timeLineCoordinateSystem);
        let endMiliseconds = getMilisecondsFromPoint(endX, chartContainer, timeLineCoordinateSystem);

        beginMiliseconds = normalizeX(beginMiliseconds);
        endMiliseconds = normalizeX(endMiliseconds);

        window.AT_BREAKPOINT = false;

        for (let miliSeconds = beginMiliseconds; miliSeconds < endMiliseconds; miliSeconds = miliSeconds + timePeriod) {

            let breakpoint = breakpointsMap.get(miliSeconds);

            if (breakpoint !== undefined) {

                let point1 = {
                    x: miliSeconds,
                    y: 0
                }

                point1 = timeLineCoordinateSystem.transformThisPoint(point1);
                point1 = transformThisPoint(point1, chartContainer);

                let point2 = {
                    x: miliSeconds,
                    y: thisObject.container.frame.height / 2 + 1
                }

                point2 = thisObject.container.frame.frameThisPoint(point2);

                let point = {
                    x: point1.x,
                    y: point2.y
                }

                let isCurrentRecord = false;

                if (datetime !== undefined) {
                    let dateValue = datetime.valueOf();
                    if (dateValue >= miliSeconds - timePeriod / 2 && dateValue <= miliSeconds + timePeriod / 2 - 1) {
                        isCurrentRecord = true;
                    }
                }

                let radius = 5;

                let opacity = '0.5';

                browserCanvasContext.lineWidth = 1;

                /* Outer Circle */

                browserCanvasContext.beginPath();

                browserCanvasContext.strokeStyle = 'rgba(123, 50, 40, ' + opacity + ')';

                if (isCurrentRecord === false) {
                    browserCanvasContext.fillStyle = 'rgba(223, 70, 60, ' + opacity + ')';
                } else {
                    browserCanvasContext.fillStyle = 'rgba(255, 233, 31, ' + opacity + ')';  /* highlight the current record */

                    window.AT_BREAKPOINT = true; // We are hitting a breakpoint!
                }

                browserCanvasContext.arc(point.x, point.y, radius, 0, Math.PI * 2, true);
                browserCanvasContext.closePath();

                if (point.x < viewPort.visibleArea.topLeft.x + 50 || point.x > viewPort.visibleArea.bottomRight.x - 50) {/*we leave this history without fill. */ } else {
                    browserCanvasContext.fill();
                }

                browserCanvasContext.stroke();
            }
        }
    }
}