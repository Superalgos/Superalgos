exports.newTradingSimulation = function newTradingSimulation(bot, logger, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
    const MODULE_NAME = "Trading Simulation -> " + bot.SESSION.name;
    
    const GMT_SECONDS = ':00.000 GMT+0000';

    let thisObject = {
        finalize: finalize,
        runSimulation: runSimulation 
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    return thisObject;

    function finalize() {
        thisObject = undefined
    }

    function runSimulation(
        chart,
        dataDependencies,
        timeFrame,
        timeFrameLabel,
        currentDay,
        interExecutionMemory,
        exchangeAPI,
        callback,
        callBackFunction) {

        try {
            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> Entering function."); }
            let processingDailyFiles
            if (timeFrame > global.dailyFilePeriods[0][0]) {
                processingDailyFiles = false
            } else {
                processingDailyFiles = true
            }

            let recordsArray = [];
            let conditionsArray = [];
            let strategiesArray = [];
            let tradesArray = [];

            let tradingSystem = bot.TRADING_SYSTEM 

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
            let previousBalanceBaseAsset = 0;
            let previousBalanceQuotedAsset = 0;

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
                endRate: 0,
                triggerOnSituation: ''
            }

            let currentTrade = {
                begin: 0,
                end: 0,
                status: 0,
                profit: 0,
                exitType: 0,
                beginRate: 0,
                endRate: 0, 
                takePositionSituation: ''
            }

            let balanceBaseAsset = bot.VALUES_TO_USE.initialBalanceA;
            let balanceQuotedAsset = bot.VALUES_TO_USE.initialBalanceB;

            let lastTradeProfitLoss = 0;
            let profit = 0;
            let lastTradeROI = 0;

            let roundtrips = 0;
            let fails = 0;
            let hits = 0;
            let periods = 0;
            let positionPeriods = 0;

            let closeRate

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

            /* Allowing these to be accesible at formulas */
            baseAsset = bot.VALUES_TO_USE.baseAsset
            quotedAsset = bot.VALUES_TO_USE.quotedAsset

            let yesterday = {};

            /* Initialization */

            yesterday.stopLoss = 0
            yesterday.takeProfit = 0

            yesterday.previousBalanceBaseAsset = previousBalanceBaseAsset
            yesterday.previousBalanceQuotedAsset = previousBalanceQuotedAsset

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
                endRate: 0,
                triggerOnSituation: ''
            }

            yesterday.currentTrade = {
                begin: 0,
                end: 0,
                status: 0,
                profit: 0,
                exitType: 0,
                beginRate: 0,
                endRate: 0,
                takePositionSituation: ''
            }

            yesterday.balanceBaseAsset = balanceBaseAsset;
            yesterday.balanceQuotedAsset = balanceQuotedAsset;

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

            if (interExecutionMemory.roundtrips === undefined) { // This just means that the inter execution memory was never used before.

                /* Initialize the data structure we will use inter execution. */

                interExecutionMemory.stopLoss = 0
                interExecutionMemory.takeProfit = 0

                interExecutionMemory.previousBalanceBaseAsset = previousBalanceBaseAsset
                interExecutionMemory.previousBalanceQuotedAsset = previousBalanceQuotedAsset

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
                    endRate: 0,
                    triggerOnSituation: ''
                }

                interExecutionMemory.currentTrade = {
                    begin: 0,
                    end: 0,
                    status: 0,
                    profit: 0,
                    exitType: 0,
                    beginRate: 0,
                    endRate: 0,
                    takePositionSituation: ''
                }

                interExecutionMemory.balanceBaseAsset = balanceBaseAsset;
                interExecutionMemory.balanceQuotedAsset = balanceQuotedAsset;

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

                interExecutionMemory.announcements = []

            } else {

                /* We get the initial values from the day previous to the candles we receive at the current execution */

                stopLoss = interExecutionMemory.stopLoss
                takeProfit = interExecutionMemory.takeProfit

                previousBalanceBaseAsset = interExecutionMemory.previousBalanceBaseAsset
                previousBalanceQuotedAsset = interExecutionMemory.previousBalanceQuotedAsset

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
                    endRate: interExecutionMemory.currentStrategy.endRate,
                    triggerOnSituation: interExecutionMemory.currentStrategy.triggerOnSituation
                }

                currentTrade = {
                    begin: interExecutionMemory.currentTrade.begin,
                    end: interExecutionMemory.currentTrade.end,
                    status: interExecutionMemory.currentTrade.status,
                    profit: interExecutionMemory.currentTrade.profit,
                    exitType: interExecutionMemory.currentTrade.exitType,
                    beginRate: interExecutionMemory.currentTrade.beginRate,
                    endRate: interExecutionMemory.currentTrade.endRate,
                    takePositionSituation: interExecutionMemory.currentTrade.takePositionSituation
                }

                if (currentDay) {
                    if (currentDay.valueOf() >= bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf() + ONE_DAY_IN_MILISECONDS) { // Only after the first day we start grabbing the balance from this memory.

                        balanceBaseAsset = interExecutionMemory.balanceBaseAsset;
                        balanceQuotedAsset = interExecutionMemory.balanceQuotedAsset;

                        yesterday.balanceBaseAsset = balanceBaseAsset;
                        yesterday.balanceQuotedAsset = balanceQuotedAsset;

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

                yesterday.previousBalanceBaseAsset = previousBalanceBaseAsset
                yesterday.previousBalanceQuotedAsset = previousBalanceQuotedAsset

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
                    endRate: currentStrategy.endRate,
                    triggerOnSituation: currentStrategy.triggerOnSituation
                }

                yesterday.currentTrade = {
                    begin: currentTrade.begin,
                    end: currentTrade.end,
                    status: currentTrade.status,
                    profit: currentTrade.profit,
                    exitType: currentTrade.exitType,
                    beginRate: currentTrade.beginRate,
                    endRate: currentTrade.endRate,
                    takePositionSituation: currentTrade.takePositionSituation
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

            let propertyName = 'at' + timeFrameLabel.replace('-', '');
            let candles = chart[propertyName].candles
            let currentChart = chart[propertyName]

            /* Last Candle */
            let lastCandle = candles[candles.length - 1];

            /* Main Simulation Loop: We go thourgh all the candles at this time period. */
            let currentCandleIndex

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
                let amount = diff / timeFrame

                currentCandleIndex = Math.trunc(amount)
                if (currentCandleIndex < 0) { currentCandleIndex = 0 }
                if (currentCandleIndex > candles.length - 1) {
                    /* This will happen when the bot.VALUES_TO_USE.timeRange.initialDatetime is beyond the last candle available, meaning that the dataSet needs to be updated with more up-to-date data. */
                    currentCandleIndex = candles.length - 1
                }

                loop()
            }

            function loop() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Processing candle # " + currentCandleIndex); }

                let announcementsToBeMade = []
                let candle = candles[currentCandleIndex];

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

                /* Here we update at the chart data structure the objects for each product representing where we are currently standing at the simulation loop */
                if (processingDailyFiles) {
                    for (let j = 0; j < global.dailyFilePeriods.length; j++) {

                        let mapKey = dailyFilePeriods[j][1]
                        let propertyName = 'at' + mapKey.replace('-', '');
                        let thisChart = chart[propertyName]

                        for (let k = 0; k < dataDependencies.length; k++) {
                            let dataDependencyNode = dataDependencies[k] 
                            if (dataDependencyNode.referenceParent.code.codeName !== 'Multi-Period-Daily') { continue }
                            let singularVariableName = dataDependencyNode.referenceParent.parentNode.code.singularVariableName
                            let pluralVariableName = dataDependencyNode.referenceParent.parentNode.code.pluralVariableName
                            let currentElement = getElement(thisChart[pluralVariableName], candle, 'Daily' + '-' + mapKey + '-' + pluralVariableName)
                            thisChart[singularVariableName] = currentElement
                        }
                    }
                }

                /* Finding the Current Element on Market Files */
                for (let j = 0; j < global.marketFilesPeriods.length; j++) {

                    let mapKey = marketFilesPeriods[j][1]
                    let propertyName = 'at' + mapKey.replace('-', '');
                    let thisChart = chart[propertyName]

                    for (let k = 0; k < dataDependencies.length; k++) {
                        let dataDependencyNode = dataDependencies[k]
                        if (dataDependencyNode.referenceParent.code.codeName !== 'Multi-Period-Market') {continue}
                        let singularVariableName = dataDependencyNode.referenceParent.parentNode.code.singularVariableName
                        let pluralVariableName = dataDependencyNode.referenceParent.parentNode.code.pluralVariableName
                        let currentElement = getElement(thisChart[pluralVariableName], candle, 'Market' + '-' + mapKey + '-' + pluralVariableName)
                        thisChart[singularVariableName] = currentElement
                    }
                }

                /* Finding the Current Element on Single Files */

                function isItInside(elementWithTimestamp, elementWithBeginEnd) {
                    if (elementWithTimestamp.timestamp >= elementWithBeginEnd.begin && elementWithTimestamp.timestamp <= elementWithBeginEnd.end) {
                        return true
                    } else {
                        return false
                    }
                }

                let propertyName = 'atAnyTimeFrame' 
                let thisChart = chart[propertyName]

                for (let k = 0; k < dataDependencies.length; k++) {
                    let dataDependencyNode = dataDependencies[k]
                    if (dataDependencyNode.referenceParent.code.codeName !== 'Single-File') { continue }
                    let singularVariableName = dataDependencyNode.referenceParent.parentNode.code.singularVariableName
                    let pluralVariableName = dataDependencyNode.referenceParent.parentNode.code.pluralVariableName
                    let elementArray = thisChart[pluralVariableName]
                    let currentElement
                    if (elementArray !== undefined) {
                        currentElement = elementArray[elementArray.length - 1]
                    }
                    thisChart[singularVariableName] = currentElement
                }

                /* While we are processing the previous day. */
                let positionedAtYesterday = false
                if (currentDay) {
                    positionedAtYesterday = (candle.end < currentDay.valueOf())
                }

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Candle Begin @ " + (new Date(candle.begin)).toLocaleString()) }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Candle End @ " + (new Date(candle.end)).toLocaleString()) }

                let ticker = {
                    bid: candle.close,
                    ask: candle.close,
                    last: candle.close
                }

                /* We will produce a simulation level heartbeat in order to inform the user this is running. */

                loopingDay = new Date(Math.trunc(candle.begin / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                if (loopingDay.valueOf() !== previousLoopingDay) {

                    let processingDate = loopingDay.getUTCFullYear() + '-' + utilities.pad(loopingDay.getUTCMonth() + 1, 2) + '-' + utilities.pad(loopingDay.getUTCDate(), 2);

                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Simulation " + bot.sessionKey + " Loop # " + currentCandleIndex + " @ " + processingDate) }

                    /*  Telling the world we are alive and doing well */
                    let fromDate = new Date(bot.VALUES_TO_USE.timeRange.initialDatetime.valueOf())
                    let lastDate = new Date(bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf())

                    let currentDateString = loopingDay.getUTCFullYear() + '-' + utilities.pad(loopingDay.getUTCMonth() + 1, 2) + '-' + utilities.pad(loopingDay.getUTCDate(), 2);
                    let currentDate = new Date(loopingDay)
                    let percentage = global.getPercentage(fromDate, currentDate, lastDate)
                    bot.processHeartBeat(currentDateString, percentage)

                    if (global.areEqualDates(currentDate, new Date()) === false) {
                        logger.newInternalLoop(bot.codeName, bot.process, currentDate, percentage);
                    }
                }
                previousLoopingDay = loopingDay.valueOf()

                /* If any of the needed data dependencies is missing for this particular candle, then we jump the candle*/
                /*
                for (let k = 0; k < dataDependencies.length; k++) {
                    let dataDependencyNode = dataDependencies[k]
                    let singularVariableName = dataDependencyNode.referenceParent.parentNode.code.singularVariableName
                    let pluralVariableName = dataDependencyNode.referenceParent.parentNode.code.pluralVariableName
                    let product = currentChart[pluralVariableName]
                    let currentElement = currentChart[singularVariableName]

                    if (currentElement === undefined) {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle because " + singularVariableName + " is undefined."); }
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> For some indicators it is normal to start after a few candles."); }
                        controlLoop();
                        return
                    }
                }
                */

                periods++;
                days = periods * timeFrame / ONE_DAY_IN_MILISECONDS;

                if (processingDailyFiles) {
                    if (positionedAtYesterday) {
                        yesterday.periods = periods
                    }

                    /* We skip the candle at the head of the market because currentCandleIndex has not closed yet. */
                    let candlesPerDay = ONE_DAY_IN_MILISECONDS / timeFrame
                    if (currentCandleIndex === candles.length - 1) {
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
                    if (currentCandleIndex === candles.length - 1) {
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

                                    if (condition.javascriptCode !== undefined) {
                                        newCondition(key, condition.javascriptCode, chart);
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

                                    if (condition.javascriptCode !== undefined) {
                                        newCondition(key, condition.javascriptCode, chart);
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

                                    if (condition.javascriptCode !== undefined) {
                                        newCondition(key, condition.javascriptCode, chart);
                                    }
                                }
                            }
                        }
                    }

                    let openStage = strategy.openStage

                    if (openStage !== undefined) {

                        /* Default Values*/
                        if (baseAsset === bot.market.baseAsset) {
                            positionSize = balanceBaseAsset;
                            positionRate = candle.close;
                        } else {
                            positionSize = balanceQuotedAsset;
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
                                            if (baseAsset === bot.market.baseAsset) {
                                                positionSize = balanceBaseAsset;
                                            } else {
                                                positionSize = balanceQuotedAsset;
                                            }
                                        } else {
                                            if (baseAsset === bot.market.baseAsset) {
                                                if (positionSize > balanceBaseAsset) { positionSize = balanceBaseAsset }
                                            } else {
                                                if (positionSize > balanceQuotedAsset) { positionSize = balanceQuotedAsset }
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
                                            if (baseAsset === bot.market.baseAsset) {
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

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart);
                                                }
                                            }
                                        }
                                    }

                                    /* move to phase events */
                                    for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                        let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                        if (moveToPhaseEvent !== undefined) {

                                            for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                                let situation = moveToPhaseEvent.situations[k];

                                                for (let m = 0; m < situation.conditions.length; m++) {

                                                    let condition = situation.conditions[m];
                                                    let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + p + '-' + n + '-' + k + '-' + m;

                                                    if (condition.javascriptCode !== undefined) {
                                                        newCondition(key, condition.javascriptCode, chart);
                                                    }
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

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart);
                                                }
                                            }
                                        }
                                    }

                                    /* move to phase events */
                                    for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                        let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                        if (moveToPhaseEvent !== undefined) {

                                            for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                                let situation = moveToPhaseEvent.situations[k];

                                                for (let m = 0; m < situation.conditions.length; m++) {

                                                    let condition = situation.conditions[m];
                                                    let key = j + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + p + '-' + n + '-' + k + '-' + m;

                                                    if (condition.javascriptCode !== undefined) {
                                                        newCondition(key, condition.javascriptCode, chart);
                                                    }
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

                                            if (condition.javascriptCode !== undefined) {
                                                newCondition(key, condition.javascriptCode, chart);
                                            }
                                        }
                                    }
                                }

                                /* move to phase events */
                                for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                    let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                    if (moveToPhaseEvent !== undefined) {

                                        for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                            let situation = moveToPhaseEvent.situations[k];

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m];
                                                let key = j + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + p + '-' + n + '-' + k + '-' + m;

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart);
                                                }
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

                                            if (condition.javascriptCode !== undefined) {
                                                newCondition(key, condition.javascriptCode, chart);
                                            }
                                        }
                                    }
                                }

                                /* move to phase events */
                                for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                                    let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                                    if (moveToPhaseEvent !== undefined) {

                                        for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                            let situation = moveToPhaseEvent.situations[k];

                                            for (let m = 0; m < situation.conditions.length; m++) {

                                                let condition = situation.conditions[m];
                                                let key = j + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + p + '-' + n + '-' + k + '-' + m;

                                                if (condition.javascriptCode !== undefined) {
                                                    newCondition(key, condition.javascriptCode, chart);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }

                    function newCondition(key, node, chart) {

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
                                node.error = err.message + " @ " + (new Date(candle.begin)).toLocaleString()
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

                    if (baseAsset === bot.market.baseAsset) {
                        balance = balanceBaseAsset
                        minimumBalance = bot.VALUES_TO_USE.minimumBalanceA
                        maximumBalance = bot.VALUES_TO_USE.maximumBalanceA
                    } else {
                        balance = balanceQuotedAsset
                        minimumBalance = bot.VALUES_TO_USE.minimumBalanceB
                        maximumBalance = bot.VALUES_TO_USE.maximumBalanceB
                    }
                    
                    let stopRunningDate = new Date(candle.begin)
                    if (balance <= minimumBalance) {
                        tradingSystem.error = "Min Balance @ " + stopRunningDate.toLocaleString()
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> " + tradingSystem.error ); }
                        afterLoop()
                        return
                    }

                    if (balance >= maximumBalance) {
                        tradingSystem.error = "Max Balance @ " + stopRunningDate.toLocaleString()
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> " + tradingSystem.error); }
                        afterLoop()
                        return
                    }

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
                                        checkAnnouncements(triggerStage)

                                        currentStrategyIndex = j;
                                        currentStrategy.begin = candle.begin;
                                        currentStrategy.beginRate = candle.min;
                                        currentStrategy.endRate = candle.min; // In case the strategy does not get exited
                                        currentStrategy.triggerOnSituation = situation.name

                                        if (processingDailyFiles) {
                                            if (positionedAtYesterday) {
                                                yesterday.strategyStage = strategyStage;
                                                yesterday.currentStrategyIndex = currentStrategyIndex;
                                                yesterday.currentStrategy.begin = currentStrategy.begin;
                                                yesterday.currentStrategy.beginRate = currentStrategy.beginRate;
                                                yesterday.currentStrategy.endRate = currentStrategy.endRate;
                                                yesterday.currentStrategy.triggerOnSituation = currentStrategy.triggerOnSituation;
                                            }
                                        }

                                        distanceToLast.triggerOn = 1;

                                        if (processingDailyFiles) {
                                            if (positionedAtYesterday) {
                                                yesterday.distanceToLast.triggerOn = distanceToLast.triggerOn
                                            }
                                        }

                                        checkAnnouncements(triggerStage.triggerOn)

                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Switching to Trigger Stage because conditions at Trigger On Event were met."); }
                                        break;
                                    }
                                }
                            }
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
                                    currentStrategy.status = 1; // This means the strategy is closed, i.e. that has a begin and end.
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

                                    checkAnnouncements(triggerStage.triggerOff)

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
                                    checkAnnouncements(strategy.openStage)

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
                                    currentTrade.takePositionSituation = situation.name
                                    
                                    checkAnnouncements(triggerStage.takePosition)

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

                    if (parentNode !== undefined) {
                        let phase = parentNode.stopLoss.phases[p];

                        /* Check the next Phase Event. */
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
                                    if (takeProfitPhase > 0) {
                                        strategyStage = 'Manage Stage'
                                        checkAnnouncements(manageStage, 'Take Profit')
                                    }

                                    if (processingDailyFiles) {
                                        if (positionedAtYesterday) {
                                            yesterday.stopLossPhase = stopLossPhase;
                                            yesterday.stopLossStage = stopLossStage;
                                            yesterday.strategyStage = strategyStage;
                                        }
                                    }

                                    checkAnnouncements(nextPhaseEvent)
                                    return;
                                }
                            }
                        }

                        /* Check the Move to Phase Events. */
                        for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                            let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                            if (moveToPhaseEvent !== undefined) {

                                for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                    let situation = moveToPhaseEvent.situations[k];
                                    let passed = true;

                                    for (let m = 0; m < situation.conditions.length; m++) {

                                        let condition = situation.conditions[m];
                                        let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'stopLoss' + '-' + p + '-' + n + '-' + k + '-' + m;

                                        let value = false
                                        if (conditions.get(key) !== undefined) {
                                            value = conditions.get(key).value;
                                        }

                                        if (value === false) { passed = false; }
                                    }

                                    if (passed) {

                                        let moveToPhase = moveToPhaseEvent.referenceParent
                                        if (moveToPhase !== undefined) {
                                            for (let q = 0; q < parentNode.stopLoss.phases.length; q++) {
                                                if (parentNode.stopLoss.phases[q].id === moveToPhase.id) {
                                                    stopLossPhase = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = "This Node needs to reference a Phase."
                                            continue
                                        }

                                        stopLossStage = 'Manage Stage'
                                        if (takeProfitPhase > 0) {
                                            strategyStage = 'Manage Stage'
                                            checkAnnouncements(manageStage, 'Take Profit')
                                        }
                                        
                                        if (processingDailyFiles) {
                                            if (positionedAtYesterday) {
                                                yesterday.stopLossPhase = stopLossPhase;
                                                yesterday.stopLossStage = stopLossStage;
                                                yesterday.strategyStage = strategyStage;
                                            }
                                        }

                                        checkAnnouncements(moveToPhaseEvent)
                                        return;
                                    }
                                }
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
                            let previousValue = stopLoss

                            stopLoss = formulas.get(key)

                            if (processingDailyFiles) {
                                if (positionedAtYesterday) {
                                    yesterday.stopLoss = stopLoss
                                }
                            }

                            if (stopLoss !== previousValue) {
                                checkAnnouncements(phase, stopLoss)
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

                    if (parentNode !== undefined) {
                        let phase = parentNode.takeProfit.phases[p];
                        if (phase === undefined) {return} // trying to jump to a phase that does not exists.

                        /* Check the next Phase Event. */
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
                                    if (stopLossPhase > 0) {
                                        strategyStage = 'Manage Stage'
                                        checkAnnouncements(manageStage, 'Stop')
                                    }

                                    if (processingDailyFiles) {
                                        if (positionedAtYesterday) {
                                            yesterday.takeProfitPhase = takeProfitPhase;
                                            yesterday.takeProfitStage = takeProfitStage;
                                            yesterday.strategyStage = strategyStage;
                                        }
                                    }

                                    checkAnnouncements(nextPhaseEvent)
                                    return;
                                }
                            }
                        }

                        /* Check the Move to Phase Events. */
                        for (let n = 0; n < phase.moveToPhaseEvents.length; n++) {
                            let moveToPhaseEvent = phase.moveToPhaseEvents[n];
                            if (moveToPhaseEvent !== undefined) {

                                for (let k = 0; k < moveToPhaseEvent.situations.length; k++) {

                                    let situation = moveToPhaseEvent.situations[k];
                                    let passed = true;

                                    for (let m = 0; m < situation.conditions.length; m++) {

                                        let condition = situation.conditions[m];
                                        let key = j + '-' + stageKey + initialDefinitionKey + '-' + 'takeProfit' + '-' + p + '-' + n + '-' + k + '-' + m;

                                        let value = false
                                        if (conditions.get(key) !== undefined) {
                                            value = conditions.get(key).value;
                                        }

                                        if (value === false) { passed = false; }
                                    }

                                    if (passed) {

                                        let moveToPhase = moveToPhaseEvent.referenceParent
                                        if (moveToPhase !== undefined) {
                                            for (let q = 0; q < parentNode.takeProfit.phases.length; q++) {
                                                if (parentNode.takeProfit.phases[q].id === moveToPhase.id) {
                                                    takeProfitPhase = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = "This Node needs to reference a Phase."
                                            continue
                                        }

                                        takeProfitStage = 'Manage Stage'
                                        if (stopLossPhase > 0) {
                                            strategyStage = 'Manage Stage'
                                            checkAnnouncements(manageStage, 'Stop')
                                        }

                                        if (processingDailyFiles) {
                                            if (positionedAtYesterday) {
                                                yesterday.takeProfitPhase = takeProfitPhase;
                                                yesterday.takeProfitStage = takeProfitStage;
                                                yesterday.strategyStage = strategyStage;
                                            }
                                        }

                                        checkAnnouncements(moveToPhaseEvent)
                                        return;
                                    }
                                }
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

                            let previousValue = stopLoss

                            takeProfit = formulas.get(key)
                            if (processingDailyFiles) {
                                if (positionedAtYesterday) {
                                    yesterday.takeProfit = takeProfit
                                }
                            }

                            if (takeProfit !== previousValue) {
                                checkAnnouncements(phase, takeProfit)
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
                    positionDays = positionPeriods * timeFrame / ONE_DAY_IN_MILISECONDS;

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

                    if ((baseAsset === bot.market.baseAsset && candle.max >= stopLoss) || (baseAsset !== bot.market.baseAsset && candle.min <= stopLoss)) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Stop Loss was hit."); }
                        /*
                        Hit Point Validation

                        This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (baseAsset === bot.market.baseAsset) {
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

                        if (baseAsset === bot.market.baseAsset) {
                            slippedStopLoss = slippedStopLoss + slippageAmount
                        } else {
                            slippedStopLoss = slippedStopLoss - slippageAmount
                        }

                        closeRate = slippedStopLoss;

                        marketRate = closeRate;
                        type = '"Close@StopLoss"';
                        strategyStage = 'Close Stage';
                        checkAnnouncements(strategy.closeStage, 'Stop')

                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';
                        currentTrade.end = candle.end;
                        currentTrade.status = 1;
                        currentTrade.exitType = 1;
                        currentTrade.endRate = closeRate;

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

                    if ((baseAsset === bot.market.baseAsset && candle.min <= takeProfit) || (baseAsset !== bot.market.baseAsset && candle.max >= takeProfit)) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Take Profit was hit."); }
                        /*
                        Hit Point Validation:

                        This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (baseAsset === bot.market.baseAsset) {
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

                        if (baseAsset === bot.market.baseAsset) {
                            slippedTakeProfit = slippedTakeProfit + slippageAmount
                        } else {
                            slippedTakeProfit = slippedTakeProfit - slippageAmount
                        }

                        closeRate = slippedTakeProfit;

                        marketRate = closeRate;
                        type = '"Close@TakeProfit"';
                        strategyStage = 'Close Stage';
                        checkAnnouncements(strategy.closeStage, 'Take Profit')

                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';

                        currentTrade.end = candle.end;
                        currentTrade.status = 1;
                        currentTrade.exitType = 2;
                        currentTrade.endRate = closeRate;

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

                    if (baseAsset === bot.market.baseAsset) {
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
                    if (currentCandleIndex > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not.*/
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

                        /*We wont take a position if we are past the final datetime */
                        if (bot.VALUES_TO_USE.timeRange.finalDatetime !== undefined) {
                            if (candle.begin > bot.VALUES_TO_USE.timeRange.finalDatetime.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> Not placing the trade at the exchange because current candle begins after the end date. -> bot.VALUES_TO_USE.timeRange.finalDatetime = " + bot.VALUES_TO_USE.timeRange.finalDatetime); }
                                takePositionAtSimulation()
                                return;
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

                        let orderPrice
                        let amountA
                        let amountB
                        let orderSide
 

                        if (baseAsset === bot.market.baseAsset) {
                            orderSide = "sell"

                            orderPrice = tradePositionRate - 100 // This is going to be ingnored at the Exchange API for now since we only put market orders.

                            amountA = tradePositionSize * orderPrice
                            amountB = tradePositionSize
 
                        } else {
                            orderSide = "buy"

                            orderPrice = tradePositionRate // This is going to be ingnored at the Exchange API for now since we only put market orders.

                            amountA = tradePositionSize
                            amountB = tradePositionSize / orderPrice

                        }

                        interExecutionMemory.executionContext = {
                            status: "Taking Position",
                            periods: periods,
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Ready to create order."); }
                        exchangeAPI.createOrder(bot.market, orderSide, orderPrice, amountA, amountB, onOrderCreated)

                        function onOrderCreated(err, order) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Entering function."); }

                            try {
                                switch (err.result) {
                                    case global.DEFAULT_OK_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_OK_RESPONSE "); }
                                        interExecutionMemory.executionContext = {
                                            status: "In a Position",
                                            periods: periods,
                                            amountA: amountA,
                                            amountB: amountB,
                                            orderId: order.id
                                        }
                                        takePositionAtSimulation()
                                        return;
                                    }
                                    case global.DEFAULT_FAIL_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_FAIL_RESPONSE "); }
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Message = " + err.message); }
                                        strategy.openStage.openExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                    case global.DEFAULT_RETRY_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_RETRY_RESPONSE "); }
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Message = " + err.message); }
                                        strategy.openStage.openExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> Unexpected Response -> Message = " + err.message); }
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return

                            } catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] runSimulation  -> loop -> putOpeningOrder -> onOrderCreated ->  err = " + err.stack);
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

                        previousBalanceBaseAsset = balanceBaseAsset;
                        previousBalanceQuotedAsset = balanceQuotedAsset;

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.previousBalanceBaseAsset = previousBalanceBaseAsset;
                                yesterday.previousBalanceQuotedAsset = previousBalanceQuotedAsset;
                            }
                        }

                        lastTradeProfitLoss = 0;
                        lastTradeROI = 0;

                        let feePaid = 0

                        if (baseAsset === bot.market.baseAsset) {

                            feePaid = tradePositionSize * tradePositionRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceQuotedAsset = balanceQuotedAsset + tradePositionSize * tradePositionRate - feePaid;
                            balanceBaseAsset = balanceBaseAsset - tradePositionSize;
                        } else {

                            feePaid = tradePositionSize / tradePositionRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceBaseAsset = balanceBaseAsset + tradePositionSize / tradePositionRate - feePaid;
                            balanceQuotedAsset = balanceQuotedAsset - tradePositionSize;
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.balanceBaseAsset = balanceBaseAsset;
                                yesterday.balanceQuotedAsset = balanceQuotedAsset;

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

                    if (currentCandleIndex > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not.*/
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

                        let orderPrice
                        let amountA
                        let amountB
                        let orderSide

                        if (baseAsset === bot.market.baseAsset) {
                            orderSide = "buy"

                            orderPrice = ticker.last + 100; // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA =  balanceQuotedAsset 
                            amountB = balanceQuotedAsset / orderPrice

                        } else {
                            orderSide = "sell"

                            orderPrice = ticker.last - 100; // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = balanceBaseAsset * orderPrice
                            amountB = balanceBaseAsset

                        }

                        interExecutionMemory.executionContext = {
                            status: "Closing Position",
                            periods: periods,
                        }

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> About to close position at the exchange."); }
                        exchangeAPI.createOrder(bot.market, orderSide, orderPrice, amountA, amountB, onOrderCreated)

                        function onOrderCreated(err, order) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> Entering function."); }

                            try {
                                switch (err.result) {
                                    case global.DEFAULT_OK_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> DEFAULT_OK_RESPONSE "); }
                                        interExecutionMemory.executionContext = {
                                            status: "Position Closed",
                                            periods: periods,
                                            amountA: amountA,
                                            amountB: amountB,
                                            orderId: order.id
                                        }
                                        closePositionAtSimulation()
                                        return;
                                    }
                                    case global.DEFAULT_FAIL_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> DEFAULT_FAIL_RESPONSE "); }
                                        /* We will assume that the problem is temporary, and expect that it will work at the next execution.*/
                                        strategy.closeStage.closeExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                    case global.DEFAULT_RETRY_RESPONSE.result: {
                                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> onOrderCreated -> DEFAULT_RETRY_RESPONSE "); }
                                        strategy.closeStage.closeExecution.error = err.message
                                        afterLoop()
                                        return;
                                    }
                                }
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[ERROR] runSimulation -> loop -> putClosingOrder -> onOrderCreated -> Unexpected Response -> Message = " + err.message); }
                                callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                                return

                            } catch (err) {
                                logger.write(MODULE_NAME, "[ERROR] runSimulation  -> loop -> putClosingOrder -> onOrderCreated ->  err = " + err.stack);
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

                        let feePaid = 0

                        if (baseAsset === bot.market.baseAsset) {
                            strategy.positionSize = balanceQuotedAsset / closeRate;
                            strategy.positionRate = closeRate;

                            feePaid = balanceQuotedAsset / closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceBaseAsset = balanceBaseAsset + balanceQuotedAsset / closeRate - feePaid;
                            balanceQuotedAsset = 0;
                        } else {
                            strategy.positionSize = balanceBaseAsset * closeRate;
                            strategy.positionRate = closeRate;

                            feePaid = balanceBaseAsset * closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            balanceQuotedAsset = balanceQuotedAsset + balanceBaseAsset * closeRate - feePaid;
                            balanceBaseAsset = 0;
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.balanceBaseAsset = balanceBaseAsset;
                                yesterday.balanceQuotedAsset = balanceQuotedAsset;

                            }
                        }

                        if (baseAsset === bot.market.baseAsset) {
                            lastTradeProfitLoss = balanceBaseAsset - previousBalanceBaseAsset;
                            lastTradeROI = lastTradeProfitLoss * 100 / tradePositionSize;
                            if (isNaN(lastTradeROI)) { lastTradeROI = 0; }
                            profit = balanceBaseAsset - bot.VALUES_TO_USE.initialBalanceA;
                        } else {
                            lastTradeProfitLoss = balanceQuotedAsset - previousBalanceQuotedAsset;
                            lastTradeROI = lastTradeProfitLoss * 100 / tradePositionSize;
                            if (isNaN(lastTradeROI)) { lastTradeROI = 0; }
                            profit = balanceQuotedAsset - bot.VALUES_TO_USE.initialBalanceB;
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
                                    yesterday.hits = hits
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

                        if (baseAsset === bot.market.baseAsset) {
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
                        currentStrategy.status = 1; // This means the strategy is closed, i.e. that has a begin and end.

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

                    if (balanceBaseAsset === Infinity) {
                        balanceBaseAsset = Number.MAX_SAFE_INTEGER
                    }

                    if (balanceQuotedAsset === Infinity) {
                        balanceQuotedAsset = Number.MAX_SAFE_INTEGER
                    }

                    let quotedBaseAsset = '"' + baseAsset + '"'
                    let quotedQuotedAsset = '"' + quotedAsset + '"'

                    simulationRecord = {
                        begin: candle.begin,
                        end: candle.end,
                        type: type,
                        marketRate: marketRate,
                        amount: 1,
                        balanceA: balanceBaseAsset,
                        balanceB: balanceQuotedAsset,
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
                        quotedAsset: quotedQuotedAsset,
                        marketBaseAsset: '"' + bot.market.baseAsset + '"',
                        marketQuotedAsset: '"' + bot.market.quotedAsset +  '"' ,
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

                    /* 
                    Lets see if there will be an open strategy ...
                    Except if we are at the head of the market (remember we skipped the last candle for not being closed.)
                    */
                    if (currentStrategy.begin !== 0 && currentStrategy.end === 0 && currentCandleIndex === candles.length - 2 && lastCandle.end !== lastInstantOfTheDay) {
                        currentStrategy.status = 2; // This means the strategy is open, i.e. that has a begin but no end.
                        currentStrategy.end = candle.end
                    }
                    
                    /* Prepare the information for the Strategies File*/
                    if (currentStrategy.begin !== 0 && currentStrategy.end !== 0)            
                     {
                        strategiesArray.push(currentStrategy);

                        currentStrategy = {
                            begin: 0,
                            end: 0,
                            status: 0,
                            number: 0,
                            beginRate: 0,
                            endRate: 0,
                            triggerOnSituation: ''
                        }

                        if (processingDailyFiles) {
                            if (positionedAtYesterday) {
                                yesterday.currentStrategy = {
                                    begin: 0,
                                    end: 0,
                                    status: 0,
                                    number: 0,
                                    beginRate: 0,
                                    endRate: 0,
                                    triggerOnSituation: ''
                                }
                            }
                        }
                    }

                    /* 
                    Lets see if there will be an open trade ...
                    Except if we are at the head of the market (remember we skipped the last candle for not being closed.)
                    */
                    if (currentTrade.begin !== 0 && currentTrade.end === 0 && currentCandleIndex === candles.length - 2 && lastCandle.end !== lastInstantOfTheDay) {
                        currentTrade.status = 2; // This means the trade is open 
                        currentTrade.end = candle.end
                        currentTrade.endRate = candle.close

                        /* Here we will calculate the ongoing ROI */
                        if (baseAsset === bot.market.baseAsset) {
                            currentTrade.lastTradeROI = (tradePositionRate - candle.close) / tradePositionRate * 100
                        } else {
                            currentTrade.lastTradeROI = (candle.close - tradePositionRate) / tradePositionRate * 100
                        }
                    }

                    /* Prepare the information for the Trades File */
                    if (currentTrade.begin !== 0 && currentTrade.end !== 0) { 

                        currentTrade.profit = lastTradeProfitLoss;

                        tradesArray.push(currentTrade);

                        currentTrade = {
                            begin: 0,
                            end: 0,
                            status: 0,
                            lastTradeROI: 0,
                            exitType: 0,
                            beginRate: 0,
                            endRate: 0,
                            takePositionSituation: ''
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
                                    endRate: 0,
                                    takePositionSituation: ''
                                }
                            }
                        }
                    }

                    makeAnnoucements() // After everything at the simulation level was done, we will do the annoucements that are pending.
                }

                function checkAnnouncements(node, value) {
                    /*
                    Value is an optional parameter that represents the value that the announcement is monitoring for change (for numeric values only).
                    If we do receive this value, we will only make the annoucement if the variance is grater than the user pre-defined value
                    for this variance.
                    */

                    if (node.announcements !== undefined) {
                        for (let i = 0; i < node.announcements.length; i++) {
                            let announcement = node.announcements[i]
                            let key = node.type + "-" + announcement.name + "-" + announcement.id

                            let lastPeriodAnnounced = -1
                            let newAnnouncementRecord = {}

                            for (let j = 0; j < interExecutionMemory.announcements.length; j++) {
                                let announcementRecord = interExecutionMemory.announcements[j]
                                if (announcementRecord.key === key) {
                                    lastPeriodAnnounced = announcementRecord.periods
                                    newAnnouncementRecord = announcementRecord
                                    break
                                }
                            }

                            if (periods > lastPeriodAnnounced) {

                                if (isNaN(value) === false) {
                                    /* The Value Variation is what tells us how much the value already announced must change in order to annouce it again. */
                                    let valueVariation

                                    let code = announcement.code
                                    valueVariation = code.valueVariation

                                    if (newAnnouncementRecord.value !== undefined && valueVariation !== undefined) {
                                        let upperLimit = newAnnouncementRecord.value + newAnnouncementRecord.value * valueVariation / 100
                                        let lowerLimit = newAnnouncementRecord.value - newAnnouncementRecord.value * valueVariation / 100
                                        if (value > lowerLimit && value < upperLimit) {
                                            /* There is not enough variation to announce this again. */
                                            return
                                        }
                                    }
                                }

                                /*
                                We store the announcement temporarily at an Array to differ its execution, becasue we need to evaulate its formula
                                and at this point in time the potential variables used at the formula are still not set.
                                */
                                announcement.value = value
                                announcementsToBeMade.push(announcement)

                                /* Next, we will remmeber this announcement was already done, so that it is not announced again in further processing of the same day. */
                                if (newAnnouncementRecord.periods !== undefined) {
                                    newAnnouncementRecord.periods = periods
                                    newAnnouncementRecord.value = value
                                } else {
                                    newAnnouncementRecord = {
                                        key: key,
                                        periods: periods,
                                        value: value
                                    }
                                    interExecutionMemory.announcements.push(newAnnouncementRecord)
                                }
                            }
                        }
                    }
                }

                function makeAnnoucements() {
                    /* Here we go through all the annoucements that need to be done during this loop, and we just do them. */
                    for (let i = 0; i < announcementsToBeMade.length; i++) {
                        announcement = announcementsToBeMade[i]
                        /* Here we check if there is a formula attached to the annoucement, we evaluate it to get the annoucement text. */
                        let formulaValue
                        if (announcement.formula !== undefined) {
                            try {
                                let value = announcement.value
                                formulaValue = eval(announcement.formula.code);
                            } catch (err) {
                                announcement.formula.error = err.message
                            }
                        }
                        announcement.formulaValue = formulaValue

                        if (bot.SESSION.socialBots !== undefined) {
                            bot.SESSION.socialBots.announce(announcement)
                        }
                    }
                }
            }



            function controlLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> controlLoop -> Entering function."); }

                /* Checking if we should continue processing this loop or not.*/
                if (bot.STOP_SESSION === true) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session."); }
                    console.log("[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this session.")
                    afterLoop()
                    return
                }

                if (global.STOP_TASK_GRACEFULLY === true) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task."); }
                    console.log("[INFO] runSimulation -> controlLoop -> We are going to stop here bacause we were requested to stop processing this task.")
                    afterLoop()
                    return
                }

                currentCandleIndex++
                if (currentCandleIndex < candles.length) {
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

                        interExecutionMemory.previousBalanceBaseAsset = yesterday.previousBalanceBaseAsset
                        interExecutionMemory.previousBalanceQuotedAsset = yesterday.previousBalanceQuotedAsset

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
                            endRate: yesterday.currentStrategy.endRate,
                            triggerOnSituation: yesterday.currentStrategy.triggerOnSituation
                        }

                        interExecutionMemory.currentTrade = {
                            begin: yesterday.currentTrade.begin,
                            end: yesterday.currentTrade.end,
                            status: yesterday.currentTrade.status,
                            profit: yesterday.currentTrade.profit,
                            exitType: yesterday.currentTrade.exitType,
                            beginRate: yesterday.currentTrade.beginRate,
                            endRate: yesterday.currentTrade.endRate,
                            takePositionSituation: yesterday.currentTrade.takePositionSituation
                        }

                        interExecutionMemory.balanceBaseAsset = yesterday.balanceBaseAsset;
                        interExecutionMemory.balanceQuotedAsset = yesterday.balanceQuotedAsset;
                        interExecutionMemory.lastTradeProfitLoss = yesterday.lastTradeProfitLoss;
                        interExecutionMemory.profit = yesterday.profit;
                        interExecutionMemory.lastTradeROI = yesterday.lastTradeROI;

                        interExecutionMemory.roundtrips = yesterday.roundtrips;
                        interExecutionMemory.fails = yesterday.fails;
                        interExecutionMemory.hits = yesterday.hits;
                        interExecutionMemory.periods = yesterday.periods;
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
                if (pArray === undefined) {return}
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
                    logger.write(MODULE_NAME, "[ERROR] runSimulation -> getElement -> err = " + err.stack);
                    callBackFunction(global.DEFAULT_FAIL_RESPONSE);
                }
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] runSimulation -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};



