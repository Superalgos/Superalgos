exports.newPermissions = function newPermissions() {

    let thisObject = {
        initialize: initialize
    }

    return thisObject;

    function initialize(pEcosystemObject, callBackFunction) {

        readStoragePermissions();

        function readStoragePermissions() {

            let filePath;

            try {
                let fs = require('fs');
                filePath = '../' + 'Connection-Strings' + '/' + 'Storage.Permissions.json';
                pEcosystemObject.STORAGE_PERMISSIONS = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                readPermissions();
            }
            catch (err) {
                console.log("[ERROR] readStoragePermissions -> err = " + err.message);
                console.log("[HINT] readStoragePermissions -> You need to have a file at this path -> " + filePath);
            }
        }

        function readPermissions() {

            try {
                let fs = require('fs');
                let filePath = '../' + 'Permissions' + '/' + 'Secrets' + '.json';

                let permissioins = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                callBackFunction(permissioins);
            }
            catch (err) {
                console.log("[ERROR] readPermissions -> err = " + err.message);
                console.log("[HINT] You need to have a file at this path -> " + filePath);

                callBackFunction();
            }
        }
    }
}