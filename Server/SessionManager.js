exports.newSessionManager = function newSessionManager() {

    let thisObject = {
        getSession: getSession,
        initialize: initialize
    }

    let activeSessions = new Map();

    return thisObject;

    function initialize(pServerConfig, callBackFunction) {

        readSessions();

        function readSessions() {

            try {

                const STORAGE = require('../Server/Storage');
                let storage = STORAGE.newStorage();

                storage.initialize(undefined, pServerConfig);
                storage.getData("AdvancedAlgos", "AAPlatform", "Open.Sessions.json", false, onData);

                function onData(pText) {

                    let sessions = JSON.parse(pText);

                    for (let i = 0; i < sessions.length; i++) {

                        let session = sessions[i];

                        activeSessions.set(session.sessionToken, session);

                    }

                    callBackFunction();

                }
            }
            catch (err) {
                console.log("[ERROR] readSessions -> err = " + err.message);
                console.log("[HINT] You need to have a file at this path -> " + filePath);

                callBackFunction();
            }
        }
    }

    function getSession(pSessionToken) {

        return activeSessions.get(pSessionToken);

    }
}