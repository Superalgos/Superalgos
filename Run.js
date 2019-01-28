require('dotenv').config()

global.CURRENT_ENVIRONMENT = "Develop";
global.CURRENT_EXECUTION_AT = "Cloud";
global.SHALL_BOT_STOP = false;
global.AT_BREAKPOINT = false; // This is used only when running at the browser. 
global.RUN_AS_TEAM = false;

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = "Poloniex";
global.MARKET = {
    assetA: "USDT",
    assetB: "BTC"
};

process.on('uncaughtException', function (err) {
    console.log('[INFO] Run -> uncaughtException -> err.message = ' + err.message);
    console.log('[INFO] Run -> uncaughtException -> err.stack = ', err.stack);
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
    try {
        console.log("[INFO] Run -> readExecutionConfiguration -> Entering function. ");
        let startMode

        // Environment Configuration
        global.CURRENT_ENVIRONMENT = process.env.PLATFORM_ENVIRONMENT
        global.GATEWAY_ENDPOINT = process.env.GATEWAY_ENDPOINT
        global.STORAGE_URL = process.env.STORAGE_URL

        // General Financial Being Configuration
        global.DEV_TEAM = process.env.DEV_TEAM
        global.CURRENT_BOT_REPO = process.env.BOT + "-" + process.env.TYPE + "-Bot"
        global.RUN_AS_TEAM = (process.env.RUN_AS_TEAM === "true")
        global.USER_LOGGED_IN = process.env.USER_LOGGED_IN

        if (process.env.TYPE === 'Trading') {
            let live = {
                run: "false",
                resumeExecution: process.env.RESUME_EXECUTION
            }

            let backtest = {
                run: "false",
                resumeExecution: process.env.RESUME_EXECUTION,
                beginDatetime: process.env.BEGIN_DATE_TIME,
                endDatetime: process.env.END_DATE_TIME,
                waitTime: process.env.WAIT_TIME
            }

            let competition = {
                run: "false",
                resumeExecution: process.env.RESUME_EXECUTION,
                beginDatetime: process.env.BEGIN_DATE_TIME,
                endDatetime: process.env.END_DATE_TIME
            }

            startMode = {
                live: live,
                backtest: backtest,
                competition: competition
            }
        } else if (process.env.TYPE === 'Indicator' || process.env.TYPE === 'Extractor') {
            let allMonths = {
                run: "false",
                minYear: process.env.MIN_YEAR,
                maxYear: process.env.MAX_YEAR
            }
            let oneMonth = {
                run: "false",
                year: process.env.YEAR,
                month: process.env.MONTH
            }
            let noTime = {
                run: "false"
            }
            let fixedInterval = {
                run: "false",
                interval: process.env.INTERVAL
            }

            startMode = {
                allMonths: allMonths,
                oneMonth: oneMonth,
                noTime: noTime,
                fixedInterval: fixedInterval
            }
        } else {
            console.log("[ERROR] readExecutionConfiguration -> Bot Type is invalid." );
            throw new Error("readExecutionConfiguration -> Bot Type is invalid.")
        }

        startMode[process.env.START_MODE].run = "true"

        let executionList = [{
            enabled: "true",
            devTeam: process.env.DEV_TEAM,
            bot: process.env.BOT,
            process: process.env.PROCESS,
            repo: global.CURRENT_BOT_REPO
        }]

        global.EXECUTION_CONFIG = {
            executionList: executionList,
            startMode: startMode
        };

        readStoragePermissions();
    }

    catch (err) {
        console.log("[ERROR] readExecutionConfiguration -> err = " + err.message);
        console.log("[ERROR] readExecutionConfiguration -> err = " + err.stack);
    }
}

function readStoragePermissions() {
    let filePath;

    try {
        console.log( "[INFO] Run -> readStoragePermissions -> Entering function. ");

        /* Dinamically generating the azure storage  permissions for the bot to run */
        global.STORAGE_BASE_URL = process.env.STORAGE_BASE_URL
        global.USER_PROFILE = {}
        const MAX_STORAGE_PERMISSION_DAYS = 10;
        const STORAGE_ACCESS_MANAGER = require('./StorageAccessManager');
        storageAccessManager = STORAGE_ACCESS_MANAGER.newStorageAccessManager();

        storageAccessManager.initialize(process.env.STORAGE_CONNECTION_STRING, onInitialized);

        function onInitialized() {

            /* Here we will rearrange the storage permissions array into a map, so that it can be easily consumed when needed. */

            let permissionsMap = new Map;

            let containers = ["AAPlatform", "AAMasters", "AAVikings", global.DEV_TEAM]
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

