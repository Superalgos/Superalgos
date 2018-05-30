
function newTopSpace() {

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = browserCanvas.width;
    thisObject.container.frame.height = TOP_SPACE_HEIGHT;

    container.displacement.containerName = "Top Space";
    container.frame.containerName = "Top Space";

    container.frame.position.x = 0;
    container.frame.position.y = 0;

    container.isDraggeable = false;

    return thisObject;

    function initialize() {

       
    }

    function getContainer(point) {

        let container;

        for (let i = 0; i < thisObject.panels.length; i++) {

            container = thisObject.panels[i].getContainer(point);

            if (container !== undefined) {

                /* We found an inner container which has the point. We return it. */

                return container;
            }
        }

        /* The point does not belong to any inner container, so we return the current container. */

        return thisObject.container;

    }

    function draw() {

        thisObject.container.frame.draw(false, false);

        drawBackground();
    }

    function drawBackground() {

        let opacity = 1;

        browserCanvasContext.beginPath();

        browserCanvasContext.rect(0, 0, thisObject.container.frame.width, thisObject.container.frame.height);
        browserCanvasContext.fillStyle = 'rgba(0, 0, 0, ' + opacity + ')';

        browserCanvasContext.closePath();

        browserCanvasContext.fill();

    }
}