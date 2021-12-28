exports.newPortfolioManagementBotModulesPortfolioManagerFormulasManager = function (processIndex) {
    /*
    This object represents the Events Manager at the Portfolio System.
    Here we will process requests comming from Trading Bots to
    the Events Manager.
    */
    let thisObject = {
        confirmThisEvent: confirmThisEvent,
        setThisEvent: setThisEvent,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
        isRunning = false
    }

    function finalize() {
        portfolioEngine = undefined
        tradingBotsCheckInStatusMap = undefined
    }

    function confirmThisEvent(event) {

    }

    function setThisEvent(event) {

    }
}