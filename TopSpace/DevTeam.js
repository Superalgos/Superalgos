
function newDevTeam() {

    let thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    };

    let container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 200;
    thisObject.container.frame.height = TOP_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 5;
    container.frame.position.y = 0;

    container.isDraggeable = false;
    container.isClickeable = true;

    const NOT_FOUND = "Team NOT FOUND";

    let sharedStatus;
    let label = ""

    return thisObject;

    function initialize(pSharedStatus) {

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken === null || sessionToken === "") {
            /* not logged in */
            return;
        }

        sharedStatus = pSharedStatus;

        let storedTeams = window.localStorage.getItem('userTeams');

        if (storedTeams === null || storedTeams === "[]" || storedTeams === "") {
            window.TEAMS = "";
            label = NOT_FOUND;
        } else {
            storedTeams = JSON.parse(storedTeams)
            window.TEAMS = storedTeams;
            window.DEV_TEAM = storedTeams[0].slug;
            label = storedTeams[sharedStatus.currentDevTeamIndex].name;
        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
    }

    function onClick() {

        if (sharedStatus.currentDevTeamIndex + 1 === window.TEAMS.length) {

            sharedStatus.currentDevTeamIndex = 0;
            window.DEV_TEAM = window.TEAMS[sharedStatus.currentDevTeamIndex].slug;
            label = window.TEAMS[sharedStatus.currentDevTeamIndex].name;
            sharedStatus.eventHandler.raiseEvent("devTeam Changed");
            return;
        }

        if (sharedStatus.currentDevTeamIndex + 1 < window.TEAMS.length) {

            sharedStatus.currentDevTeamIndex++;
            window.DEV_TEAM = window.TEAMS[sharedStatus.currentDevTeamIndex].slug;
            label = window.TEAMS[sharedStatus.currentDevTeamIndex].name;
            sharedStatus.eventHandler.raiseEvent("devTeam Changed");
            return;
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

        let fontSize = 12;

        let point = {
            x: thisObject.container.frame.width * 1 / 3,
            y: (thisObject.container.frame.height / 2) + 4
        };

        point = thisObject.container.frame.frameThisPoint(point);

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY;
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)';
        browserCanvasContext.fillText(label, point.x, point.y);
    }
}
