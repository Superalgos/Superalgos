
function newTopSpace() {

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        companyLogo: undefined,
        endUser: undefined,
        devTeam: undefined,
        currentBot: undefined,
        currentProcess: undefined,
        currentStartMode: undefined,
        playStopButton: undefined,
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

        thisObject.companyLogo = newCompanyLogo();
        thisObject.companyLogo.initialize();

        thisObject.endUser = newEndUser();
        thisObject.endUser.initialize();

        thisObject.devTeam = newDevTeam();
        thisObject.devTeam.initialize();

        thisObject.currentBot = newCurrentBot();
        thisObject.currentBot.initialize();

        thisObject.currentProcess = newCurrentProcess();
        thisObject.currentProcess.initialize();

        thisObject.currentStartMode = newCurrentStartMode();
        thisObject.currentStartMode.initialize();

        thisObject.playStopButton = newPlayStopButton();
        thisObject.playStopButton.initialize();

    }

    function getContainer(point) {

        let container;

        container = thisObject.companyLogo.getContainer(point);
        if (container !== undefined) { return container; }

        container = thisObject.endUser.getContainer(point);
        if (container !== undefined) { return container; }

        container = thisObject.devTeam.getContainer(point);
        if (container !== undefined) { return container; }

        container = thisObject.currentBot.getContainer(point);
        if (container !== undefined) { return container; }

        container = thisObject.currentProcess.getContainer(point);
        if (container !== undefined) { return container; }

        container = thisObject.currentStartMode.getContainer(point);
        if (container !== undefined) { return container; }

        container = thisObject.playStopButton.getContainer(point);
        if (container !== undefined) { return container; }

        /* The point does not belong to any inner container, so we return the current container. */

        return thisObject.container;

    }

    function draw() {

        thisObject.container.frame.draw(false, false);

        drawBackground();
        thisObject.companyLogo.draw();
        thisObject.endUser.draw();
        thisObject.devTeam.draw();
        thisObject.currentBot.draw();
        thisObject.currentProcess.draw();
        thisObject.currentStartMode.draw();
        thisObject.playStopButton.draw();

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