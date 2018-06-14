exports.newSessionManager = function newSessionManager() {

    let thisObject = {
        getSession: getSession,
        initialize: initialize
    }

    let activeSessions = new Map();

    return thisObject;

    function initialize(callBackFunction) {

        readSessions();

        function readSessions() {

            try {
                let fs = require('fs');
                let filePath = '../' + 'Sessions' + '/' + 'Open.Sessions' + '.json';

                let sessions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                for (let i = 0; i < sessions.length; i++) {

                    let session = sessions[i];

                    activeSessions.set(session.sessionToken, session);

                }

                callBackFunction();
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