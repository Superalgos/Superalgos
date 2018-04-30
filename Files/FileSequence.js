
function newFileSequence() {

    const MODULE_NAME = "File Sequence";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        getFile: getFile,
        getExpectedFiles: getExpectedFiles,
        getFilesLoaded: getFilesLoaded,
        initialize: initialize
    }

    let filesLoaded = 0;

    let fileCloud;

    let files = new Map;

    let maxSequence;

    return thisObject;

    function initialize(pDevTeam, pBot, pProduct, pSet, pExchange, pMarket, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }
            if (INFO_LOG === true) { logger.write("[INFO] initialize -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

            let exchange = ecosystem.getExchange(pProduct, pExchange);

            if (exchange === undefined) {

                throw "Exchange not supoorted by this pProduct of the ecosystem! - pDevTeam.codeName = " + pDevTeam.codeName + ", pBot.codeName = " + pBot.codeName + ", pProduct.codeName = " + pProduct.codeName + ", pExchange = " + pExchange;

            }

            fileCloud = newFileCloud();
            fileCloud.initialize(pBot);

            /* First we will get the sequence max number */

            fileCloud.getFile(pDevTeam, pBot, pSet, exchange, pMarket, undefined, undefined, "Sequence", onSequenceFileReceived);

            function onSequenceFileReceived(err, file) {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> Entering function."); }
                    if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> key = " + pDevTeam.codeName + "-" + pBot.codeName + "-" + pProduct.codeName); }

                    switch (err.result) {
                        case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> Received OK Response."); }
                            break;
                        }

                        case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> Received FAIL Response."); }
                            callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                            return;
                        }

                        case GLOBAL.CUSTOM_OK_RESPONSE.result: {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> Received CUSTOM OK Response."); }
                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> err.message = " + err.message); }

                            callBackFunction(err);
                            return;
                        }

                        case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> Received CUSTOM FAIL Response."); }
                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> err.message = " + err.message); }

                            callBackFunction(err);
                            return;
                        }

                        default: {

                            if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> Received Unexpected Response."); }
                            callBackFunction(err);
                            return;
                        }
                    }

                    maxSequence = Number(file);

                    /* Now we will get the sequence of files */

                    for (let i = 0; i <= maxSequence; i++) {

                        fileCloud.getFile(pDevTeam, pBot, pSet, exchange, pMarket, undefined, undefined, i, onFileReceived);

                        function onFileReceived(err, file) {

                            try {

                                switch (err.result) {
                                    case GLOBAL.DEFAULT_OK_RESPONSE.result: {

                                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received OK Response."); }
                                        break;
                                    }

                                    case GLOBAL.DEFAULT_FAIL_RESPONSE.result: {

                                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received FAIL Response."); }
                                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE);
                                        return;
                                    }

                                    case GLOBAL.CUSTOM_FAIL_RESPONSE.result: {

                                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received CUSTOM FAIL Response."); }
                                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> err.message = " + err.message); }

                                        callBackFunction(err);
                                        return;
                                    }

                                    default: {

                                        if (INFO_LOG === true) { logger.write("[INFO] initialize -> onSequenceFileReceived -> onFileReceived -> Received Unexpected Response."); }
                                        callBackFunction(err);
                                        return;
                                    }
                                }

                                files.set(i, file);

                                filesLoaded++;

                                callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, thisObject); // Note that the callback is called for every file loaded.

                            } catch (err) {

                                if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onSequenceFileReceived -> onFileReceived -> err = " + err); }
                                callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
                            }
                        }
                    }

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> onSequenceFileReceived -> err = " + err); }
                    callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
        }
    }

    function getFile(pSequence) {

        if (INFO_LOG === true) { logger.write("[INFO] getFile -> Entering function."); }
        if (INFO_LOG === true) { logger.write("[INFO] getFile -> pSequence = " + pSequence); }

        return files.get(pSequence);

    }

    function getExpectedFiles() {

        if (INFO_LOG === true) { logger.write("[INFO] getExpectedFiles -> Entering function."); }

        return maxSequence + 1;

    }

    function getFilesLoaded() {

        if (INFO_LOG === true) { logger.write("[INFO] getFilesLoaded -> Entering function."); }

        return filesLoaded;

    }

}