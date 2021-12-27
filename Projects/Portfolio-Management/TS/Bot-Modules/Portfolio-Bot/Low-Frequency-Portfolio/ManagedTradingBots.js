exports.newPortfolioManagementBotModulesManagedTradingBots = function (processIndex) {
    /*
    This object represents the Trading Bots being managed.
    */
    let thisObject = {
        run: run,
        checkInCandle: checkInCandle,
        checkOutCandle: checkOutCandle,
        initialize: initialize,
        finalize: finalize
    }
    let portfolioSystemModuleObject
    let portfolioEngine
    let isRunning
    let tradingBotsCheckInStatusMap

    return thisObject

    function initialize(portfolioSystemModuleObject) {
        isRunning = false
        portfolioSystemModuleObject = portfolioSystemModuleObject
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine

        tradingBotsCheckInStatusMap = new Map()
    }

    function finalize() {
        portfolioSystemModuleObject = undefined
        portfolioEngine = undefined
        tradingBotsCheckInStatusMap = undefined
    }

    async function run() {
        let promise = new Promise((resolve, reject) => {
            isRunning = true

            let intervalId = setInterval(checkTradingBotsStatus, 1000)

            function checkTradingBotsStatus() {

                let checkedInCount = 0
                let checkedOutCount = 0

                for (let i = 0; i < TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES.length; i++) {

                    let SESSION_KEY = TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.name +
                        '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.type +
                        '-' + TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES[i].referenceParent.id

                    let status = tradingBotsCheckInStatusMap.get(SESSION_KEY)

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
            tradingBotsCheckInStatusMap.set(SESSION_KEY, 'Checked In')

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

    function checkOutCandle(
        SESSION_KEY,
        candle
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
            Remember that this Trading Bot Checked In.
            */
            tradingBotsCheckInStatusMap.set(SESSION_KEY, 'Checked Out')

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