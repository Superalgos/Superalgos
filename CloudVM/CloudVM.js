
function newCloudVM() {

    const MODULE_NAME = "CloudVM";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    var thisObject = {
        onBotPlayPressed: onBotPlayPressed,
        onBotStopPressed: onBotStopPressed
    };

    let root = newRoot();
    let intervalHandler;
    let previousBotCode = "";

    return thisObject;

    function onBotPlayPressed(pUI_COMMANDS) {

        window.SHALL_BOT_STOP = false;

        window.CURRENT_ENVIRONMENT = "Develop";
        window.STORAGE_PERMISSIONS = ecosystem.getStoragePermissions();
        window.EXCHANGE_KEYS = ecosystem.getExchangeKeys();
        window.USER_LOGGED_IN = window.localStorage.getItem("userName"); 
        window.USER_DEV_TEAM = window.localStorage.getItem("devTeam"); 

        root.initialize(pUI_COMMANDS, onInitialized);

        function onInitialized() {

            root.start();

            intervalHandler = setInterval(checkForChangesInBotCode, 10000);

        }

    }

    function onBotStopPressed() {

        window.SHALL_BOT_STOP = true; 

    }

    function checkForChangesInBotCode() {

        let botFunction = newUserBot;

        if (botFunction !== undefined) {

            let currentBotCode = botFunction.toString();

            if (previousBotCode !== "") {

                if (currentBotCode !== previousBotCode) {

                    console.log("Bot code changes detected.");

                    let path = "AABrowserAPI" + "/"
                        + "saveBotCode"
                        ;

                    callServer(currentBotCode, path, onServerResponse);

                    function onServerResponse(err) {

                        console.log("Server responded: " + err);
                    }
                }
            }

            previousBotCode = currentBotCode;
        }
    }
}