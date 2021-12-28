exports.newPortfolioManagementModulesTradingBotsInterface = function (processIndex) {
    /*
    This object represents a proxy of the Profile Manager. It is used to send 
    questions to the Event and Formula Managers and receive their answers.
    */
    let thisObject = {
        processMessage: processMessage,
        initialize: initialize,
        finalize: finalize
    }
    let managedTradingBotsModuleObject
    let portfolioSystemModuleObject

    return thisObject

    function initialize(managedTradingBots, portfolioSystem) {
        managedTradingBotsModuleObject = managedTradingBots
        portfolioSystemModuleObject = portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
    }

    function finalize() {
        managedTradingBotsModuleObject = undefined
        portfolioSystemModuleObject = undefined
    }

    function processMessage(
        SESSION_KEY,
        message
    ) {
        let response

        switch (message.type) {
            case 'Check In Candle': {
                response = managedTradingBotsModuleObject.checkInCandle(
                    SESSION_KEY,
                    message.candle
                )
                break
            }
            case 'Check Out Candle': {
                response = managedTradingBotsModuleObject.checkOutCandle(
                    SESSION_KEY,
                    message.candle
                )
                break
            }
            case 'Confirm This Event': {
                response = portfolioSystemModuleObject.confirmThisEvent(
                    SESSION_KEY,
                    message.event
                )
                break
            }
            case 'Set This Event': {
                response = portfolioSystemModuleObject.setThisEvent(
                    SESSION_KEY,
                    message.event
                )
                break
            }
            case 'Confirm This Formula': {
                response = portfolioSystemModuleObject.confirmThisFormula(
                    SESSION_KEY,
                    message.formula
                )
                break
            }
            case 'Set This Formula': {
                response = portfolioSystemModuleObject.setThisFormula(
                    SESSION_KEY,
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