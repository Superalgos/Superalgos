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

    return thisObject

    function initialize(managedTradingBots) {
        managedTradingBotsModuleObject = managedTradingBots
    }

    function finalize() {
        managedTradingBotsModuleObject = undefined
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
                break
            }
            case 'Set This Event': {
                break
            }
            case 'Confirm This Formula': {
                break
            }
            case 'Set This Formula': {
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