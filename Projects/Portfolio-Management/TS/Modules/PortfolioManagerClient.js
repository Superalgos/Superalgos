exports.newPortfolioManagementModulesPortfolioManagerClient = function (processIndex) {
    /*
    This object represents a proxy of the Profile Manager. It is used to send 
    questions to the Event and Formula Managers and receive their answers.
    */
    let thisObject = {
        askPortfolioEventsManager: askPortfolioEventsManager,
        askPortfolioFormulaManager: askPortfolioFormulaManager,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioManagerEventsClient = TS.projects.portfolioManagement.modules.portfolioManagerEventsClient.newPortfolioManagementModulesPortfolioManagerEventsClient(processIndex)

    return thisObject

    function initialize() {
        portfolioManagerEventsClient.initialize()
    }

    function finalize() {
        portfolioManagerEventsClient.finalize()
        portfolioManagerEventsClient = undefined
    }

    async function askPortfolioEventsManager(eventNode, eventStatus) {
        let response = {
            raiseEvent: eventStatus,
            reason: "No need to ask Portfolio Manager"
        }

        if (eventNode.askPortfolioEventsManager === undefined) {
            return response
        }

        if (eventStatus == true) {
            /*
            First we will check if the Portfolio Manager confirms this event
            can be raised.
            */
            if (eventNode.askPortfolioEventsManager.confirmEvent !== undefined) {
                let message = {
                    question: "Confirm This Event",
                    event: eventNode.type,
                    eventNodeId: eventNode.id
                }
                response = await portfolioManagerEventsClient.sendMessage(message)
            }
        } else {
            /*
            In this case, we will check if the Porfolio Manager would like to 
            raise this event anyways.
            */
            if (eventNode.askPortfolioEventsManager.raiseEvent !== undefined) {
                let message = {
                    question: "Must This Event Be Raised",
                    event: eventNode.type,
                    eventNodeId: eventNode.id
                }
                response = await portfolioManagerEventsClient.sendMessage(message)
            }
        }
        return response
    }

    async function askPortfolioFormulaManager(formulaParentNode, formulaValue) {
        let response = {
            value: formulaValue,
            reason: "No need to ask Portfolio Manager"
        }
        if (formulaParentNode === undefined) {
            return response
        }
        if (formulaParentNode.askPortfolioFormulaManager === undefined) {
            return response
        }

        /*
         *  First we will check if the Porfolio Manager would like to 
         *  replace this formula value for something else.
         */
        if (formulaParentNode.askPortfolioFormulaManager.setFormula !== undefined) {
            let message = {
                question: "Give Me A Value For This Formula",
                formula: formulaParentNode.type,
                formulaParentNodeId: formulaParentNode.id
            }
            response = await portfolioManagerEventsClient.sendMessage(message)
        }
        /*
         *  Second we will check if the Portfolio Manager confirms this formula
         *  value.
         */
        if (formulaParentNode.askPortfolioFormulaManager.confirmFormula !== undefined) {
            let message = {
                question: "Confirm This Formula Value",
                formula: formulaParentNode.type,
                formulaParentNodeId: formulaParentNode.id
            }
            response = await portfolioManagerEventsClient.sendMessage(message)
        }
        return response
    }
}