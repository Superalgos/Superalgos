exports.newCommons = function newCommons(bot, logger, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Commons -> " + bot.SESSION.name ;
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
    const GMT_SECONDS = ':00.000 GMT+0000';

    let thisObject = {
        finalize: finalize,
        runSimulation: runSimulation,
        buildPercentageBandwidthArray: buildPercentageBandwidthArray,
        buildBollingerBandsArray: buildBollingerBandsArray,
        buildBollingerChannelsArray: buildBollingerChannelsArray,
        buildBollingerSubChannelsArray: buildBollingerSubChannelsArray,
        buildCandles: buildCandles
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let percentageBandwidthAt = {}
    let bollingerBandsAt = {}
    let bollingerChannelsAt = {}
    let bollingerSubChannelsAt = {}
    let candlesAt = {}
    let processingDailyFiles

    return thisObject;

    function finalize() {
        percentageBandwidthAt = undefined
        bollingerBandsAt = undefined
        bollingerChannelsAt = undefined
        bollingerSubChannelsAt = undefined
        candlesAt = undefined
        thisObject = undefined
    }

    function runSimulation(
        timePeriod,
        timePeriodLabel,
        currentDay,
        interExecutionMemory,
        assistant,
        callback,
        callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> Entering function."); }

            if (timePeriod > global.dailyFilePeriods[0][0]) {
                processingDailyFiles = false
            } else {
                processingDailyFiles = true
            }

            let recordsArray = [];
            let conditionsArray = [];
            let strategiesArray = [];
            let tradesArray = [];

            let tradingSystem = bot.DEFINITION.tradingSystem;

            /* Initial Default Values */

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> bot.VALUES_TO_USE.timeRange.initialDatetime = " + bot.VALUES_TO_USE.timeRange.initialDatetime); }
            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> bot.VALUES_TO_USE.timeRange.finalDatetime = " + bot.VALUES_TO_USE.timeRange.finalDatetime); }

            let timerToCloseStage = 0

            /* Stop Loss Management */

            const MIN_STOP_LOSS_VALUE = 1 // We can not let the stop be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_STOP_LOSS_VALUE = Number.MAX_SAFE_INTEGER
            let stopLoss = 0;

            /* Take Profit Management */

            const MIN_TAKE_PROFIT_VALUE = 1 // We can not let the buy order be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_TAKE_PROFIT_VALUE = Number.MAX_SAFE_INTEGER
            let takeProfit = 0;

            /* Simulation Records */

            let hitRatio = 0;
            let ROI = 0;
            let days = 0;
            let positionDays = 0;
            let anualizedRateOfReturn = 0;
            let type = '""';
            let marketRate = 0;
            let takePositionNow = false
            let closePositionNow = false

            /* In some cases we need to know if we are positioned at the last candle of the calendar day, for that we need these variables. */

            let lastInstantOfTheDay = 0
            if (currentDay) {
                lastInstantOfTheDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;
            }

            /*
            The following counters need to survive multiple executions of the similator and keep themselves reliable.
            This is challenging when the simulation is executed using Daily Files, since each execution means a new
            day and these counters are meant to be kept along the whole market.

            To overcome this problem, we use the interExecutionMemory to record the values of the current execution
            when finish. But there are a few details:

            1. When the process is at the head of the market, it executes multple times at the same day.
            2. The same code serves execution from Market Files.
            3. In Daily Files we are receiving candles from the current day and previous day, so we need to take care of
               not adding to the counters duplicate info when processing the day before candles.

            To overcome these challenges we record the values of the counters and variables on the interExecutionMemory only when
            the day is complete and if we have a current Day. That menas that for Market Files we will never use
            interExecutionMemory.
            */

            /*Needed for statistics */
            let previousBalanceAssetA = 0;
            let previousBalanceAssetB = 0;

            /* Position Management */
            let tradePositionRate = 0;
            let tradePositionSize = 0;

            /* Strategy and Phase Management */
            let currentStrategyIndex = -1;
            let strategyStage = 'No Stage';

            let stopLossPhase = -1;
            let stopLossStage = 'No Stage';

            let takeProfitPhase = -1;
            let takeProfitStage = 'No Stage';

            /* These 2 objects will allow us to create separate files for each one of them. */

            let currentStrategy = {
                begin: 0,
                end: 0,
                status: 0,
                number: 0,
                beginRate: 0,
                endRate: 0
            }

            let currentTrade = {
                begin: 0,
                end: 0,
                status: 0,
                profit: 0,
                exitType: 0,
                beginRate: 0,
                endRate: 0
            }

            let balanceAssetA = bot.VALUES_TO_USE.initialBalanceA;
            let balanceAssetB = bot.VALUES_TO_USE.initialBalanceB;

            let lastTradeProfitLoss = 0;
            let profit = 0;
            let lastTradeROI = 0;

            let roundtrips = 0;
            let fails = 0;
            let hits = 0;
            let periods = 0;
            let positionPeriods = 0;

            /* Usefull counters for conditions and formulas */

            let distanceToLast = {
                triggerOn: 0,
                triggerOff: 0,
                takePosition: 0,
                closePosition: 0
            }

            /* Message to the Simulation Executor */

            let orderId = 0;
            let messageId = 0;

            let yesterday = {};

            /* Initialization */

            yesterday.stopLoss = 0
            yesterday.takeProfit = 0

            yesterday.previousBalanceAssetA = previousBalanceAssetA
            yesterday.previousBalanceAssetB = previousBalanceAssetB

            yesterday.tradePositionRate = tradePositionRate
            yesterday.tradePositionSize = tradePositionSize

            yesterday.currentStrategyIndex = currentStrategyIndex 
            yesterday.strategyStage = strategyStage

            yesterday.stopLossPhase = stopLossPhase
            yesterday.stopLossStage = stopLossStage

            yesterday.takeProfitPhase = takeProfitPhase
            yesterday.takeProfitStage = takeProfitStage

            yesterday.currentStrategy = {
                begin: 0,
                end: 0,
                status: 0,
                number: 0,
                beginRate: 0,
                endRate: 0
            }

            yesterday.currentTrade = {
                begin: 0,
                end: 0,
                status: 0,
                profit: 0,
                exitType: 0,
                beginRate: 0,
                endRate: 0
            }

            yesterday.balanceAssetA = balanceAssetA;
            yesterday.balanceAssetB = balanceAssetB;

            yesterday.lastTradeProfitLoss = 0;
            yesterday.profit = 0;
            yesterday.lastTradeROI = 0;

            yesterday.roundtrips = 0;
            yesterday.fails = 0;
            yesterday.hits = 0;
            yesterday.periods = 0;
            yesterday.positionPeriods = 0;

            yesterday.distanceToLast = {
                triggerOn: 0,
                triggerOff: 0,
                takePosition: 0,
                closePosition: 0
            }

            yesterday.orderId = 0;
            yesterday.messageId = 0;

            yesterday.hitRatio = 0;
            yesterday.ROI = 0;
            yesterday.anualizedRateOfReturn = 0;

            if (interExecutionMemory.roundtrips === undefined) {

                /* Initialize the data structure we will use inter execution. */

                interExecutionMemory.stopLoss = 0
                interExecutionMemory.takeProfit = 0

                interExecutionMemory.previousBalanceAssetA = previousBalanceAssetA
                interExecutionMemory.previousBalanceAssetB = previousBalanceAssetB

                interExecutionMemory.tradePositionRate = tradePositionRate
                interExecutionMemory.tradePositionSize = tradePositionSize

                interExecutionMemory.currentStrategyIndex = currentStrategyIndex
                interExecutionMemory.strategyStage = strategyStage

                interExecutionMemory.stopLossPhase = stopLossPhase
                interExecutionMemory.stopLossStage = stopLossStage

                interExecutionMemory.takeProfitPhase = takeProfitPhase
                interExecutionMemory.takeProfitStage = takeProfitStage

                interExecutionMemory.currentStrategy = {
                    begin: 0,
                    end: 0,
                    status: 0,
                    number: 0,
                    beginRate: 0,
                    endRate: 0
                }

                interExecutionMemory.currentTrade = {
                    begin: 0,
                    end: 0,
                    status: 0,
                    profit: 0,
                    exitType: 0,
                    beginRate: 0,
                    endRate: 0
                }

                interExecutionMemory.balanceAssetA = balanceAssetA;
                interExecutionMemory.balanceAssetB = balanceAssetB;

                interExecutionMemory.lastTradeProfitLoss = lastTradeProfitLoss;
                interExecutionMemory.profit = profit;
                interExecutionMemory.lastTradeROI = lastTradeROI;

                interExecutionMemory.roundtrips = 0;
                interExecutionMemory.fails = 0;
                interExecutionMemory.hits = 0;
                interExecutionMemory.periods = 0;
                interExecutionMemory.positionPeriods = 0;

                interExecutionMemory.distanceToLast = {
                    triggerOn: 0,
                    triggerOff: 0,
                    takePosition: 0,
                    closePosition: 0
                }

                interExecutionMemory.orderId = 0;
                interExecutionMemory.messageId = 0;

                interExecutionMemory.hitRatio = 0;
                interExecutionMemory.ROI = 0;
                interExecutionMemory.anualizedRateOfReturn = 0;

            } else {

                /* We get the initial values from the day previous to the candles we receive at the current execution */

                stopLoss = interExecutionMemory.stopLoss
                takeProfit = interExecutionMemory.takeProfit

                previousBalanceAssetA = interExecutionMemory.previousBalanceAssetA
                previousBalanceAssetB = interExecutionMemory.previousBalanceAssetB

                tradePositionRate = interExecutionMemory.tradePositionRate
                tradePositionSize = interExecutionMemory.tradePositionSize

                currentStrategyIndex = interExecutionMemory.currentStrategyIndex 
                strategyStage = interExecutionMemory.strategyStage 

                stopLossPhase = interExecutionMemory.stopLossPhase 
                stopLossStage = interExecutionMemory.stopLossStage 

                takeProfitPhase = interExecutionMemory.takeProfitPhase 
                takeProfitStage = interExecutionMemory.takeProfitStage

                currentStrategy = {
                    begin: interExecutionMemory.currentStrategy.begin,
                    end: interExecutionMemory.currentStrategy.end,
                    status: interExecutionMemory.currentStrategy.status,
                    number: interExecutionMemory.currentStrategy.number,
                    beginRate: interExecutionMemory.currentStrategy.beginRate,
                    endRate: interExecutionMemory.currentStrategy.endRate
                }

                currentTrade = {
                    begin: interExecutionMemory.currentTrade.begin,
                    end: interExecutionMemory.currentTrade.end,
                    status: interExecutionMemory.currentTrade.status,
                    profit: interExecutionMemory.currentTrade.profit,
                    exitType: interExecutionMemory.currentTrade.exitType,
                    beginRate: interExecutionMemory.currentTrade.beginRate,
                    endRate: interExecutionMemory.currentTrade.endRate
                }

                if (currentDay) {
                    if (currentDay.valueOf() >= bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf() + ONE_DAY_IN_MILISECONDS) { // Only after the first day we start grabbing the balance from this memory.

                        balanceAssetA = interExecutionMemory.balanceAssetA;
                        balanceAssetB = interExecutionMemory.balanceAssetB;

                        yesterday.balanceAssetA = balanceAssetA;
                        yesterday.balanceAssetB = balanceAssetB;

                    }
                }

                lastTradeProfitLoss = interExecutionMemory.lastTradeProfitLoss;
                profit = interExecutionMemory.profit;
                lastTradeROI = interExecutionMemory.lastTradeROI;

                roundtrips = interExecutionMemory.roundtrips;
                fails = interExecutionMemory.fails;
                hits = interExecutionMemory.hits;
                periods = interExecutionMemory.periods;
                positionPeriods = interExecutionMemory.positionPeriods;

                distanceToLast.triggerOn = interExecutionMemory.distanceToLast.triggerOn
                distanceToLast.triggerOff = interExecutionMemory.distanceToLast.triggerOff
                distanceToLast.takePosition = interExecutionMemory.distanceToLast.takePosition
                distanceToLast.closePosition = interExecutionMemory.distanceToLast.closePosition

                orderId = interExecutionMemory.orderId; // to be deprecated
                messageId = interExecutionMemory.messageId; // to be deprecated

                hitRatio = interExecutionMemory.hitRatio;
                ROI = interExecutionMemory.ROI;
                anualizedRateOfReturn = interExecutionMemory.anualizedRateOfReturn;

                /* For the case that any of these variables are not updated during the main loop, we need to store their value at the yesterday structure, otherwise it would be lost. */

                yesterday.stopLoss = stopLoss
                yesterday.takeProfit = takeProfit

                yesterday.previousBalanceAssetA = previousBalanceAssetA
                yesterday.previousBalanceAssetB = previousBalanceAssetB

                yesterday.tradePositionRate = tradePositionRate
                yesterday.tradePositionSize = tradePositionSize

                yesterday.currentStrategyIndex = currentStrategyIndex;
                yesterday.strategyStage = strategyStage;

                yesterday.stopLossPhase = stopLossPhase;
                yesterday.stopLossStage = stopLossStage;

                yesterday.takeProfitPhase = takeProfitPhase;
                yesterday.takeProfitStage = takeProfitStage;

                yesterday.currentStrategy = {
                    begin: currentStrategy.begin,
                    end: currentStrategy.end,
                    status: currentStrategy.status,
                    number: currentStrategy.number,
                    beginRate: currentStrategy.beginRate,
                    endRate: currentStrategy.endRate
                }

                yesterday.currentTrade = {
                    begin: currentTrade.begin,
                    end: currentTrade.end,
                    status: currentTrade.status,
                    profit: currentTrade.profit,
                    exitType: currentTrade.exitType,
                    beginRate: currentTrade.beginRate,
                    endRate: currentTrade.endRate
                }

                yesterday.lastTradeProfitLoss = lastTradeProfitLoss;
                yesterday.profit = profit;
                yesterday.lastTradeROI = lastTradeROI;

                yesterday.roundtrips = roundtrips;
                yesterday.fails = fails;
                yesterday.hits = hits;
                yesterday.periods = periods;
                yesterday.positionPeriods = positionPeriods;

                yesterday.distanceToLast.triggerOn = distanceToLast.triggerOn
                yesterday.distanceToLast.triggerOff = distanceToLast.triggerOff
                yesterday.distanceToLast.takePosition = distanceToLast.takePosition
                yesterday.distanceToLast.closePosition = distanceToLast.closePosition

                yesterday.hitRatio = hitRatio;
                yesterday.ROI = ROI;
                yesterday.anualizedRateOfReturn = anualizedRateOfReturn;
            }

            /* Main Array and Maps */

            let candles = candlesAt[timePeriodLabel]
            let percentageBandwidthArray = percentageBandwidthAt[timePeriodLabel]
            let bollingerBandsArray = bollingerBandsAt[timePeriodLabel]
            let bollingerChannelsArray = bollingerChannelsAt[timePeriodLabel]
            let bollingerSubChannelsArray = bollingerSubChannelsAt[timePeriodLabel]

            /* Last Candle */
            let lastCandle = candles[candles.length - 1];

            /* Main Simulation Loop: We go thourgh all the candles at this time period. */
            let i

            /* For Loop Level heartbeat */
            let loopingDay
            let previousLoopingDay

            initializeLoop()

            function initializeLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> initializeLoop -> Entering function."); }

                /* Estimate Initial Candle */

                let firstEnd = candles[0].end
                let targetEnd = bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()
                let diff = targetEnd - firstEnd
                let amount = diff / timePeriod

                i = Math.trunc(amount)
                if (i < 0) { i = 0 }
                if (i > candles.length - 1) {
                    /* This will happen when the bot.VALUES_TO_USE.timeRange.initialDatetime is beyond the last candle available, meaning that the dataSet needs to be updated with more up-to-date data. */
                    i = candles.length - 1
                }

                loop()
            }

            function loop() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Processing candle # " + i); }

                let candle = candles[i];

                /* Not processing while out of user-defined time range */

                if (candle.end < bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle before the bot.VALUES_TO_USE.timeRange.initialDatetime."); }
                    controlLoop();
                    return
                }
                if (candle.begin > bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf()) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle after the bot.VALUES_TO_USE.timeRange.finalDatetime."); }
                    afterLoop();
                    return
                }

                let percentageBandwidth = getElement(percentageBandwidthArray, candle, 'Current' + '-' + 'Percentage Bandwidth');   
                let bollingerBand = getElement(bollingerBandsArray, candle, 'Current' + '-' + 'Bollinger Band');   
                let bollingerChannel = getElement(bollingerChannelsArray, candle, 'Current' + '-' + 'Bollnger Channel');
                let bollingerSubChannel = getElement(bollingerSubChannelsArray, candle, 'Current' + '-' + 'Bollnger Sub Channel');

                let chart = {}

                if (processingDailyFiles) {
                    for (let j = 0; j < global.dailyFilePeriods.length; j++) {

                        let mapKey = dailyFilePeriods[j][1]
                        let propertyName = 'at' + mapKey.replace('-', '');

                        chart[propertyName] = {}
                        chart[propertyName].candle = getElement(candlesAt[mapKey], candle, 'Daily' + '-' + mapKey + '-' + 'Candles');
                        chart[propertyName].percentageBandwidth = getElement(percentageBandwidthAt[mapKey], candle, 'Daily' + '-' + mapKey + '-' + 'Percentage Bandwidth');
                        chart[propertyName].bollingerBand = getElement(bollingerBandsAt[mapKey], candle, 'Daily' + '-' + mapKey + '-' + 'Bollinger Band');
                        chart[propertyName].bollingerChannel = getElement(bollingerChannelsAt[mapKey], candle, 'Daily' + '-' + mapKey + '-' + 'Bollnger Channel');
                        chart[propertyName].bollingerSubChannel = getElement(bollingerSubChannelsAt[mapKey], candle, 'Daily' + '-' + mapKey + '-' + 'Bollnger Sub Channel');
                    }
                }

                for (let j = 0; j < global.marketFilesPeriods.length; j++) {

                    let mapKey = marketFilesPeriods[j][1]
                    let propertyName = 'at' + mapKey.replace('-', '');

                    chart[propertyName] = {}
                    chart[propertyName].candle = getElement(candlesAt[mapKey], candle, 'Market' + '-' + mapKey + '-' + 'Candles');
                    chart[propertyName].percentageBandwidth = getElement(percentageBandwidthAt[mapKey], candle, 'Market' + '-' + mapKey + '-' + 'Percentage Bandwidth');
                    chart[propertyName].bollingerBand = getElement(bollingerBandsAt[mapKey], candle, 'Market' + '-' + mapKey + '-' + 'Bollinger Band');
                    chart[propertyName].bollingerChannel = getElement(bollingerChannelsAt[mapKey], candle, 'Market' + '-' + mapKey + '-' + 'Bollnger Channel');
                    chart[propertyName].bollingerSubChannel = getElement(bollingerSubChannelsAt[mapKey], candle, 'Market' + '-' + mapKey + '-' + 'Bollnger Sub Channel');
                }

                /* While we are processing the previous day. */
                let positionedAtYesterday = false
                if (currentDay) {
                    positionedAtYesterday = (candle.end < currentDay.valueOf())
                }

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Candle Begin @ " + (new Date(candle.begin)).toLocaleString()) }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Candle End @ " + (new Date(candle.end)).toLocaleString()) }

                /* Assistant Info */

                let ticker = {
                    bid: candle.close,
                    ask: candle.close,
                    last: candle.close
                }

                /* We will produce a simulation level heartbeat in order to inform the user this is running. */

                loopingDay = new Date(Math.trunc(candle.begin / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                if (loopingDay.valueOf() !== previousLoopingDay) {

                    let processingDate = loopingDay.getUTCFullYear() + '-' + utilities.pad(loopingDay.getUTCMonth() + 1, 2) + '-' + utilities.pad(loopingDay.getUTCDate(), 2);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Simulation " + bot.sessionKey + " Loop # " + i + " @ " + processingDate)}
                    console.log("Jason -> " + MODULE_NAME + " -> runSimulation -> loop -> Simulation " + bot.sessionKey + " Loop # " + i + " @ " + processingDate) 
                    
                    bot.sessionHeartBeat(processingDate) // tell the world we are alive and doing well
                }
                previousLoopingDay = loopingDay.valueOf()

                /* If any of the needed indicators is missing, then that period is not calculated */
                if (bollingerBand === undefined) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle because Bollinger Band is undefined."); }
                    controlLoop();
                    return
                }
                if (percentageBandwidth === undefined) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle because %B is undefined."); }
                    controlLoop();
                    return
                } // percentageBandwidth might start after the first few candles.
                if (bollingerChannel === undefined) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle because Bollingeer Channel is undefined."); }
                    controlLoop();
                    return
                }
                if (bollingerSubChannel === undefined) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle because Bollingeer Sub Channel is undefined."); }
                    controlLoop();
                    return
                }

                //if (LRC === undefined) { controlLoop(); return}

                periods++;
                days = periods * timePeriod / ONE_DAY_IN_MILISECONDS;

                if (processingDailyFiles) { 
                    if (positionedAtYesterday) {
                        yesterday.periods = periods
                    }

                    /* We skip the candle at the head of the market because i has not closed yet. */
                    let candlesPerDay = ONE_DAY_IN_MILISECONDS / timePeriod
                    if (i === candles.length - 1) {
                        if ((candles.length < candlesPerDay) || (candles.length > candlesPerDay && candles.length < candlesPerDay * 2)) {
                            /*We are at the head of the market, thus we skip the last candle because it has not close yet. */
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle because it is the last one and has not been closed yet."); }
                            controlLoop();
                            return
                            /* Note here that in the last candle of the first day or the second day it will use an incomplete candle and partially calculated indicators.
                                if we skip these two periods, then there will be a hole in the file since the last period will be missing. */
                        }
                    }

                } else { // We are processing Market Files
                    if (i === candles.length - 1) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle because it is the last one and has not been closed yet."); }
                        controlLoop();
                        return
                    }
                }               

                let conditions = new Map;       // Here we store the conditions values that will be use in the simulator for decision making.
                let formulas = new Map;
                let conditionsArrayRecord = []; // These are the records that will be saved in a file for the plotter to consume.
                let conditionsArrayValues = []; // Here we store the conditions values that will be written on file for the plotter.
                let formulasErrors = []; // Here we store the errors produced by all phase formulas.
                let formulasValues = []; // Here we store the values produced by all phase formulas.

                /* We define and evaluate all conditions to be used later during the simulation loop. */

                conditionsArrayRecord.push(candle.begin);
                conditionsArrayRecord.push(candle.end);

                for (let j = 0; j < tradingSystem.strategies.length; j++) {

                    let strategy = tradingSystem.strategies[j];

                    let positionSize = 0
                    let positionRate = 0

                    /* Continue with the rest of the formulas and conditions */

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {

                        if (triggerStage.triggerOn !== undefined) {

                            for (let k = 0; k < triggerStage.triggerOn.situations.length; k++) {

                                let situation = triggerStage.triggerOn.situations[k];

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = j + '-' + 'triggerStage' + '-' + 'triggerOn' + '-' + k + '-' + m;

                                    if (condition.code !== undefined) {
                                        newCondition(key, condition.code);
                                    }
                                }
                            }
                        }

                        if (triggerStage.triggerOff !== undefined) {

                            for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {

                                let situation = triggerStage.triggerOff.situations[k];

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = j + '-' + 'triggerStage' + '-' + 'triggerOff' + '-' + k + '-' + m;

                                    if (condition.code !== undefined) {
                                        newCondition(key, condition.code);
                                    }
                                }
                            }
                        }

                        if (triggerStage.takePosition !== undefined) {

                            for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {

                                let situation = triggerStage.takePosition.situations[k];

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = j + '-' + 'triggerStage' + '-' + 'takePosition' + '-' + k + '-' + m;

                                    if (condition.code !== undefined) {
                                        newCondition(key, condition.code);
                                    }
                                }
                            }
                        }
                    }

                    let openStage = strategy.openStage

                    if (openStage !== undefined) {

                        /* Default Values*/
                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            positionSize = balanceAssetA;
                            positionRate = candle.close;
                        } else {
                            positionSize = balanceAssetB;
                            positionRate = candle.close;
                        }

                        let initialDefinition = openStage.initialDefinition

                        if (initialDefinition !== undefined) {

                            if (tradePositionSize !== 0) {
                                positionSize = tradePositionSize
                            } else {
                                if (initialDefinition.positionSize !== undefined) {
                                    if (initialDefinition.positionSize.formula !== undefined) {
                                        try {
                                            positionSize = eval(initialDefinition.positionSize.formula.code);
                                        } catch (err) {
                                            initialDefinition.positionSize.formula.error = err.message
                                        }
                                        if (isNaN(positionSize)) {
                                            if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                                                positionSize = balanceAssetA;
                                            } else {
                                                positionSize = balanceAssetB;
                                            }
                                        } else {
                                            if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                                                if (positionSize > balanceAssetA) { positionSize = balanceAssetA }
                                            } else {
                                                if (positionSize > balanceAssetB) { positionSize = balanceAssetB }
                                            }
                                        }
                                    }
                                }
                            }

                            if (tradePositionRate !== 0) {
                                positionRate = tradePositionRate
                            } else {
                                if (initialDefinition.positionRate !== undefined) {
                                    if (initialDefinition.positionRate.formula !== undefined) {
                                        try {
                                            positionRate = eval(initialDefinition.positionRate.formula.code);
                                        } catch (err) {
                                            initialDefinition.positionRate.formula.error = err.message
                                        }
                                        if (isNaN(positionRate)) {
                                            if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                                                positionRate = candle.close;
                                            } else {
                                                positionRate = candle.close;
                                            }
                                        }
                                    }
                                }
                            }

                            if (initialDefinition.stopLoss !== undefined) {

                                for (let p = 0; p < initialDefinition.stopLoss.phases.length; p++) {

                                    let phase = initialDefinition.stopLoss.phases[p];

                                    /* Evaluate Formula */
                                    let formulaValue
                                    let formulaError = ''

                                    if (phase.formula !== undefined) {
                                        try {
                                            formulaValue = eval(phase.formula.code);
                                            if (formulaValue === Infinity) {
                                                formulaError = "Formula evaluates to Infinity."
                                                formulaValue = MAX_STOP_LOSS_VALUE
                                                if (stopLossStage === 'Open Stage') {
                                                    formulaError = "WARNING: Formula evaluates to Infinity."
                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> initialDefinition.stopLoss -> MAX_STOP_LOSS_VALUE -> formulaError = " + formulaError); }
                                                }
                                             }
                                        } catch (err) {
                                            if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                                /*
                                                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                                */
                                            } else {
                                                formulaError = err.message
                                            }
                                        }
                                        if (isNaN(formulaValue)) { formulaValue = 0; }
                                        if (formulaValue < MIN_STOP_LOSS_VALUE) {
                                            formulaValue = MIN_STOP_LOSS_VALUE
                                            if (stopLossStage === 'Open Stage') {
                                                formulaError = "WARNING: Formula is evaluating below the MIN_STOP_LOSS_VALUE."
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> initialDefinition.stopLoss -> MIN_STOP_LOSS_VALUE -> formulaError = " + formulaError); }
                                            }
                                         }

                                        formulasErrors.push('"' + formulaError + '"')
                                        formulasValues.push(formulaValue)
                                        let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + p;
                                        formulas.set(key, formulaValue)
                                    }

                                    /* next phase event */
                                    let nextPhaseEvent = phase.nextPhaseEvent;
                                    if (nextPhaseEvent !== undefined) {

                                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                            let situation = nextPhaseEvent.situations[k];

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m];
                                                let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + p + '-' + k + '-' + m;

                                                if (condition.code !== undefined) {
                                                    newCondition(key, condition.code);
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            if (initialDefinition.takeProfit !== undefined) {

                                for (let p = 0; p < initialDefinition.takeProfit.phases.length; p++) {

                                    let phase = initialDefinition.takeProfit.phases[p];

                                    /* Evaluate Formula */
                                    let formulaValue
                                    let formulaError = ''

                                    if (phase.formula !== undefined) {
                                        try {
                                            formulaValue = eval(phase.formula.code);
                                            if (formulaValue === Infinity) {
                                                formulaValue = MAX_TAKE_PROFIT_VALUE
                                                if (takeProfitStage === 'Open Stage') {
                                                    formulaError = "WARNING: Formula evaluates to Infinity."
                                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> initialDefinition.takeProfit -> MAX_TAKE_PROFIT_VALUE -> formulaError = " + formulaError); }
                                                }
                                             }
                                        } catch (err) {
                                            if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                                /*
                                                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                                */
                                            } else {
                                                formulaError = err.message
                                            }
                                        }
                                        if (isNaN(formulaValue)) { formulaValue = 0; }
                                        if (formulaValue < MIN_TAKE_PROFIT_VALUE) {
                                            formulaValue = MIN_TAKE_PROFIT_VALUE
                                            if (takeProfitStage === 'Open Stage') {
                                                formulaError = "WARNING: Formula is evaluating below the MIN_TAKE_PROFIT_VALUE."
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> initialDefinition.takeProfit -> MIN_TAKE_PROFIT_VALUE -> formulaError = " + formulaError); }
                                            }
                                         }

                                        formulasErrors.push('"' + formulaError + '"')
                                        formulasValues.push(formulaValue)
                                        let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + p;
                                        formulas.set(key, formulaValue)
                                    }

                                    /* next phase event */
                                    let nextPhaseEvent = phase.nextPhaseEvent;
                                    if (nextPhaseEvent !== undefined) {

                                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                            let situation = nextPhaseEvent.situations[k];

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m];
                                                let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + p + '-' + k + '-' + m;

                                                if (condition.code !== undefined) {
                                                    newCondition(key, condition.code);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        strategy.positionSize = positionSize
                        strategy.positionRate = positionRate
                    }

                    let manageStage = strategy.manageStage

                    if (manageStage !== undefined) {

                        if (manageStage.stopLoss !== undefined) {

                            for (let p = 0; p < manageStage.stopLoss.phases.length; p++) {

                                let phase = manageStage.stopLoss.phases[p];

                                /* Evaluate Formula */
                                let formulaValue
                                let formulaError = ''

                                if (phase.formula !== undefined) {
                                    try {
                                        formulaValue = eval(phase.formula.code);
                                        if (formulaValue === Infinity) {
                                            formulaError = ""
                                            formulaValue = MAX_STOP_LOSS_VALUE
                                            if (stopLossStage === 'Manage Stage') {
                                                formulaError = "WARNING: Formula evaluates to Infinity."
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> manageStage.stopLoss -> MAX_STOP_LOSS_VALUE -> formulaError = " + formulaError); }
                                            }
                                         }
                                    } catch (err) {
                                        if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                            /*
                                                We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                            */
                                        } else {
                                            formulaError = err.message
                                        }
                                    }
                                    if (isNaN(formulaValue)) { formulaValue = 0; }
                                    if (formulaValue < MIN_STOP_LOSS_VALUE) {
                                        formulaValue = MIN_STOP_LOSS_VALUE
                                        if (stopLossStage === 'Manage Stage') {
                                            formulaError = "WARNING: Formula is evaluating below the MIN_STOP_LOSS_VALUE."
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> manageStage.stopLoss -> MIN_STOP_LOSS_VALUE -> formulaError = " + formulaError); }
                                        }
                                    }

                                    formulasErrors.push('"' + formulaError + '"')
                                    formulasValues.push(formulaValue)
                                    let key = j + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + p;
                                    formulas.set(key, formulaValue)
                                }

                                /* next phase event */
                                let nextPhaseEvent = phase.nextPhaseEvent;
                                if (nextPhaseEvent !== undefined) {

                                    for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                        let situation = nextPhaseEvent.situations[k];

                                        for (let m = 0; m < situation.conditions.length; m++) {

                                            let condition = situation.conditions[m];
                                            let key = j + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + p + '-' + k + '-' + m;

                                            if (condition.code !== undefined) {
                                                newCondition(key, condition.code);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (manageStage.takeProfit !== undefined) {

                            for (let p = 0; p < manageStage.takeProfit.phases.length; p++) {

                                let phase = manageStage.takeProfit.phases[p];

                                /* Evaluate Formula */
                                let formulaValue
                                let formulaError = ''

                                if (phase.formula !== undefined) {
                                    try {
                                        formulaValue = eval(phase.formula.code);
                                        if (formulaValue === Infinity) {
                                            formulaError = "Formula evaluates to Infinity."
                                            formulaValue = MAX_TAKE_PROFIT_VALUE
                                            if (takeProfitStage === 'Manage Stage') {
                                                formulaError = "WARNING: Formula evaluates to Infinity."
                                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> manageStage.takeProfit -> MAX_TAKE_PROFIT_VALUE -> formulaError = " + formulaError); }
                                            }
                                        }
                                    } catch (err) {
                                        if (phase.formula.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                            /*
                                                We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                            */
                                        } else {
                                            formulaError = err.message
                                        }
                                    }
                                    if (isNaN(formulaValue)) { formulaValue = 0; }
                                    if (formulaValue < MIN_TAKE_PROFIT_VALUE) {
                                        formulaValue = MIN_TAKE_PROFIT_VALUE
                                        if (takeProfitStage === 'Manage Stage') {
                                            formulaError = "WARNING: Formula is evaluating below the MIN_TAKE_PROFIT_VALUE."
                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[WARN] runSimulation -> loop -> manageStage.takeProfit -> MIN_TAKE_PROFIT_VALUE -> formulaError = " + formulaError); }
                                        }
                                    }

                                    formulasErrors.push('"' + formulaError + '"')
                                    formulasValues.push(formulaValue)
                                    let key = j + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + p;
                                    formulas.set(key, formulaValue)
                                }

                                /* next phase event */
                                let nextPhaseEvent = phase.nextPhaseEvent;
                                if (nextPhaseEvent !== undefined) {

                                    for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                                        let situation = nextPhaseEvent.situations[k];

                                        for (let m = 0; m < situation.conditions.length; m++) {

                                            let condition = situation.conditions[m];
                                            let key = j + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + p + '-' + k + '-' + m;

                                            if (condition.code !== undefined) {
                                                newCondition(key, condition.code);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    function newCondition(key, node) {

                        let condition;
                        let error = ''
                        let value

                        try {
                            value = eval(node.code);
                        } catch (err) {
                            /*
                                One possible error is that the conditions references a .previous that is undefined. For this
                                reason and others, we will simply set the value to false.
                            */
                            value = false

                            if (node.code.indexOf('previous') > -1 && err.message.indexOf('of undefined') > -1 || 
                                node.code.indexOf('chart') > -1 && err.message.indexOf('of undefined') > -1
                                ) {
                                /*
                                    We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                */
                            } else {
                                node.error = err.message +  " @ " + (new Date(candle.begin)).toLocaleString() 
                            }
                        }

                        condition = {
                            key: key,
                            value: value
                        };

                        conditions.set(condition.key, condition);

                        if (condition.value) {
                            conditionsArrayValues.push(1);
                        } else {
                            conditionsArrayValues.push(0);
                        }
                    }
                }

                /* Trigger On Conditions */
                if (
                    strategyStage === 'No Stage' &&
                    currentStrategyIndex === -1
                ) {
                    let minimumBalance
                    let maximumBalance
                    let balance

                    if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                        balance = balanceAssetA
                        minimumBalance = bot.VALUES_TO_USE.minimumBalanceA
                        maximumBalance = bot.VALUES_TO_USE.maximumBalanceA
                    } else {
                        balance = balanceAssetB
                        minimumBalance = bot.VALUES_TO_USE.minimumBalanceB
                        maximumBalance = bot.VALUES_TO_USE.maximumBalanceB
                    }

                    if (balance > minimumBalance && balance < maximumBalance) {

                        /*
                        Here we need to pick a strategy, or if there is not suitable strategy for the current
                        market conditions, we pass until the next period.
                
                        To pick a new strategy we will evaluate what we call the trigger on. Once we enter
                        into one strategy, we will ignore market conditions for others. However there is also
                        a strategy trigger off which can be hit before taking a position. If hit, we would
                        be outside a strategy again and looking for the condition to enter all over again.
            
                        */

                        for (let j = 0; j < tradingSystem.strategies.length; j++) {

                            let strategy = tradingSystem.strategies[j];

                            let triggerStage = strategy.triggerStage

                            if (triggerStage !== undefined) {

                                if (triggerStage.triggerOn !== undefined) {

                                    for (let k = 0; k < triggerStage.triggerOn.situations.length; k++) {

                                        let situation = triggerStage.triggerOn.situations[k];
                                        let passed = true;

                                        for (let m = 0; m < situation.conditions.length; m++) {

                                            let condition = situation.conditions[m];
                                            let key = j + '-' + 'triggerStage' + '-' + 'triggerOn' + '-' + k + '-' + m;

                                            let value = false
                                            if (conditions.get(key) !== undefined) {
                                                value = conditions.get(key).value;
                                            }

                                            if (value === false) { passed = false; }
                                        }

                                        if (passed) {

                                            strategyStage = 'Trigger Stage';
                                            currentStrategyIndex = j;
                                            currentStrategy.begin = candle.begin;
                                            currentStrategy.beginRate = candle.min;
                                            currentStrategy.endRate = candle.min; // In case the strategy does not get exited

                                            if (processingDailyFiles) {
                                                if (positionedAtYesterday) {
                                                    yesterday.strategyStage = strategyStage;
                                                    yesterday.currentStrategyIndex = currentStrategyIndex;
                                                    yesterday.currentStrategy.begin = currentStrategy.begin;
                                                    yesterday.currentStrategy.beginRate = currentStrategy.beginRate;
                                                    yesterday.currentStrategy.endRate = currentStrategy.endRate;
                                                }
                                            }

                                            distanceToLast.triggerOn = 1;

                                            if (processingDailyFiles) {
                                                if (positionedAtYesterday) {
                                                    yesterday.distanceToLast.triggerOn = distanceToLast.triggerOn
                                                }
                                            }

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Switching to Trigger Stage because conditions at Trigger On Event were met."); }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        let stopRunningDate = new Date(candle.begin)
                        if (balance <= minimumBalance) {
                            tradingSystem.error = "Min Balance @ " + stopRunningDate.toLocaleString()
                        }
                        if (balance >= maximumBalance) {
                            tradingSystem.error = "Max Balance @ " + stopRunningDate.toLocaleString()
                        }
                    }
                }

                /* Trigger Off Condition */
                if (strategyStage === 'Trigger Stage') {

                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {

                        if (triggerStage.triggerOff !== undefined) {

                            for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {

                                let situation = triggerStage.triggerOff.situations[k];
                                let passed = true;

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = currentStrategyIndex + '-' + 'triggerStage' + '-' + 'triggerOff' + '-' + k + '-' + m;

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value;
                                    }

                                    if (value === false) { passed = false; }
                                }

                                if (passed) {

                                    currentStrategy.number = currentStrategyIndex
                                    currentStrategy.end = candle.end;
                                    currentStrategy.endRate = candle.min;
                                    currentStrategy.status = 1;
                                    strategyStage = 'No Stage';
                                    currentStrategyIndex = -1;

                                    if (processingDailyFiles) {
                                        if (positionedAtYesterday) {
                                            yesterday.currentStrategy.number = currentStrategy.number;
                                            yesterday.currentStrategy.end = currentStrategy.end;
                                            yesterday.currentStrategy.endRate = currentStrategy.endRate;
                                            yesterday.currentStrategy.status = currentStrategy.status;
                                            yesterday.strategyStage = strategyStage;
                                            yesterday.currentStrategyIndex = currentStrategyIndex;
                                        }
                                    }

                                    distanceToLast.triggerOff = 1;

                                    if (processingDailyFiles) {
                                        if (positionedAtYesterday) {
                                            yesterday.distanceToLast.triggerOff = distanceToLast.triggerOff
                                        }
                                    }

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Switching to No Stage because conditions at the Trigger Off Event were met."); }
                                    break;
                                }
                            }
                        }
                    }
                }

                /* Take Position Condition */
                if (strategyStage === 'Trigger Stage') {

                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {

                        if (triggerStage.takePosition !== undefined) {

                            for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {

                                let situation = triggerStage.takePosition.situations[k];
                                let passed = true;

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = currentStrategyIndex + '-' + 'triggerStage' + '-' + 'takePosition' + '-' + k + '-' + m;

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value;
                                    }

                                    if (value === false) { passed = false; }
                                }

                                if (passed) {

                                    type = '"Take Position"';

                                    strategyStage = 'Open Stage';
                                    stopLossStage = 'Open Stage';
                                    takeProfitStage = 'Open Stage';
                                    stopLossPhase = 0;
                                    takeProfitPhase = 0;

                                    if (processingDailyFiles) {
                                        if (positionedAtYesterday) {
                                            yesterday.strategyStage = strategyStage;
                                            yesterday.stopLossStage = stopLossStage;
                                            yesterday.takeProfitStage = takeProfitStage;
                                            yesterday.stopLossPhase = stopLossPhase;
                                            yesterday.takeProfitPhase = takeProfitPhase;
                                        }
                                    }

                                    takePositionNow = true

                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Conditions at the Take Position Event were met."); }
                                    break;
                                }
                            }
                        }
                    }
                }

                /* Stop Loss Management */
                if (
                    (strategyStage === 'Open Stage' || strategyStage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {

                    checkStopPhases()
                    calculateStopLoss();

                }

                function checkStopPhases() {

                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = currentStrategyIndex
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (stopLossStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = stopLossPhase
                            }
                        }
                    }

                    if (stopLossStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = stopLossPhase - 1
                        }
                    }

                    let phase = parentNode.stopLoss.phases[p];

                    let nextPhaseEvent = phase.nextPhaseEvent;
                    if (nextPhaseEvent !== undefined) {

                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                            let situation = nextPhaseEvent.situations[k];
                            let passed = true;

                            for (let m = 0; m < situation.conditions.length; m++) {

                                let condition = situation.conditions[m];
                                let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'stopLoss' + '-' + p + '-' + k + '-' + m;

                                let value = false
                                if (conditions.get(key) !== undefined) {
                                    value = conditions.get(key).value;
                                }

                                if (value === false) { passed = false; }
                            }

                            if (passed) {

                                stopLossPhase++;
                                stopLossStage = 'Manage Stage'
                                if (takeProfitPhase > 0) { strategyStage = 'Manage Stage' }

                                if (processingDailyFiles) {
                                    if (positionedAtYesterday) {
                                        yesterday.stopLossPhase = stopLossPhase;
                                        yesterday.stopLossStage = stopLossStage;
                                        yesterday.strategyStage = strategyStage;
                                    }
                                }
                                return;
                            }
                        }
                    }
                }

                function calculateStopLoss() {

                    let strategy = tradingSystem.strategies[currentStrategyIndex];
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (stopLossStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                phase = openStage.initialDefinition.stopLoss.phases[stopLossPhase];
                                key = currentStrategyIndex + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + (stopLossPhase);
                            }
                        }
                    }

                    if (stopLossStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            phase = manageStage.stopLoss.phases[stopLossPhase - 1];
                            key = currentStrategyIndex + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + (stopLossPhase - 1);
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            stopLoss = formulas.get(key)

                            if (processingDailyFiles) {
                                if (positionedAtYesterday) {
                                    yesterday.stopLoss = stopLoss
                                }
                            }
                        }
                    }
                }

                /* Take Profit Management */
                if (
                    (strategyStage === 'Open Stage' || strategyStage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {

                    checkTakeProfitPhases();
                    calculateTakeProfit();

                }

                function checkTakeProfitPhases() {

                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = currentStrategyIndex
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (takeProfitStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = takeProfitPhase
                            }
                        }
                    }

                    if (takeProfitStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = takeProfitPhase - 1
                        }
                    }

                    let phase = parentNode.takeProfit.phases[p];

                    let nextPhaseEvent = phase.nextPhaseEvent;
                    if (nextPhaseEvent !== undefined) {

                        for (let k = 0; k < nextPhaseEvent.situations.length; k++) {

                            let situation = nextPhaseEvent.situations[k];
                            let passed = true;

                            for (let m = 0; m < situation.conditions.length; m++) {

                                let condition = situation.conditions[m];
                                let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'takeProfit' + '-' + p + '-' + k + '-' + m;

                                let value = false
                                if (conditions.get(key) !== undefined) {
                                    value = conditions.get(key).value;
                                }

                                if (value === false) { passed = false; }
                            }

                            if (passed) {

                                takeProfitPhase++;
                                takeProfitStage = 'Manage Stage'
                                if (stopLossPhase > 0) { strategyStage = 'Manage Stage' }

                                if (processingDailyFiles) {
                                    if (positionedAtYesterday) {
                                        yesterday.takeProfitPhase = takeProfitPhase;
                                        yesterday.takeProfitStage = takeProfitStage;
                                        yesterday.strategyStage = strategyStage;
                                    }
                                }
                                return;
                            }
                        }
                    }
                }

                function calculateTakeProfit() {

                    let strategy = tradingSystem.strategies[currentStrategyIndex];
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (takeProfitStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                phase = openStage.initialDefinition.takeProfit.phases[takeProfitPhase];
                                key = currentStrategyIndex + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + (takeProfitPhase);
                            }
                        }
                    }

                    if (takeProfitStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            phase = manageStage.takeProfit.phases[takeProfitPhase - 1];
                            key = currentStrategyIndex + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + (takeProfitPhase - 1);
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            takeProfit = formulas.get(key)
                            if (processingDailyFiles) {
                                if (positionedAtYesterday) {
                                    yesterday.takeProfit = takeProfit
                                }
                            }
                        }
                    }
                }

                /* Keeping Position Counters Up-to-date */
                if (
                    (strategyStage === 'Open Stage' || strategyStage === 'Manage Stage')
                ) {

                    if (takePositionNow === true) {
                        positionPeriods = 0

                        if (processingDailyFiles) { 
                            if (positionedAtYesterday) {
                                yesterday.positionPeriods = 0
                            }
                        }
                    }

                    positionPeriods++;
                    positionDays = positionPeriods * timePeriod / ONE_DAY_IN_MILISECONDS;

                    if (processingDailyFiles) { 
                        if (positionedAtYesterday) {
                            yesterday.positionPeriods = positionPeriods
                        }
                    }
                } else {
                    positionPeriods = 0
                    positionDays = 0

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.positionPeriods = 0
                        }
                    }
                }

                /* Keeping Distance Counters Up-to-date */
                if (
                    distanceToLast.triggerOn > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.triggerOn++;
           
                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.distanceToLast.triggerOn = distanceToLast.triggerOn
                        }
                    }
                }

                if (
                    distanceToLast.triggerOff > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.triggerOff++;

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.distanceToLast.triggerOff = distanceToLast.triggerOff
                        }
                    }
                }

                if (
                    distanceToLast.takePosition > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.takePosition++;

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.distanceToLast.takePosition = distanceToLast.takePosition
                        }
                    }
                }

                if (
                    distanceToLast.closePosition > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.closePosition++;

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.distanceToLast.takePosition = distanceToLast.closePosition
                        }
                    }
                }

                /* Checking if Stop or Take Profit were hit */
                if (
                    (strategyStage === 'Open Stage' || strategyStage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    /* Checking what happened since the last execution. We need to know if the Stop Loss
                        or our Take Profit were hit. */

                    /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */

                    if ((bot.VALUES_TO_USE.baseAsset === 'BTC' && candle.max >= stopLoss) || (bot.VALUES_TO_USE.baseAsset !== 'BTC' && candle.min <= stopLoss)) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Stop Loss was hit."); }
                        /*
                        Hit Point Validation

                        This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            if (stopLoss < candle.min) {
                                stopLoss = candle.min
                                if (processingDailyFiles) {
                                    if (positionedAtYesterday) {
                                        yesterday.stopLoss = stopLoss
                                    }
                                }
                            }
                        } else {
                            if (stopLoss > candle.max) {
                                stopLoss = candle.max
                                if (processingDailyFiles) {
                                    if (positionedAtYesterday) {
                                        yesterday.stopLoss = stopLoss
                                    }
                                }
                            }
                        }

                        let slippedStopLoss = stopLoss

                        /* Apply the Slippage */
                        let slippageAmount = slippedStopLoss * bot.VALUES_TO_USE.slippage.stopLoss / 100

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            slippedStopLoss = slippedStopLoss + slippageAmount
                        } else {
                            slippedStopLoss = slippedStopLoss - slippageAmount
                        }

                        let finalStopLoss = slippedStopLoss;

                        let feePaid = 0

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            strategy.positionSize = balanceAssetB / finalStopLoss;
                            strategy.positionRate = finalStopLoss;

                            feePaid = balanceAssetB / finalStopLoss * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceAssetA = balanceAssetA + balanceAssetB / finalStopLoss - feePaid;
                            balanceAssetB = 0;
                        } else {
                            strategy.positionSize = balanceAssetA * finalStopLoss;
                            strategy.positionRate = finalStopLoss;

                            feePaid = balanceAssetA * finalStopLoss * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceAssetB = balanceAssetB + balanceAssetA * finalStopLoss - feePaid;
                            balanceAssetA = 0;
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.balanceAssetA = balanceAssetA;
                                yesterday.balanceAssetB = balanceAssetB;
                            }
                        }

                        marketRate = finalStopLoss;
                        type = '"Close@StopLoss"';
                        strategyStage = 'Close Stage';
                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';
                        currentTrade.end = candle.end;
                        currentTrade.status = 1;
                        currentTrade.exitType = 1;
                        currentTrade.endRate = finalStopLoss;
 
                        closePositionNow = true;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.strategyStage = strategyStage;
                                yesterday.stopLossStage = stopLossStage;
                                yesterday.takeProfitStage = takeProfitStage;
                                yesterday.currentTrade.end = currentTrade.end;
                                yesterday.currentTrade.status = currentTrade.status;
                                yesterday.currentTrade.exitType = currentTrade.exitType;
                                yesterday.currentTrade.endRate = currentTrade.endRate;
                            }
                        }
                    }

                    /* Take Profit condition: Here we verify if the Take Profit was hit or not. */

                    if ((bot.VALUES_TO_USE.baseAsset === 'BTC' && candle.min <= takeProfit) || (bot.VALUES_TO_USE.baseAsset !== 'BTC' && candle.max >= takeProfit)) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Take Profit was hit."); }
                        /*
                        Hit Point Validation:

                        This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            if (takeProfit > candle.max) {
                                takeProfit = candle.max
                                if (processingDailyFiles) {
                                    if (positionedAtYesterday) {
                                        yesterday.takeProfit = takeProfit
                                    }
                                }
                            }
                        } else {
                            if (takeProfit < candle.min) {
                                takeProfit = candle.min
                                if (processingDailyFiles) {
                                    if (positionedAtYesterday) {
                                        yesterday.takeProfit = takeProfit
                                    }
                                }
                            }
                        }

                        let slippedTakeProfit = takeProfit
                        /* Apply the Slippage */
                        let slippageAmount = slippedTakeProfit * bot.VALUES_TO_USE.slippage.takeProfit / 100

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            slippedTakeProfit = slippedTakeProfit + slippageAmount
                        } else {
                            slippedTakeProfit = slippedTakeProfit - slippageAmount
                        }

                        let finalTakeProfit = slippedTakeProfit;

                        let feePaid = 0

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            strategy.positionSize = balanceAssetB / finalTakeProfit;
                            strategy.positionRate = finalTakeProfit;

                            feePaid = balanceAssetB / finalTakeProfit * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceAssetA = balanceAssetA + balanceAssetB / finalTakeProfit - feePaid;
                            balanceAssetB = 0;
                        } else {
                            strategy.positionSize = balanceAssetA * finalTakeProfit;
                            strategy.positionRate = finalTakeProfit;

                            feePaid = balanceAssetA * finalTakeProfit * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceAssetB = balanceAssetB + balanceAssetA * finalTakeProfit - feePaid;
                            balanceAssetA = 0;
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.balanceAssetA = balanceAssetA;
                                yesterday.balanceAssetB = balanceAssetB;

                            }
                        }

                        marketRate = finalTakeProfit;
                        type = '"Close@TakeProfit"';
                        strategyStage = 'Close Stage';
                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';

                        currentTrade.end = candle.end;
                        currentTrade.status = 1;
                        currentTrade.exitType = 2;
                        currentTrade.endRate = finalTakeProfit;
                    
                        closePositionNow = true;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.strategyStage = strategyStage;
                                yesterday.stopLossStage = stopLossStage;
                                yesterday.takeProfitStage = takeProfitStage;

                                yesterday.currentTrade.end = currentTrade.end;
                                yesterday.currentTrade.status = currentTrade.status;
                                yesterday.currentTrade.exitType = currentTrade.exitType;
                                yesterday.currentTrade.endRate = currentTrade.endRate;
                            }
                        }
                    }
                }

                /* Taking a Position */
                if (
                    takePositionNow === true
                ) {
                    takePositionNow = false
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> takePositionNow -> Entering code block."); }

                    /* Inicializing this counter */
                    distanceToLast.takePosition = 1;

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.distanceToLast.takePosition = distanceToLast.takePosition
                        }
                    }

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    tradePositionSize = strategy.positionSize;
                    tradePositionRate = strategy.positionRate;

                    /* We take what was calculated at the formula and apply the slippage. */
                    let slippageAmount = tradePositionRate * bot.VALUES_TO_USE.slippage.positionRate / 100

                    if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                        tradePositionRate = tradePositionRate - slippageAmount
                    } else {
                        tradePositionRate = tradePositionRate + slippageAmount
                    }

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.tradePositionSize = tradePositionSize;
                            yesterday.tradePositionRate = tradePositionRate;
                        }
                    }

                    /* Update the trade record information. */
                    currentTrade.begin = candle.begin;
                    currentTrade.beginRate = tradePositionRate;

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.currentTrade.begin = currentTrade.begin;
                            yesterday.currentTrade.beginRate = currentTrade.beginRate;
                        }
                    }

                    /* Check if we need to execute. */
                    if (i > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not.*/
                        /* Check that we are in LIVE MODE */
                        if (bot.startMode === "Live") {
                            /* We see if we need to put the actual order at the exchange. */
                            if (interExecutionMemory.executionContext !== undefined) {
                                switch (interExecutionMemory.executionContext.status) {
                                    case "Without a Position": { // We need to put the order because It was not put yet.
                                        if (strategy.openStage !== undefined) {
                                            if (strategy.openStage.openExecution !== undefined) {
                                                putOpeningOrder()
                                                return
                                            }
                                        }
                                        break
                                    }
                                    case "Position Closed": { // Waiting for a confirmation that the position was closed.
                                        if (strategy.openStage !== undefined) {
                                            if (strategy.openStage.openExecution !== undefined) {
                                                putOpeningOrder()
                                                return
                                            }
                                        }
                                        break
                                    }
                                    case "Taking Position": { // Waiting for a confirmation that the position was taken.
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> takePositionNow -> Exiting code block because status is Taking Position."); }
                                        break
                                    }
                                    case "In a Position": { // This should mean that we already put the order at the exchange.
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> takePositionNow -> Exiting code block because status is In a Position."); }
                                        break
                                    }
                                }
                            } else { // The context does not exist so it means we are not in a position.
                                if (strategy.openStage !== undefined) {
                                    if (strategy.openStage.openExecution !== undefined) {
                                        putOpeningOrder()
                                        return
                                    }
                                }
                            }
                        } else {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> takePositionNow -> Not trading live."); }
                        }
                    } else {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> takePositionNow -> Not the last closed candle."); }
                    }

                    takePositionAtSimulation()
                    return

                    function putOpeningOrder() {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Entering function."); }

                        /* We wont take a position unless we are withing the bot.VALUES_TO_USE.timeRange.initialDatetime and the bot.VALUES_TO_USE.timeRange.finalDatetime range */
                        if (bot.VALUES_TO_USE.timeRange.initialDatetime !== undefined) {
                            if (candle.end < bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because current candle ends before the start date.  -> bot.VALUES_TO_USE.timeRange.initialDatetime = " + bot.VALUES_TO_USE.timeRange.initialDatetime); }
                                takePositionAtSimulation()
                                return;
                            }
                        }

                        /* This validation is disbled for now because we do not have the correct end date at this point.
                        if (bot.VALUES_TO_USE.timeRange.finalDatetime !== undefined) {
                            if (candle.begin > bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> Not placing the trade at the exchange because current candle begins after the end date. -> bot.VALUES_TO_USE.timeRange.finalDatetime = " + bot.VALUES_TO_USE.timeRange.finalDatetime); }
                                takePositionAtSimulation()
                                return;
                            }
                        }
                        */

                        /* Checking the status of current positions */
                        let positions = assistant.getPositions();
                        if (positions.length > 0) {
                            let position = positions[positions.length - 1] // We are allways checking the the last position is not open.  
                            if (position.status === 'open') {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because the last position is still open. "); }
                                afterLoop();
                                return
                            }
                        }

                        /* Mechanism to avoid putting the same order over and over again at different executions of the simulation engine. */

                        if (interExecutionMemory.executionContext !== undefined) {
                            if (interExecutionMemory.executionContext.periods !== undefined) {
                                if (periods <= interExecutionMemory.executionContext.periods) {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because it was already placed at a previous execution."); }
                                    takePositionAtSimulation()
                                    return;
                                }
                            }
                        }

                        /* We are not going to place orders based on outdated information. The next filter prevents firing orders when backtesting. */
                        if (currentDay) {
                            let today = new Date(Math.trunc((new Date().valueOf()) / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                            let processDay = new Date(Math.trunc(currentDay.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                            if (today.valueOf() !== processDay.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because the current candle belongs to the previous day and that is considered simulation and not live trading."); }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> today = " + today); }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> processDay = " + processDay); }
                                takePositionAtSimulation()
                                return;
                            }
                        }

                        let openPositionRate
                        let amountA
                        let amountB
                        let positionDirection
                        let availableBalance = assistant.getAvailableBalance()

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            positionDirection = "sell"

                            openPositionRate = tradePositionRate - 100 // 100 is Provisional since we do have management of orders yet

                            amountA = tradePositionSize * openPositionRate
                            amountB = tradePositionSize

                            if (amountB > availableBalance.assetB) { // The assistant know what fees were paid.
                                amountB = availableBalance.assetB
                            }
                        } else {
                            positionDirection = "buy"

                            openPositionRate = tradePositionRate + 100 // 100 is Provisional since we do have management of orders yet

                            amountA = tradePositionSize
                            amountB = tradePositionSize / openPositionRate

                            if (amountA > availableBalance.assetA) { // The assistant know what fees were paid.
                                amountA = availableBalance.assetA
                            }
                        }

                        interExecutionMemory.executionContext = {
                            status: "Taking Position",
                            periods: periods,
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Ready to put order."); }
                        assistant.putPosition(positionDirection, openPositionRate, amountA, amountB, onOrderPut)

                        function onOrderPut(err) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> Entering function."); }

                            try {
                                switch (err.result) {
                                    case global.DEFAULT_OK_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> DEFAULT_OK_RESPONSE "); }
                                        interExecutionMemory.executionContext = {
                                            status: "In a Position",
                                            periods: periods,
                                            amountA: amountA,
                                            amountB: amountB
                                        }
                                        takePositionAtSimulation()
                                        return;
                                    }
                                    case global.DEFAULT_FAIL_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> DEFAULT_FAIL_RESPONSE "); }
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> Message = " + err.message); }
                                        strategy.openStage.openExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                    case global.DEFAULT_RETRY_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> DEFAULT_RETRY_RESPONSE "); }
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> Message = " + err.message); }
                                        strategy.openStage.openExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> Unexpected Response -> Message = " + err.message); }
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return

                            } catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] runSimulation  -> loop -> putOpeningOrder -> onOrderPut ->  err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return
                            }
                        }
                    }

                    function takePositionAtSimulation() {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> takePositionAtSimulation -> Entering function."); }

                        /* Continue with the simulation */
                        calculateTakeProfit();
                        calculateStopLoss();

                        marketRate = candle.close;

                        previousBalanceAssetA = balanceAssetA;
                        previousBalanceAssetB = balanceAssetB;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.previousBalanceAssetA = previousBalanceAssetA;
                                yesterday.previousBalanceAssetB = previousBalanceAssetB;
                            }
                        }

                        lastTradeProfitLoss = 0;
                        lastTradeROI = 0;

                        let feePaid = 0

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {

                            feePaid = tradePositionSize * tradePositionRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceAssetB = balanceAssetB + tradePositionSize * tradePositionRate - feePaid;
                            balanceAssetA = balanceAssetA - tradePositionSize;
                        } else {

                            feePaid = tradePositionSize / tradePositionRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceAssetA = balanceAssetA + tradePositionSize / tradePositionRate - feePaid;
                            balanceAssetB = balanceAssetB - tradePositionSize;
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.balanceAssetA = balanceAssetA;
                                yesterday.balanceAssetB = balanceAssetB;

                                yesterday.lastTradeProfitLoss = lastTradeProfitLoss;
                                yesterday.lastTradeROI = lastTradeROI;
                            }
                        }

                        addRecord();
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> takePositionAtSimulation -> Exiting Loop Body after taking position at simulation."); }
                        controlLoop();
                        return
                    }
                }

                if (closePositionNow === true) {

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing a Position -> Entering code block."); }

                    closePositionNow = false

                    /* Inicializing this counter */
                    distanceToLast.closePosition = 1;

                    if (processingDailyFiles) {
                        if (positionedAtYesterday) {
                            yesterday.distanceToLast.closePosition = distanceToLast.closePosition
                        }
                    }

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    if (i > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not.*/
                        /* Check that we are in LIVE MODE */
                        if (bot.startMode === "Live") {
                            /* We see if we need to put the actual order at the exchange. */
                            if (interExecutionMemory.executionContext !== undefined) {
                                switch (interExecutionMemory.executionContext.status) {
                                    case "Without a Position": { // No way to close anything at the exchange.
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing a Position -> Exiting code block because status is Without a Position."); }
                                        break
                                    }
                                    case "In a Position": { // This should mean that we already put the order at the exchange.
                                        if (strategy.closeStage !== undefined) {
                                            if (strategy.closeStage.closeExecution !== undefined) {
                                                putClosingOrder()
                                                return
                                            }
                                        }
                                        break
                                    }
                                    case "Closing Position": { // Waiting for a confirmation that the position was taken.
                                        if (strategy.closeStage !== undefined) {
                                            if (strategy.closeStage.closeExecution !== undefined) {
                                                putClosingOrder()
                                                return
                                            }
                                        }
                                        break
                                    }

                                    case "Position Closed": { //  
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing a Position -> Exiting code block because status is Position Closed."); }
                                        break
                                    }
                                }
                            }
                        }
                    } else {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing a Position -> Not within the last 10 candles."); }
                    }

                    closePositionAtSimulation()
                    return

                    function putClosingOrder() {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putClosingOrder -> Entering function."); }

                        /* Checking the status of current positions */
                        let positions = assistant.getPositions();
                        if (positions.length > 0) {
                            let position = positions[positions.length - 1] // We are allways checking the the last position is not open. 
                            if (position.status === 'open') {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> Exiting function because status of last position is Open."); }
                                afterLoop();
                                return
                            }
                        }

                        /* Mechanism to avoid putting the same order over and over again at different executions of the simulation engine. */

                        if (interExecutionMemory.executionContext !== undefined) {
                            if (interExecutionMemory.executionContext.periods !== undefined) {
                                if (periods <= interExecutionMemory.executionContext.periods) {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> Exiting function because this closing was already submited at a previous execution."); }
                                    closePositionAtSimulation()
                                    return;
                                }
                            }
                        }

                        let closePositionRate
                        let amountA
                        let amountB
                        let positionDirection
                        let availableBalance = assistant.getAvailableBalance()

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            positionDirection = "buy"

                            closePositionRate = ticker.last + 100; // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = availableBalance.assetA
                            amountB = availableBalance.assetA / closePositionRate

                        } else {
                            positionDirection = "sell"

                            closePositionRate = ticker.last - 100; // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = availableBalance.assetB * closePositionRate
                            amountB = availableBalance.assetB

                        }

                        interExecutionMemory.executionContext = {
                            status: "Closing Position",
                            periods: periods,
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> About to close position at the exchange."); }
                        assistant.putPosition(positionDirection, closePositionRate, amountA, amountB, onOrderPut)

                        function onOrderPut(err) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> onOrderPut -> Entering function."); }

                            try {
                                switch (err.result) {
                                    case global.DEFAULT_OK_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> onOrderPut -> DEFAULT_OK_RESPONSE "); }
                                        interExecutionMemory.executionContext = {
                                            status: "Position Closed",
                                            periods: periods,
                                            amountA: amountA,
                                            amountB: amountB
                                        }
                                        closePositionAtSimulation()
                                        return;
                                    }
                                    case global.DEFAULT_FAIL_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> onOrderPut -> DEFAULT_FAIL_RESPONSE "); }
                                        /* We will assume that the problem is temporary, and expect that it will work at the next execution.*/
                                        strategy.closeStage.closeExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                    case global.DEFAULT_RETRY_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderPut -> DEFAULT_RETRY_RESPONSE "); }
                                        strategy.closeStage.closeExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putClosingOrder -> onOrderPut -> Unexpected Response -> Message = " + err.message); }
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return

                            } catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] runSimulation  -> loop -> putClosingOrder -> onOrderPut ->  err = " + err.stack);
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return
                            }
                        }
                    }

                    function closePositionAtSimulation() {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> closePositionAtSimulation -> Entering function."); }

                        roundtrips++;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.roundtrips = roundtrips
                            }
                        }

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            lastTradeProfitLoss = balanceAssetA - previousBalanceAssetA;
                            lastTradeROI = lastTradeProfitLoss * 100 / tradePositionSize;
                            if (isNaN(lastTradeROI)) { lastTradeROI = 0; }
                            profit = balanceAssetA - bot.VALUES_TO_USE.initialBalanceA;
                        } else {
                            lastTradeProfitLoss = balanceAssetB - previousBalanceAssetB;
                            lastTradeROI = lastTradeProfitLoss * 100 / tradePositionSize;
                            if (isNaN(lastTradeROI)) { lastTradeROI = 0; }
                            profit = balanceAssetB - bot.VALUES_TO_USE.initialBalanceB;
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.lastTradeProfitLoss = lastTradeProfitLoss;
                                yesterday.profit = profit;
                                yesterday.lastTradeROI = lastTradeROI;
                            }
                        }

                        currentTrade.lastTradeROI = lastTradeROI;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.currentTrade.lastTradeROI = currentTrade.lastTradeROI;
                            }
                        }

                        if (lastTradeProfitLoss > 0) {
                            hits++;

                            if (processingDailyFiles) {
                                if (positionedAtYesterday) {
                                    yesterday.hits =  hits
                                }
                            }

                        } else {
                            fails++;

                            if (processingDailyFiles) {
                                if (positionedAtYesterday) {
                                    yesterday.fails = fails
                                }
                            }
                        }

                        if (bot.VALUES_TO_USE.baseAsset === 'BTC') {
                            ROI = (bot.VALUES_TO_USE.initialBalanceA + profit) / bot.VALUES_TO_USE.initialBalanceA - 1;
                            hitRatio = hits / roundtrips;
                            anualizedRateOfReturn = ROI / days * 365;
                        } else {
                            ROI = (bot.VALUES_TO_USE.initialBalanceB + profit) / bot.VALUES_TO_USE.initialBalanceB - 1;
                            hitRatio = hits / roundtrips;
                            anualizedRateOfReturn = ROI / days * 365;
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.ROI = ROI;
                                yesterday.hitRatio = hitRatio;
                                yesterday.anualizedRateOfReturn = anualizedRateOfReturn;
                            }
                        }

                        addRecord();

                        stopLoss = 0;
                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.stopLoss = stopLoss
                            }
                        }
                        takeProfit = 0;
                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.takeProfit = takeProfit
                            }
                        }

                        tradePositionRate = 0;
                        tradePositionSize = 0;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.tradePositionSize = tradePositionSize;
                                yesterday.tradePositionRate = tradePositionRate;
                            }
                        }

                        timerToCloseStage = candle.begin
                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';
                        stopLossPhase = -1;
                        takeProfitPhase = -1;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.stopLossStage = stopLossStage;
                                yesterday.takeProfitStage = takeProfitStage;
                                yesterday.stopLossPhase = stopLossPhase;
                                yesterday.takeProfitPhase = takeProfitPhase;
                            }
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> closePositionAtSimulation -> Exiting Loop Body after closing position at simulation."); }
                        controlLoop();
                        return
                    }
                }

                /* Closing the Closing Stage */
                if (strategyStage === 'Close Stage') {
                    if (candle.begin - 5 * 60 * 1000 > timerToCloseStage) {

                        currentStrategy.number = currentStrategyIndex
                        currentStrategy.end = candle.end;
                        currentStrategy.endRate = candle.min;
                        currentStrategy.status = 1;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {

                                yesterday.currentStrategy.number = currentStrategy.number;
                                yesterday.currentStrategy.end = currentStrategy.end;
                                yesterday.currentStrategy.endRate = currentStrategy.endRate;
                                yesterday.currentStrategy.status = currentStrategy.status;
                            }
                        }

                        currentStrategyIndex = -1;
                        strategyStage = 'No Stage';

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.currentStrategyIndex = currentStrategyIndex;
                                yesterday.strategyStage = strategyStage;
                            }
                        }

                        timerToCloseStage = 0

                        distanceToLast.triggerOff = 1;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.distanceToLast.triggerOff = distanceToLast.triggerOff
                            }
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing the Closing Stage -> Exiting Close Stage."); }
                    } else {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing the Closing Stage -> Waiting for timer."); }
                    }
                }

                /* Not a buy or sell condition */

                marketRate = candle.close;
                addRecord();
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Exiting Loop Body after adding a record."); }
                controlLoop();
                return

                function addRecord() {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> addRecord -> Entering function."); }

                    // Since we are going to write the message to a file that the Simulation Executor is going to read, we use the abbreviations.
                    let messageType;
                    let message;
                    let simulationRecord;
                    let executionRecord;

                    let strategyStageNumber
                    switch (strategyStage) {
                        case 'No Stage': {
                            strategyStageNumber = 0
                            break
                        }
                        case 'Trigger Stage': {
                            strategyStageNumber = 1
                            break
                        }
                        case 'Open Stage': {
                            strategyStageNumber = 2
                            break
                        }
                        case 'Manage Stage': {
                            strategyStageNumber = 3
                            break
                        }
                        case 'Close Stage': {
                            strategyStageNumber = 4
                            break
                        }
                    }

                    if (balanceAssetA === Infinity) {
                        balanceAssetA = Number.MAX_SAFE_INTEGER
                    }

                    if (balanceAssetB === Infinity) {
                        balanceAssetB = Number.MAX_SAFE_INTEGER
                    }

                    let quotedBaseAsset = '"' + bot.VALUES_TO_USE.baseAsset + '"'

                    simulationRecord = {
                        begin: candle.begin,
                        end: candle.end,
                        type: type,
                        marketRate: marketRate,
                        amount: 1,
                        balanceA: balanceAssetA,
                        balanceB: balanceAssetB,
                        profit: profit,
                        lastTradeProfitLoss: lastTradeProfitLoss,
                        stopLoss: stopLoss,
                        roundtrips: roundtrips,
                        hits: hits,
                        fails: fails,
                        hitRatio: hitRatio,
                        ROI: ROI,
                        periods: periods,
                        days: days,
                        anualizedRateOfReturn: anualizedRateOfReturn,
                        positionRate: tradePositionRate,
                        lastTradeROI: lastTradeROI,
                        strategy: currentStrategyIndex,
                        strategyStageNumber: strategyStageNumber,
                        takeProfit: takeProfit,
                        stopLossPhase: stopLossPhase,
                        takeProfitPhase: takeProfitPhase,
                        executionRecord: '',
                        positionSize: tradePositionSize,
                        initialBalanceA: bot.VALUES_TO_USE.initialBalanceA,
                        minimumBalanceA: bot.VALUES_TO_USE.minimumBalanceA,
                        maximumBalanceA: bot.VALUES_TO_USE.maximumBalanceA,
                        initialBalanceB: bot.VALUES_TO_USE.initialBalanceB,
                        minimumBalanceB: bot.VALUES_TO_USE.minimumBalanceB,
                        maximumBalanceB: bot.VALUES_TO_USE.maximumBalanceB,
                        baseAsset: quotedBaseAsset,
                        positionPeriods: positionPeriods,
                        positionDays: positionDays,
                        distanceToLastTriggerOn: distanceToLast.triggerOn,
                        distanceToLastTriggerOff: distanceToLast.triggerOff,
                        distanceToLastTakePosition: distanceToLast.takePosition,
                        distanceToLastClosePosition: distanceToLast.closePosition
                    }

                    recordsArray.push(simulationRecord);

                    type = '""';

                    /* Prepare the information for the Conditions File */

                    conditionsArrayRecord.push(currentStrategyIndex);
                    conditionsArrayRecord.push(strategyStageNumber);
                    conditionsArrayRecord.push(stopLossPhase);
                    conditionsArrayRecord.push(takeProfitPhase);
                    conditionsArrayRecord.push(conditionsArrayValues);
                    conditionsArrayRecord.push(formulasErrors);
                    conditionsArrayRecord.push(formulasValues);

                    conditionsArray.push(conditionsArrayRecord);

                    /* Prepare the information for the Strategies File*/

                    if (
                        (currentStrategy.begin !== 0 && currentStrategy.end !== 0) ||
                        (currentStrategy.begin !== 0 && i === candles.length - 1 && lastCandle.end !== lastInstantOfTheDay)
                    ) {

                        strategiesArray.push(currentStrategy);

                        currentStrategy = {
                            begin: 0,
                            end: 0,
                            status: 0,
                            number: 0,
                            beginRate: 0,
                            endRate: 0
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.currentStrategy = {
                                    begin: 0,
                                    end: 0,
                                    status: 0,
                                    number: 0,
                                    beginRate: 0,
                                    endRate: 0
                                }
                            }
                        }
                    }

                    /* Prepare the information for the Trades File */

                    if (
                        (currentTrade.begin !== 0 && currentTrade.end !== 0) ||
                        (currentTrade.begin !== 0 && i === candles.length - 1 && lastCandle.end !== lastInstantOfTheDay)
                    ) {

                        currentTrade.profit = lastTradeProfitLoss;

                        tradesArray.push(currentTrade);

                        currentTrade = {
                            begin: 0,
                            end: 0,
                            status: 0,
                            lastTradeROI: 0,
                            exitType: 0,
                            beginRate: 0,
                            endRate: 0
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.currentTrade = {
                                    begin: 0,
                                    end: 0,
                                    status: 0,
                                    lastTradeROI: 0,
                                    exitType: 0,
                                    beginRate: 0,
                                    endRate: 0
                                }
                            }
                        }
                    }
                }
            }

            function controlLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> controlLoop -> Entering function."); }

                /* Checking if we should continue processing this loop or not.*/
                if (bot.STOP_SESSION === true) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing."); }
                    console.log("[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing.")
                    afterLoop()
                    return
                }

                i++
                if (i < candles.length) {
                    setImmediate(loop) // This will execute the next loop in the next iteration of the NodeJs event loop allowing for other callbacks to be executed.
                } else {
                    afterLoop()
                }
            }

            function afterLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> afterLoop -> Entering function."); }

                /*
                Before returning we need to see if we have to record some of our counters at the interExecutionMemory.
                To do that, the condition to be met is that this execution must include all candles of the current day.
                */

                if (processingDailyFiles) {

                    if (lastCandle.end === lastInstantOfTheDay) {

                        interExecutionMemory.stopLoss = yesterday.stopLoss
                        interExecutionMemory.takeProfit = yesterday.takeProfit

                        interExecutionMemory.previousBalanceAssetA = yesterday.previousBalanceAssetA
                        interExecutionMemory.previousBalanceAssetB = yesterday.previousBalanceAssetB

                        interExecutionMemory.tradePositionRate = yesterday.tradePositionRate
                        interExecutionMemory.tradePositionSize = yesterday.tradePositionSize

                        interExecutionMemory.currentStrategyIndex = yesterday.currentStrategyIndex
                        interExecutionMemory.strategyStage = yesterday.strategyStage

                        interExecutionMemory.stopLossPhase = yesterday.stopLossPhase
                        interExecutionMemory.stopLossStage = yesterday.stopLossStage

                        interExecutionMemory.takeProfitPhase = yesterday.takeProfitPhase
                        interExecutionMemory.takeProfitStage = yesterday.takeProfitStage

                        interExecutionMemory.currentStrategy = {
                            begin: yesterday.currentStrategy.begin,
                            end: yesterday.currentStrategy.end,
                            status: yesterday.currentStrategy.status,
                            number: yesterday.currentStrategy.number,
                            beginRate: yesterday.currentStrategy.beginRate,
                            endRate: yesterday.currentStrategy.endRate
                        }

                        interExecutionMemory.currentTrade = {
                            begin: yesterday.currentTrade.begin,
                            end: yesterday.currentTrade.end,
                            status: yesterday.currentTrade.status,
                            profit: yesterday.currentTrade.profit,
                            exitType: yesterday.currentTrade.exitType,
                            beginRate: yesterday.currentTrade.beginRate,
                            endRate: yesterday.currentTrade.endRate
                        }

                        interExecutionMemory.balanceAssetA = yesterday.balanceAssetA;
                        interExecutionMemory.balanceAssetB = yesterday.balanceAssetB;
                        interExecutionMemory.lastTradeProfitLoss = yesterday.lastTradeProfitLoss;
                        interExecutionMemory.profit = yesterday.profit;
                        interExecutionMemory.lastTradeROI = yesterday.lastTradeROI;

                        interExecutionMemory.roundtrips =  yesterday.roundtrips;
                        interExecutionMemory.fails =  yesterday.fails;
                        interExecutionMemory.hits =  yesterday.hits;
                        interExecutionMemory.periods =  yesterday.periods;
                        interExecutionMemory.positionPeriods = yesterday.positionPeriods;

                        interExecutionMemory.distanceToLast.triggerOn = yesterday.distanceToLast.triggerOn
                        interExecutionMemory.distanceToLast.triggerOff = yesterday.distanceToLast.triggerOff
                        interExecutionMemory.distanceToLast.takePosition = yesterday.distanceToLast.takePosition
                        interExecutionMemory.distanceToLast.closePosition = yesterday.distanceToLast.closePosition

                        interExecutionMemory.messageId = interExecutionMemory.messageId + yesterday.messageId;
                        interExecutionMemory.orderId = interExecutionMemory.orderId + yesterday.orderId;

                        interExecutionMemory.hitRatio = yesterday.hitRatio;
                        interExecutionMemory.ROI = yesterday.ROI;
                        interExecutionMemory.anualizedRateOfReturn = yesterday.anualizedRateOfReturn;
                    }
                }

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> callback -> recordsArray.length = " + recordsArray.length); }

                callback(tradingSystem, recordsArray, conditionsArray, strategiesArray, tradesArray);
            }

            function getElement(pArray, currentCandle, datasetName) { 

                try {
                    let element;
                    for (let i = 0; i < pArray.length; i++) {
                        element = pArray[i];

                        if (currentCandle.end === element.end) { // when there is an exact match at the end we take that element
                            return element
                        } else {
                            if (
                                i > 0 &&
                                element.end > currentCandle.end
                            ) {
                                let previousElement = pArray[i - 1]
                                if (previousElement.end < currentCandle.end) {
                                    return previousElement // If one elements goes into the future of currentCandle, then we stop and take the previous element.
                                } else {
                                    return
                                }
                            }
                            if (
                                i === pArray.length - 1 // If we reach the end of the array, then we return the last element.
                                &&
                                element.end < currentCandle.end
                            ) {
                                return element
                            }
                        }
                    }
                    return
                }
                catch (err) {
                    logger.write(MODULE_NAME, "[ERROR] runSimulation -> getElement -> datasetName = " + datasetName);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] runSimulation -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildPercentageBandwidthArray(dataFile, timePeriodLabel, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildPercentageBandwidthArray -> Entering function."); }

        try {

            let percentageBandwidthArray = [];

            let previous;

            for (let i = 0; i < dataFile.length; i++) {

                let percentageBandwidth = {
                    begin: dataFile[i][0],
                    end: dataFile[i][1],
                    value: dataFile[i][2],
                    movingAverage: dataFile[i][3],
                    bandwidth: dataFile[i][4]
                };

                if (previous !== undefined) {

                    if (previous.movingAverage > percentageBandwidth.movingAverage) { percentageBandwidth.direction = 'Down'; }
                    if (previous.movingAverage < percentageBandwidth.movingAverage) { percentageBandwidth.direction = 'Up'; }
                    if (previous.movingAverage === percentageBandwidth.movingAverage) { percentageBandwidth.direction = 'Side'; }

                }

                percentageBandwidth.previous = previous;

                percentageBandwidthArray.push(percentageBandwidth);

                previous = percentageBandwidth;

            }

            percentageBandwidthAt[timePeriodLabel] = percentageBandwidthArray

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildPercentageBandwidthArray -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildBollingerBandsArray(dataFile, timePeriodLabel, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildBollingerBandsArray -> Entering function."); }

        try {

            let bollingerBandsArray = [];

            let previous;

            for (let i = 0; i < dataFile.length; i++) {

                let bollingerBand = {
                    begin: dataFile[i][0],
                    end: dataFile[i][1],
                    movingAverage: dataFile[i][2],
                    standardDeviation: dataFile[i][3],
                    deviation: dataFile[i][4]
                };

                if (previous !== undefined) {

                    if (previous.movingAverage > bollingerBand.movingAverage) { bollingerBand.direction = 'Down'; }
                    if (previous.movingAverage < bollingerBand.movingAverage) { bollingerBand.direction = 'Up'; }
                    if (previous.movingAverage === bollingerBand.movingAverage) { bollingerBand.direction = 'Side'; }

                }

                bollingerBand.previous = previous;

                bollingerBandsArray.push(bollingerBand);

                previous = bollingerBand;
            }

            bollingerBandsAt[timePeriodLabel] = bollingerBandsArray

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildBollingerBandsArray -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildBollingerChannelsArray(dataFile, timePeriodLabel, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildBollingerChannelsArray -> Entering function."); }

        try {

            let bollingerChannelsArray = [];

            let previous;

            for (let i = 0; i < dataFile.length; i++) {

                let bollingerChannel = {
                    begin: dataFile[i][0],
                    end: dataFile[i][1],
                    direction: dataFile[i][2],
                    period: dataFile[i][3]
                };

                bollingerChannel.previous = previous;

                bollingerChannelsArray.push(bollingerChannel);

                previous = bollingerChannel;
            }

            bollingerChannelsAt[timePeriodLabel] = bollingerChannelsArray

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildBollingerChannelsArray -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildBollingerSubChannelsArray(dataFile, timePeriodLabel, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildBollingerSubChannelsArray -> Entering function."); }

        try {
            let bollingerSubChannelsArray = [];

            let previous;

            for (let i = 0; i < dataFile.length; i++) {

                let bollingerSubChannel = {
                    begin: dataFile[i][0],
                    end: dataFile[i][1],
                    direction: dataFile[i][2],
                    slope: dataFile[i][3],
                    period: dataFile[i][4],
                    firstMovingAverage: dataFile[i][5],
                    lastMovingAverage: dataFile[i][6],
                    firstDeviation: dataFile[i][7],
                    lastDeviation: dataFile[i][8]
                };

                bollingerSubChannel.previous = previous;

                bollingerSubChannelsArray.push(bollingerSubChannel);

                previous = bollingerSubChannel;
            }

            bollingerSubChannelsAt[timePeriodLabel] = bollingerSubChannelsArray

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildBollingerSubChannelsArray -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildCandles(dataFile, timePeriodLabel, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildCandles -> Entering function."); }

        try {
            let candles = [];

            let previous;

            for (let i = 0; i < dataFile.length; i++) {

                let candle = {
                    open: undefined,
                    close: undefined,
                    min: 10000000000000,
                    max: 0,
                    begin: undefined,
                    end: undefined,
                    direction: undefined
                };

                candle.min = dataFile[i][0];
                candle.max = dataFile[i][1];

                candle.open = dataFile[i][2];
                candle.close = dataFile[i][3];

                candle.begin = dataFile[i][4];
                candle.end = dataFile[i][5];

                if (candle.open > candle.close) { candle.direction = 'Down'; }
                if (candle.open < candle.close) { candle.direction = 'Up'; }
                if (candle.open === candle.close) { candle.direction = 'Side'; }

                candle.previous = previous;

                candles.push(candle);

                previous = candle;
            }

            candlesAt[timePeriodLabel] = candles

        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildCandles -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};



