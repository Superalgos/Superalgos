exports.newUserAuthentication = function newUserAuthentication() {

    MAX_STORAGE_PERMISSION_DAYS = 3;

    let thisObject = {
        authenticateUser: authenticateUser,
        initialize: initialize
    };

    let sessionManager;
    let storageAccessManager;

    return thisObject;

    function initialize(pSessionManager, pStorageAccessManager) {

        sessionManager = pSessionManager;
        storageAccessManager = pStorageAccessManager;

    }

    function authenticateUser(pSessionToken, callBackFunction) {

        let userProfile = {
            userName: "",
            devTeams: [],
            storagePermissions: []
        };

        /* The first possibility is that the sessionToken is not there. */

        if (pSessionToken === "") {

            callBackFunction(global.DEFAULT_OK_RESPONSE, userProfile);
            return;
        }

        /* The second posiibility is that the session is not found. */

        let session = sessionManager.getSession(pSessionToken);

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

        for (let i = 0; i < session.devTeams.length; i++) {

            let devTeam = session.devTeams[i];
            let container = devTeam.codeName.toLowerCase();

            let readPermission = storageAccessManager.getPermission(container, "READ", MAX_STORAGE_PERMISSION_DAYS);
            let writePermission = storageAccessManager.getPermission(container, "WRITE", MAX_STORAGE_PERMISSION_DAYS);
            let deletePermission = storageAccessManager.getPermission(container, "DELETE", MAX_STORAGE_PERMISSION_DAYS);

            userProfile.storagePermissions.push([devTeam.codeName + "." + "READ", readPermission]);
            userProfile.storagePermissions.push([devTeam.codeName + "." + "WRITE", writePermission]);
            userProfile.storagePermissions.push([devTeam.codeName + "." + "DELETE", deletePermission]);

            console.log(devTeam.codeName + "." + "READ" + ":" + readPermission);
            console.log(devTeam.codeName + "." + "WRITE" + ":" + writePermission);
            console.log(devTeam.codeName + "." + "DELETE" + ":" + writePermission);

            /* Each devTeam potentially depends on data from other devTeams. The user will need the storage permissions to read that data. */

            for (j = 0; j < devTeam.devTeamDependencies.length; j++) {

                let dependecy = devTeam.devTeamDependencies[j];

                let container = dependecy.toLowerCase();

                let readPermission = storageAccessManager.getPermission(container, "READ", MAX_STORAGE_PERMISSION_DAYS);

                userProfile.storagePermissions.push([dependecy + "." + "READ", readPermission]);

                console.log(dependecy + "." + "READ" + ":" + readPermission);

            }
        }

        /* In order to be able to download a bot source code, the user will need READ permissions over the Platform container. */

        let container = "aaplatform";
        let readPermission = storageAccessManager.getPermission(container, "READ", MAX_STORAGE_PERMISSION_DAYS);
        userProfile.storagePermissions.push(["AAPlatform" + "." + "READ", readPermission]);

        callBackFunction(global.DEFAULT_OK_RESPONSE, userProfile);

    }
};