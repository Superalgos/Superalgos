function newChartAspectRatio() {

    let thisObject = {
        aspectRatio: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    let container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 50;
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 2;
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    container.isDraggeable = false;
    container.isClickeable = false;
    container.isWheeleable = true;

    thisObject.aspectRatio = {};

    const INITIAL_Y_ASPECT_RATIO = 2 / 10;
    const MIN_Y_ASPECT_RATIO = 1 / 10;
    const MAX_Y_ASPECT_RATIO = 10 / 10;

    thisObject.aspectRatio.x = 1;
    thisObject.aspectRatio.y = INITIAL_Y_ASPECT_RATIO;

    canDrawIcon = false;

    return thisObject;

    function initialize() {

        icon = new Image();

        icon.onload = onImageLoad;

        function onImageLoad() {
            canDrawIcon = true;
        }

        icon.src = "Images/scale.y.png";

        thisObject.container.eventHandler.listenToEvent('Mouse Wheel', onMouseWheel);

    }

    function onMouseWheel(pDelta) {

        if (pDelta < 0) {
            pDelta = -0.1;
        } else {
            pDelta = 0.1;
        }

        thisObject.aspectRatio.y = thisObject.aspectRatio.y + pDelta;
        thisObject.aspectRatio.y = Math.round(thisObject.aspectRatio.y * 100) / 100;

        if (thisObject.aspectRatio.y < MIN_Y_ASPECT_RATIO) {

            thisObject.aspectRatio.y = MIN_Y_ASPECT_RATIO;

        }

        if (thisObject.aspectRatio.y > MAX_Y_ASPECT_RATIO) {

            thisObject.aspectRatio.y = MAX_Y_ASPECT_RATIO;

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

        thisObject.container.frame.draw(false, false);

        if (canDrawIcon === false) { return; }

        let breakpointsHeight = 15;

        let imageHeight = 30;
        let imageWidth = 15;

        let imagePoint = {
            x: 10,
            y: thisObject.container.frame.height / 2 - imageHeight / 2 + breakpointsHeight
        };

        imagePoint = thisObject.container.frame.frameThisPoint(imagePoint);

        browserCanvasContext.drawImage(icon, imagePoint.x, imagePoint.y, imageWidth, imageHeight);
    }

}