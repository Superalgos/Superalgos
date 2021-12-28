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

    let portfolioSystem

    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
    }

    function finalize() {
        portfolioSystem = undefined
    }

    function confirmThisFormula(SESSION_KEY, formula) {

    }

    function setThisFormula(SESSION_KEY, formula) {

    }
}
