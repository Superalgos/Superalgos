
function newCurrentProcess() {

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

    container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 2;
    container.frame.position.y = 0;

    container.isDraggeable = false;
    container.isClickeable = true;

    const NOT_FOUND = "No Process Found";

    let sharedStatus;

    return thisObject;

    function initialize(pSharedStatus) {

        sharedStatus = pSharedStatus;

        if (window.USER_PROFILE.devTeams.length === 0) {
            window.CURRENT_PROCESS = NOT_FOUND;
        } else {

            if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length === 0) {
                window.CURRENT_PROCESS = NOT_FOUND;
            } else {

                if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length === 0) {
                    window.CURRENT_PROCESS = NOT_FOUND;
                } else {

                    window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;

                }
            }
        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
        sharedStatus.eventHandler.listenToEvent("userBot Changed", onUserBotChanged);
    }

    function onUserBotChanged() {

        if ( window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots.length > 0) {

            if (window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length > 0) {

                sharedStatus.currentProcessIndex = 0;
                window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;

                return;
            }   
        }

        window.CURRENT_PROCESS = NOT_FOUND;
    }

    function onClick() {

        if (sharedStatus.currentProcessIndex + 1 === window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length) {

            sharedStatus.currentProcessIndex = 0;
            window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;
            return;
        }

        if (sharedStatus.currentProcessIndex + 1 < window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes.length) {

            sharedStatus.currentProcessIndex++;
            window.CURRENT_PROCESS = window.USER_PROFILE.devTeams[sharedStatus.currentDevTeamIndex].userBots[sharedStatus.currentUserBotIndex].processes[sharedStatus.currentProcessIndex].name;
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
        let label = window.CURRENT_PROCESS;

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