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

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    async function askPortfolioEventsManager(eventNode, eventStatus) {
        let response = {
            raiseEvent: eventStatus,
            reason: "No need to ask Portfolio Manager"
        }

        if (eventNode.askPortfolioEventsManager === undefined) {
            return response
        }

        if (eventStatus === true) {
            /*
            First we will check if the Portfolio Manager confirms this event
            can be raised.
            */
            if (eventNode.askPortfolioEventsManager.confirmEvent !== undefined) {
                let message = {
                    question: "Confirm This Event Can Be Raised",
                    event: eventNode.type
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
                    event: eventNode.type
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

        if (formulaValue === true) {
            /*
            First we will check if the Portfolio Manager confirms this formula
            value.
            */
            if (formulaParentNode.askPortfolioEventsManager.confirmFormula !== undefined) {
                let message = {
                    question: "Confirm This Formula Value",
                    formula: formulaParentNode.type
                }
                response = await portfolioManagerEventsClient.sendMessage(message)
            }
        } else {
            /*
            In this case, we will check if the Porfolio Manager would like to 
            replace this formula value for something else.
            */
            if (formulaParentNode.askPortfolioEventsManager.raiseEvent !== undefined) {
                let message = {
                    question: "Give me a Value for this Formula",
                    formula: formulaParentNode.type
                }
                response = await portfolioManagerEventsClient.sendMessage(message)
            }
        }
        return response
    }
}