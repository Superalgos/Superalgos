var LRCIndicator = require('./LRCIndicator');
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

    let assistant;                           // You will receive a reference to the Traing Platform Advanced Algos Assistant at initialization.

    /*
    
    The Traing Platform Advanced Algos Assistant object represents the implementation of the assistant that will allow to create and move positions on the exchange market.

    More details about these objects:

    datasource = {
        candlesFiles: new Map,              // Complete sets of candles for different Time Periods. For Time Periods < 1hs sets are of current day only, otherwise whole market.
        candlesMap: new Map,                // The last 10 candles for each Time Period will be stored here.
        stairsFiles: new Map,               // Complete sets of patterns for different Time Periods. For Time Periods < 1hs sets are of current day only, otherwise whole market.
        stairsMap: new Map                  // The patterns we are currently in will be stored here.
    };

    assistant = {
        putPosition: putPosition,           // To create a buy or sell position.
        movePosition: movePosition          // To modify an existing position.
    };

    */

    let oliviaStorage;						// This is an example of dependency to other bots
    let commons;
    return thisObject;

    function initialize(pAssistant, callBackFunction) {
        try {
            if (LOG_INFO === true) { logger.write("[INFO] initialize -> Entering function."); }

            logger.fileName = MODULE_NAME;
            commons = COMMONS_MODULE;
            assistant = pAssistant;

            let key = "AAMasters-AAOlivia-Candles-Multi-Period-Daily-dataSet.V1";

            oliviaStorage = assistant.dataDependencies.dataSets.get(key);
            callBackFunction(global.DEFAULT_OK_RESPONSE);
        } catch (err) {
            logger.write("[ERROR] initialize -> onDone -> err = " + err.message);
            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
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
                
				if(positions.length > 0){
					
					assistant.movePosition(positions[0], currentRate, callBack);
					
					if (LOG_INFO === true) { logger.write("[INFO] start -> createBuyPosition -> Artuditu is moving an existing position to a new rate: " + currentRate.toFixed(8) + ". Position: " + JSON.stringify(positions[0])); }
					
					let message = "I'm moving an existing buy position to a new rate: " + currentRate.toFixed(8);
					assistant.sendMessage(5, "Moving Position", message);
					
				} else if(assetABalance > 0){
					
					assistant.putPosition("buy", currentRate, amountA, amountB, callBack);
					
					let message = "I'm creating a new buy position at rate: " + currentRate.toFixed(8) + ". " + MARKET.assetA +" amount: " + amountA.toFixed(8) + ". " + MARKET.assetB + " amount: "  + amountB.toFixed(8);
					assistant.sendMessage(5, "Buying", message);
										
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

				if(positions.length > 0){
					
					assistant.movePosition(positions[0], currentRate, callBack);
					
					if (LOG_INFO === true) { logger.write("[INFO] start -> createBuyPosition -> Artuditu is moving an existing position to a new rate: " + currentRate.toFixed(8) + ". Position: " + JSON.stringify(positions[0])); }
					
					let message = "I'm moving an existing sell position to a new rate: " + currentRate.toFixed(8);
					assistant.sendMessage(5, "Moving Position", message);

				}else if(assetBBalance > 0){
					
					assistant.putPosition("sell", currentRate, amountA, amountB, callBack);
					
					if (LOG_INFO === true) { logger.write("[INFO] start -> createSellPosition -> Artuditu put a new SELL Position at rate: " + currentRate + ". Amount traded asset A: " + amountA + ". Amount traded asset B: " + amountB); }
					
					let message = "I'm creating a new sell position at rate: " + currentRate.toFixed(8) + ". " + MARKET.assetA +" amount: " + amountA.toFixed(8) + ". " + MARKET.assetB + " amount: "  + amountB.toFixed(8);
					assistant.sendMessage(5, "Selling", message);
					
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
                const maxLRCDepth = 62; // 61 to be able to calculate current lrc60, plus one to calculate previous lrc60
                const maxBackwardsCount = 60;

                let backwardsCount = 0;
                let candleArray = [];

                let queryDate = new Date(bot.processDatetime);
                let candleFile = getDailyFile(queryDate, onDailyFileReceived);

                function onDailyFileReceived(err, candleFile) {
                    if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> onDailyFileReceived." ); }

                    if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                        for (let i = 0; i < candleFile.length; i++) {
                            let candle = {
                                open: undefined,
                                close: undefined,
                                min: 10000000000000,
                                max: 0,
                                begin: undefined,
                                end: undefined,
                                direction: undefined
                            };

                            candle.min = candleFile[i][0];
                            candle.max = candleFile[i][1];

                            candle.open = candleFile[i][2];
                            candle.close = candleFile[i][3];

                            candle.begin = candleFile[i][4];
                            candle.end = candleFile[i][5];

                            if (candle.open > candle.close) { candle.direction = 'down'; }
                            if (candle.open < candle.close) { candle.direction = 'up'; }
                            if (candle.open === candle.close) { candle.direction = 'side'; }
                            

                            if (LOG_INFO === true) { logger.write("[INFO] Candle Date: " + new Date(candle.begin).toISOString() + ". Process Date: " + bot.processDatetime.toISOString()); }

                            if (candleArray.length < maxLRCDepth && candle.begin <= bot.processDatetime.valueOf()) {
                                candleArray.push(candleFile[i]);
                            }
                        }
                        
                        if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> Candle Array Length: " + candleArray.length); }

                        if (candleArray.length >= maxLRCDepth) {
                            if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> All candles available proceed with LRC calculations."); }

                            performLRCCalculations(callBack);
                        }else if (backwardsCount <= maxBackwardsCount) {
                            if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> Getting file for day before."); }

                            queryDate.setDate(queryDate.getDate() - 1);
                            getDailyFile(queryDate, onDailyFileReceived);
                            backwardsCount++;
                        } else {
                            logger.write("[ERROR] start -> getChannelTilt -> Not enough history to calculate LRC.");
                            callBack(global.DEFAULT_RETRY_RESPONSE);
                        }
                    }
                }

                function performLRCCalculations(callBack){
                    /*
                    * It's needed to order since it's possible that we need to get another file and it will put an older candle at the end of the array.
                    */
                    candleArray.sort(function (a, b) {
                        return a[4] - b[4];
                    });

                    let lrcPoints = calculateLRC(candleArray);

                    let lrc15 = lrcPoints.minimumChannelValue;
                    let lrc30 = lrcPoints.middleChannelValue;
                    let lrc60 = lrcPoints.maximumChannelValue;

                    /**
                        * We take the last candle (because it's the newest) and calculate the LRC points again to detect the tilt.
                        */
                    let previousCandleArray = candleArray.slice(0, candleArray.length - 1);
                    let lrcPreviousPoints = calculateLRC(previousCandleArray);

                    let previousLrc15 = lrcPreviousPoints.minimumChannelValue;
                    let previousLrc30 = lrcPreviousPoints.middleChannelValue;
                    let previousLrc60 = lrcPreviousPoints.maximumChannelValue;
                    

                    let channelTilt = NO_CHANNEL;
                    let ruleApplied = "";

                    if (lrc60 < lrc30 && lrc15 > lrc30 && lrc30 < lrc15) {
                        if (lrc15 > previousLrc15 && lrc30 > previousLrc30 && lrc60 > previousLrc60) {
                            channelTilt = CHANNEL_UP; // The channel points UP
                            ruleApplied += "Rule_1.";
                        }
                    }

                    if (lrc15 < lrc30 && lrc60 > lrc30 && lrc30 < lrc60) {
                        if (lrc15 < previousLrc15 && lrc30 < previousLrc30 && lrc60 < previousLrc60) {
                            channelTilt = CHANNEL_DOWN; // The channel points DOWN
                            ruleApplied += "Rule_2.";
                        }
                    }

                    if (lrc15 < previousLrc15 && lrc30 <= previousLrc30) {
                        // 15 AND 30 changed direction from up to down
                        channelTilt = CHANNEL_DOWN;
                        ruleApplied += "Rule_3a.";
                    }

                    if (lrc15 > previousLrc15 && lrc30 >= previousLrc30) {
                        // 15 AND 30 changed direction from down to up
                        channelTilt = CHANNEL_UP;
                        ruleApplied += "Rule_3b.";
                    }

                    let logMessage = bot.processDatetime.toISOString() + "\t" + ruleApplied + "\t" + channelTilt + "\t" + lrc15 + "\t" + lrc30 + "\t" + lrc60 ;
                    if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> performLRCCalculations -> Results: "+ logMessage); }

                    callBack(global.DEFAULT_OK_RESPONSE, channelTilt);
                }
            }

            function getDailyFile(dateTime, onDailyFileReceived) {
                try {
                    if (FULL_LOG === true) { logger.write("[INFO] start -> getChannelTilt -> getDailyFile -> Entering function."); }

                    //TODO Hardcoded parameters
                    let periodTime = 1800000;
                    let periodName = "30-min";

                    let pFileName = MARKET.assetA + "_" + MARKET.assetB + ".json";
                    let pFilePath = "Candles/Multi-Period-Daily/";
                    pFilePath += periodName;
                    pFilePath += "/" + dateTime.getUTCFullYear();
                    pFilePath += "/" + pad(dateTime.getUTCMonth() + 1, 2);
                    pFilePath += "/" + pad(dateTime.getUTCDate(), 2);

                    oliviaStorage.getTextFile(pFilePath, pFileName, onFileReceived);

                    function onFileReceived(err, text) {
                        if (err.result === global.DEFAULT_OK_RESPONSE.result) {
                            if (FULL_LOG === true) { logger.write("[INFO] start -> getChannelTilt -> getDailyFile -> onFileReceived > Entering Function."); }

                            let candleFile = JSON.parse(text);
                            onDailyFileReceived(global.DEFAULT_OK_RESPONSE, candleFile);
                        } else {
                            logger.write("[ERROR] start -> getChannelTilt -> getDailyFile -> onFileReceived -> Failed to get the file. Will abort the process and request a retry.");
                            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                            return;
                        }
                    }                    
                } catch (err) {
                    logger.write("[ERROR] start -> getChannelTilt -> getDailyFile -> err = " + err.message);
                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                }
            }

            function calculateLRC(candlesArray) {
                if (LOG_INFO === true) { logger.write("[INFO] start -> getChannelTilt -> calculateLRC -> Entering function."); }
                
                let minimumChannelDepth = 15;
                let middleChannelDepth = 30;
                let maximumChannelDepth = 60;

                let lrcPoints = {
                    minimumChannelValue: 0,
                    middleChannelValue: 0,
                    maximumChannelValue: 0,
                    lrcTimeBegin: 0
                };

                let lrcMinIndicator = new LRCIndicator(minimumChannelDepth);
                let lrcMidIndicator = new LRCIndicator(middleChannelDepth);
                let lrcMaxIndicator = new LRCIndicator(maximumChannelDepth);
                let currentCandle = candlesArray[candlesArray.length - 1];

                for (let i = 0; i < candlesArray.length; i++) {
                    let tempCandle = candlesArray[i];
                    let averagePrice = (tempCandle[0] + tempCandle[1] + tempCandle[2] + tempCandle[3]) / 4; // TODO Check which price should be take to get the LRC
                    lrcMinIndicator.update(averagePrice);
                    lrcMidIndicator.update(averagePrice);
                    lrcMaxIndicator.update(averagePrice);
                }
                if (FULL_LOG === true) {
                    logger.write("[INFO] start -> getChannelTilt -> calculateLRC -> candlesArray.length: " + candlesArray.length + ". lrcMinIndicator: " + lrcMinIndicator.age + ". lrcMidIndicator: "
                        + lrcMidIndicator.age + ". lrcMaxIndicator: " + lrcMaxIndicator.age);
                    
                }

                if (FULL_LOG === true) {
                    logger.write("[INFO] start -> getChannelTilt -> calculateLRC -> Values: " + "lrcMinIndicator: " + lrcMinIndicator.result + ". lrcMidIndicator: "
                        + lrcMidIndicator.result + ". lrcMaxIndicator: " + lrcMaxIndicator.result);
                }

                /*
                 * Only if there is enough history the result will be calculated
                 */
                if (lrcMinIndicator.result != false && lrcMidIndicator.result != false && lrcMaxIndicator.result != false) {
                    lrcPoints.minimumChannelValue = lrcMinIndicator.result;
                    lrcPoints.middleChannelValue = lrcMidIndicator.result;
                    lrcPoints.maximumChannelValue = lrcMaxIndicator.result;
                    lrcPoints.lrcTimeBegin = currentCandle[4];

                    return lrcPoints;
                } else {
                    logger.write("[ERROR] start -> getChannelTilt -> calculateLRC -> There is not enough history to calculate the LRC.");
                    callBackFunction(global.DEFAULT_RETRY_RESPONSE);
                }
            }
        } catch (err) {
            logger.write("[ERROR] start -> err = " + err.message);
            callBackFunction(global.DEFAULT_RETRY_RESPONSE);
        }
    }
};
