
function newLogin() {

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

    container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 1;
    container.frame.position.y = 0;

    container.isDraggeable = false;
    container.isClickeable = true;

    const LOGIN_URL = "https://advancedalgos1.eu.auth0.com/login?state=HQmR_JEnoSYS9Zz0nkCzW_zALsRJXjoQ&client=GReymhOiUQuLhDEwxlLu6PMDIa6mjVQQ&protocol=oauth2&response_type=token%20id_token&redirect_uri=https%3A%2F%2F" + window.location.host + "%2F%23&scope=openid&audience=https%3A%2F%2Fadvancedalgos1.eu.auth0.com%2Fuserinfo&nonce=7LZ5hOd6D3jFdNdtDvEqNOyOR3nZXw5A&auth0Client=eyJuYW1lIjoiYXV0aDAuanMiLCJ2ZXJzaW9uIjoiOS41LjEifQ%3D%3D"
    const LOGOUT_URL = "/";

    let currentURL;
    let currentLabel;

    let sharedStatus;

    return thisObject;

    function initialize() {


        if (window.USER_LOGGED_IN === "") {

            currentLabel = "Login";
            currentURL = LOGIN_URL;

        } else {

            currentLabel = "Logout";
            currentURL = LOGOUT_URL;

        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
    }

    function onClick() {

        window.location.href = currentURL;

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
        let label = currentLabel;

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