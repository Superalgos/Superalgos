exports.newUserAuthentication = function newUserAuthentication() {

    let thisObject = {
        authenticateUser: authenticateUser,
        initialize: initialize
    }

    let serverConfig;

    return thisObject;

    function initialize(pServerConfig) {

        serverConfig = pServerConfig;

    }

    function authenticateUser(callBackFunction) {

        callBackFunction(global.DEFAULT_OK_RESPONSE);

    }
}