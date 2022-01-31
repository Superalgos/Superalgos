exports.newPortfolioManagementModulesPortfolioManagerClient = function (processIndex) {
    /*
    This code runs inside the Trading Bots. 

    This object represents a proxy of the Portfolio Manager. It is used to send 
    requests to the Event and Formula Managers and receive their answers.
    */
    let thisObject = {
        candleEntry: candleEntry,
        candleExit: candleExit,
        askPortfolioEventsManager: askPortfolioEventsManager,
        askPortfolioFormulaManager: askPortfolioFormulaManager,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioManagerEventsClient

    return thisObject

    function initialize() {
        portfolioManagerEventsClient = TS.projects.portfolioManagement.modules.portfolioManagerEventsClient.newPortfolioManagementModulesPortfolioManagerEventsClient(processIndex)
        portfolioManagerEventsClient.initialize()
    }

    function finalize() {
        portfolioManagerEventsClient.finalize()
        portfolioManagerEventsClient = undefined
    }

    async function candleEntry(candle) {
        let message = {
            type: "Check In Candle",
            candle: {
                begin: candle.begin,
                end: candle.end
            }
        }
        /*
        Since the trading bot could start before the Portfolio Bot, we will
        use a timeout in order to wait for Portfolio Manager.
        */
        return await portfolioManagerEventsClient.sendMessage(message, 5000)
    }

    async function candleExit(candle, tradingEngine) {
        let message = {
            type: "Check Out Candle",
            candle: {
                begin: candle.begin,
                end: candle.end
            },
            tradingEngine: tradingEngine
        }
        return await portfolioManagerEventsClient.sendMessage(message)
    }

    async function askPortfolioEventsManager(eventNode, passed) {

        let response = {
            status: 'Ok',
            passed: passed,
            reason: "No need to ask Portfolio Manager"
        }
        /*
        First we will check if the Portfolio Manager confirms this event
        can be raised.
        */
        if (
            passed === true &&
            eventNode.askPortfolioEventsManager.request !== undefined &&
            eventNode.askPortfolioEventsManager.request.type === 'Confirm Event'
        ) {
            let message = {
                type: "Confirm This Event",
                event: {
                    node: {
                        name: eventNode.name,
                        id: eventNode.id,
                        type: eventNode.type
                    }
                }
            }
            response = await portfolioManagerEventsClient.sendMessage(message)
        }
        /*
        In this case, we will check if the Porfolio Manager would like to 
        raise this event anyways.
        */
        if (
            eventNode.askPortfolioEventsManager.request !== undefined &&
            eventNode.askPortfolioEventsManager.request.type === 'Set Event'
        ) {
            let message = {
                type: "Set This Event",
                event: {
                    node: {
                        name: eventNode.name,
                        id: eventNode.id,
                        type: eventNode.type
                    }
                }
            }
            response = await portfolioManagerEventsClient.sendMessage(message)
        }

        return response
    }

    async function askPortfolioFormulaManager(formulaNode, formulaParentNode, formulaValue) {

        let response = {
            status: 'Ok',
            value: formulaValue,
            reason: "No need to ask Portfolio Manager"
        }
        if (formulaParentNode === undefined) {
            return response
        }
        /*
        First we will check if the Porfolio Manager would like to 
        replace this formula value for something else.
        */
        if (
            formulaParentNode.askPortfolioFormulaManager.request !== undefined &&
            formulaParentNode.askPortfolioFormulaManager.request.type === 'Set Formula'
        ) {
            let message = {
                type: "Set This Formula",
                formula: {
                    node: {
                        name: formulaNode.name,
                        id: formulaNode.id,
                        type: formulaNode.type,
                        parentNode: {
                            name: formulaParentNode.name,
                            id: formulaParentNode.id,
                            type: formulaParentNode.type,
                        }
                    }
                }
            }
            response = await portfolioManagerEventsClient.sendMessage(message)
        }
        /*
         Second we will check if the Portfolio Manager confirms this formula
         value.
        */
        if (
            formulaParentNode.askPortfolioFormulaManager.request !== undefined &&
            formulaParentNode.askPortfolioFormulaManager.request.type === 'Confirm Formula'
        ) {
            let message = {
                type: "Confirm This Formula",
                formula: {
                    node: {
                        name: formulaNode.name,
                        id: formulaNode.id,
                        type: formulaNode.type,
                        parentNode: {
                            name: formulaParentNode.name,
                            id: formulaParentNode.id,
                            type: formulaParentNode.type,
                        }
                    },
                    value: formulaValue
                }
            }
            response = await portfolioManagerEventsClient.sendMessage(message)
        }
        return response
    }
}