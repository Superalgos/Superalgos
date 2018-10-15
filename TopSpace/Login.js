
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

    function initialize() {

        if (window.EXECUTING_AT === 'Master App') {
            currentLabel = "";
            return;
        }

        let parameters = {
            domain: 'advancedalgos.eu.auth0.com',
            clientID: 'WQTnXt20a0t2WGl64mEcOyP4Ippo37nB',
            redirectUri: window.location.href,
            audience: 'https://auth-dev.advancedalgos.net',
        };

        Auth0 = new auth0.WebAuth(parameters);

        userAuthorization = window.location.hash.substr(1); // What comes after the # on the URL.

        let sessionToken = window.localStorage.getItem('sessionToken');

        if (sessionToken !== null && sessionToken !== "") {

            currentLabel = "Logout";

            if (window.location.search !== "?" + sessionToken ) {

                /* When the user was logged in, and we navigate again to the platform url alone, we need to re-submit the token session to AAWeb */

                window.location = "/index.html?" + sessionToken;
                return;
            }

        } else {

            if (userAuthorization === "") {

                currentLabel = "Login / Signup";

            } else {

                Auth0.parseHash({ hash: window.location.hash }, function (err, authResult) {
                    if (err) {
                        return console.log("Parse Hash Error", err);
                    }

                    // The contents of authResult depend on which authentication parameters were used.
                    // It can include the following:
                    // authResult.accessToken - access token for the API specified by `audience`
                    // authResult.expiresIn - string with the access token's expiration time in seconds
                    // authResult.idToken - ID token JWT containing user profile information

                    currentLabel = "Logout";

                    let authId = authResult.idTokenPayload.sub;

                    // We store the token so we can identify the user
                    window.localStorage.setItem('auth0Token', authResult.accessToken);

                    /* Now we connect to the users and team modules
                       to get the users alias, first, middle and last names
                       as well as the user's teams and their team data. */

                       // To avoid race conditions, add asynchronous fetches to array
                       let fetchDataPromises = [];

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
                                     let sessionToken = response.data.userByAuthId.sessionToken;
                                     window.localStorage.setItem('sessionToken', sessionToken);
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
                                   authorization: `Bearer ${authResult.accessToken}`
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

                           fetchDataPromises.push(getUser(), getTeamByOwner());

                           // When all asynchronous fetches resolve, refresh page or throw error.
                           Promise.all(fetchDataPromises).then(result => {
                               console.log('fetchDataPromises: ', result);
                               window.location = "/index.html?" + sessionToken;
                           }, err => {
                               console.error("fetchData error", err)
                           });

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
            window.localStorage.setItem('userTeams', "");
            window.localStorage.setItem('accessToken', "");
            window.location = "/index.html";
            currentLabel = "Login / Signup";

        } else {

            if (userAuthorization === "") {

                /* Goes for a login / signup */

                Auth0.authorize({
                    scope: 'openid profile',
                    responseType: 'token id_token'
                });

            } else {

                /* Goes for a logout */

                window.localStorage.setItem('sessionToken', "");
                window.localStorage.setItem('loggedInUser', "");
                window.localStorage.setItem('userTeams', "");
            window.localStorage.setItem('accessToken', "");
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
