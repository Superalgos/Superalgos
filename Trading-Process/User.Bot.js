exports.newUserBot = function newUserBot(BOT, DEBUG_MODULE, COMMONS_MODULE) {
    let bot = BOT;

    const FULL_LOG = true;
    const MODULE_NAME = "User Bot";
    const LOG_INFO = true;
    const logger = DEBUG_MODULE.newDebugLog();
    logger.fileName = MODULE_NAME;
    logger.bot = bot;
    
    let thisObject = {
        initialize: initialize,
        start: start
    };

    let assistant;          // The reference to the Traing Platform Advanced Algos Assistant.
    let gaussStorage;		// This is an example of dependency to other bots

    return thisObject;

    function initialize(pAssistant, callBackFunction) {
        try {
            if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

            logger.fileName = MODULE_NAME;

            assistant = pAssistant;

            let key = "AAVikings-AAGauss-LRC-Points-Multi-Period-Daily-dataSet.V1";

            gaussStorage = assistant.dataDependencies.dataSets.get(key);
            callBackFunction(global.DEFAULT_OK_RESPONSE);
        } catch (err) {
            logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
        }
    }
    
    function start(callBackFunction) {
        try {
            if (LOG_INFO === true) { logger.write("[INFO] start -> Entering function."); }

            /*

            This trading bot will use an strategy based on the interpretation of the Linear Regression Curve Channel.

            */

            businessLogic(onDone);

            function onDone(err) {
                try {
                    switch (err.result) {                        
                        case global.DEFAULT_OK_RESPONSE.result: { 
                            logger.write("[INFO] start -> onDone -> Execution finished well. :-)");
                            callBackFunction(global.DEFAULT_OK_RESPONSE);
                            return;
                        }
                        case global.DEFAULT_RETRY_RESPONSE.result: {  // Something bad happened, but if we retry in a while it might go through the next time.
                            logger.write("[ERROR] start -> onDone -> Retry Later. Requesting Execution Retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                        case global.DEFAULT_FAIL_RESPONSE.result: { // This is an unexpected exception that we do not know how to handle.
                            logger.write("[ERROR] start -> onDone -> Operation Failed. Aborting the process. err = " + err.message);
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                    }
                } catch (err) {
                    logger.write("[ERROR] start -> onDone -> err = " + err.message);
                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                }
            }

            function businessLogic(callBack) {
				if (LOG_INFO === true) { logger.write("[INFO] start -> businessLogic -> Entering function."); }

				getChannelTilt(botDecision);
				
				function botDecision(err, channelTilt) {
					if (LOG_INFO === true) { logger.write("[INFO] start -> businessLogic -> botDecision  -> LRC Channel Tilt:" + channelTilt); }

					if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
						logger.write("[ERROR] start -> businessLogic -> err = " + err.message);
						callBack(global.DEFAULT_RETRY_RESPONSE);
					} else {
						if (channelTilt == 1) {
							createBuyPosition(callBack);
						} else if (channelTilt == -1) {
							createSellPosition(callBack);
						} else {
							if (LOG_INFO === true) { logger.write("[INFO] start -> processBotDecision -> Nothing to do, there isn't a sell or buy oportunity."); }
							
							callBack(global.DEFAULT_OK_RESPONSE);
						}
					}
				}
            }

            function createBuyPosition(callBack) {
                if (LOG_INFO === true) { logger.write("[INFO] start -> createBuyPosition -> Entering function."); }
                
				let positions = assistant.getPositions();
                let assetABalance = assistant.getAvailableBalance().assetA;
                let currentRate = assistant.getMarketRate();
                let amountA = assistant.getAvailableBalance().assetA;
                let amountB = amountA / currentRate;
				
				if(positions.length > 0 && positions[0].type === "buy" && (bot.processDatetime.valueOf() - positions[0].date) > (60000 * 5)){
					
					assistant.movePosition(positions[0], currentRate, callBack);
					
					if (LOG_INFO === true) { logger.write("[INFO] start -> createBuyPosition -> Artuditu is moving an existing position to a new rate: " + currentRate.toFixed(8) + ". Position: " + JSON.stringify(positions[0])); }
					
					let message = "I'm moving an existing buy position to a new rate: " + currentRate.toFixed(8);
					assistant.sendMessage(1, "Moving Position", message);

					
				} else if(assetABalance > 0){
					
					assistant.putPosition("buy", currentRate, amountA, amountB, callBack);
					
					let message = "I'm creating a new buy position at rate: " + currentRate.toFixed(8) + ". " + MARKET.assetA +" amount: " + amountA.toFixed(8) + ". " + MARKET.assetB + " amount: "  + amountB.toFixed(8);
					assistant.sendMessage(1, "Buying", message);
										
				} else {
					if (LOG_INFO === true) { logger.write("[INFO] start -> createBuyPosition -> There is not enough available balance to buy. Available balance: " + assetABalance ); }
					
					callBack(global.DEFAULT_OK_RESPONSE);
				}
				
                
            }
              
            function createSellPosition(callBack) {
                if (LOG_INFO === true) { logger.write("[INFO] start -> createSellPosition -> Entering function."); }
                
				let positions = assistant.getPositions();
				let assetBBalance = assistant.getAvailableBalance().assetB;
                let currentRate = assistant.getMarketRate();
                let amountB = assistant.getAvailableBalance().assetB;
                let amountA = amountB * currentRate;

				if(positions.length > 0 && positions[0].type === "sell" && (bot.processDatetime.valueOf() - positions[0].date) > (60000 * 5)){
					
					assistant.movePosition(positions[0], currentRate, callBack);
					
					if (LOG_INFO === true) { logger.write("[INFO] start -> createBuyPosition -> Artuditu is moving an existing position to a new rate: " + currentRate.toFixed(8) + ". Position: " + JSON.stringify(positions[0])); }
					
					let message = "I'm moving an existing sell position to a new rate: " + currentRate.toFixed(8);
					assistant.sendMessage(1, "Moving Position", message);

				}else if(assetBBalance > 0){
					
					assistant.putPosition("sell", currentRate, amountA, amountB, callBack);
					
					if (LOG_INFO === true) { logger.write("[INFO] start -> createSellPosition -> Artuditu put a new SELL Position at rate: " + currentRate + ". Amount traded asset A: " + amountA + ". Amount traded asset B: " + amountB); }
					
					let message = "I'm creating a new sell position at rate: " + currentRate.toFixed(8) + ". " + MARKET.assetA +" amount: " + amountA.toFixed(8) + ". " + MARKET.assetB + " amount: "  + amountB.toFixed(8);
					assistant.sendMessage(1, "Selling", message);
					
				} else {
					if (LOG_INFO === true) { logger.write("[INFO] start -> createBuyPosition -> There is not enough available balance to sell. Available balance: " + assetBBalance ); }
					
					callBack(global.DEFAULT_OK_RESPONSE);
				}
                
            }

            function getChannelTilt(callBack) {
                if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> Entering function."); }

                const CHANNEL_DOWN = -1;
                const CHANNEL_UP = 1;
                const NO_CHANNEL = 0;
                let lrcPoint, previousLRCPoint;

                let queryDate = new Date(bot.processDatetime);
                getLRCPointsFile(queryDate, onLRCPointsFileReceived);

                function onLRCPointsFileReceived(err, lrcPointsFile) {
                    if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> onDailyFileReceived."); }

                    for (let i = 0; i < lrcPointsFile.length; i++) {

                        if (lrcPointsFile[i][0] === bot.processDatetime.valueOf()) {
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

                            break;
                        }
                    }
                }

                function onLRCPointsFileReceived(err, lrcPointsFile) {
                    if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> onDailyFileReceived."); }

                    let previous = lrcPointsFile.length - 2;
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
                    if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> applyBotRules -> LRC Point Found: " + JSON.stringify(lrcPoint)); }

                    let channelTilt = NO_CHANNEL;
                    let ruleApplied = "";

                    if (lrcPoint.mid < lrcPoint.mid && lrcPoint.min > lrcPoint.mid && lrcPoint.mid < lrcPoint.min) {
                        if (lrcPoint.min > previousLrc15 && lrcPoint.mid > previousLrc30 && lrcPoint.mid > previousLrc60) {
                            channelTilt = CHANNEL_UP; // The channel points UP
                            ruleApplied += "Rule_1.";
                        }
                    }

                    if (lrcPoint.min < lrcPoint.mid && lrcPoint.mid > lrcPoint.mid && lrcPoint.mid < lrcPoint.mid) {
                        if (lrcPoint.min < previousLrc15 && lrcPoint.mid < previousLrc30 && lrcPoint.mid < previousLrc60) {
                            channelTilt = CHANNEL_DOWN; // The channel points DOWN
                            ruleApplied += "Rule_2.";
                        }
                    }

                    if (lrcPoint.min < previousLrc15 && lrcPoint.mid <= previousLrc30) {
                        // 15 AND 30 changed direction from up to down
                        channelTilt = CHANNEL_DOWN;
                        ruleApplied += "Rule_3a.";
                    }

                    if (lrcPoint.min > previousLrc15 && lrcPoint.mid >= previousLrc30) {
                        // 15 AND 30 changed direction from down to up
                        channelTilt = CHANNEL_UP;
                        ruleApplied += "Rule_3b.";
                    }

                    let logMessage = bot.processDatetime.toISOString() + "\t" + ruleApplied + "\t" + channelTilt + "\t" + lrcPoint.min + "\t" + lrcPoint.mid + "\t" + lrcPoint.mid;
                    if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> applyBotRules -> Results: " + logMessage); }

                    callBack(global.DEFAULT_OK_RESPONSE, channelTilt);

                }
            }

            function getLRCPointsFile(dateTime, onDailyFileReceived) {
                try {
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getChannelTilt -> getLRCPointsFile -> Entering function."); }

                    let periodName = "30-min";
                    let datePath = dateTime.getUTCFullYear() + "/" + pad(dateTime.getUTCMonth() + 1, 2) + "/" + pad(dateTime.getUTCDate(), 2);
                    let filePath = "AAVikings/AAGauss.1.0/AACloud.1.1/Poloniex/dataSet.V1/Output/LRC-Points/Multi-Period-Daily/" + periodName + "/" + datePath;
                    let fileName = market.assetA + '_' + market.assetB + ".json"

                    gaussStorage.getTextFile(pFilePath, pFileName, onFileReceived);

                    function onFileReceived(err, text) {
                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> getChannelTilt -> getLRCPointsFile -> onFileReceived > Entering Function."); }

                            let lrcPointsFile = JSON.parse(text);
                            onDailyFileReceived(global.DEFAULT_OK_RESPONSE, lrcPointsFile);
                        } else {
                            logger.write("[ERROR] start -> getChannelTilt -> getLRCPointsFile -> onFileReceived -> Failed to get the file. Will abort the process and request a retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                    }                    
                } catch (err) {
                    logger.write("[ERROR] start -> getChannelTilt -> getLRCPointsFile -> err = " + err.message);
                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                }
            }

            function pad(str, max) {
                str = str.toString();
                return str.length < max ? pad("0" + str, max) : str;
            }

        } catch (err) {
            logger.write("[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
        }
    }
};
