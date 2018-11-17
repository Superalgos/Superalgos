
global.CURRENT_ENVIRONMENT = "Develop"; 
global.CURRENT_EXECUTION_AT = "Cloud"; 
global.SHALL_BOT_STOP = false;
global.AT_BREAKPOINT = false; // This is used only when running at the browser. 

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = "Poloniex";
global.MARKET = {
    assetA: "USDT",
    assetB: "BTC"
};

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

readExecutionConfiguration();

function readExecutionConfiguration() {
    let filePath;
    try {
        let fs = require('fs');

        let configDirectory = process.argv[2];
        if (configDirectory === undefined) {
            console.log("[ERROR] Configuration file not passed as a command line argument.");
            return;
        }
        filePath = configDirectory + '/Execution.Config.json';
        let executionProperties = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        global.DEV_TEAM = executionProperties.devTeam;
        global.EXCHANGE_NAME = executionProperties.exchangeName;
        global.MARKET = executionProperties.market;
        global.EXECUTION_CONFIG = {
            executionList: executionProperties.executionList,
            startMode: executionProperties.startMode
        };

        readStoragePermissions();
    }
    catch (err) {
        console.log("[ERROR] readExecutionConfiguration -> err = " + err.message);
        console.log("[HINT] You need to have a file at this path -> " + filePath);
    }
}

function readStoragePermissions() {
    let filePath;

    try {
        console.log( "[INFO] Run -> readStoragePermissions -> Entering function. ");

        let fs = require('fs');
        filePath = './' + 'configs' + '/' + 'User.Profile.json';
        global.USER_PROFILE = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        /* Dinamically generating the azure storage  permissions for the bot to run */

        const MAX_STORAGE_PERMISSION_DAYS = 10;
        const STORAGE_ACCESS_MANAGER = require('./StorageAccessManager');
        storageAccessManager = STORAGE_ACCESS_MANAGER.newStorageAccessManager();

        storageAccessManager.initialize(global.USER_PROFILE.connectionString, onInitialized);

        function onInitialized() {

            /* Here we will rearrange the storage permissions array into a map, so that it can be easily consumed when needed. */

            let permissionsMap = new Map;

            let containers = ["AAPlatform", "AAVikings", global.USER_PROFILE.teamName]
            let container;
            let key;
            let value;

            for (let i = 0; i < containers.length; i++) {

                container = containers[i];
                let readPermission = storageAccessManager.getPermission(container.toLowerCase(), "READ", MAX_STORAGE_PERMISSION_DAYS);

                key = container + ".READ";
                value = readPermission;

                permissionsMap.set(key, value);

            }

            let writePermission = storageAccessManager.getPermission(container.toLowerCase(), "WRITE", MAX_STORAGE_PERMISSION_DAYS);

            key = container + ".WRITE";
            value = writePermission;

            permissionsMap.set(key, value);

            global.USER_PROFILE.storagePermissions = permissionsMap;
            global.USER_PROFILE.connectionString = "";

            readEmailConfiguration();

        }
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
        filePath = './' + 'configs' + '/' + 'Email.Config.json';
        global.EMAIL_CONFIG = JSON.parse(fs.readFileSync(filePath, 'utf8'));

        startRoot();
    }
    catch (err) {
        console.log("[ERROR] Run -> readEmailConfiguration -> err = " + err.message);
        console.log("[HINT] Run -> You need to have a file at this path -> " + filePath);
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

