exports.newAlgorithmicTradingFunctionLibrariesTradingFunctions = function () {
    /*
    This module contains the functions that are used at Simulations.
    */
    const MODULE_NAME = "Trading Functions"

    let thisObject = {
        checkIfWeNeedToStopTheSimulation: checkIfWeNeedToStopTheSimulation
    }

    return thisObject

    function checkIfWeNeedToStopTheSimulation(
        episodeModuleObject,
        sessionParameters,
        tradingSystem,
        tradingEngine,
        processIndex
    ) {
        if (checkMinimunAndMaximunBalance(sessionParameters, tradingSystem, tradingEngine, processIndex) === false) {
            TS.projects.simulation.functionLibraries.simulationFunctions.closeEpisode(episodeModuleObject, 'Min or Max Balance Reached')
            TS.projects.foundations.functionLibraries.sessionFunctions.stopSession(processIndex, 'Min or Max Balance Reached')
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                '[IMPORTANT] runSimulation -> Min or Max Balance Reached. Stopping the Session now. ')
            return true
        }
        return false
    }

    function checkMinimunAndMaximunBalance(sessionParameters, tradingSystem, tradingEngine, processIndex) {
        /* Checks for Minimum and Maximum Balance. We do the check while not inside any strategy only. */
        if (
            tradingEngine.tradingCurrent.strategy.index.value === tradingEngine.tradingCurrent.strategy.index.config.initialValue
        ) {
            /*
            We will perform this check only when we are not inside a position,
            because there the balances have shifted from their resting position.
            */

            let stopRunningDate = (new Date(tradingEngine.tradingCurrent.tradingEpisode.candle.begin.value)).toUTCString()

            if (sessionParameters.sessionBaseAsset.config.minimumBalance !== undefined) {
                if (tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value <= sessionParameters.sessionBaseAsset.config.minimumBalance) {
                    const errorMessage = 'Min Balance reached @ ' + stopRunningDate

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - Minimum Balance Reached',
                        placeholder: {}
                    }

                    let contextInfo = {
                        timestamp: stopRunningDate,
                        episodeBaseAssetBalance: tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value,
                        sessionBaseAssetMinimumBalance: sessionParameters.sessionBaseAsset.config.minimumBalance
                    }

                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                    tradingSystem.addError([tradingSystem.id, errorMessage, docs])
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[WARN] checkMinimunAndMaximunBalance -> ' + errorMessage)
                    return false
                }
            }

            if (sessionParameters.sessionBaseAsset.config.maximumBalance !== undefined) {
                if (tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value >= sessionParameters.sessionBaseAsset.config.maximumBalance) {
                    const errorMessage = 'Max Balance reached @ ' + stopRunningDate

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - Maximum Balance Reached',
                        placeholder: {}
                    }

                    let contextInfo = {
                        timestamp: stopRunningDate,
                        episodeBaseAssetBalance: tradingEngine.tradingCurrent.tradingEpisode.episodeBaseAsset.balance.value,
                        sessionBaseAssetMaximumBalance: sessionParameters.sessionBaseAsset.config.maximumBalance
                    }

                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                    tradingSystem.addError([tradingSystem.id, errorMessage, docs])
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[WARN] checkMinimunAndMaximunBalance -> ' + errorMessage)
                    return false
                }
            }

            if (sessionParameters.sessionQuotedAsset.config.minimumBalance !== undefined) {
                if (tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value <= sessionParameters.sessionQuotedAsset.config.minimumBalance) {
                    const errorMessage = 'Min Balance reached @ ' + stopRunningDate

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - Minimum Balance Reached',
                        placeholder: {}
                    }

                    let contextInfo = {
                        timestamp: stopRunningDate,
                        episodeQuotedAssetBalance: tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value,
                        sessionQuotedAssetMinimumBalance: sessionParameters.sessionQuotedAsset.config.minimumBalance
                    }

                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                    tradingSystem.addError([tradingSystem.id, errorMessage, docs])
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[WARN] checkMinimunAndMaximunBalance -> ' + errorMessage)
                    return false
                }
            }

            if (sessionParameters.sessionQuotedAsset.config.maximumBalance !== undefined) {
                if (tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value >= sessionParameters.sessionQuotedAsset.config.maximumBalance) {
                    const errorMessage = 'Max Balance reached @ ' + stopRunningDate

                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - Maximum Balance Reached',
                        placeholder: {}
                    }

                    let contextInfo = {
                        timestamp: stopRunningDate,
                        episodeQuotedAssetBalance: tradingEngine.tradingCurrent.tradingEpisode.episodeQuotedAsset.balance.value,
                        sessionQuotedAssetMaximumBalance: sessionParameters.sessionQuotedAsset.config.maximumBalance
                    }

                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, undefined, undefined, undefined, undefined, undefined, contextInfo)

                    tradingSystem.addError([tradingSystem.id, errorMessage, docs])
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                        '[WARN] checkMinimunAndMaximunBalance -> ' + errorMessage)
                    return false
                }
            }
        }
        return true
    }
}