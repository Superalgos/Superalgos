
exports.newUserBot = function newUserBot(bot, logger, COMMONS, UTILITIES, FILE_STORAGE, STATUS_REPORT, EXCHANGE_API) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const GMT_SECONDS = ':00.000 GMT+0000';
    const GMT_MILI_SECONDS = '.000 GMT+0000';
    const MODULE_NAME = "User Bot";
    const CANDLES_FOLDER_NAME = "Candles/One-Min";
    const VOLUMES_FOLDER_NAME = "Volumes/One-Min";

    thisObject = {
        initialize: initialize,
        start: start
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger)
    let fileStorage = FILE_STORAGE.newFileStorage(logger);
    let statusDependencies

    const ONE_MIN = 60000
    const ONE_DAY = ONE_MIN * 60 * 24
    
    const MAX_OHLCVs_PER_EXECUTION =   10000000
    const symbol = bot.market.baseAsset + '/' + bot.market.quotedAsset
    const ccxt = require('ccxt')

    let fetchType = "by Time"
    let lastId
    let firstId
    let allOHLCVs = []
    let thisReport;
    let since
    let initialProcessTimestamp
    let beginingOfMarket
    let lastFile
    let exchangeId
    let options = {}
    let rateLimit = 500
    let exchange
    let uiStartDate = new Date(bot.uiStartDate)
    let fisrtTimeThisProcessRun = false
    let limit = 1000 // This is the default value
    let hostname
    let lastCandleOfTheDay

    return thisObject;

    function initialize(pStatusDependencies, callBackFunction) {
        try {

            logger.fileName = MODULE_NAME;
            logger.initialize();

            statusDependencies = pStatusDependencies;

            callBackFunction(global.DEFAULT_OK_RESPONSE);

        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function start(callBackFunction) {
        try {

            if (global.STOP_TASK_GRACEFULLY === true) {
                callBackFunction(global.DEFAULT_OK_RESPONSE);
                return
            }

            getContextVariables()
            saveMessages()
 
            function getContextVariables() {

                try {
                    let reportKey;

                    reportKey = "Masters" + "-" + "Webhooks" + "-" + "Record-Messages" + "-" + "dataSet.V1";
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getContextVariables -> reportKey = " + reportKey); }

                    if (statusDependencies.statusReports.get(reportKey).status === "Status Report is corrupt.") {
                        logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> Can not continue because dependecy Status Report is corrupt. ");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }

                    thisReport = statusDependencies.statusReports.get(reportKey)

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getContextVariables -> err = " + err.stack);
                    if (err.message === "Cannot read property 'file' of undefined") {
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Check the bot Status Dependencies. ");
                        logger.write(MODULE_NAME, "[HINT] start -> getContextVariables -> Dependencies loaded -> keys = " + JSON.stringify(statusDependencies.keys));
                    }
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function saveMessages() {
                try {

                    const https = require('https')
                    const options = {
                        hostname: process.env.WEB_SERVER_URL,
                        port: process.env.WEB_SERVER_PORT,
                        path: 'Webhook/Fetch-Messages',
                        method: 'GET'
                    }

                    const req = https.request(options, onRequestSent)

                    function onRequestSent(response) {

                        response.on('data', onMessegesArrived)

                        function onMessegesArrived(messages) {
                            console.log(messages)

                            let fileName = 'Data.json'
                            fileStorage.createTextFile(getFilePath(day * ONE_DAY, CANDLES_FOLDER_NAME) + '/' + fileName, candlesFileContent + '\n', onFileCreated);
                            let filePath = bot.filePathRoot + "/Output/" + folderName + '/' + dateForPath;

                            function onFileCreated(err) {

                                console.log('on file created err: ' + err)
                                writeStatusReport()
                            }
                        }
                    }

                    req.on('error', error => {
                        console.error(error)
                    })

                    req.end()

                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> saveMessages -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                    abort = true
                }
            }

            function writeStatusReport() {
                try {
   
                    thisReport.file = {};

                    thisReport.save(onSaved);

                    function onSaved(err) {
                        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                            logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> onSaved -> err = " + err.stack);
                            callBackFunction(err);
                            return;
                        }
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> writeStatusReport -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }


        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};
