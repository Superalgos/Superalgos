exports.newPortfolioManagementBotModulesPortfolioManagerFormulasManager = function (processIndex) {
    /*
    This object represents the Formulas Manager at the Portfolio System.
    Here we will process requests comming from Trading Bots to
    the Formulas Manager.
    */
    let thisObject = {
        confirmThisFormula: confirmThisFormula,
        setThisFormula: setThisFormula,
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

    function confirmThisFormula(SESSION_KEY, formula) {

    }

    function setThisFormula(SESSION_KEY, formula) {

    }
}
