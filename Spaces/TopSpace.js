
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

    let endUser;
    let devTeam;
    let currentBot;
    let currentProcess;
    let currentStartMode;

    return thisObject;

    function initialize() {

        endUser = newEndUser();
        endUser.initialize();

        devTeam = newDevTeam();
        devTeam.initialize();

        currentBot = newCurrentBot();
        currentBot.initialize();

        currentProcess = newCurrentProcess();
        currentProcess.initialize();

        currentStartMode = newCurrentStartMode();
        currentStartMode.initialize();

    }

    function getContainer(point) {

        let container;

        container = endUser.getContainer(point);
        if (container !== undefined) { return container; }

        container = devTeam.getContainer(point);
        if (container !== undefined) { return container; }

        container = currentBot.getContainer(point);
        if (container !== undefined) { return container; }

        container = currentProcess.getContainer(point);
        if (container !== undefined) { return container; }

        container = currentStartMode.getContainer(point);
        if (container !== undefined) { return container; }

        /* The point does not belong to any inner container, so we return the current container. */

        return thisObject.container;

    }

    function draw() {

        thisObject.container.frame.draw(false, false);

        drawBackground();
        endUser.draw();
        devTeam.draw();
        currentBot.draw();
        currentProcess.draw();
        currentStartMode.draw();

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