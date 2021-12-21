exports.newPortfolioManagementBotModulesPortfolioManager = function (processIndex) {
    /*
    This module packages all functions related to the Portfolio Manager.
    */
    const MODULE_NAME = 'Portfolio Manager'
    let thisObject = {
        updateChart: updateChart,
        mantain: mantain,
        reset: reset,
        cycleBasedStatistics: cycleBasedStatistics,
        updateEnds: updateEnds,
        resetPortfolioEngineDataStructure: resetPortfolioEngineDataStructure,
        updateCounters: updateCounters,
        updateStatistics: updateStatistics,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioStrategyModuleObject = TS.projects.portfolioManagement.botModules.portfolioStrategy.newPortfolioManagementBotModulesPortfolioStrategy(processIndex)
    let portfolioPositionModuleObject = TS.projects.portfolioManagement.botModules.portfolioPosition.newPortfolioManagementBotModulesPortfolioPosition(processIndex)
    let portfolioExecutionModuleObject = TS.projects.portfolioManagement.botModules.portfolioExecution.newPortfolioManagementBotModulesPortfolioExecution(processIndex)
    let announcementsModuleObject = TS.projects.socialBots.botModules.announcements.newSocialBotsBotModulesAnnouncements(processIndex)
    let snapshotsModuleObject = TS.projects.portfolioManagement.botModules.snapshots.newPortfolioManagementBotModulesSnapshots(processIndex)
    let portfolioEpisodeModuleObject = TS.projects.portfolioManagement.botModules.portfolioEpisode.newPortfolioManagementBotModulesPortfolioEpisode(processIndex)

    let portfolioEngine
    let portfolioSystem
    let sessionParameters

    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
        portfolioEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.portfolioParameters

        portfolioStrategyModuleObject.initialize()
        portfolioPositionModuleObject.initialize()
        announcementsModuleObject.initialize()
        snapshotsModuleObject.initialize()
        portfolioExecutionModuleObject.initialize()
        portfolioEpisodeModuleObject.initialize()

        /* Initialize listeners: */
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
            'Confirm This Event',
            undefined,
            undefined,
            undefined,
            eventConfirmer
        )
    }

    function finalize() {
        portfolioEngine = undefined
        portfolioSystem = undefined
        sessionParameters = undefined

        portfolioStrategyModuleObject.finalize()
        portfolioStrategyModuleObject = undefined

        portfolioPositionModuleObject.finalize()
        portfolioPositionModuleObject = undefined

        announcementsModuleObject.finalize()
        announcementsModuleObject = undefined

        snapshotsModuleObject.finalize()
        snapshotsModuleObject = undefined

        portfolioExecutionModuleObject.finalize()
        portfolioExecutionModuleObject = undefined

        portfolioEpisodeModuleObject.finalize()
        portfolioEpisodeModuleObject = undefined
    }

    function updateChart(pChart, pExchange, pMarket) {
        snapshotsModuleObject.updateChart(pChart, pExchange, pMarket)
    }

    function mantain() {
        portfolioPositionModuleObject.mantain()
        portfolioStrategyModuleObject.mantain()
        portfolioExecutionModuleObject.mantain()

        updateCounters()
        updateEnds()
    }

    function reset() {
        resetPortfolioEngineDataStructure()

        portfolioPositionModuleObject.reset()
        portfolioStrategyModuleObject.reset()
        portfolioExecutionModuleObject.reset()
    }

    /* eventConfirmer() :
     *  Properties of arguments[0].event: {event:eventType, question:questionType, returnToCallerId:returnAddress }
     */
    function eventConfirmer() {
        let message = arguments[0].event;

        message.raiseEvent = (function() {
            // First find the correct eventReference node to test:
            let refNode;
            let passed;
            if (portfolioSystem !== undefined && portfolioSystem.eventsManager !== undefined &&
                portfolioSystem.eventsManager.confirmEventRules !== undefined) {
                for (let i = 0; i < portfolioSystem.eventsManager.confirmEventRules.confirmEventReference.length; i++) {
                    if (portfolioSystem.eventsManager.confirmEventRules.confirmEventReference[i].referenceParent !== undefined && portfolioSystem.eventsManager.confirmEventRules.confirmEventReference[i].referenceParent.id == message.eventNodeId) {
                        refNode = portfolioSystem.eventsManager.confirmEventRules.confirmEventReference[i];
                        break;
                    }
                }
                if (refNode === undefined) { return true; } // Default Behavior.
                portfolioSystem.evalConditions(refNode, 'Confirm Event Reference');
                for (let i = 0; i < refNode.situations.length; i++) {
                    let situation = refNode.situations[i];
                    passed = true;
                    if ((passed = portfolioSystem.checkConditions(situation, passed)) === true) { break; }
                }
            }
            return passed;
        })();

        // Send back response to Events Interface Outbound:
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_KEY,
            message.returnToCallerId,
            message
        )
    }

    function cycleBasedStatistics() {
        portfolioEpisodeModuleObject.cycleBasedStatistics()
        portfolioPositionModuleObject.cycleBasedStatistics()
    } 

    function updateEnds() {
        /* 
        Note that we can not use the cycle here because this is executed via mantain
        which in turn is executed before the first cycle for this candle is set. 
        */
        if (portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyTriggerStage.end.value = portfolioEngine.portfolioCurrent.strategyTriggerStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyTriggerStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
        if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyOpenStage.end.value = portfolioEngine.portfolioCurrent.strategyOpenStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyOpenStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
        if (portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyManageStage.end.value = portfolioEngine.portfolioCurrent.strategyManageStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyManageStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
        if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Open') {
            portfolioEngine.portfolioCurrent.strategyCloseStage.end.value = portfolioEngine.portfolioCurrent.strategyCloseStage.end.value + sessionParameters.timeFrame.config.value
            portfolioEngine.portfolioCurrent.strategyCloseStage.endRate.value = portfolioEngine.portfolioCurrent.portfolioEpisode.candle.close.value
        }
    }

    function resetPortfolioEngineDataStructure() {
        if (portfolioEngine.portfolioCurrent.strategyTriggerStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyTriggerStage.status)
        }
        if (portfolioEngine.portfolioCurrent.strategyOpenStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyOpenStage.status)
        }
        if (portfolioEngine.portfolioCurrent.strategyManageStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyManageStage.status)
        }
        if (portfolioEngine.portfolioCurrent.strategyCloseStage.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyCloseStage.status)
        }

        if (portfolioEngine.portfolioCurrent.position.status.value === 'Closed') {
            resetStage(portfolioEngine.portfolioCurrent.strategyTriggerStage)
            resetStage(portfolioEngine.portfolioCurrent.strategyOpenStage)
            resetStage(portfolioEngine.portfolioCurrent.strategyManageStage)
            resetStage(portfolioEngine.portfolioCurrent.strategyCloseStage)
        }
        function resetStage(stage) {
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.get(processIndex).PORTFOLIO_ENGINE_MODULE_OBJECT.initializeNode(stage)
        }
    }

    function updateCounters() {

    }

    function updateStatistics() {

    }

    function badDefinitionUnhandledException(err, message, node) {

        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS LF Portfolio Bot Error - ' + message,
            placeholder: {}
        }

        portfolioSystem.addError([node.id, message, docs])

        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> " + message);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.name = " + node.name);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.type = " + node.type);
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> node.config = " + JSON.stringify(node.config));
        if (err !== undefined) {
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] -> err.stack = " + err.stack);
        }
        throw 'Error Already Recorded'
    }

    /* checkUserDefinedCode(): Checks if User Defined Code exists and processes if applicable. */
    function checkUserDefinedCode(stage, status, when) {
        let portfolioSystemStage = getPortfolioSystemStage(stage);

        if (portfolioSystemStage !== undefined &&
            portfolioSystemStage.userDefinedCode !== undefined) {
            if (status === 'Running' && when !== portfolioSystemStage.userDefinedCode.config.whileAtStageWhenToRun) { return; }

            switch(status) {
                case 'Open' : {
                    if (portfolioSystemStage.userDefinedCode.config.runWhenEnteringStage) {
                        portfolioSystem.evalUserCode(portfolioSystemStage, 'User Defined Code');
                    }
                    break;
                }
                case 'Running' : {
                    if (portfolioSystemStage.userDefinedCode.config.runWhileAtStage) {
                        portfolioSystem.evalUserCode(portfolioSystemStage, 'User Defined Code');
                    }
                    break;
                }
                case 'Closed' : {
                    if (portfolioSystemStage.userDefinedCode.config.runWhenExitingStage) {
                        portfolioSystem.evalUserCode(portfolioSystemStage, 'User Defined Code');
                    }
                    break;
                }
            }
        }
    }

    // checkAnnounce(): Check if stage announcement should be made
    function checkAnnounce(stage, status) {
        let portfolioSystemStage = getPortfolioSystemStage(stage);
        if (status === 'Open' || status === 'Closed') {
            announcementsModuleObject.makeAnnouncements(portfolioSystemStage, status)
        }
    }

    /* getPortfolioSystemStage(): takes stage name returns stage object. */
    function getPortfolioSystemStage(stage) {
      switch(stage) {
        case 'Trigger Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].triggerStage;
          break;
        }
        case 'Open Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].openStage;
          break;
        }
        case 'Manage Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].manageStage;
          break
        }
        case 'Close Stage' : {
          return portfolioSystem.portfolioStrategies[portfolioEngine.portfolioCurrent.strategy.index.value].closeStage;
          break;
        }
      }
    }
}
