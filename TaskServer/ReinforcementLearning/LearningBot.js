exports.newLearningBot = function (processIndex, parentLogger) {

    const MODULE_NAME = "Learning Bot";
    const FULL_LOG = true;

    const TRADING_PROCESS_MODULE = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + '/LowFrequencyTrading/MachineLearningProcess.js');
    const FILE_STORAGE = require('./FileStorage.js');
    const SESSION = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'TradingSession');

    let fileStorage = FILE_STORAGE.newFileStorage(parentLogger);
    let session = SESSION.newLearningSession(processIndex, parentLogger)

    const DEBUG_MODULE = require(TS.projects.superalgos.globals.nodeJSConstants.REQUIRE_ROOT_DIR + 'DebugLog');
    let logger; // We need this here in order for the loopHealth function to work and be able to rescue the loop when it gets in trouble.

    let nextLoopTimeoutHandle;

    let thisObject = {
        initialize: initialize,
        run: run
    };

    let processConfig;

    return thisObject;

    function initialize(pProcessConfig, callBackFunction) {
     
    }

    function run(callBackFunction) {

    }
};
