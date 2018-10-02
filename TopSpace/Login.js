
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

    const AUTH0_CLIENT_ID = 'WQTnXt20a0t2WGl64mEcOyP4Ippo37nB';
    const AUTH0_DOMAIN = 'advancedalgos.eu.auth0.com';

    const LOGIN_URL = "https://" + AUTH0_DOMAIN + "/authorize" +
        "?state=" +
        "&client_id=" + AUTH0_CLIENT_ID +
        "&response_type=id_token" +
        "&redirect_uri=" + location.href + "index.html" +
        "&scope=openid" +
        "&nonce=CALCULATESOMENONCE"; 

    const LOGOUT_URL = "/";

    let currentURL;
    let currentLabel;

    let Auth0;
    let userAuthorization;

    return thisObject;

    function initialize() {

        let parameters = {
            domain: 'advancedalgos.eu.auth0.com',
            redirectUri: window.location.href,
            clientID: 'WQTnXt20a0t2WGl64mEcOyP4Ippo37nB'
        };

        Auth0 = new auth0.WebAuth(parameters);

        userAuthorization = window.location.hash.substr(1); // What comes after the # on the URL.

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken !== null && sessionToken !== "") {

            currentLabel = "Logout";

        } else {

            if (userAuthorization === "") {

                currentLabel = "Login / Signup";

            } else {

                console.log(userAuthorization);

                Auth0.parseHash({ hash: window.location.hash }, function (err, authResult) {
                    if (err) {
                        return console.log("Parse Hash Error", err);
                    }

                    console.log("Auth0 Error", err);
                    console.log("Auth0 Result", authResult);

                    // The contents of authResult depend on which authentication parameters were used.
                    // It can include the following:
                    // authResult.accessToken - access token for the API specified by `audience`
                    // authResult.expiresIn - string with the access token's expiration time in seconds
                    // authResult.idToken - ID token JWT containing user profile information

                    currentLabel = "Logout";

                    let authId = authResult.idTokenPayload.sub;

                    /* Now we connect to the users module to get the users alias, first, middle and last names. */

                    const apolloClient = new Apollo.lib.ApolloClient({
                        networkInterface: Apollo.lib.createNetworkInterface({
                            uri: 'http://localhost:4000/graphql',
                            /*uri: 'https://users-api.advancedalgos.net/graphql',*/
                            transportBatching: true,
                        }),
                        connectToDevTools: true,
                    })

                    const QUERY = Apollo.gql`
                query($authId: String){
                    userByAuthId (authId: $authId){
                        id
                        referrerId
                        alias
                        firstName
                        middleName
                        lastName
                        bio
                        email
                        emailVerified
                        isDeveloper
                        isDataAnalyst
                        isTrader
                        avatarHandle
                        avatarChangeDate
                        sessionToken
                        role {
                        id
                        }
                    }
                }
                `

                    apolloClient.query({
                        query: QUERY,
                        variables: {
                            authId: authId
                        }
                    })
                        .then(response => {
                            console.log("apolloClient data", response);
                            let sessionToken = response.data.userByAuthId.sessionToken;
                            window.localStorage.setItem('sessionToken', sessionToken);
                            window.localStorage.setItem('loggedInUser', JSON.stringify(response.data.userByAuthId));
                            window.location = "/index.html?" + sessionToken;
                        })
                        .catch(error => console.error("apolloClient error", error));

                });
            }

        }

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);
    }

    function onClick() {

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken !== null && sessionToken !== "") {

            window.localStorage.setItem('sessionToken', "");
            window.localStorage.setItem('loggedInUser', "");
            window.location = "/index.html";
            currentLabel = "Login / Signup";

        } else {

            if (userAuthorization === "") {

                /* Goes for a login / signup */

                Auth0.authorize({
                    scope: 'openid profile',
                    responseType: 'id_token'
                });

            } else {

                /* Goes for a logout */

                window.localStorage.setItem('sessionToken', "");
                window.localStorage.setItem('loggedInUser', "");
                window.location = "/index.html";
                currentLabel = "Login / Signup";
            }
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