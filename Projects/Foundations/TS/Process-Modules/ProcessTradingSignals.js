exports.newFoundationsProcessModulesProcessTradingSignals = function (processIndex) {
    /*
    Here we manage the de dependency on trading signals at the process level.
    We want the process to be able to wait for a signal to arrive in order to continue running,
    as a syncronization mechanism. 
    */
    const MODULE_NAME = "Process Trading Signals";


    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        start: start,
        finish: finish
    }

    return thisObject;

    function initialize(callBackFunction) {
        try {
            if (
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config !== undefined &&
                TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.waitForSignalsToRunNextLoop === true && 
                TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS !== undefined
            ) {
                /*
                We set this value so that the process can handle correctly the wait times at the process loop control.
                */
                TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).WAIT_FOR_TRADING_SIGNAL_TO_ARRIVE = true
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] initialize -> We will need to wait for a Trading Signal to arrive at every loop excecution.")
            }

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    function finalize() {
        thisObject = undefined
    }

    function start(callBackFunction) {
        try {
            /*
            Let's check if we need to wait for a trading signal.
            */
            if (TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).WAIT_FOR_TRADING_SIGNAL_TO_ARRIVE !== true) {
                TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> We DO NOT need to wait for a Trading Signal to arrive in order to continue.")
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
                return
            }
            /*
            We do need to wait, so that is what we do.
            */
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> We need to wait for a Trading Signal to arrive in order to continue.")
            TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.callMeWhenSignalReceived(onSignalReceived)
            TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Waiting for a Trading Signal to Continue.")

            function onSignalReceived() {
                TS.projects.foundations.functionLibraries.processFunctions.processHeartBeat(processIndex, undefined, undefined, "Continuing Execution after Trading Signal Arrived.")
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
            }

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }

    function finish(callBackFunction) {

        try {

            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] finish -> Entering function.")

            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE);

        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] finish -> err = " + err.stack);
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE);
        }
    }
}
