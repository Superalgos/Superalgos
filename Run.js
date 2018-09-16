
global.CURRENT_ENVIRONMENT = "Develop"; 
global.CURRENT_EXECUTION_AT = "Cloud"; 
global.SHALL_BOT_STOP = false;
global.USER_LOGGED_IN = "Ciencias"; 
global.DEV_TEAM = "AAMasters";
global.AT_BREAKPOINT = false; // This is used only when running at the browser. 

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

global.USER_PROFILE = {};
global.EMAIL_CONFIG = {};

readStoragePermissions();

function readStoragePermissions() {

    let filePath;

    try {
        console.log( "[INFO] Run -> readStoragePermissions -> Entering function. ");

        let fs = require('fs');
        filePath = '../' + 'User-Profile' + '/' + 'User.Profile.json';
        global.USER_PROFILE = JSON.parse(fs.readFileSync(filePath, 'utf8'));


        /* Here we will rearrange the storage permissions array into a map, so that it can be easily consumed when needed. */

        let permissionsMap = new Map;

        for (i = 0; i < global.USER_PROFILE.storagePermissions.length; i++) {

            let permission = global.USER_PROFILE.storagePermissions[i];

            permissionsMap.set(permission[0], permission[1]);

        }

        global.USER_PROFILE.storagePermissions = permissionsMap;

        readEmailConfiguration();
    }
    catch (err) {
        console.log("[ERROR] Run -> readStoragePermissions -> err = " + err.message);
        console.log("[HINT] Run -> readStoragePermissions -> You need to have a file at this path -> " + filePath);
    }
}

function readEmailConfiguration() {

    let filePath;

    try {
        console.log( "Run : [INFO] readEmailConfiguration -> Entering function. ");

        let fs = require('fs');
        filePath = '../' + 'Email-Config' + '/' + 'Email.Config.json';
        global.EMAIL_CONFIG = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        readExchangeAPIKey();
    }
    catch (err) {
        console.log("[ERROR] Run -> readEmailConfiguration -> err = " + err.message);
        console.log("[HINT] Run -> You need to have a file at this path -> " + filePath);
    }
}

function readExchangeAPIKey() {

    try {
        console.log( "[INFO] Run -> readExchangeAPIKey -> Entering function. ");

        let fs = require('fs');
        let filePath = '../' + 'Exchange-Keys' + '/' + 'Secret.Keys' + '.json';

        global.EXCHANGE_KEYS = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        startRoot();
    }
    catch (err) {
        console.log("[ERROR] Run -> readExchangeAPIKey -> err = " + err.message);
        console.log("[HINT] Run -> You need to have a file at this path -> " + filePath);

        global.EXCHANGE_KEYS = {
            Poloniex: [{
                Key: "",
                Secret: ""
            }]
        }

        startRoot();
    }
}

function startRoot() {

    console.log( "[INFO] Run -> startRoot -> Entering function. ");

    const ROOT_DIR = './';
    const ROOT_MODULE = require(ROOT_DIR + 'Root');
    let root = ROOT_MODULE.newRoot();

    let UI_COMMANDS = {
        beginDatetime: undefined,
        endDatetime: undefined,
        timePeriod: undefined,
        startMode: undefined,
        eventHandler: undefined
    };

    root.initialize(UI_COMMANDS, onInitialized);

    function onInitialized() {

        console.log( "[INFO] Run -> startRoot -> onInitialized -> Entering function. ");

        root.start();
    }
}

