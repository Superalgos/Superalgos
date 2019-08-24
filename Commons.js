exports.newCommons = function newCommons(bot, logger, UTILITIES) {

    const FULL_LOG = true;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "Commons";
    const ONE_DAY_IN_MILISECONDS = 24 * 60 * 60 * 1000;
    const GMT_SECONDS = ':00.000 GMT+0000';

    let thisObject = {
        initializeData: initializeData,
        runSimulation: runSimulation,
        buildLRC: buildLRC,
        buildPercentageBandwidthMap: buildPercentageBandwidthMap,
        buildBollingerBandsMap: buildBollingerBandsMap,
        buildBollingerChannelsArray: buildBollingerChannelsArray,
        buildBollingerSubChannelsArray: buildBollingerSubChannelsArray,
        buildCandles: buildCandles
    };

    let utilities = UTILITIES.newCloudUtilities(bot, logger);

    let LRCMap = new Map();
    let percentageBandwidthMap = new Map();
    let bollingerBandsMap = new Map();
    let bollingerChannelsArray = [];
    let bollingerSubChannelsArray = [];

    let candles = [];
    const definition = global.DEFINITION

    return thisObject;

    function initializeData() {

        LRCMap = new Map();
        percentageBandwidthMap = new Map();
        bollingerBandsMap = new Map();
        bollingerChannelsArray = [];
        bollingerSubChannelsArray = [];

        candles = [];
    }

    async function runSimulation(
        timePeriod,
        currentDay,
        startDate,
        endDate,
        interExecutionMemory,
        assistant,
        callback,
        callBackFunction) {

        try {

            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> Entering function."); }

            let processingDailyFiles = (currentDay !== undefined)

            let executionArray = [];
            let recordsArray = [];
            let conditionsArray = [];
            let strategiesArray = [];
            let tradesArray = [];
            let lastObjectsArray = [];

            let tradingSystem = definition.tradingSystem;

            /* Initial Default Values */

            let initialDate = startDate;
            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> initialDate = " + initialDate); }

            const DEFAULT_BASE_ASSET_BALANCE = 1
            const DEFAULT_BASE_ASSET_MINIMUN_BALANCE = 0.5
            const DEFAULT_BASE_ASSET_MAXIMUN_BALANCE = 2

            let initialBalanceA = DEFAULT_BASE_ASSET_BALANCE
            let minimumBalanceA = DEFAULT_BASE_ASSET_MINIMUN_BALANCE
            let maximumBalanceA = DEFAULT_BASE_ASSET_MAXIMUN_BALANCE
            let initialBalanceB = 0
            let minimumBalanceB = 0
            let maximumBalanceB = 0
            let baseAsset = 'BTC'

            /* Parameters Processing */

            if (tradingSystem.parameters !== undefined) {
                if (tradingSystem.parameters.baseAsset !== undefined) {

                    let code
                    try {
                        code = JSON.parse(tradingSystem.parameters.baseAsset.code);

                        if (code.name !== undefined) {
                            baseAsset = code.name;
                            if (baseAsset !== 'BTC' && baseAsset !== 'USDT') {
                                tradingSystem.parameters.baseAsset.error = baseAsset + ' is not supported. Using default: BTC.'
                                baseAsset = 'BTC'
                            }
                        }

                        if (baseAsset === 'BTC') {
                            if (code.initialBalance !== undefined) {
                                initialBalanceA = code.initialBalance;
                                initialBalanceB = 0
                            } else {
                                initialBalanceA = DEFAULT_BASE_ASSET_BALANCE;
                                initialBalanceB = 0
                            }
                            if (code.minimumBalance !== undefined) {
                                minimumBalanceA = code.minimumBalance;
                                minimumBalanceB = 0
                            } else {
                                minimumBalanceA = DEFAULT_BASE_ASSET_MINIMUN_BALANCE;
                                minimumBalanceB = 0
                            }
                            if (code.maximumBalance !== undefined) {
                                maximumBalanceA = code.maximumBalance;
                                maximumBalanceB = 0
                            } else {
                                maximumBalanceA = DEFAULT_BASE_ASSET_MAXIMUN_BALANCE;
                                maximumBalanceB = 0
                            }
                        } else {
                            if (code.initialBalance !== undefined) {
                                initialBalanceB = code.initialBalance;
                                initialBalanceA = 0
                            } else {
                                initialBalanceB = DEFAULT_BASE_ASSET_BALANCE;
                                initialBalanceA = 0
                            }
                            if (code.minimumBalance !== undefined) {
                                minimumBalanceB = code.minimumBalance;
                                minimumBalanceA = 0
                            } else {
                                minimumBalanceB = DEFAULT_BASE_ASSET_MINIMUN_BALANCE;
                                minimumBalanceA = 0
                            }
                            if (code.maximumBalance !== undefined) {
                                maximumBalanceB = code.maximumBalance;
                                maximumBalanceA = 0
                            } else {
                                maximumBalanceB = DEFAULT_BASE_ASSET_MAXIMUN_BALANCE;
                                maximumBalanceA = 0
                            }
                        }
                    } catch (err) {
                        tradingSystem.parameters.baseAsset.error = err.message
                    }
                }
            }

            /* Slippage */
            let slippage = { // Default Values
                positionRate: 0,
                stopLoss: 0,
                takeProfit: 0
                }
            if (definition.tradingSystem !== undefined) {
                if (definition.tradingSystem.parameters !== undefined) {
                    if (definition.tradingSystem.parameters.slippage !== undefined) {
                        if (definition.tradingSystem.parameters.slippage.code !== undefined) {
                            try {
                                let code = JSON.parse(definition.tradingSystem.parameters.slippage.code)

                                if (code.positionRate !== undefined) {
                                    slippage.positionRate = code.positionRate
                                }
                                if (code.stopLoss !== undefined) {
                                    slippage.stopLoss = code.stopLoss
                                }
                                if (code.takeProfit !== undefined) {
                                    slippage.takeProfit = code.takeProfit
                                }

                            } catch (err) {
                                tradingSystem.parameters.slippage.error =  err.message
                            }
                        }
                    }
                }
            }

            /* Fee Structure */
            let feeStructure = { // Default Values
                maker: 0,
                taker: 0
            }

            if (definition.tradingSystem !== undefined) {
                if (definition.tradingSystem.parameters !== undefined) {
                    if (definition.tradingSystem.parameters.feeStructure !== undefined) {
                        if (definition.tradingSystem.parameters.feeStructure.code !== undefined) {
                            try {
                                let code = JSON.parse(definition.tradingSystem.parameters.feeStructure.code)

                                if (code.maker !== undefined) {
                                    feeStructure.maker = code.maker
                                }
                                if (code.taker !== undefined) {
                                    feeStructure.taker = code.taker
                                }

                            } catch (err) {
                                tradingSystem.parameters.feeStructure.error = err.message
                            }
                        }
                    }
                }
            }

            let timerToCloseStage = 0

            /* Stop Loss Management */

            const MIN_STOP_LOSS_VALUE = 1 // We can not let the stop be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_STOP_LOSS_VALUE = Number.MAX_SAFE_INTEGER
            let stopLoss = 0;

            /* Take Profit Management */

            const MIN_TAKE_PROFIT_VALUE = 1 // We can not let the buy order be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_TAKE_PROFIT_VALUE = Number.MAX_SAFE_INTEGER
            let previousTakeProfit = 0;
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

            let lastInstantOfTheDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;
            let lastCandle = candles[candles.length - 1];

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
            the day is complete and if we have a currentDay. That menas that for Market Files we will never use
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

            let stopLossPhase = 0;
            let stopLossStage = 'No Stage';

            let takeProfitPhase = 0;
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

            let balanceAssetA = initialBalanceA;
            let balanceAssetB = initialBalanceB;

            let lastTradeProfitLoss = 0;
            let profit = 0;
            let lastTradeROI = 0;

            let roundtrips = 0;
            let fails = 0;
            let hits = 0;
            let periods = 0;
            let positionPeriods = 0;

            /* Message to the Simulation Executor */

            let orderId = 0;
            let messageId = 0;

            let yesterday = {};

            /* Initialization */

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

            yesterday.orderId = 0;
            yesterday.messageId = 0;

            yesterday.hitRatio = 0;
            yesterday.ROI = 0;
            yesterday.anualizedRateOfReturn = 0;

            if (interExecutionMemory.roundtrips === undefined) {

                /* Initialize the data structure we will use inter execution. */

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

                interExecutionMemory.orderId = 0;
                interExecutionMemory.messageId = 0;

                interExecutionMemory.hitRatio = 0;
                interExecutionMemory.ROI = 0;
                interExecutionMemory.anualizedRateOfReturn = 0;

            } else {

                /* We get the initial values from the day previous to the candles we receive at the current execution */

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

                if (currentDay.valueOf() >= startDate.valueOf() + ONE_DAY_IN_MILISECONDS) { // Only after the first day we start grabbing the balance from this memory.

                    balanceAssetA = interExecutionMemory.balanceAssetA;
                    balanceAssetB = interExecutionMemory.balanceAssetB;

                    yesterday.balanceAssetA = balanceAssetA;
                    yesterday.balanceAssetB = balanceAssetB;

                }

                lastTradeProfitLoss = interExecutionMemory.lastTradeProfitLoss;
                profit = interExecutionMemory.profit;
                lastTradeROI = interExecutionMemory.lastTradeROI;

                roundtrips = interExecutionMemory.roundtrips;
                fails = interExecutionMemory.fails;
                hits = interExecutionMemory.hits;
                periods = interExecutionMemory.periods;
                positionPeriods = interExecutionMemory.positionPeriods;

                orderId = interExecutionMemory.orderId; // to be deprecated
                messageId = interExecutionMemory.messageId; // to be deprecated

                hitRatio = interExecutionMemory.hitRatio;
                ROI = interExecutionMemory.ROI;
                anualizedRateOfReturn = interExecutionMemory.anualizedRateOfReturn;

                /* For the case that any of these variables are not updated during the main loop, we need to store their value at the yesterday structure, otherwise it would be lost. */

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

                yesterday.hitRatio = hitRatio;
                yesterday.ROI = ROI;
                yesterday.anualizedRateOfReturn = anualizedRateOfReturn;
            }

            /* Main Simulation Loop: We go thourgh all the candles at this time period. */
            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> Main Simulation Loop -> candles.length = " + candles.length); }

            let i
            initializeLoop()

            function initializeLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> initializeLoop -> Entering function."); }
                i = 0
                loop()
            }

            function loop() {

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Entering function."); }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Processing candle # " + i); }

                let candle = candles[i];

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Candle Begin @ " + (new Date(candle.begin)).toLocaleString()) }
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Candle End @ " + (new Date(candle.end)).toLocaleString()) }

                let percentageBandwidth = percentageBandwidthMap.get(candle.begin);
                let bollingerBand = bollingerBandsMap.get(candle.begin);
                let bollingerChannel = getElement(bollingerChannelsArray, candle.begin, candle.end);
                let bollingerSubChannel = getElement(bollingerSubChannelsArray, candle.begin, candle.end);
                let positionedAtYesterday = (candle.end < currentDay.valueOf())

                /* Assistant Info */

                let ticker = {
                    bid: candle.close,
                    ask: candle.close,
                    last: candle.close
                }

                //let LRC = LRCMap.get(candle.begin);

                /* If any of the needed indicators is missing, then that period is not calculated */

                if (candle.end < initialDate.valueOf()) {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Skipping Candle before the initialDate."); }
                    controlLoop();
                    return
                }
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

                let lastObjects = {
                    candle: clone(candle),
                    //LRC: clone(LRC),
                    bollingerBand: clone(bollingerBand),
                    percentageBandwidth: clone(percentageBandwidth),
                    bollingerChannel: clone(bollingerChannel),
                    bollingerSubChannel: clone(bollingerSubChannel)
                }

                function clone(obj) {
                    if (null == obj || "object" != typeof obj) return obj;
                    var copy = obj.constructor();
                    for (var attr in obj) {
                        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
                    }
                    return copy;
                }

                lastObjects.candle.previous = undefined;
                //lastObjects.LRC.previous = undefined;
                lastObjects.bollingerBand.previous = undefined;
                lastObjects.percentageBandwidth.previous = undefined;
                lastObjects.bollingerChannel.previous = undefined;
                lastObjects.bollingerSubChannel.previous = undefined;

                lastObjectsArray.push(lastObjects);

                if (lastObjectsArray.length > 5) {
                    lastObjectsArray.splice(0, 1);
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

                evaluateConditionsAndFormulas(tradingSystem, conditions);

                function evaluateConditionsAndFormulas(tradingSystem, conditions) {

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
                            if (baseAsset === 'BTC') {
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
                                                if (baseAsset === 'BTC') {
                                                    positionSize = balanceAssetA;
                                                } else {
                                                    positionSize = balanceAssetB;
                                                }
                                            } else {
                                                if (baseAsset === 'BTC') {
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
                                                if (baseAsset === 'BTC') {
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
                                                    formulaError = "Formula evaluates to Infinity."
                                                    formulaValue = MAX_TAKE_PROFIT_VALUE
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
                                                formulaError = "Formula evaluates to Infinity."
                                                formulaValue = MAX_STOP_LOSS_VALUE
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

                                if (node.code.indexOf('previous') > 0 && err.message.indexOf('of undefined') > 0) {
                                    /*
                                        We are not going to set an error for the casess we are using previous and the error is that the indicator is undefined.
                                    */
                                } else {
                                    node.error = err.message
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
                }

                /* Trigger On Conditions */
                if (
                    strategyStage === 'No Stage' &&
                    currentStrategyIndex === -1
                ) {
                    let minimumBalance
                    let maximumBalance
                    let balance

                    if (baseAsset === 'BTC') {
                        balance = balanceAssetA
                        minimumBalance = minimumBalanceA
                        maximumBalance = maximumBalanceA
                    } else {
                        balance = balanceAssetB
                        minimumBalance = minimumBalanceB
                        maximumBalance = maximumBalanceB
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

                                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> Switching to Trigger Stage because conditions at Trigger On Event were met."); }
                                            break;
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        let stopRunningDate = new Date(candle.begin)
                        if (balance < minimumBalance) {
                            tradingSystem.error = "Min Balance @ " + stopRunningDate.toUTCString()
                        }
                        if (balance > maximumBalance) {
                            tradingSystem.error = "Max Balance @ " + stopRunningDate.toUTCString()
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
                                    stopLossPhase = 1;
                                    takeProfitPhase = 1;

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
                                p = stopLossPhase - 1
                            }
                        }
                    }

                    if (stopLossStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = stopLossPhase - 2
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
                                if (takeProfitPhase > 1) { strategyStage = 'Manage Stage' }

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
                                phase = openStage.initialDefinition.stopLoss.phases[stopLossPhase - 1];
                                key = currentStrategyIndex + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'stopLoss' + '-' + (stopLossPhase - 1);
                            }
                        }
                    }

                    if (stopLossStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.stopLoss !== undefined) {
                            phase = manageStage.stopLoss.phases[stopLossPhase - 2];
                            key = currentStrategyIndex + '-' + 'manageStage' + '-' + 'stopLoss' + '-' + (stopLossPhase - 2);
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            stopLoss = formulas.get(key)
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
                                p = takeProfitPhase - 1
                            }
                        }
                    }

                    if (takeProfitStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            parentNode = manageStage
                            stageKey = 'manageStage'
                            p = takeProfitPhase - 2
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
                                if (stopLossPhase > 1) { strategyStage = 'Manage Stage' }

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
                                phase = openStage.initialDefinition.takeProfit.phases[takeProfitPhase - 1];
                                key = currentStrategyIndex + '-' + 'openStage' + '-' + 'initialDefinition' + '-' + 'takeProfit' + '-' + (takeProfitPhase - 1);
                            }
                        }
                    }

                    if (takeProfitStage === 'Manage Stage' && manageStage !== undefined) {
                        if (manageStage.takeProfit !== undefined) {
                            phase = manageStage.takeProfit.phases[takeProfitPhase - 2];
                            key = currentStrategyIndex + '-' + 'manageStage' + '-' + 'takeProfit' + '-' + (takeProfitPhase - 2);
                        }
                    }

                    if (phase !== undefined) {
                        if (phase.formula !== undefined) {
                            takeProfit = formulas.get(key)
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

                /* Checking if Stop or Take Profit were hit */
                if (
                    (strategyStage === 'Open Stage' || strategyStage === 'Manage Stage') &&
                    takePositionNow !== true
                ) {
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    /* Checking what happened since the last execution. We need to know if the Stop Loss
                        or our Take Profit were hit. */

                    /* Stop Loss condition: Here we verify if the Stop Loss was hitted or not. */

                    if ((baseAsset === 'BTC' && candle.max >= stopLoss) || (baseAsset !== 'BTC' && candle.min <= stopLoss)) {

                        /*
                        Hit Point Validation

                        This prevents misscalculations when a formula places the stop loss in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (baseAsset === 'BTC') {
                            if (stopLoss < candle.min) { stopLoss = candle.min }
                        } else {
                            if (stopLoss > candle.max) { stopLoss = candle.max }
                        }

                        let slippedStopLoss = stopLoss

                        /* Apply the Slippage */
                        let slippageAmount = slippedStopLoss * slippage.stopLoss / 100

                        if (baseAsset === 'BTC') {
                            slippedStopLoss = slippedStopLoss + slippageAmount
                        } else {
                            slippedStopLoss = slippedStopLoss - slippageAmount
                        }

                        let finalStopLoss = slippedStopLoss;

                        let feePaid = 0

                        if (baseAsset === 'BTC') {
                            strategy.positionSize = balanceAssetB / finalStopLoss;
                            strategy.positionRate = finalStopLoss;

                            feePaid = balanceAssetB / finalStopLoss * feeStructure.taker / 100

                            balanceAssetA = balanceAssetA + balanceAssetB / finalStopLoss - feePaid;
                            balanceAssetB = 0;
                        } else {
                            strategy.positionSize = balanceAssetA * finalStopLoss;
                            strategy.positionRate = finalStopLoss;

                            feePaid = balanceAssetA * finalStopLoss * feeStructure.taker / 100

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

                    if ((baseAsset === 'BTC' && candle.min <= takeProfit) || (baseAsset !== 'BTC' && candle.max >= takeProfit)) {

                        /*
                        Hit Point Validation:

                        This prevents misscalculations when a formula places the take profit in this case way beyond the market price.
                        If we take the stop loss value at those situation would be a huge distortion of facts.
                        */

                        if (baseAsset === 'BTC') {
                            if (takeProfit > candle.max) { takeProfit = candle.max }
                        } else {
                            if (takeProfit < candle.min) { takeProfit = candle.min }
                        }

                        let slippedTakeProfit = takeProfit
                        /* Apply the Slippage */
                        let slippageAmount = slippedTakeProfit * slippage.takeProfit / 100

                        if (baseAsset === 'BTC') {
                            slippedTakeProfit = slippedTakeProfit + slippageAmount
                        } else {
                            slippedTakeProfit = slippedTakeProfit - slippageAmount
                        }

                        let finalTakeProfit = slippedTakeProfit;

                        let feePaid = 0

                        if (baseAsset === 'BTC') {
                            strategy.positionSize = balanceAssetB / finalTakeProfit;
                            strategy.positionRate = finalTakeProfit;

                            feePaid = balanceAssetB / finalTakeProfit * feeStructure.taker / 100

                            balanceAssetA = balanceAssetA + balanceAssetB / finalTakeProfit - feePaid;
                            balanceAssetB = 0;
                        } else {
                            strategy.positionSize = balanceAssetA * finalTakeProfit;
                            strategy.positionRate = finalTakeProfit;

                            feePaid = balanceAssetA * finalTakeProfit * feeStructure.taker / 100

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

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    tradePositionSize = strategy.positionSize;
                    tradePositionRate = strategy.positionRate;

                    /* We take what was calculated at the formula and apply the slippage. */
                    let slippageAmount = tradePositionRate * slippage.positionRate / 100

                    if (baseAsset === 'BTC') {
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
                        if (process.env.START_MODE === "live") {
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

                        /* We wont take a position unless we are withing the startDate and the endDate range */
                        if (startDate !== undefined) {
                            if (candle.end < startDate.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because current candle ends before the start date.  -> startDate = " + startDate); }
                                takePositionAtSimulation()
                                return;
                            }
                        }

                        /* This validation is disbled for now because we do not have the correct end date at this point.
                        if (endDate !== undefined) {
                            if (candle.begin > endDate.valueOf()) {
                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> Not placing the trade at the exchange because current candle begins after the end date. -> endDate = " + endDate); }
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
                        let today = new Date(Math.trunc((new Date().valueOf()) / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                        let processDay = new Date(Math.trunc(currentDay.valueOf() / ONE_DAY_IN_MILISECONDS) * ONE_DAY_IN_MILISECONDS)
                        if (today.valueOf() !== processDay.valueOf()) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> Not placing the trade at the exchange because the current candle belongs to the previous day and that is considered simulation and not live trading."); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> today = " + today); }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> putOpeningOrder -> processDay = " + processDay); }
                            takePositionAtSimulation()
                            return;
                        }

                        let openPositionRate
                        let amountA
                        let amountB
                        let positionDirection
                        let availableBalance = assistant.getAvailableBalance()

                        if (baseAsset === 'BTC') {
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

                        if (baseAsset === 'BTC') {

                            feePaid = tradePositionSize * tradePositionRate * feeStructure.taker / 100

                            balanceAssetB = balanceAssetB + tradePositionSize * tradePositionRate - feePaid;
                            balanceAssetA = balanceAssetA - tradePositionSize;
                        } else {

                            feePaid = tradePositionSize / tradePositionRate * feeStructure.taker / 100

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

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    if (i > candles.length - 10) { /* Only at the last candles makes sense to check if we are in live mode or not.*/
                        /* Check that we are in LIVE MODE */
                        if (process.env.START_MODE === "live") {
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

                        if (baseAsset === 'BTC') {
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

                        if (baseAsset === 'BTC') {
                            lastTradeProfitLoss = balanceAssetA - previousBalanceAssetA;
                            lastTradeROI = lastTradeProfitLoss * 100 / tradePositionSize;
                            if (isNaN(lastTradeROI)) { lastTradeROI = 0; }
                            profit = balanceAssetA - initialBalanceA;
                        } else {
                            lastTradeProfitLoss = balanceAssetB - previousBalanceAssetB;
                            lastTradeROI = lastTradeProfitLoss * 100 / tradePositionSize;
                            if (isNaN(lastTradeROI)) { lastTradeROI = 0; }
                            profit = balanceAssetB - initialBalanceB;
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

                        if (baseAsset === 'BTC') {
                            ROI = (initialBalanceA + profit) / initialBalanceA - 1;
                            hitRatio = hits / roundtrips;
                            anualizedRateOfReturn = ROI / days * 365;
                        } else {
                            ROI = (initialBalanceB + profit) / initialBalanceB - 1;
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
                        takeProfit = 0;

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
                        stopLossPhase = 0;
                        takeProfitPhase = 0;

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

                    let quotedBaseAsset = '"' + baseAsset + '"'

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
                        initialBalanceA: initialBalanceA,
                        minimumBalanceA: minimumBalanceA,
                        maximumBalanceA: maximumBalanceA,
                        initialBalanceB: initialBalanceB,
                        minimumBalanceB: minimumBalanceB,
                        maximumBalanceB: maximumBalanceB,
                        baseAsset: quotedBaseAsset,
                        positionPeriods: positionPeriods,
                        positionDays: positionDays
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
                i++
                if (i < candles.length) {
                    process.nextTick(loop)
                } else {
                    afterLoop()
                }
            }

            function afterLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> afterLoop -> Entering function."); }

                /*
                Before returning we need to see if we have to record some of our counters at the interExecutionMemory.
                To do that, the condition to be met is that this execution must include all candles of the currentDay.
                */

                if (processingDailyFiles) {

                    if (lastCandle.end === lastInstantOfTheDay) {

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
                        interExecutionMemory.positionPeriods =  yesterday.positionPeriods;

                        interExecutionMemory.messageId = interExecutionMemory.messageId + yesterday.messageId;
                        interExecutionMemory.orderId = interExecutionMemory.orderId + yesterday.orderId;

                        interExecutionMemory.hitRatio = yesterday.hitRatio;
                        interExecutionMemory.ROI = yesterday.ROI;
                        interExecutionMemory.anualizedRateOfReturn = yesterday.anualizedRateOfReturn;
                    }
                }

                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> callback -> recordsArray.length = " + recordsArray.length); }

                callback(tradingSystem, executionArray, recordsArray, conditionsArray, strategiesArray, tradesArray, lastObjectsArray);
            }


            function getElement(pArray, begin, end) {

                let element;

                for (let i = 0; i < pArray.length; i++) {

                    element = pArray[i];

                    if (begin >= element.begin && end <= element.end) {
                        return element
                    }
                }

                return
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] runSimulation -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildLRC(dataFile, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildLRC -> Entering function."); }

        try {

            let previous;

            for (let i = 0; i < dataFile.length; i++) {

                let LRC = {
                    begin: dataFile[i][0],
                    end: dataFile[i][1],
                    _15: dataFile[i][2],
                    _30: dataFile[i][3],
                    _60: dataFile[i][4]
                };

                if (previous !== undefined) {

                    if (previous._15 > LRC._15) { LRC.direction15 = 'Down'; }
                    if (previous._15 < LRC._15) { LRC.direction15 = 'Up'; }
                    if (previous._15 === LRC._15) { LRC.direction15 = 'Side'; }

                    if (previous._30 > LRC._30) { LRC.direction30 = 'Down'; }
                    if (previous._30 < LRC._30) { LRC.direction30 = 'Up'; }
                    if (previous._30 === LRC._30) { LRC.direction30 = 'Side'; }

                    if (previous._60 > LRC._60) { LRC.direction60 = 'Down'; }
                    if (previous._60 < LRC._60) { LRC.direction60 = 'Up'; }
                    if (previous._60 === LRC._60) { LRC.direction60 = 'Side'; }

                }

                LRC.previous = previous;

                LRCMap.set(LRC.begin, LRC);

                previous = LRC;
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildLRC -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildPercentageBandwidthMap(dataFile, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildPercentageBandwidthMap -> Entering function."); }

        try {

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

                percentageBandwidthMap.set(percentageBandwidth.begin, percentageBandwidth);

                previous = percentageBandwidth;
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildPercentageBandwidthMap -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildBollingerBandsMap(dataFile, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildBollingerBandsMap -> Entering function."); }

        try {

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

                bollingerBandsMap.set(bollingerBand.begin, bollingerBand);

                previous = bollingerBand;
            }
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildBollingerBandsMap -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildBollingerChannelsArray(dataFile, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildBollingerChannelsArray -> Entering function."); }

        try {

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
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildBollingerChannelsArray -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildBollingerSubChannelsArray(dataFile, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildBollingerSubChannelsArray -> Entering function."); }

        try {

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
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildBollingerSubChannelsArray -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }

    function buildCandles(dataFile, callBackFunction) {

        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] buildCandles -> Entering function."); }

        try {

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
        }
        catch (err) {
            logger.write(MODULE_NAME, "[ERROR] buildCandles -> err = " + err.stack);
            callBackFunction(global.DEFAULT_FAIL_RESPONSE);
        }
    }
};



