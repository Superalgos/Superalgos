exports.newUserAuthentication = function newUserAuthentication() {

    MAX_STORAGE_PERMISSION_DAYS = 3;

    let thisObject = {
        authenticateUser: authenticateUser,
        initialize: initialize
    }

    let sessionManager;
    let storageAccessManager;

    return thisObject;

    function initialize(pSessionManager, pStorageAccessManager) {

        sessionManager = pSessionManager;
        storageAccessManager = pStorageAccessManager; 

    }

    function authenticateUser(pSessionToken, callBackFunction) {

        let userProfile = {
            userName: "Guest",
            devTeams: [],
            storagePermissions: new Map()
        };

        /* The first possibility is that the sessionToken is not there. */

        if (pSessionToken === "") {

            callBackFunction(global.DEFAULT_OK_RESPONSE, userProfile);
            return;
        }

         /* The second posiibility is that the session is not found. */

        let session = sessionManager.getSession(sessionToken);

        if (session === undefined) {

            let customResponse = {
                result: global.CUSTOM_FAIL_RESPONSE.result,
                message: "Invalid session token received. Please login again."
            };

            callBackFunction(customResponse, userProfile);
            return;

        }

        /* The last one is that the session is found, meaning valid. */

        userProfile.userName = session.userName;
        userProfile.devTeams = session.devTeams;

        for (let i = 0; i < session.devTeams.lenght; i++) {

            let devTeam = session.devTeams[i];
            let readPermission = storageAccessManager.getPermission(devTeam, "READ", MAX_STORAGE_PERMISSION_DAYS);
            let writePermission = storageAccessManager.getPermission(devTeam, "WRITE", MAX_STORAGE_PERMISSION_DAYS);

            userProfile.storagePermissions.set(devTeam + "." + "READ", readPermission);
            userProfile.storagePermissions.set(devTeam + "." + "WRITE", writePermission);

        }

        callBackFunction(global.DEFAULT_OK_RESPONSE, userProfile);

    }
}