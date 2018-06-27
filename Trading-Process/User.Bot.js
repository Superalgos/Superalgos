exports.newUserBot = function newUserBot(bot, logger) {

    const MODULE_NAME = "User Bot";
    const FULL_LOG = true;
    const LOG_INFO = true;
    
    let thisObject = {
        initialize: initialize,
        start: start
    };

    let assistant;          // The reference to the Traing Platform Advanced Algos Assistant.
    let gaussStorage;		// This is an example of dependency to other bots

    return thisObject;

    function initialize(pAssistant, callBackFunction) {
        try {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] initialize -> Entering function."); }

            logger.fileName = MODULE_NAME;

            assistant = pAssistant;

            let key = "AAVikings-AAGauss-LRC-Points-Multi-Period-Daily-dataSet.V1";

            gaussStorage = assistant.dataDependencies.dataSets.get(key);

            callBackFunction(global.DEFAULT_OK_RESPONSE);
        } catch (err) {
            logger.write(MODULE_NAME, "[ERROR] initialize -> onDone -> err = " + err.message);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
    
    function start(callBackFunction) {
        if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> Entering function."); }

        let market = global.MARKET;

        /*
        This trading bot will use an strategy based on the interpretation of the Linear Regression Curve Channel.
        */

        businessLogic(onDone);

        function onDone(err) {
            try {
                switch (err.result) {                        
                    case global.DEFAULT_OK_RESPONSE.result: { 
                        logger.write(MODULE_NAME, "[INFO] start -> onDone -> Execution finished well. :-)");
                        callBackFunction(global.DEFAULT_OK_RESPONSE);
                        return;
                    }
                    case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                        logger.write(MODULE_NAME, "[ERROR] start -> onDone -> Retry Later. Requesting Execution Retry.");
                        callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                        return;
                    }
                    case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                        logger.write(MODULE_NAME, "[ERROR] start -> onDone -> Operation Failed. Aborting the process. err = " + err.message);
                        callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                        return;
                    }
                }
            } catch (err) {
                logger.write(MODULE_NAME, "[ERROR] start -> onDone -> err = " + err.message);
                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
            }
        }

        function businessLogic(callBack) {
			if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> Entering function."); }

			getChannelTilt(botDecision);
				
            function botDecision(err, channelTilt) {
                try {
			        if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> botDecision  -> LRC Channel Tilt:" + channelTilt); }

			        if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
                        logger.write(MODULE_NAME, "[ERROR] start -> businessLogic -> botDecision -> err = " + err.message);
                        callBack(global.DEFAULT_FAIL_RESPONSE);
			        } else {
				        if (channelTilt == 1) {
					        createBuyPosition(callBack);
				        } else if (channelTilt == -1) {
					        createSellPosition(callBack);
				        } else {
                            if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> botDecision -> Nothing to do, there isn't a sell or buy oportunity."); }
							
					        callBack(global.DEFAULT_OK_RESPONSE);
				        }
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> businessLogic -> botDecision -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
			}
        }

        function getChannelTilt(callBack) {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> getChannelTilt -> Entering function."); }

            const CHANNEL_DOWN = -1;
            const CHANNEL_UP = 1;
            const NO_CHANNEL = 0;
            let lrcPoint, previousLRCPoint;

            let queryDate = new Date(bot.processDatetime);
            getLRCPointsFile(queryDate, onLRCPointsFileReceived);

            function onLRCPointsFileReceived(err, lrcPointsFile) {
                try {
                    if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> getChannelTilt -> onLRCPointsFileReceived."); }

                    let lastIndexLrcPointsFile = lrcPointsFile.length - 1;
                    let lastAvailableDateTime = lrcPointsFile[lastIndexLrcPointsFile][0];

                    if (bot.processDatetime.valueOf() <= lastAvailableDateTime || !isExecutionToday()) {
                        for (let i = 0; i < lrcPointsFile.length; i++) {
                            if (bot.processDatetime.valueOf() >= lrcPointsFile[i][0] && bot.processDatetime.valueOf() < lrcPointsFile[i][1]) {
                                lrcPoint = {
                                    begin: lrcPointsFile[i][0],
                                    end: lrcPointsFile[i][1],
                                    min: lrcPointsFile[i][2],
                                    mid: lrcPointsFile[i][3],
                                    max: lrcPointsFile[i][4]
                                };
                                if (i >= 1) {
                                    let previous = i - 1;
                                    previousLRCPoint = {
                                        begin: lrcPointsFile[previous][0],
                                        end: lrcPointsFile[previous][1],
                                        min: lrcPointsFile[previous][2],
                                        mid: lrcPointsFile[previous][3],
                                        max: lrcPointsFile[previous][4]
                                    };

                                    applyBotRules();

                                } else {
                                    queryDate.setDate(queryDate.getDate() - 1);
                                    getLRCPointsFile(queryDate, onPreviousLRCPointsFileReceived);
                                }
                                return;
                            }
                        }

                        logger.write(MODULE_NAME, "[ERROR] start -> businessLogic -> getChannelTilt -> onLRCPointsFileReceived. The expected LRC Point was not found.");
                        callBack(global.DEFAULT_FAIL_RESPONSE);
                    } else {
                        // Running live we will process last available LRCPoint only if it's delayed 25 minutes top
                        let maxTolerance = 25 * 60 * 1000;
                        if (bot.processDatetime.valueOf() <= (lastAvailableDateTime + maxTolerance)) {
                            lrcPoint = {
                                begin: lrcPointsFile[lastIndexLrcPointsFile][0],
                                end: lrcPointsFile[lastIndexLrcPointsFile][1],
                                min: lrcPointsFile[lastIndexLrcPointsFile][2],
                                mid: lrcPointsFile[lastIndexLrcPointsFile][3],
                                max: lrcPointsFile[lastIndexLrcPointsFile][4]
                            };

                            if (lastIndexLrcPointsFile >= 1) {
                                let previous = lastIndexLrcPointsFile - 1;
                                previousLRCPoint = {
                                    begin: lrcPointsFile[previous][0],
                                    end: lrcPointsFile[previous][1],
                                    min: lrcPointsFile[previous][2],
                                    mid: lrcPointsFile[previous][3],
                                    max: lrcPointsFile[previous][4]
                                };

                                applyBotRules();

                            } else {
                                queryDate.setDate(queryDate.getDate() - 1);
                                getLRCPointsFile(queryDate, onPreviousLRCPointsFileReceived);
                            }
                        } else {
                            if (LOG_INFO === true) logger.write(MODULE_NAME, "[WARN] start -> getChannelTilt -> onLRCPointsFileReceived. Available candle older than 5 minutes. Skeeping execution.");

                            callBack(global.DEFAULT_OK_RESPONSE, NO_CHANNEL); // TODO CUSTOM_OK_RESPONSE
                        }
                    }
                } catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] start -> getChannelTilt -> onLRCPointsFileReceived -> err = " + err.message);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }

            function isExecutionToday() {
                let localDate = new Date();
                let today = new Date(Date.UTC(
                    localDate.getUTCFullYear(),
                    localDate.getUTCMonth(),
                    localDate.getUTCDate()));

                return (today.getUTCFullYear() === bot.processDatetime.getUTCFullYear()
                    && today.getUTCMonth() === bot.processDatetime.getUTCMonth()
                    && today.getUTCDate() === bot.processDatetime.getUTCDate());
            }

            function onPreviousLRCPointsFileReceived(err, lrcPointsFile) {
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> getChannelTilt -> onLRCPointsFileReceived."); }

                let previous = lrcPointsFile.length - 1;
                previousLRCPoint = {
                    begin: lrcPointsFile[previous][0],
                    end: lrcPointsFile[previous][1],
                    min: lrcPointsFile[previous][2],
                    mid: lrcPointsFile[previous][3],
                    max: lrcPointsFile[previous][4]
                };

                applyBotRules();
            }

            function applyBotRules() {
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> getChannelTilt -> applyBotRules -> LRC Point Found."); }

                let channelTilt = NO_CHANNEL;
                let ruleApplied = "";

                if (lrcPoint.max < lrcPoint.mid && lrcPoint.min > lrcPoint.mid && lrcPoint.mid < lrcPoint.min) {
                    if (lrcPoint.min > previousLRCPoint.min && lrcPoint.mid > previousLRCPoint.mid && lrcPoint.max > previousLRCPoint.max) {
                        channelTilt = CHANNEL_UP; // The channel points UP
                        ruleApplied += "Rule_1.";
                    }
                }

                if (lrcPoint.min < lrcPoint.mid && lrcPoint.max > lrcPoint.mid && lrcPoint.mid < lrcPoint.max) {
                    if (lrcPoint.min < previousLRCPoint.min && lrcPoint.mid < previousLRCPoint.mid && lrcPoint.max < previousLRCPoint.max) {
                        channelTilt = CHANNEL_DOWN; // The channel points DOWN
                        ruleApplied += "Rule_2.";
                    }
                }

                if (lrcPoint.min < previousLRCPoint.min && lrcPoint.mid <= previousLRCPoint.mid) {
                    // 15 AND 30 changed direction from up to down
                    channelTilt = CHANNEL_DOWN;
                    ruleApplied += "Rule_3a.";
                }

                if (lrcPoint.min > previousLRCPoint.min && lrcPoint.mid >= previousLRCPoint.mid) {
                    // 15 AND 30 changed direction from down to up
                    channelTilt = CHANNEL_UP;
                    ruleApplied += "Rule_3b.";
                }

                let logMessage = bot.processDatetime.toISOString() + "\t" + ruleApplied + "\t" + channelTilt + "\t" + lrcPoint.min + "\t" + lrcPoint.mid + "\t" + lrcPoint.max;
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> getChannelTilt -> applyBotRules -> Results: " + logMessage); }

                callBack(global.DEFAULT_OK_RESPONSE, channelTilt);
            }
        }

        function getLRCPointsFile(dateTime, callback) {
			if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> getLRCPointsFile -> Entering function."); }

			let periodName = "30-min";
			let datePath = dateTime.getUTCFullYear() + "/" + pad(dateTime.getUTCMonth() + 1, 2) + "/" + pad(dateTime.getUTCDate(), 2);
			let filePath = "LRC-Points/Multi-Period-Daily/" + periodName + "/" + datePath;
			let fileName = market.assetA + '_' + market.assetB + ".json"

			gaussStorage.getTextFile(filePath, fileName, onFileReceived);

			function onFileReceived(err, text) {
				if (err.result === global.DEFAULT_OK_RESPONSE.result) {
					if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] start -> getChannelTilt -> getLRCPointsFile -> onFileReceived > Entering Function."); }

					let lrcPointsFile = JSON.parse(text);
					callback(global.DEFAULT_OK_RESPONSE, lrcPointsFile);
				} else {
					logger.write(MODULE_NAME, "[ERROR] start -> getChannelTilt -> getLRCPointsFile -> onFileReceived -> Failed to get the file. Will abort the process and request a retry.");
					callBackFunction(global.DEFAULT_RETRY_RESPONSE);
					return;
				}
			}
        }

        function createBuyPosition(callBack) {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> createBuyPosition -> Entering function."); }
                
			let positions = assistant.getPositions();
            let assetABalance = assistant.getAvailableBalance().assetA;
            let currentRate = assistant.getMarketRate();
            let amountA = assistant.getAvailableBalance().assetA;
            let amountB = amountA / currentRate;
				
            if (positions.length > 0 && positions[0].type === "buy" && positions[0].status !== "executed" && (bot.processDatetime.valueOf() - positions[0].date) > (60000 * 15)){
					
				assistant.movePosition(positions[0], currentRate, callBack);
					
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> createBuyPosition -> Moving an existing position to a new rate: " + currentRate.toFixed(8)); }
					
                let message = "Moving an existing buy position to a new price: " + Number(currentRate).toLocaleString();
				assistant.sendMessage(2, "Moving Position", message);

					
			} else if(assetABalance > 0){
					
				assistant.putPosition("buy", currentRate, amountA, amountB, callBack);

                let message = "Creating a new buy position. Price: " + Number(currentRate).toLocaleString();
                if (assistant.getROI() !== undefined) {
                    message += ". ROI on current execution: " + MARKET.assetA + ": " + assistant.getROI().assetA + ". " + MARKET.assetB + ": " + assistant.getROI().assetB;

                }
                assistant.sendMessage(2, "Buying", message);
										
			} else {
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> createBuyPosition -> There is not enough available balance to buy. Available balance: " + assetABalance ); }
					
				callBack(global.DEFAULT_OK_RESPONSE);
			}                
        }
              
        function createSellPosition(callBack) {
            if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> createSellPosition -> Entering function."); }
                
			let positions = assistant.getPositions();
			let assetBBalance = assistant.getAvailableBalance().assetB;
            let currentRate = assistant.getMarketRate();
            let amountB = assistant.getAvailableBalance().assetB;
            let amountA = amountB * currentRate;

            if (positions.length > 0 && positions[0].type === "sell" && positions[0].status !== "executed" && (bot.processDatetime.valueOf() - positions[0].date) > (60000 * 15)){
					
				assistant.movePosition(positions[0], currentRate, callBack);
					
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> createBuyPosition -> Artuditu is moving an existing position to a new rate: " + currentRate.toFixed(8)); }
					
                let message = "Moving an existing sell position to a new price: " + Number(currentRate).toLocaleString();
				assistant.sendMessage(2, "Moving Position", message);

			}else if(assetBBalance > 0){
					
				assistant.putPosition("sell", currentRate, amountA, amountB, callBack);
				
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> createSellPosition -> Artuditu put a new SELL Position at rate: " + currentRate + ". Amount traded asset A: " + amountA + ". Amount traded asset B: " + amountB); }

                let message = "Creating a new sell position. Price: " + Number(currentRate).toLocaleString();
                if (assistant.getROI() !== undefined) {
                    message += ". ROI on current execution: " + MARKET.assetA + ": " + assistant.getROI().assetA + ". " + MARKET.assetB + ": " + assistant.getROI().assetB;

                }
                assistant.sendMessage(2, "Selling", message);
					
			} else {
                if (LOG_INFO === true) { logger.write(MODULE_NAME, "[INFO] start -> businessLogic -> createBuyPosition -> There is not enough available balance to sell. Available balance: " + assetBBalance ); }
					
				callBack(global.DEFAULT_OK_RESPONSE);
			}
        }

        function pad(str, max) {
            str = str.toString();
            return str.length < max ? pad("0" + str, max) : str;
        }

    }
};
