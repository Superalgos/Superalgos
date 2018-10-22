
function newCurrentBot() {

    let thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,  
        initialize: initialize
    };

    let container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 150;
    thisObject.container.frame.height = TOP_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topLeft.x + thisObject.container.frame.width * 1;
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    container.isDraggeable = false;
    container.isClickeable = true;

    const NOT_FOUND = "";

    let sharedStatus;

    return thisObject;

    function initialize(pSharedStatus) {

        sharedStatus = pSharedStatus;

        if (window.USER_PROFILE.devTeams.length === 0) {
            window.CURRENT_BOT_DISPLAY_NAME = NOT_FOUND;
        } else {

            if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length === 0) {
                window.CURRENT_BOT_DISPLAY_NAME = NOT_FOUND;
                window.CURRENT_BOT_REPO = "NO REPO";
                window.CURRENT_BOT_CODE_NAME = "";
            } else {
                window.CURRENT_BOT_DISPLAY_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].displayName;
                window.CURRENT_BOT_REPO = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].repo;
                window.CURRENT_BOT_CODE_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].codeName;
            }
        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
        sharedStatus.eventHandler.listenToEvent("devTeam Changed", onDevTeamChanged);
    }

    function onDevTeamChanged() {

        if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length > 0) {

            sharedStatus.currentUserBotIndex = 0;
            window.CURRENT_BOT_DISPLAY_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].displayName;
            window.CURRENT_BOT_REPO = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].repo;
            window.CURRENT_BOT_CODE_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].codeName;

            sharedStatus.eventHandler.raiseEvent("userBot Changed");

        } else {

            window.CURRENT_BOT_DISPLAY_NAME = NOT_FOUND;

        }
    }

    function onClick() {

        if (sharedStatus.currentUserBotIndex + 1 === window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length) {

            sharedStatus.currentUserBotIndex = 0;
            window.CURRENT_BOT_DISPLAY_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].displayName;
            window.CURRENT_BOT_REPO = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].repo;
            window.CURRENT_BOT_CODE_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].codeName;

            sharedStatus.eventHandler.raiseEvent("userBot Changed");
            return;
        }

        if (sharedStatus.currentUserBotIndex + 1 < window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length) {

            sharedStatus.currentUserBotIndex++;
            window.CURRENT_BOT_DISPLAY_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].displayName;
            window.CURRENT_BOT_REPO = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].repo;
            window.CURRENT_BOT_CODE_NAME = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].codeName;

            sharedStatus.eventHandler.raiseEvent("userBot Changed");
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
        let label = window.CURRENT_BOT_DISPLAY_NAME;
        if (label === undefined) { label = "" };

        let point = {
            x: thisObject.container.frame.width / 2 - label.length / 2 * fontSize / 3,
            y: (thisObject.container.frame.height / 2) + 12
        };
        point = thisObject.container.frame.frameThisPoint(point);

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY;
        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)';
        browserCanvasContext.fillText(label, point.x, point.y);
    }
}