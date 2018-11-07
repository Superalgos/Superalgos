
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
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topRight.x - thisObject.container.frame.width * 1;
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    container.isDraggeable = false;
    container.isClickeable = true;

    let currentLabel;

    let userAuthorization;

    return thisObject;

    function initialize(callBackFunction) {

        
        const accessToken = window.localStorage.getItem("access_token");
        let user = window.localStorage.getItem("user");

        if (user === null) {

            // if there is no user that means that we are logged off, which means it is time to clean the local storage of things from the last log in.

            window.localStorage.removeItem("loggedInUser");
            window.localStorage.removeItem('sessionToken');
            return;
        }

        user = JSON.parse(user);

        const authId = user.authId;

        let sessionToken;

        const apolloClient = new Apollo.lib.ApolloClient({
            networkInterface: Apollo.lib.createNetworkInterface({
                uri: window.canvasApp.graphQL.masterAppApiUrl,
                transportBatching: true,
            }),
            connectToDevTools: true,
        })

        const QUERY = Apollo.gql`
            query($authId: String){
                users_UserByAuthId (authId: $authId){
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
            const getUser = () => {
                return new Promise((resolve, reject) => {
                apolloClient.query({
                    query: QUERY,
                    variables: {
                        authId: authId
                    }
                })
                    .then(response => {
                        sessionToken = response.data.users_UserByAuthId.sessionToken;
                         
                        window.localStorage.setItem('loggedInUser', JSON.stringify(response.data.users_UserByAuthId));
                        resolve({ user: response.data.users_UserByAuthId})
                    })
                    .catch(error => {
                        console.log("apolloClient error getting user query", error)
                        reject(error)
                    });
                });
            }   

            const networkInterfaceTeams = Apollo.lib.createNetworkInterface({
                uri: window.canvasApp.graphQL.masterAppApiUrl
            });

            networkInterfaceTeams.use([{
            applyMiddleware(req, next) {
                req.options.headers = {
                authorization: `Bearer ${accessToken}`
                };
                next();
            }
            }]);

            const apolloClientTeams = new Apollo.lib.ApolloClient({
                networkInterface: networkInterfaceTeams,
                connectToDevTools: true,
            });

            const TEAM_BY_OWNER_QUERY = Apollo.gql`
            query teamsByOwnerQuery {
                teams_TeamsByOwner {
                    id
                    name
                    slug
                    profile {
                    avatar
                    banner
                    description
                    motto
                    updatedAt
                    }
                    members {
                    member {
                        alias
                    }
                    }
                    fb {
                    id
                    name
                    slug
                    avatar
                    kind
                    status {
                        status
                        reason
                        createdAt
                    }
                    }
                }
            }
        `

        const getTeamByOwner = () => {
        return new Promise((resolve, reject) => {
            apolloClientTeams.query({
            query: TEAM_BY_OWNER_QUERY
            })
            .then(response => {
                window.localStorage.setItem('userTeams', JSON.stringify(response.data.teams_TeamsByOwner));
                resolve({ teams: response.data.teams_TeamsByOwner})
            })
            .catch(error => {
                console.log("apolloClient error getting user teams", error)
                reject (error)
            });
            })
        }

        // To avoid race conditions, add asynchronous fetches to array
        let fetchDataPromises = [];

        fetchDataPromises.push(getUser(), getTeamByOwner());

        // When all asynchronous fetches resolve, authenticate user or throw error.
        Promise.all(fetchDataPromises).then(result => {

            /* this is the time to authenticate the user at AAWeb */

            authenticateUser(); 

        }, err => {
            console.error("fetchData error", err)
        });

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);

        function authenticateUser() {

            if (sessionToken === undefined) { sessionToken = "" }

            let path = window.canvasApp.urlPrefix + "AABrowserAPI/authenticateUser/" + sessionToken;

            callServer(undefined, path, onServerReponded);

            function onServerReponded(pResponseFromServer) {

                let responseFromServer = JSON.parse(pResponseFromServer);

                err = responseFromServer.err;

                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {

                    console.log("Authentication Error. " + err.message);
                    return;

                }

                window.USER_PROFILE = responseFromServer.userProfile;
                window.localStorage.setItem('sessionToken', sessionToken);

                currentLabel = "Logged In"
                callBackFunction();
            }
        }
    }


    function onClick() {
 
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

        return; // nothing to show.

        thisObject.container.frame.draw(false, false);

        let fontSize = 12;
        let label = currentLabel;
        if (label === undefined) { label = "" };

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
