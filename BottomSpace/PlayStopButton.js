
function newPlayStopButton() {

    var thisObject = {
        container: undefined,
        setDatetime: setDatetime, 
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 50;
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT;

    resize();

    container.isDraggeable = false;
    container.isClickeable = true;

    let play;
    let stop;
    let canDraw = false;
    let showing = "Play";
    let image;

    let datetime;
    let timePeriod;

    return thisObject;

    function initialize() {

        play = new Image();

        play.onload = onImageLoad;

        function onImageLoad() {
            image = play;
            canDraw = true;
        }

        play.src = window.canvasApp.urlPrefix + "Images/Icons/play.png";

        stop = new Image();

        stop.src = window.canvasApp.urlPrefix + "Images/Icons/pause.png";

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);

        viewPort.eventHandler.listenToEvent("Zoom Changed", onZoomChanged);
        timePeriod = INITIAL_TIME_PERIOD;

        window.canvasApp.eventHandler.listenToEvent("Browser Resized", resize);

    }

    function resize() {

        container.frame.position.x = viewPort.visibleArea.topLeft.x + 150 * 4;
        container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    }


    function onClick() {

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken === null || sessionToken === "") {
            /* not logged in */
            return;
        }

        switch (showing) {

            case "Play": {
                image = stop;
                showing = "Stop";

                let UI_COMMANDS = {
                    beginDatetime: datetime,
                    endDatetime: undefined,
                    timePeriod: timePeriod,
                    startMode: window.CURRENT_START_MODE,
                    eventHandler: thisObject.container.eventHandler
                };

                cloudVM.onBotPlayPressed(UI_COMMANDS);

                break;
            }
            case "Stop": {
                image = play;
                showing = "Play";

                cloudVM.onBotStopPressed();

                break;
            }
        }
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

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken === null || sessionToken === "") {
            /* not logged in */
            return;
        }

        thisObject.container.frame.draw(false, false);

        let breakpointsHeight = 14;

        if (canDraw === false) { return; }

        let imageHeight = 20;
        let imageWidth = 20;

        let imagePoint = {
            x: thisObject.container.frame.width / 2 - imageWidth / 2,
            y: thisObject.container.frame.height / 2 - imageHeight / 2 + breakpointsHeight
        };

        imagePoint = thisObject.container.frame.frameThisPoint(imagePoint);

        browserCanvasContext.drawImage(image, imagePoint.x, imagePoint.y, imageWidth, imageHeight);
    }
}