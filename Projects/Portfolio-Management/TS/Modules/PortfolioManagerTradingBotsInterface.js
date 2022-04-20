exports.newPortfolioManagementModulesPortfolioManagerTradingBotsInterface = function (processIndex) {
    /*
    This object represents a proxy of the Profile Manager. It is used to send 
    questions to the Event and Formula Managers and receive their answers.
    */
    let thisObject = {
        processMessage: processMessage,
        initialize: initialize,
        finalize: finalize
    }
    let portfolioManagedTradingBotsModuleObject
    let portfolioSystemModuleObject
    let portfolioEngine

    return thisObject

    function initialize(managedTradingBots, portfolioSystem) {
        portfolioManagedTradingBotsModuleObject = managedTradingBots
        portfolioSystemModuleObject = portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
    }

    function finalize() {
        portfolioManagedTradingBotsModuleObject = undefined
        portfolioSystemModuleObject = undefined
    }

    function processMessage(
        SESSION_KEY,
        sessionId,
        message
    ) {
        let response

        switch (message.type) {
            case 'Check In Candle': {
                response = portfolioManagedTradingBotsModuleObject.checkInCandle(
                    SESSION_KEY,
                    message.candle
                )
                break
            }
            case 'Check Out Candle': {
                response = portfolioManagedTradingBotsModuleObject.checkOutCandle(
                    SESSION_KEY,
                    message.candle,
                    message.tradingEngine
                )
                break
            }
            case 'Confirm This Event': {
                response = portfolioSystemModuleObject.confirmThisEvent(
                    sessionId,
                    message.event
                )
                break
            }
            case 'Set This Event': {
                response = portfolioSystemModuleObject.setThisEvent(
                    sessionId,
                    message.event
                )
                break
            }
            case 'Confirm This Formula': {
                response = portfolioSystemModuleObject.confirmThisFormula(
                    sessionId,
                    message.formula
                )
                break
            }
            case 'Set This Formula': {
                response = portfolioSystemModuleObject.setThisFormula(
                    sessionId,
                    message.formula
                )
                break
            }
            default: {
                response = {
                    status: 'Not Ok',
                    reason: "Message Type Not Supported"
                }
            }
        }
        return response
    }
}