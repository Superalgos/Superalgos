exports.newPortfolioManagementModulesPortfolioManagerClient = function (processIndex) {
    /*
    This object represents a proxy of the Profile Manager. It is used to send 
    questions to the Event and Formula Managers and receive their answers.
    */
    let thisObject = {
        askPortfolioEventManager: askPortfolioEventManager,
        askPortfolioFormulaManager: askPortfolioFormulaManager, 
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    async function askPortfolioEventManager(eventNode, conectInfo) {
        console.log('here')
    }

    async function askPortfolioFormulaManager() {

    }
}