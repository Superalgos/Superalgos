exports.newPortfolioManagementModulesPortfolioManagerClient = function (processIndex) {
    /*
    This object represents a proxy of the Profile Manager. It is used to send 
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

    function candleEntry(systemNode) {
        let message = {
            type: "Check In Candle",
            candle: {
                begin: tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value,
                end: tradingEngine.tradingCurrent.tradingEpisode.candle.end.value,
                open: tradingEngine.tradingCurrent.tradingEpisode.candle.open.value,
                close: tradingEngine.tradingCurrent.tradingEpisode.candle.close.value,
                min: tradingEngine.tradingCurrent.tradingEpisode.candle.min.value,
                max: tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
            },
            systemNodeId: systemNode.id
        }
        /*
        Since the trading bot could start before the Portfolio Bot, we will
        use a timeout in order to wait for Portfolio Manager.
        */
        return await portfolioManagerEventsClient.sendMessage(message, 5000)
    }

    function candleExit(systemNode) {
        let message = {
            type: "Check Out Candle",
            candle: {
                begin: tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value,
                end: tradingEngine.tradingCurrent.tradingEpisode.candle.end.value,
                open: tradingEngine.tradingCurrent.tradingEpisode.candle.open.value,
                close: tradingEngine.tradingCurrent.tradingEpisode.candle.close.value,
                min: tradingEngine.tradingCurrent.tradingEpisode.candle.min.value,
                max: tradingEngine.tradingCurrent.tradingEpisode.candle.max.value
            },
            systemNodeId: systemNode.id
        }
        return await portfolioManagerEventsClient.sendMessage(message)
    }

    async function askPortfolioEventsManager(eventNode, eventStatus) {
        
        let response = {
            status: 'Ok',
            raiseEvent: eventStatus,
            reason: "No need to ask Portfolio Manager"
        }

        if (eventStatus == true) {
            /*
            First we will check if the Portfolio Manager confirms this event
            can be raised.
            */
            if (eventNode.askPortfolioEventsManager.confirmEvent !== undefined) {
                let message = {
                    type: "Confirm This Event",
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
                    type: "Set This Event",
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
            status: 'Ok',
            value: formulaValue,
            reason: "No need to ask Portfolio Manager"
        }
        if (formulaParentNode === undefined) {
            return response
        }

        /*
         *  First we will check if the Porfolio Manager would like to 
         *  replace this formula value for something else.
         */
        if (formulaParentNode.askPortfolioFormulaManager.setFormula !== undefined) {
            let message = {
                type: "Set This Formula",
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
                type: "Confirm This Formula",
                formula: formulaParentNode.type,
                formulaParentNodeId: formulaParentNode.id
            }
            response = await portfolioManagerEventsClient.sendMessage(message)
        }
        return response
    }
}