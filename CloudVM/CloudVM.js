
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

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onBotPlayPressed -> Entering function."); }

            window.SHALL_BOT_STOP = false;

            window.CURRENT_ENVIRONMENT = "Develop";
            window.CURRENT_EXECUTION_AT = "Browser";
            window.STORAGE_PERMISSIONS = ecosystem.getStoragePermissions();
            window.EXCHANGE_KEYS = ecosystem.getExchangeKeys();
            window.USER_LOGGED_IN = window.localStorage.getItem("userName");
            window.DEV_TEAM = window.localStorage.getItem("devTeam");

            root.initialize(pUI_COMMANDS, onInitialized);

            function onInitialized() {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] onBotPlayPressed -> Entering function."); }

                    root.start();

                    intervalHandler = setInterval(checkForChangesInBotCode, 10000);

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] onBotPlayPressed -> onInitialized -> err.message = " + err.message); }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onBotPlayPressed -> err.message = " + err.message); }
        }
    }

    function onBotStopPressed() {

        if (INFO_LOG === true) { logger.write("[INFO] onBotStopPressed -> Entering function."); }

        window.SHALL_BOT_STOP = true; 

    }

    function checkForChangesInBotCode() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] checkForChangesInBotCode -> Entering function."); }

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

                            if (INFO_LOG === true) { logger.write("[INFO] checkForChangesInBotCode -> onServerResponse -> Entering function."); }
                            if (INFO_LOG === true) { logger.write("[INFO] checkForChangesInBotCode -> onServerResponse -> err = " + err); }

                        }
                    }
                }

                previousBotCode = currentBotCode;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] checkForChangesInBotCode -> err.message = " + err.message); }
        }
    }
}