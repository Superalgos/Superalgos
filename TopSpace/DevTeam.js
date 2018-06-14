
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
    container.isClickeable = true;

    let sharedStatus;

    return thisObject;

    function initialize(pSharedStatus) {

        sharedStatus = pSharedStatus;

        if (window.USER_PROFILE.devTeams.length === 0) {
            window.DEV_TEAM = "Not a devTeam Member";
        } else {
            window.DEV_TEAM = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].displayName;
        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
    }

    function onClick() {

        if (sharedStatus.currentDevTeamIndex + 1 === window.USER_PROFILE.devTeams.length) {

            sharedStatus.currentDevTeamIndex = 0;
            window.DEV_TEAM = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].displayName;
            sharedStatus.eventHandler.raiseEvent("devTeam Changed");
            return;
        }

        if (sharedStatus.currentDevTeamIndex + 1 < window.USER_PROFILE.devTeams.length) {

            sharedStatus.currentDevTeamIndex++;
            window.DEV_TEAM = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].displayName;
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
        let label = window.DEV_TEAM;

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