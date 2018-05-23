
global.CURRENT_ENVIRONMENT = "Develop"; 
global.CURRENT_LOCATION = "Cloud"; 

process.on('uncaughtException', function (err) {
    console.log('[INFO] Run -> uncaughtException -> err.message = ' + err.message);
    return;
});


process.on('unhandledRejection', (reason, p) => {
    console.log('[INFO] Run -> unhandledRejection -> reason = ' + reason);
    console.log('[INFO] Run -> unhandledRejection -> p = ' + JSON.stringify(p));
    return;
});


process.on('exit', function (code) {
    try {
        console.log('[INFO] Run -> process.on.exit -> About to exit -> code = ' + code);
        return;
    }
    catch (err) {
        console.log("[ERROR] Run -> process.on.exit -> Error Logging Error Code.");
        console.log("[ERROR] Run -> process.on.exit -> err.message = " + err.message);
        return;
    }
});

global.STORAGE_PERMISSIONS = {};

readStoragePermissions();

function readStoragePermissions() {

    let filePath;

    try {
        let fs = require('fs');
        filePath = '../' + 'Connection-Strings' + '/' + 'Storage.Permissions.json';
        global.STORAGE_PERMISSIONS = JSON.parse(fs.readFileSync(filePath, 'utf8'));

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

        global.EXCHANGE_KEYS = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        startRoot();
    }
    catch (err) {
        console.log("[ERROR] readExchangeAPIKey -> err = " + err.message);
        console.log("[HINT] You need to have a file at this path -> " + filePath);

        global.EXCHANGE_KEYS = {
            Poloniex: {
                Key: "",
                Secret: ""
            }
        }

        startRoot();
    }
}

function startRoot() {

    const ROOT_DIR = './';
    const ROOT_MODULE = require(ROOT_DIR + 'Root');
    let root = ROOT_MODULE.newRoot();

    root.initialize(onInitialized);

    function onInitialized() {

        root.start();
    }
}

