const strategy = require('./Integrations/Strategy')

exports.newCommons = function newCommons(bot, logger, UTILITIES) {

    const { orderMessage } = require("@superalgos/mqservice")

    const {
      MESSAGE_ENTITY, MESSAGE_TYPE, ORDER_CREATOR, ORDER_TYPE,
            ORDER_OWNER, ORDER_DIRECTION, ORDER_STATUS, ORDER_EXIT_OUTCOME,
            createMessage, getMessage, getExpandedMessage
    } = orderMessage.newOrderMessage()

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

            let executionArray = [];
            let recordsArray = [];
            let conditionsArray = [];
            let strategiesArray = [];
            let tradesArray = [];
            let lastObjectsArray = [];

            let definition = await strategy.getStrategy();
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
                    if (tradingSystem.parameters.baseAsset.formula !== undefined) {
                        let receivedParameters 
                        try {
                            receivedParameters = JSON.parse(tradingSystem.parameters.baseAsset.formula.code);

                            if (receivedParameters.name !== undefined) {
                                baseAsset = receivedParameters.name;
                                if (baseAsset !== 'BTC' && baseAsset !== 'USDT') {
                                    tradingSystem.parameters.baseAsset.formula.error = baseAsset + ' is not supported. Using default: BTC.'
                                    baseAsset = 'BTC'
                                }
                            }

                            if (baseAsset === 'BTC') {
                                if (receivedParameters.initialBalance !== undefined) {
                                    initialBalanceA = receivedParameters.initialBalance;
                                    initialBalanceB = 0
                                } else {
                                    initialBalanceA = DEFAULT_BASE_ASSET_BALANCE;
                                    initialBalanceB = 0
                                }
                                if (receivedParameters.minimumBalance !== undefined) {
                                    minimumBalanceA = receivedParameters.minimumBalance;
                                    minimumBalanceB = 0
                                } else {
                                    minimumBalanceA = DEFAULT_BASE_ASSET_MINIMUN_BALANCE;
                                    minimumBalanceB = 0
                                }
                                if (receivedParameters.maximumBalance !== undefined) {
                                    maximumBalanceA = receivedParameters.maximumBalance;
                                    maximumBalanceB = 0
                                } else {
                                    maximumBalanceA = DEFAULT_BASE_ASSET_MAXIMUN_BALANCE;
                                    maximumBalanceB = 0
                                }
                            } else {
                                if (receivedParameters.initialBalance !== undefined) {
                                    initialBalanceB = receivedParameters.initialBalance;
                                    initialBalanceA = 0
                                } else {
                                    initialBalanceB = DEFAULT_BASE_ASSET_BALANCE;
                                    initialBalanceA = 0
                                }
                                if (receivedParameters.minimumBalance !== undefined) {
                                    minimumBalanceB = receivedParameters.minimumBalance;
                                    minimumBalanceA = 0
                                } else {
                                    minimumBalanceB = DEFAULT_BASE_ASSET_MINIMUN_BALANCE;
                                    minimumBalanceA = 0
                                }
                                if (receivedParameters.maximumBalance !== undefined) {
                                    maximumBalanceB = receivedParameters.maximumBalance;
                                    maximumBalanceA = 0
                                } else {
                                    maximumBalanceB = DEFAULT_BASE_ASSET_MAXIMUN_BALANCE;
                                    maximumBalanceA = 0
                                }
                            }
                        } catch (err) {
                            tradingSystem.parameters.baseAsset.formula.error = err.message
                        }
                    }
                }
            }

            /* Strategy and Phases */

            let currentStrategyIndex = -1;
            let strategyStage = 'No Stage';   

            /* Stop Loss Management */

            const MIN_STOP_LOSS_VALUE = 1 // We can not let the stop be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_STOP_LOSS_VALUE = Number.MAX_SAFE_INTEGER
            let stopLoss = 0;
            let stopLossPhase = 0;
            let stopLossStage = 'No Stage';  

            /* Take Profit Management */

            const MIN_TAKE_PROFIT_VALUE = 1 // We can not let the buy order be zero to avoid division by 0 error or infinity numbers as a result.
            const MAX_TAKE_PROFIT_VALUE = Number.MAX_SAFE_INTEGER
            let previousTakeProfit = 0;
            let takeProfit = 0;
            let takeProfitPhase = 0;
            let takeProfitStage = 'No Stage';  

            /* Simulation Records */

            let tradePositionRate = 0;
            let tradePositionSize = 0;
            let positionInstant;

            let previousBalanceAssetA = 0;
            let previousBalanceAssetB = 0;
            let hitRatio = 0;
            let ROI = 0;
            let days = 0;
            let anualizedRateOfReturn = 0;
            let type = '""';
            let marketRate = 0;
            let takePositionNow = false

            /* Assistant Info */

            let ticker = assistant.getTicker();

            /* In some cases we need to know if we are positioned at the last candle of the calendar day, for that we need thse variables. */

            let lastInstantOfTheDay = currentDay.valueOf() + ONE_DAY_IN_MILISECONDS - 1;
            let lastCandle = candles[candles.length - 1];

            /* These 2 objects will allow us to create separate files for each one of them. */

            let currentStrategy = {
                begin: 0,
                end: 0,
                status: 0,
                number: 0
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

            let balanceAssetA = initialBalanceA;
            let balanceAssetB = initialBalanceB;

            let lastTradeProfitLoss = 0;
            let profit = 0;
            let lastTradeROI = 0;

            let roundtrips = 0;
            let fails = 0;
            let hits = 0;
            let periods = 0;

            /* Message to the Simulation Executor */

            let orderId = 0;
            let messageId = 0;

            let yesterday = {};

            yesterday.balanceAssetA = balanceAssetA;
            yesterday.balanceAssetB = balanceAssetB;

            yesterday.lastTradeProfitLoss = 0;
            yesterday.profit = 0;
            yesterday.lastTradeROI = 0;

            yesterday.Roundtrips = 0;
            yesterday.fails = 0;
            yesterday.hits = 0;
            yesterday.Periods = 0;

            yesterday.orderId = 0;
            yesterday.messageId = 0;

            yesterday.hitRatio = 0;
            yesterday.ROI = 0;
            yesterday.anualizedRateOfReturn = 0;

            if (interExecutionMemory.roundtrips === undefined) {

                /* Initialize the data structure we will use inter execution. */

                interExecutionMemory.balanceAssetA = balanceAssetA;
                interExecutionMemory.balanceAssetB = balanceAssetB;

                interExecutionMemory.lastTradeProfitLoss = lastTradeProfitLoss;
                interExecutionMemory.profit = profit;
                interExecutionMemory.lastTradeROI = lastTradeROI;

                interExecutionMemory.roundtrips = 0;
                interExecutionMemory.fails = 0;
                interExecutionMemory.hits = 0;
                interExecutionMemory.periods = 0;

                interExecutionMemory.orderId = 0;
                interExecutionMemory.messageId = 0;

                interExecutionMemory.hitRatio = 0;
                interExecutionMemory.ROI = 0;
                interExecutionMemory.anualizedRateOfReturn = 0;

            } else {

                /* We get the initial values from the day previous to the candles we receive at the current execution */

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

                orderId = interExecutionMemory.orderId;
                messageId = interExecutionMemory.messageId;

                hitRatio = interExecutionMemory.hitRatio;
                ROI = interExecutionMemory.ROI;
                anualizedRateOfReturn = interExecutionMemory.anualizedRateOfReturn;

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
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> i = " + i); }

                let candle = candles[i];
                let percentageBandwidth = percentageBandwidthMap.get(candle.begin);
                let bollingerBand = bollingerBandsMap.get(candle.begin);
                let bollingerChannel = getElement(bollingerChannelsArray, candle.begin, candle.end);
                let bollingerSubChannel = getElement(bollingerSubChannelsArray, candle.begin, candle.end);

                //let LRC = LRCMap.get(candle.begin);

                /* If any of the needed indicators is missing, then that period is not calculated */

                if (candle.begin < initialDate.valueOf()) {
                    controlLoop();
                    return
                }
                if (bollingerBand === undefined) {
                    controlLoop();
                    return
                }
                if (percentageBandwidth === undefined) {
                    controlLoop();
                    return
                } // percentageBandwidth might start after the first few candles.
                if (bollingerChannel === undefined) {
                    controlLoop();
                    return
                }
                if (bollingerSubChannel === undefined) {
                    controlLoop();
                    return
                }

                //if (LRC === undefined) { controlLoop(); return}

                periods++;
                days = periods * timePeriod / ONE_DAY_IN_MILISECONDS;

                if (currentDay !== undefined) { // This means that we are processing Daily Files 
                    if (candle.end < currentDay.valueOf()) {
                        yesterday.Periods++;
                    }

                    /* We skip the candle at the head of the market because i has not closed yet. */
                    let candlesPerDay = ONE_DAY_IN_MILISECONDS / timePeriod
                    if (i === candles.length - 1) {
                        if ((candles.length < candlesPerDay) || (candles.length > candlesPerDay && candles.length < candlesPerDay * 2)) {
                            /*We are at the head of the market, thus we skip the last candle because it has not close yet. */
                            controlLoop();
                            return
                            /* Note here that in the last candle of the first day or the second day it will use an incomplete candle and partially calculated indicators.
                                if we skip these two periods, then there will be a hole in the file since the last period will be missing. */
                        }
                    }
                } else { // We are processing Market Files
                    if (i === candles.length - 1) {
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
                                    currentTrade.begin = candle.begin;
                                    currentTrade.beginRate = candle.close;
                                    takePositionNow = true
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

                        if (baseAsset === 'BTC') {
                            strategy.positionSize = balanceAssetB / stopLoss;
                            strategy.positionRate = stopLoss;

                            balanceAssetA = balanceAssetA + balanceAssetB / stopLoss;
                            balanceAssetB = 0;
                        } else {
                            strategy.positionSize = balanceAssetA * stopLoss;
                            strategy.positionRate = stopLoss;

                            balanceAssetB = balanceAssetB + balanceAssetA * stopLoss;
                            balanceAssetA = 0;
                        }

                        if (currentDay !== undefined) {
                            if (positionInstant < currentDay.valueOf()) {
                                yesterday.balanceAssetA = balanceAssetA;
                                yesterday.balanceAssetB = balanceAssetB;
                            }
                        }

                        marketRate = stopLoss;
                        type = '"Close@StopLoss"';
                        strategyStage = 'Close Stage';
                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';
                        currentTrade.end = candle.end;
                        currentTrade.status = 1;
                        currentTrade.exitType = 1;
                        currentTrade.endRate = stopLoss;

                        currentStrategy.number = currentStrategyIndex
                        currentStrategy.end = candle.end;
                        currentStrategy.endRate = candle.min;
                        currentStrategy.status = 1;
                    }

                    /* Take Profit condition: Here we verify if the Take Profit was filled or not. */

                    if ((baseAsset === 'BTC' && candle.min <= takeProfit) || (baseAsset !== 'BTC' && candle.max >= takeProfit)) {

                        if (baseAsset === 'BTC') {
                            strategy.positionSize = balanceAssetB / takeProfit;
                            strategy.positionRate = takeProfit;

                            balanceAssetA = balanceAssetA + balanceAssetB / takeProfit;
                            balanceAssetB = 0;
                        } else {
                            strategy.positionSize = balanceAssetA * takeProfit;
                            strategy.positionRate = takeProfit;

                            balanceAssetB = balanceAssetB + balanceAssetA * takeProfit;
                            balanceAssetA = 0;
                        }

                        if (currentDay !== undefined) {
                            if (positionInstant < currentDay.valueOf()) {
                                yesterday.balanceAssetA = balanceAssetA;
                                yesterday.balanceAssetB = balanceAssetB;

                            }
                        }

                        marketRate = takeProfit;
                        type = '"Close@TakeProfit"';
                        strategyStage = 'Close Stage';
                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';
                        currentTrade.end = candle.end;
                        currentTrade.status = 1;
                        currentTrade.exitType = 2;
                        currentTrade.endRate = takeProfit;

                        currentStrategy.number = currentStrategyIndex
                        currentStrategy.end = candle.end;
                        currentStrategy.endRate = candle.min;
                        currentStrategy.status = 1;
                    }
                }

                /* Taking a Position */
                if (
                    takePositionNow === true
                ) {
                    takePositionNow = false

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    tradePositionSize = strategy.positionSize;
                    tradePositionRate = strategy.positionRate;

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
                            case "Closing Position": { // Waiting for a confirmation that the position was closed.
                                if (strategy.openStage !== undefined) {
                                    if (strategy.openStage.openExecution !== undefined) {
                                        putOpeningOrder()
                                        return
                                    }
                                }
                                break
                            }
                            case "Taking Position": { // Waiting for a confirmation that the position was taken.
                                break
                            }
                            case "In a Position": { // This should mean that we already put the order at the exchange.
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

                    takePositionAtSimulation()
                    return

                    function putOpeningOrder() {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> Entering function."); }

                        let positionDirection
                        if (baseAsset === 'BTC') {
                            positionDirection = "sell"
                        } else {
                            positionDirection = "buy"
                        }

                        interExecutionMemory.executionContext = {
                            status: "Taking Position"
                        }

                        assistant.putPosition(positionDirection, tradePositionRate, tradePositionSize * tradePositionRate, tradePositionSize, onOrderPut)

                        function onOrderPut(err) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> onOrderPut -> Entering function."); }

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> onOrderPut -> DEFAULT_OK_RESPONSE "); }
                                    interExecutionMemory.executionContext = {
                                        status: "In a Position"
                                    }
                                    takePositionAtSimulation()
                                    return;
                                }
                                case global.DEFAULT_FAIL_RESPONSE.result: {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> onOrderPut -> DEFAULT_FAIL_RESPONSE "); }
                                    strategy.openStage.openExecution.error = err.message
                                    afterLoop()
                                    return;
                                }
                                case global.DEFAULT_RETRY_RESPONSE.result: {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> onOrderPut -> DEFAULT_RETRY_RESPONSE "); }
                                    strategy.openStage.openExecution.error = err.message
                                    afterLoop()
                                    return;
                                }
                            }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> onOrderPut -> Unexpected Response -> Message = " + err.message); }
                            strategy.openStage.openExecution.error = err.message
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

                        lastTradeProfitLoss = 0;
                        lastTradeROI = 0;

                        if (baseAsset === 'BTC') {
                            balanceAssetB = balanceAssetB + tradePositionSize * tradePositionRate;
                            balanceAssetA = balanceAssetA - tradePositionSize;
                        } else {
                            balanceAssetA = balanceAssetA + tradePositionSize / tradePositionRate;
                            balanceAssetB = balanceAssetB - tradePositionSize;
                        }

                        positionInstant = candle.end;

                        if (currentDay !== undefined) {
                            if (positionInstant < currentDay.valueOf()) {
                                yesterday.balanceAssetA = balanceAssetA;
                                yesterday.balanceAssetB = balanceAssetB;

                                yesterday.lastTradeProfitLoss = lastTradeProfitLoss;
                                yesterday.lastTradeROI = lastTradeROI;
                            }
                        }

                        addRecord();
                        controlLoop();
                        return
                    }
                }

                /* Closing a Position */
                if (strategyStage === 'Close Stage') {

                    /* Position size and rate */
                    let strategy = tradingSystem.strategies[currentStrategyIndex];

                    tradePositionSize = strategy.positionSize;
                    tradePositionRate = strategy.positionRate;

                    /* We see if we need to put the actual order at the exchange. */

                    if (interExecutionMemory.executionContext !== undefined) {
                        switch (interExecutionMemory.executionContext.status) {
                            case "Without a Position": { // No way to close anything at the exchange.
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
                            case "Taking Position": { // Waiting for a confirmation that the position was taken.
                                if (strategy.closeStage !== undefined) {
                                    if (strategy.closeStage.closeExecution !== undefined) {
                                        putClosingOrder()
                                        return
                                    }
                                }
                                break
                            }

                            case "Closing Position": { // Waiting for a confirmation that the position was closed.
                                break
                            }

                            case "Position Closed": { //  
                                break
                            }
                        }
                    }

                    closePositionAtSimulation()
                    return 

                    function putClosingOrder() {

                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putClosingOrder -> Entering function."); }

                        let positionDirection
                        if (baseAsset === 'BTC') {
                            positionDirection = "buy"
                        } else {
                            positionDirection = "sell"
                        }

                        interExecutionMemory.executionContext = {
                            status: "Closing Position"
                        }

                        assistant.putPosition(positionDirection, tradePositionRate, tradePositionSize * tradePositionRate, tradePositionSize, onOrderPut)

                        function onOrderPut(err) {
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putClosingOrder -> onOrderPut -> Entering function."); }

                            switch (err.result) {
                                case global.DEFAULT_OK_RESPONSE.result: {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putClosingOrder -> onOrderPut -> DEFAULT_OK_RESPONSE "); }
                                    interExecutionMemory.executionContext = {
                                        status: "Position Closed"
                                    }
                                    closePositionAtSimulation()
                                    return;
                                }
                                case global.DEFAULT_FAIL_RESPONSE.result: {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putClosingOrder -> onOrderPut -> DEFAULT_FAIL_RESPONSE "); }
                                    /* We will assume that the problem is temporary, and expect that it will work at the next execution.*/
                                    strategy.openStage.openExecution.error = err.message
                                    afterLoop()
                                    return;
                                }
                                case global.DEFAULT_RETRY_RESPONSE.result: {
                                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putOpeningOrder -> onOrderPut -> DEFAULT_RETRY_RESPONSE "); }
                                    strategy.openStage.openExecution.error = err.message
                                    afterLoop()
                                    return;
                                }
                            }
                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> putClosingOrder -> onOrderPut -> Unexpected Response -> Message = " + err.message); }
                            strategy.openStage.openExecution.error = err.message
                        }
                    }

                    function closePositionAtSimulation() {
                        if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> closePositionAtSimulation -> Entering function."); }

                        roundtrips++;

                        if (currentDay !== undefined) {
                            if (positionInstant < currentDay.valueOf()) {
                                yesterday.Roundtrips++;
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

                        if (currentDay !== undefined) {
                            if (positionInstant < currentDay.valueOf()) {
                                yesterday.lastTradeProfitLoss = lastTradeProfitLoss;
                                yesterday.profit = profit;
                                yesterday.lastTradeROI = lastTradeROI;
                            }
                        }

                        currentTrade.lastTradeROI = lastTradeROI;
                        currentTrade.stopRate = stopLoss;

                        if (lastTradeProfitLoss > 0) {
                            hits++;

                            if (currentDay !== undefined) {
                                if (positionInstant < currentDay.valueOf()) {
                                    yesterday.hits++;
                                }
                            }

                        } else {
                            fails++;

                            if (currentDay !== undefined) {
                                if (positionInstant < currentDay.valueOf()) {
                                    yesterday.fails++;
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

                        if (currentDay !== undefined) {
                            if (positionInstant < currentDay.valueOf()) {
                                yesterday.ROI = ROI;
                                yesterday.hitRatio = hitRatio;
                                yesterday.anualizedRateOfReturn = anualizedRateOfReturn;
                            }
                        }

                        addRecord();

                        currentStrategyIndex = -1;
                        stopLoss = 0;
                        tradePositionRate = 0;
                        tradePositionSize = 0;
                        positionInstant = undefined;
                        takeProfit = 0;
                        strategyStage = 'No Stage';
                        stopLossStage = 'No Stage';
                        takeProfitStage = 'No Stage';
                        stopLossPhase = 0;
                        takeProfitPhase = 0;
                        controlLoop();
                        return
                    }
                }

                /* Not a buy or sell condition */

                marketRate = candle.close;
                addRecord();
                controlLoop();
                return

                function addRecord() {
                    if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> loop -> addRecord -> Entering function."); }

                    // Since we are going to write the message to a file that the Simulation Executor is going to read, we use the abbreviations.
                    let messageType;
                    let message;
                    let simulationRecord;
                    let executionRecord;
                    let executionMessage;

                    messageId++;

                    if (strategyStage === 'Open Stage' || strategyStage === 'Manage Stage' || type === '"Close@TakeProfit"' || type === '"Close@StopLoss"') {

                        if (type === '"Take Position"') {
                            messageType = MESSAGE_TYPE.Order;
                            orderId++;

                            if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> addRecord -> Taking Position Now. "); }

                        } else {
                            if (type === '"Close@TakeProfit"' || type === '"Close@StopLoss"') {
                                messageType = MESSAGE_TYPE.OrderClose;

                                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> addRecord -> Closing Position Now. "); }

                            } else {
                                messageType = MESSAGE_TYPE.OrderUpdate;
                            }
                        }

                        let exitOutcome = ""
                        if (messageType === MESSAGE_TYPE.OrderClose && type === '"Close@TakeProfit"') {
                            exitOutcome = "TP"
                        }
                        if (messageType === MESSAGE_TYPE.OrderClose && type === '"Close@StopLoss"') {
                            exitOutcome = "SL"
                        }

                        executionMessage = createMessage(
                            messageId,
                            MESSAGE_ENTITY.SimulationEngine,
                            MESSAGE_ENTITY.SimulationExecutor,
                            messageType,
                            (new Date()).valueOf(),
                            orderId.toString(),
                            ORDER_CREATOR.SimulationEngine,
                            (new Date()).valueOf(),
                            ORDER_OWNER.User,
                            global.EXCHANGE_NAME,
                            "BTC_USDT",
                            0,
                            ORDER_TYPE.Limit,
                            tradePositionRate,
                            stopLoss,
                            takeProfit,
                            ORDER_DIRECTION.Sell,
                            -1,
                            ORDER_STATUS.Signaled,
                            0,
                            exitOutcome,
                            "")

                    }
                    else {

                        executionMessage = createMessage(
                            messageId,
                            MESSAGE_ENTITY.SimulationEngine,
                            MESSAGE_ENTITY.SimulationExecutor,
                            MESSAGE_TYPE.HeartBeat,
                            (new Date()).valueOf(),
                            "",
                            "",
                            0,
                            "",
                            "",
                            "",
                            0,
                            "",
                            0,
                            0,
                            0,
                            "",
                            0,
                            "",
                            0,
                            "",
                            "")
                    }

                    executionRecord = {
                        begin: candle.begin,
                        end: candle.end,
                        executionRecord: executionMessage
                    }

                    executionArray.push(executionRecord)

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
                        executionRecord: executionMessage,
                        positionSize: tradePositionSize,
                        initialBalanceA: initialBalanceA,
                        minimumBalanceA: minimumBalanceA,
                        maximumBalanceA: maximumBalanceA,
                        initialBalanceB: initialBalanceB,
                        minimumBalanceB: minimumBalanceB,
                        maximumBalanceB: maximumBalanceB,
                        baseAsset: quotedBaseAsset
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
                    }
                }
            }

            function controlLoop() {
                if (FULL_LOG === true) { logger.write(MODULE_NAME, "[INFO] runSimulation -> controlLoop -> Entering function."); }
                i++
                if (i < candles.length) {
                    loop()
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

                if (currentDay !== undefined) {

                    if (lastCandle.end === lastInstantOfTheDay) {

                        interExecutionMemory.balanceAssetA = yesterday.balanceAssetA;
                        interExecutionMemory.balanceAssetB = yesterday.balanceAssetB;
                        interExecutionMemory.lastTradeProfitLoss = yesterday.lastTradeProfitLoss;
                        interExecutionMemory.profit = yesterday.profit;
                        interExecutionMemory.lastTradeROI = yesterday.lastTradeROI;

                        interExecutionMemory.roundtrips = interExecutionMemory.roundtrips + yesterday.Roundtrips;
                        interExecutionMemory.fails = interExecutionMemory.fails + yesterday.fails;
                        interExecutionMemory.hits = interExecutionMemory.hits + yesterday.hits;
                        interExecutionMemory.periods = interExecutionMemory.periods + yesterday.Periods;

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



