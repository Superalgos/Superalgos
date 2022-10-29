/* Exchange API - Portfolio Management's Version */
exports.newPortfolioManagementBotModulesExchangeAPI = function (processIndex) {

    let MODULE_NAME = "Exchange API";
  
    let thisObject = {
        fetchAllBalances: fetchAllBalances,
        initialize: initialize,
        finalize: finalize
    };
  
    let portfolioSystem
  
    let exchangeId
    let options = {}
    let exchange
  
    const ccxt = SA.nodeModules.ccxt
  
    return thisObject;
  
    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem
  
        exchangeId = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName
  
        let key
        let secret
        let uid
        let password
        let sandBox = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.sandbox || false;
  
        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference !== undefined) {
            if (TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent !== undefined) {
                key = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.codeName
                secret = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.secret
                uid = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.uid
                password = TS.projects.foundations.globals.taskConstants.TASK_NODE.keyReference.referenceParent.config.password
            }
        }
        const exchangeClass = ccxt[exchangeId]
        const exchangeConstructorParams = {
            'apiKey': key,
            'secret': secret,
            'uid': uid,
            'password': password,
            'timeout': 30000,
            'enableRateLimit': true,
            verbose: false,
            'adjustForTimeDifference': true,
            options: options
        }
        exchange = new exchangeClass(exchangeConstructorParams)
        // enable sandbox mode based on exchange sandbox param value
        if (sandBox) {
            exchange.setSandboxMode(sandBox);
        }
        // console.log('Sandbox mode = ' + sandBox);
        // uncomment the following line if you want to log the exchange api being used
        // console.log(exchange.urls.api);
    }
  
    function finalize() {
        portfolioSystem = undefined
        exchangeId = undefined
        options = undefined
        exchange = undefined
    }

    async function fetchAllBalances() {
        // Validations:
        if (exchange.has['fetchBalance'] === false) {
            logError("fetchAllBalances -> Exchange does not support fetchBalance command.");
        }
        try {
            let balances = await exchange.fetchBalance();
            return balances;
        } catch (err) {
            const message = "Fetch Balances Unexpected Error" + err;
            let docs = {
                project: 'Portfolio-Management',
                category: 'Topic',
                type: 'TS LF Portfolio Bot Error - ' + message,
                placeholder: {}
            }
            console.log("Error: " + message + "\nerr=>" + err);
        }
        return false;
    }
  
    function logInfo(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[INFO] ' + message)
    }
  
    function logError(message) {
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, '[ERROR] ' + message)
    }
  };
  
