exports.newPortfolioManagementBotModulesPortfolioManagedTradingBots = function (processIndex) {
    /*
    This object represents the Trading Bots being managed and it solves
    the syncronization problem between the Portfolio Bot Simulation and the 
    Trading Bot Simulation.
    */
    let thisObject = {
        moveTradingEnginesIntoPortfolioEngine: moveTradingEnginesIntoPortfolioEngine,
        waitForManagedTradingBotsToAskTheirQuestions: waitForManagedTradingBotsToAskTheirQuestions,
        checkInCandle: checkInCandle,
        checkOutCandle: checkOutCandle,
        initialize: initialize,
        finalize: finalize
    }
    let portfolioEngine
    let isRunning
    let tradingBotsCheckInCheckOutStatusMap
    let tradingBotsTradingEngineMap

    return thisObject

    function initialize() {
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        isRunning = false
    }

    function finalize() {
        portfolioEngine = undefined
        tradingBotsCheckInCheckOutStatusMap = undefined
        tradingBotsTradingEngineMap = undefined
    }

    function moveTradingEnginesIntoPortfolioEngine() {

        for (let i = 0; i < TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES.length; i++) {

            let SESSION_KEY = TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.name +
                '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.type +
                '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.id

            let tradingEngine = tradingBotsTradingEngineMap.get(SESSION_KEY)
            let managedTradingBotEngine = portfolioEngine.managedTradingBots.managedTradingBots[i].managedTradingBotEngine

            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).ENGINE_MODULE_OBJECT.cloneValues(tradingEngine, managedTradingBotEngine)

        }
    }

    async function waitForManagedTradingBotsToAskTheirQuestions() {
        let promise = new Promise((resolve, reject) => {
            isRunning = true

            tradingBotsCheckInCheckOutStatusMap = new Map()
            tradingBotsTradingEngineMap = new Map()
            let intervalId = setInterval(checkTradingBotsStatus, 10)

            function checkTradingBotsStatus() {

                let checkedInCount = 0
                let checkedOutCount = 0

                for (let i = 0; i < TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES.length; i++) {

                    let SESSION_KEY = TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.name +
                        '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.type +
                        '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.id

                    let status = tradingBotsCheckInCheckOutStatusMap.get(SESSION_KEY)

                    switch (status) {
                        case 'Checked In': {
                            checkedInCount++
                            break
                        }
                        case 'Checked Out': {
                            checkedOutCount++
                            break
                        }
                    }

                    if (checkedOutCount === TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES.length) {
                        clearInterval(intervalId)
                        isRunning = false
                        resolve()
                    }
                }
            }
        })
        return promise
    }

    function checkInCandle(
        SESSION_KEY,
        candle
    ) {
        let response
        if (isRunning === false) {
            /*
            We are not going to allow Check Ins when the Portfolio Manager is
            not ready for that.
            */
            response = {
                status: 'Not Ok',
                reason: "Portfolio Manager Is Not Ready"
            }
            return response
        }

        if (
            candle.begin === portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value &&
            candle.end === portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
        ) {
            response = {
                status: 'Ok',
                reason: "Portfolio Manager Also At This Candle"
            }
            /*
            Remember that this Trading Bot Checked In.
            */
            tradingBotsCheckInCheckOutStatusMap.set(SESSION_KEY, 'Checked In')
            return response
        }

        if (
            candle.end - candle.begin !== portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value - portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value
        ) {
            response = {
                status: 'Not Ok',
                reason: "Time Frame of the Trading Bot and Portfolio Bot are Different."
            }
            return response
        }

        if (candle.begin > portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value) {
            response = {
                status: 'Not Ok',
                reason: "Portfolio Manager Is Behind Trading Bot.",
                candle: {
                    begin: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value,
                    end: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
                }
            }            
            /*
            The trading Bot is ahead of time relative to the Portfolio Bot, so in order to allow the Portfolio Bot to 
            move fordward, we will consider that this tradinb bot has made a Checked Out.
            */
            tradingBotsCheckInCheckOutStatusMap.set(SESSION_KEY, 'Checked Out')
            return response
        }

        response = {
            status: 'Not Ok',
            reason: "Portfolio Manager Is Ahead of Trading Bot.",
            candle: {
                begin: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value,
                end: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
            }
        }
        return response
    }

    function checkOutCandle(
        SESSION_KEY,
        candle,
        tradingEngine
    ) {
        let response
        if (isRunning === false) {
            /*
            We are not going to allow Check Outs when the Portfolio Manager is
            not ready for that.
            */
            response = {
                status: 'Not Ok',
                reason: "Portfolio Manager Is Not Ready"
            }
            return response
        }

        if (
            candle.begin === portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value &&
            candle.end === portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
        ) {
            response = {
                status: 'Ok',
                reason: "Acknowledged"
            }
            /*
            Remember that this Trading Bot Checked Out.
            */
            tradingBotsCheckInCheckOutStatusMap.set(SESSION_KEY, 'Checked Out')
            /*
            Remember that this Trading Bot's Trading Engine.
            */
            tradingBotsTradingEngineMap.set(SESSION_KEY, tradingEngine)
        } else {
            response = {
                status: 'Not Ok',
                reason: "Portfolio Manager Is At This Candle",
                candle: {
                    begin: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.begin.value,
                    end: portfolioEngine.portfolioCurrent.portfolioEpisode.candle.end.value
                }
            }
        }
        return response
    }
}