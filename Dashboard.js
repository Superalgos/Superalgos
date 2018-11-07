
let canvas;
let markets;
let ecosystem = newEcosystem();
let cloudVM = newCloudVM();
let INITIAL_ZOOM_LEVEL = -26;       // This is the zoom level at the view port in which the APP starts.
let INITIAL_TIME_PERIOD = recalculatePeriod(INITIAL_ZOOM_LEVEL);  // This value will be overwritten at the viewPort.initialize if the user had a prevous session with this same browser.
let viewPort = newViewPort();

function newDashboard() {

    const MODULE_NAME = "Dashboard";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        start: start
    };

    const DEBUG_START_UP_DELAY = 0; //3000; // This is a waiting time in case there is a need to debug the very first steps of initialization, to be able to hit F12 on time.

    return thisObject;

    function start() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] start -> Entering function."); }

            /* Here we will setup the global eventHandler that will enable the Canvas App to react to events happening outside its execution scope. */

            window.canvasApp.eventHandler = newEventHandler();
            window.canvasApp.eventHandler.listenToEvent("User Profile Changed", userProfileChanged);
            window.canvasApp.eventHandler.listenToEvent("Browser Resized", browserResized);

            loadImages(onImagesLoaded);

            function onImagesLoaded() {

                if (INFO_LOG === true) { logger.write("[INFO] start -> onImagesLoaded -> Entering function."); }

                /* Next we start the App*/

                setTimeout(delayedStart, DEBUG_START_UP_DELAY);

            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] start -> err = " + err); }

        }
    }


    function delayedStart() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] delayedStart -> Entering function."); }

            /* For now, we are supporting only one market. */

            let market = {
                id: 2,
                assetA: "USDT",
                assetB: "BTC"
            };

            markets = new Map();

            markets.set(market.id, market);

            canvas = newCanvas();
            canvas.initialize();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] delayedStart -> err = " + err); }

        }
    }

    function userProfileChanged() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] userProfileChanged -> Entering function."); }

            canvas.topSpace.initialize();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] userProfileChanged -> err = " + err); }

        }

    }

    function browserResized() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] browserResized -> Entering function."); }

            browserCanvas = document.getElementById('canvas');

            browserCanvas.width = window.innerWidth;
            browserCanvas.height = window.innerHeight - window.canvasApp.topMargin;

            viewPort.initialize();

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] browserResized -> err = " + err); }

        }

    }

    function loadImages(callBack) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] loadImages -> Entering function."); }

            const accessToken = "";

            /*
            Soon, we will need to get images from the Financial Beings Module. I live this core here as a sample for that:

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
                            resolve({ user: response.data.users_UserByAuthId })
                        })
                        .catch(error => {
                            console.log("apolloClient error getting user query", error)
                            reject(error)
                        });
                });
            }

            */

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

            const ALL_TEAMS_QUERY = Apollo.gql`
            {
              teams_Teams{
                edges{
                  node{
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
              }
            }
        `

            const getTeams = () => {
                return new Promise((resolve, reject) => {
                    apolloClientTeams.query({
                        query: ALL_TEAMS_QUERY
                    })
                    .then(response => {
                        window.localStorage.setItem('Teams', JSON.stringify(response.data.teams_Teams));
                        resolve({ teams: response.data.teams_Teams })
                    })
                        .catch(err => {
                        if (ERROR_LOG === true) { logger.write("[ERROR] loadImages -> getTeams -> Error fetching data from Teams Module."); }
                        if (ERROR_LOG === true) { logger.write("[ERROR] loadImages -> getTeams -> err = " + err); }
                        reject(err)
                    });
                })
            }

            // To avoid race conditions, add asynchronous fetches to array
            let fetchDataPromises = [];

            fetchDataPromises.push(/*getUser(),*/ getTeams());   //   <-- Here we must add the function calll to the Financial Beings module.

            // When all asynchronous fetches resolve, authenticate user or throw error.
            Promise.all(fetchDataPromises).then(result => {

                /* All good */

                callBack();

            }, err => {
                if (ERROR_LOG === true) { logger.write("[ERROR] loadImages -> Error fetching data from Teams Module."); }
                if (ERROR_LOG === true) { logger.write("[ERROR] loadImages -> err = " + err); }
            });

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] loadImages -> err = " + err); }

        }

    }
}



