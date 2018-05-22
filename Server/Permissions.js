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

                readExchangeAPIKey();
            }
            catch (err) {
                console.log("[ERROR] readStoragePermissions -> err = " + err.message);
                console.log("[HINT] readStoragePermissions -> You need to have a file at this path -> " + filePath);
            }
        }

        function readExchangeAPIKey() {

            try {
                let fs = require('fs');
                let filePath = '../' + 'Exchange-Keys' + '/' + 'Secret.Keys' + '.json';

                pEcosystemObject.EXCHANGE_KEYS = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                callBackFunction();
            }
            catch (err) {
                console.log("[ERROR] readExchangeAPIKey -> err = " + err.message);
                console.log("[HINT] You need to have a file at this path -> " + filePath);

                pEcosystemObject.EXCHANGE_KEYS = {
                    Poloniex: {
                        Key: "",
                        Secret: ""
                    }
                }

                callBackFunction();
            }
        }
    }
}