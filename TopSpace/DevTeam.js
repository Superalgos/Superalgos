
function newDevTeam() {

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 200;
    thisObject.container.frame.height = TOP_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 4;
    container.frame.position.y = 0;

    container.isDraggeable = false;

    return thisObject;

    function initialize() {

        window.DEV_TEAM = window.localStorage.getItem("devTeam");

        if (window.DEV_TEAM === null) {
            window.DEV_TEAM = "Not devTeam Member";
        }
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

        let fontSize = 12;
        let label = window.DEV_TEAM;

        let point = {
            x: thisObject.container.frame.width * 1 / 3,
            y: (thisObject.container.frame.height / 2) + 4
        };

        point = thisObject.container.frame.frameThisPoint(point);

        browserCanvasContext.font = fontSize + 'px Courier New';
        browserCanvasContext.fillStyle = 'rgba(255, 255, 255, 1)';
        browserCanvasContext.fillText(label, point.x, point.y);
    }
}