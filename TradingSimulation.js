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
        variable,
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

            /* Take Profit Management */
            const MIN_TAKE_PROFIT_VALUE = 1 // We can not let the buy order be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_TAKE_PROFIT_VALUE = Number.MAX_SAFE_INTEGER

            /* Variables for this executioin only */
            let takePositionNow = false
            let closePositionNow = false

            /* In some cases we need to know if we are positioned at the last candle of the calendar day, for that we need these variables. */
            let lastInstantOfTheDay = 0
            if (currentDay) {
                lastInstantOfTheDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;
            }

            if (variable.isInitialized !== true) { 

                variable.isInitialized = true

                variable.stopLoss = 0
                variable.takeProfit = 0

                /*Needed for statistics */
                variable.previousBalanceBaseAsset = 0
                variable.previousBalanceQuotedAsset = 0

                /* Position Management */
                variable.tradePositionRate = 0
                variable.tradePositionSize = 0

                /* Strategy and Phase Management */
                variable.strategyIndex = -1
                variable.strategyStage = 'No Stage'
                variable.stopLossPhase = -1
                variable.stopLossStage = 'No Stage'
                variable.takeProfitPhase = -1
                variable.takeProfitStage = 'No Stage'

                variable.currentStrategy = {
                    begin: 0,
                    end: 0,
                    status: 0,
                    number: 0,
                    beginRate: 0,
                    endRate: 0,
                    triggerOnSituation: ''
                }

                variable.currentTrade = {
                    begin: 0,
                    end: 0,
                    status: 0,
                    profit: 0,
                    exitType: 0,
                    beginRate: 0,
                    endRate: 0,
                    takePositionSituation: ''
                }

                variable.balanceBaseAsset = bot.VALUES_TO_USE.initialBalanceA
                variable.balanceQuotedAsset = bot.VALUES_TO_USE.initialBalanceB

                variable.lastTradeProfitLoss = 0
                variable.lastTradeProfit = 0
                variable.lastTradeROI = 0

                variable.roundtrips = 0;
                variable.fails = 0;
                variable.hits = 0;
                variable.periods = 0;
                variable.positionPeriods = 0;

                /* Usefull counters for conditions and formulas */
                variable.distanceToLast = {
                    triggerOn: 0,
                    triggerOff: 0,
                    takePosition: 0,
                    closePosition: 0
                }

                variable.hitRatio = 0;
                variable.ROI = 0;
                variable.anualizedRateOfReturn = 0;

                variable.announcements = []

                /* Allowing these to be accesible at formulas */
                variable.baseAsset = bot.VALUES_TO_USE.baseAsset
                variable.quotedAsset = bot.VALUES_TO_USE.quotedAsset
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
                            positionSize = variable.balanceBaseAsset;
                            positionRate = candle.close;
                        } else {
                            positionSize = variable.balanceQuotedAsset;
                            positionRate = candle.close;
                        }

                        let initialDefinition = openStage.initialDefinition

                        if (initialDefinition !== undefined) {

                            if (tradePositionSize !== 0) {
                                positionSize = variable.tradePositionSize
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
                                                positionSize = variable.balanceBaseAsset;
                                            } else {
                                                positionSize = variable.balanceQuotedAsset;
                                            }
                                        } else {
                                            if (baseAsset === bot.market.baseAsset) {
                                                if (positionSize > variable.balanceBaseAsset) { positionSize = variable.balanceBaseAsset }
                                            } else {
                                                if (positionSize > variable.balanceQuotedAsset) { positionSize = variable.balanceQuotedAsset }
                                            }
                                        }
                                    }
                                }
                            }

                            if (tradePositionRate !== 0) {
                                positionRate = variable.tradePositionRate
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
                    variable.strategyStage === 'No Stage' &&
                    variable.strategyIndex === -1
                ) {
                    let minimumBalance
                    let maximumBalance
                    let balance

                    if (baseAsset === bot.market.baseAsset) {
                        balance = variable.balanceBaseAsset
                        minimumBalance = bot.VALUES_TO_USE.minimumBalanceA
                        maximumBalance = bot.VALUES_TO_USE.maximumBalanceA
                    } else {
                        balance = variable.balanceQuotedAsset
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

                                        variable.strategyStage = 'Trigger Stage';
                                        checkAnnouncements(triggerStage)

                                        variable.strategyIndex = j;
                                        variable.currentStrategy.begin = candle.begin;
                                        variable.currentStrategy.beginRate = candle.min;
                                        variable.currentStrategy.endRate = candle.min; // In case the strategy does not get exited
                                        variable.currentStrategy.triggerOnSituation = situation.name

                                        distanceToLast.triggerOn = 1;

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

                    let strategy = tradingSystem.strategies[strategyIndex];

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {

                        if (triggerStage.triggerOff !== undefined) {

                            for (let k = 0; k < triggerStage.triggerOff.situations.length; k++) {

                                let situation = triggerStage.triggerOff.situations[k];
                                let passed = true;

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = variable.strategyIndex + '-' + 'triggerStage' + '-' + 'triggerOff' + '-' + k + '-' + m;

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value;
                                    }

                                    if (value === false) { passed = false; }
                                }

                                if (passed) {

                                    variable.currentStrategy.number = variable.strategyIndex
                                    variable.currentStrategy.end = candle.end;
                                    variable.currentStrategy.endRate = candle.min;
                                    variable.currentStrategy.status = 1; // This means the strategy is closed, i.e. that has a begin and end.
                                    variable.strategyStage = 'No Stage';
                                    variable.strategyIndex = -1;

                                    distanceToLast.triggerOff = 1;

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

                    let strategy = tradingSystem.strategies[strategyIndex];

                    let triggerStage = strategy.triggerStage

                    if (triggerStage !== undefined) {

                        if (triggerStage.takePosition !== undefined) {

                            for (let k = 0; k < triggerStage.takePosition.situations.length; k++) {

                                let situation = triggerStage.takePosition.situations[k];
                                let passed = true;

                                for (let m = 0; m < situation.conditions.length; m++) {

                                    let condition = situation.conditions[m];
                                    let key = variable.strategyIndex + '-' + 'triggerStage' + '-' + 'takePosition' + '-' + k + '-' + m;

                                    let value = false
                                    if (conditions.get(key) !== undefined) {
                                        value = conditions.get(key).value;
                                    }

                                    if (value === false) { passed = false; }
                                }

                                if (passed) {

                                    variable.strategyStage = 'Open Stage';
                                    checkAnnouncements(strategy.openStage)

                                    variable.stopLossStage = 'Open Stage';
                                    variable.takeProfitStage = 'Open Stage';
                                    variable.stopLossPhase = 0;
                                    variable.takeProfitPhase = 0;

                                    takePositionNow = true
                                    variable.currentTrade.takePositionSituation = situation.name
                                    
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
                    (strategyStage === 'Open Stage' || variable.strategyStage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {

                    checkStopPhases()
                    calculateStopLoss();

                }

                function checkStopPhases() {

                    let strategy = tradingSystem.strategies[strategyIndex];

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = variable.strategyIndex
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (stopLossStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = variable.stopLossPhase
                            }
                        }
                    }

                    if (stopLossStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = variable.stopLossPhase - 1
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

                                    variable.stopLossPhase++;
                                    variable.stopLossStage = 'Manage Stage'
                                    if (takeProfitPhase > 0) {
                                        variable.strategyStage = 'Manage Stage'
                                        checkAnnouncements(manageStage, 'Take Profit')
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
                                                    variable.stopLossPhase = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = "This Node needs to reference a Phase."
                                            continue
                                        }

                                        variable.stopLossStage = 'Manage Stage'
                                        if (takeProfitPhase > 0) {
                                            variable.strategyStage = 'Manage Stage'
                                            checkAnnouncements(manageStage, 'Take Profit')
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

                    let strategy = tradingSystem.strategies[strategyIndex];
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (stopLossStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.stopLoss !== undefined) {
                                phase = openStage.initialDefinition.stopLoss.phases[stopLossPhase];
                                key = variable.strategyIndex + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + (stopLossPhase);
                            }
                        }
                    }

                    if (stopLossStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            phase = manageStage.stopLoss.phases[stopLossPhase - 1];
                            key = variable.strategyIndex + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + (stopLossPhase - 1);
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            let previousValue = variable.stopLoss

                            variable.stopLoss = formulas.get(key)

                            if (stopLoss !== previousValue) {
                                checkAnnouncements(phase, variable.stopLoss)
                            }
                        }
                    }
                }

                /* Take Profit Management */
                if (
                    (strategyStage === 'Open Stage' || variable.strategyStage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {

                    checkTakeProfitPhases();
                    calculateTakeProfit();

                }

                function checkTakeProfitPhases() {

                    let strategy = tradingSystem.strategies[strategyIndex];

                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let parentNode
                    let j = variable.strategyIndex
                    let stageKey
                    let initialDefinitionKey = ''
                    let p

                    if (takeProfitStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                parentNode = openStage.initialDefinition
                                initialDefinitionKey = '-' + 'initialDefinition'
                                stageKey = 'openStage'
                                p = variable.takeProfitPhase
                            }
                        }
                    }

                    if (takeProfitStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = variable.takeProfitPhase - 1
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

                                    variable.takeProfitPhase++;
                                    variable.takeProfitStage = 'Manage Stage'
                                    if (stopLossPhase > 0) {
                                        variable.strategyStage = 'Manage Stage'
                                        checkAnnouncements(manageStage, 'Stop')
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
                                                    variable.takeProfitPhase = q + 1
                                                }
                                            }
                                        } else {
                                            moveToPhaseEvent.error = "This Node needs to reference a Phase."
                                            continue
                                        }

                                        variable.takeProfitStage = 'Manage Stage'
                                        if (stopLossPhase > 0) {
                                            variable.strategyStage = 'Manage Stage'
                                            checkAnnouncements(manageStage, 'Stop')
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

                    let strategy = tradingSystem.strategies[strategyIndex];
                    let openStage = strategy.openStage
                    let manageStage = strategy.manageStage
                    let phase
                    let key

                    if (takeProfitStage === 'Open Stage' && openStage !== undefined) {
                        if (openStage.initialDefinition !== undefined) {
                            if (openStage.initialDefinition.takeProfit !== undefined) {
                                phase = openStage.initialDefinition.takeProfit.phases[takeProfitPhase];
                                key = variable.strategyIndex + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + (takeProfitPhase);
                            }
                        }
                    }

                    if (takeProfitStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            phase = manageStage.takeProfit.phases[takeProfitPhase - 1];
                            key = variable.strategyIndex + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + (takeProfitPhase - 1);
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {

                            let previousValue = variable.stopLoss

                            variable.takeProfit = formulas.get(key)

                            if (takeProfit !== previousValue) {
                                checkAnnouncements(phase, variable.takeProfit)
                            }
                        }
                    }
                }

                /* Keeping Position Counters Up-to-date */
                if (
                    (strategyStage === 'Open Stage' || variable.strategyStage === 'Manage Stage')
                ) {

                    if (takePositionNow === true) {
                        positionPeriods = 0
                    }

                    positionPeriods++;
                    positionDays = positionPeriods * timeFrame / ONE_DAY_IN_MILISECONDS;

                } else {
                    positionPeriods = 0
                    positionDays = 0
                }

                /* Keeping Distance Counters Up-to-date */
                if (
                    distanceToLast.triggerOn > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.triggerOn++;
                }

                if (
                    distanceToLast.triggerOff > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.triggerOff++;
                }

                if (
                    distanceToLast.takePosition > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.takePosition++;
                }

                if (
                    distanceToLast.closePosition > 0 // with this we avoind counting before the first event happens.
                ) {
                    distanceToLast.closePosition++;
                }

                /* Checking if Stop or Take Profit were hit */
                if (
                    (strategyStage === 'Open Stage' || variable.strategyStage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    let strategy = tradingSystem.strategies[strategyIndex];

                    /* Checking what happened since the last execution. We need to know if the Stop Loss
                        or our Take Profit were hit. */

                    /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */

                    if ((baseAsset === bot.market.baseAsset && candle.max >= variable.stopLoss) || (baseAsset !== bot.market.baseAsset && candle.min <= variable.stopLoss)) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Stop Loss was hit."); }
                        /*
                        Hit Point Validation

                        This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (baseAsset === bot.market.baseAsset) {
                            if (stopLoss < candle.min) {
                                variable.stopLoss = candle.min
                            }
                        } else {
                            if (stopLoss > candle.max) {
                                variable.stopLoss = candle.max
                            }
                        }

                        let slippedStopLoss = variable.stopLoss

                        /* Apply the Slippage */
                        let slippageAmount = slippedStopLoss * bot.VALUES_TO_USE.slippage.stopLoss / 100

                        if (baseAsset === bot.market.baseAsset) {
                            slippedStopLoss = slippedStopLoss + slippageAmount
                        } else {
                            slippedStopLoss = slippedStopLoss - slippageAmount
                        }

                        closeRate = slippedStopLoss;

                        variable.strategyStage = 'Close Stage';
                        checkAnnouncements(strategy.closeStage, 'Stop')

                        variable.stopLossStage = 'No Stage';
                        variable.takeProfitStage = 'No Stage';
                        variable.currentTrade.end = candle.end;
                        variable.currentTrade.status = 1;
                        variable.currentTrade.exitType = 1;
                        variable.currentTrade.endRate = closeRate;

                        closePositionNow = true;
                    }

                    /* Take Profit condition: Here we verify if the Take Profit was hit or not. */

                    if ((baseAsset === bot.market.baseAsset && candle.min <= variable.takeProfit) || (baseAsset !== bot.market.baseAsset && candle.max >= variable.takeProfit)) {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Take Profit was hit."); }
                        /*
                        Hit Point Validation:

                        This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (baseAsset === bot.market.baseAsset) {
                            if (takeProfit > candle.max) {
                                variable.takeProfit = candle.max
                            }
                        } else {
                            if (takeProfit < candle.min) {
                                variable.takeProfit = candle.min
                            }
                        }

                        let slippedTakeProfit = variable.takeProfit
                        /* Apply the Slippage */
                        let slippageAmount = slippedTakeProfit * bot.VALUES_TO_USE.slippage.takeProfit / 100

                        if (baseAsset === bot.market.baseAsset) {
                            slippedTakeProfit = slippedTakeProfit + slippageAmount
                        } else {
                            slippedTakeProfit = slippedTakeProfit - slippageAmount
                        }

                        closeRate = slippedTakeProfit;

                        variable.strategyStage = 'Close Stage';
                        checkAnnouncements(strategy.closeStage, 'Take Profit')

                        variable.stopLossStage = 'No Stage';
                        variable.takeProfitStage = 'No Stage';

                        variable.currentTrade.end = candle.end;
                        variable.currentTrade.status = 1;
                        variable.currentTrade.exitType = 2;
                        variable.currentTrade.endRate = closeRate;

                        closePositionNow = true;

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

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[strategyIndex];

                    variable.tradePositionSize = strategy.positionSize;
                    variable.tradePositionRate = strategy.positionRate;

                    /* We take what was calculated at the formula and apply the slippage. */
                    let slippageAmount = variable.tradePositionRate * bot.VALUES_TO_USE.slippage.positionRate / 100

                    if (baseAsset === bot.market.baseAsset) {
                        variable.tradePositionRate = variable.tradePositionRate - slippageAmount
                    } else {
                        variable.tradePositionRate = variable.tradePositionRate + slippageAmount
                    }

                    /* Update the trade record information. */
                    variable.currentTrade.begin = candle.begin;
                    variable.currentTrade.beginRate = variable.tradePositionRate;

                    /* Check if we need to execute. */
                    if (currentCandleIndex > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not.*/
                        /* Check that we are in LIVE MODE */
                        if (bot.startMode === "Live") {
                            /* We see if we need to put the actual order at the exchange. */
                            if (variable.executionContext !== undefined) {
                                switch (variable.executionContext.status) {
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
                        if (variable.executionContext !== undefined) {
                            if (variable.executionContext.periods !== undefined) {
                                if (periods <= variable.executionContext.periods) {
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

                            orderPrice = variable.tradePositionRate - 100 // This is going to be ingnored at the Exchange API for now since we only put market orders.

                            amountA = variable.tradePositionSize * orderPrice
                            amountB = variable.tradePositionSize
 
                        } else {
                            orderSide = "buy"

                            orderPrice = variable.tradePositionRate // This is going to be ingnored at the Exchange API for now since we only put market orders.

                            amountA = variable.tradePositionSize
                            amountB = variable.tradePositionSize / orderPrice

                        }

                        variable.executionContext = {
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
                                        variable.executionContext = {
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

                        variable.previousBalanceBaseAsset = variable.balanceBaseAsset;
                        variable.previousBalanceQuotedAsset = variable.balanceQuotedAsset;

                        variable.lastTradeProfitLoss = 0;
                        variable.lastTradeROI = 0;

                        let feePaid = 0

                        if (baseAsset === bot.market.baseAsset) {

                            feePaid = variable.tradePositionSize * variable.tradePositionRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.balanceQuotedAsset = variable.balanceQuotedAsset + variable.tradePositionSize * variable.tradePositionRate - feePaid;
                            variable.balanceBaseAsset = variable.balanceBaseAsset - variable.tradePositionSize;
                        } else {

                            feePaid = variable.tradePositionSize / variable.tradePositionRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.balanceBaseAsset = variable.balanceBaseAsset + variable.tradePositionSize / variable.tradePositionRate - feePaid;
                            variable.balanceQuotedAsset = variable.balanceQuotedAsset - variable.tradePositionSize;
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

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[strategyIndex];

                    if (currentCandleIndex > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not.*/
                        /* Check that we are in LIVE MODE */
                        if (bot.startMode === "Live") {
                            /* We see if we need to put the actual order at the exchange. */
                            if (variable.executionContext !== undefined) {
                                switch (variable.executionContext.status) {
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
                        if (variable.executionContext !== undefined) {
                            if (variable.executionContext.periods !== undefined) {
                                if (periods <= variable.executionContext.periods) {
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

                            amountA =  variable.balanceQuotedAsset 
                            amountB = variable.balanceQuotedAsset / orderPrice

                        } else {
                            orderSide = "sell"

                            orderPrice = ticker.last - 100; // This is provisional and totally arbitrary, until we have a formula on the designer that defines this stuff.

                            amountA = variable.balanceBaseAsset * orderPrice
                            amountB = variable.balanceBaseAsset

                        }

                        variable.executionContext = {
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
                                        variable.executionContext = {
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

                        let feePaid = 0

                        if (baseAsset === bot.market.baseAsset) {
                            strategy.positionSize = variable.balanceQuotedAsset / closeRate;
                            strategy.positionRate = closeRate;

                            feePaid = variable.balanceQuotedAsset / closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.balanceBaseAsset = variable.balanceBaseAsset + variable.balanceQuotedAsset / closeRate - feePaid;
                            variable.balanceQuotedAsset = 0;
                        } else {
                            strategy.positionSize = variable.balanceBaseAsset * closeRate;
                            strategy.positionRate = closeRate;

                            feePaid = variable.balanceBaseAsset * closeRate * bot.VALUES_TO_USE.feeStructure.taker / 100

                            variable.balanceQuotedAsset = variable.balanceQuotedAsset + variable.balanceBaseAsset * closeRate - feePaid;
                            variable.balanceBaseAsset = 0;
                        }

                        if (baseAsset === bot.market.baseAsset) {
                            variable.lastTradeProfitLoss = variable.balanceBaseAsset - variable.previousBalanceBaseAsset;
                            variable.lastTradeROI = variable.lastTradeProfitLoss * 100 / variable.tradePositionSize;
                            if (isNaN(lastTradeROI)) { variable.lastTradeROI = 0; }
                            variable.lastTradeProfit = variable.balanceBaseAsset - bot.VALUES_TO_USE.initialBalanceA;
                        } else {
                            variable.lastTradeProfitLoss = variable.balanceQuotedAsset - variable.previousBalanceQuotedAsset;
                            variable.lastTradeROI = variable.lastTradeProfitLoss * 100 / variable.tradePositionSize;
                            if (isNaN(lastTradeROI)) { variable.lastTradeROI = 0; }
                            variable.lastTradeProfit = variable.balanceQuotedAsset - bot.VALUES_TO_USE.initialBalanceB;
                        }

                        variable.currentTrade.lastTradeROI = variable.lastTradeROI;

                        if (lastTradeProfitLoss > 0) {
                            hits++;
                        } else {
                            fails++;
                        }

                        if (baseAsset === bot.market.baseAsset) {
                            ROI = (bot.VALUES_TO_USE.initialBalanceA + variable.lastTradeProfit) / bot.VALUES_TO_USE.initialBalanceA - 1;
                            hitRatio = hits / roundtrips;
                            anualizedRateOfReturn = ROI / days * 365;
                        } else {
                            ROI = (bot.VALUES_TO_USE.initialBalanceB + variable.lastTradeProfit) / bot.VALUES_TO_USE.initialBalanceB - 1;
                            hitRatio = hits / roundtrips;
                            anualizedRateOfReturn = ROI / days * 365;
                        }

                        addRecord();

                        variable.stopLoss = 0;
                        variable.takeProfit = 0;

                        variable.tradePositionRate = 0;
                        variable.tradePositionSize = 0;

                        timerToCloseStage = candle.begin
                        variable.stopLossStage = 'No Stage';
                        variable.takeProfitStage = 'No Stage';
                        variable.stopLossPhase = -1;
                        variable.takeProfitPhase = -1;

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> closePositionAtSimulation -> Exiting Loop Body after closing position at simulation."); }
                        controlLoop();
                        return
                    }
                }

                /* Closing the Closing Stage */
                if (strategyStage === 'Close Stage') {
                    if (candle.begin - 5 * 60 * 1000 > timerToCloseStage) {

                        variable.currentStrategy.number = variable.strategyIndex
                        variable.currentStrategy.end = candle.end;
                        variable.currentStrategy.endRate = candle.min;
                        variable.currentStrategy.status = 1; // This means the strategy is closed, i.e. that has a begin and end.

                        variable.strategyIndex = -1;
                        variable.strategyStage = 'No Stage';

                        timerToCloseStage = 0
                        distanceToLast.triggerOff = 1;

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing the Closing Stage -> Exiting Close Stage."); }
                    } else {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Closing the Closing Stage -> Waiting for timer."); }
                    }
                }

                /* Not a buy or sell condition */

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
                        variable.balanceBaseAsset = Number.MAX_SAFE_INTEGER
                    }

                    if (balanceQuotedAsset === Infinity) {
                        variable.balanceQuotedAsset = Number.MAX_SAFE_INTEGER
                    }

                    let quotedBaseAsset = '"' + baseAsset + '"'
                    let quotedQuotedAsset = '"' + quotedAsset + '"'

                    simulationRecord = {
                        begin: candle.begin,
                        end: candle.end,
                        amount: 1,
                        balanceA: variable.balanceBaseAsset,
                        balanceB: variable.balanceQuotedAsset,
                        profit: variable.lastTradeProfit,
                        lastTradeProfitLoss: variable.lastTradeProfitLoss,
                        stopLoss: variable.stopLoss,
                        roundtrips: roundtrips,
                        hits: hits,
                        fails: fails,
                        hitRatio: hitRatio,
                        ROI: ROI,
                        periods: periods,
                        days: days,
                        anualizedRateOfReturn: anualizedRateOfReturn,
                        positionRate: variable.tradePositionRate,
                        lastTradeROI: variable.lastTradeROI,
                        strategy: variable.strategyIndex,
                        strategyStageNumber: strategyStageNumber,
                        takeProfit: variable.takeProfit,
                        stopLossPhase: variable.stopLossPhase,
                        takeProfitPhase: variable.takeProfitPhase,
                        positionSize: variable.tradePositionSize,
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

                    /* Prepare the information for the Conditions File */

                    conditionsArrayRecord.push(strategyIndex);
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
                    if (currentStrategy.begin !== 0 && variable.currentStrategy.end === 0 && currentCandleIndex === candles.length - 2 && lastCandle.end !== lastInstantOfTheDay) {
                        variable.currentStrategy.status = 2; // This means the strategy is open, i.e. that has a begin but no end.
                        variable.currentStrategy.end = candle.end
                    }
                    
                    /* Prepare the information for the Strategies File*/
                    if (currentStrategy.begin !== 0 && variable.currentStrategy.end !== 0)            
                     {
                        strategiesArray.push(currentStrategy);

                        variable.currentStrategy = {
                            begin: 0,
                            end: 0,
                            status: 0,
                            number: 0,
                            beginRate: 0,
                            endRate: 0,
                            triggerOnSituation: ''
                        }
                    }

                    /* 
                    Lets see if there will be an open trade ...
                    Except if we are at the head of the market (remember we skipped the last candle for not being closed.)
                    */
                    if (currentTrade.begin !== 0 && variable.currentTrade.end === 0 && currentCandleIndex === candles.length - 2 && lastCandle.end !== lastInstantOfTheDay) {
                        variable.currentTrade.status = 2; // This means the trade is open 
                        variable.currentTrade.end = candle.end
                        variable.currentTrade.endRate = candle.close

                        /* Here we will calculate the ongoing ROI */
                        if (baseAsset === bot.market.baseAsset) {
                            variable.currentTrade.lastTradeROI = (tradePositionRate - candle.close) / variable.tradePositionRate * 100
                        } else {
                            variable.currentTrade.lastTradeROI = (candle.close - variable.tradePositionRate) / variable.tradePositionRate * 100
                        }
                    }

                    /* Prepare the information for the Trades File */
                    if (currentTrade.begin !== 0 && variable.currentTrade.end !== 0) { 

                        variable.currentTrade.profit = variable.lastTradeProfitLoss;

                        tradesArray.push(currentTrade);

                        variable.currentTrade = {
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

                            for (let j = 0; j < variable.announcements.length; j++) {
                                let announcementRecord = variable.announcements[j]
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
                                    variable.announcements.push(newAnnouncementRecord)
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
                Before returning we need to see if we have to record some of our counters at the variable.
                To do that, the condition to be met is that this execution must include all candles of the current day.
                */

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



