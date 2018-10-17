
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

    let currentLabel;

    let Auth0;
    let userAuthorization;

    return thisObject;

    function initialize(callBackFunction) {

        
        const accessToken = window.localStorage.getItem("access_token");
        let user = window.localStorage.getItem("user");

        if (user === null) { return; }

        user = JSON.parse(user);

        const authId = user.authId;

        let sessionToken;

        const apolloClient = new Apollo.lib.ApolloClient({
            networkInterface: Apollo.lib.createNetworkInterface({
                /*uri: 'http://localhost:4000/graphql',*/
                uri: 'https://users-api.advancedalgos.net/graphql',
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
            const getUser = () => {
                return new Promise((resolve, reject) => {
                apolloClient.query({
                    query: QUERY,
                    variables: {
                        authId: authId
                    }
                })
                    .then(response => {
                        console.log("apolloClient data", response);
                        sessionToken = response.data.userByAuthId.sessionToken;
                         
                        window.localStorage.setItem('loggedInUser', JSON.stringify(response.data.userByAuthId));
                        resolve({user: response.data.userByAuthId})
                    })
                    .catch(error => {
                    console.log("apolloClient error", error)
                    // reject (error)
                    });
                });
            }   

            const networkInterfaceTeams = Apollo.lib.createNetworkInterface({
            // uri: 'http://localhost:4001/graphql',
            uri: 'https://teams-api.advancedalgos.net/graphql'
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
            query teamsByOwnerQuery($authId: String!) {
            teamsByOwner(ownerId: $authId) {
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
            query: TEAM_BY_OWNER_QUERY,
            variables: { authId: authId }
            })
            .then(response => {
                console.log("apolloClientTeam data", response);
                window.localStorage.setItem('userTeams', JSON.stringify(response.data.teamsByOwner));
                resolve({teams: response.data.teamsByOwner})
            })
            .catch(error => {
                console.log("apolloClientTeam error", error)
                // reject (error)
            });
            })
        }

        // To avoid race conditions, add asynchronous fetches to array
        let fetchDataPromises = [];

        fetchDataPromises.push(getUser(), getTeamByOwner());

        // When all asynchronous fetches resolve, authenticate user or throw error.
        Promise.all(fetchDataPromises).then(result => {
            console.log('fetchDataPromises: ', result);

            /* this is the time to authenticate the user at AAWeb */

            authenticateUser(); 

        }, err => {
            console.error("fetchData error", err)
        });

        thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);

        function authenticateUser() {

            if (sessionToken === undefined) { sessionToken = "" }

            let path = window.URL_PREFIX + "AABrowserAPI/authenticateUser/" + sessionToken;

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

                console.log("window.USER_PROFILE at Login", window.USER_PROFILE);

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
