exports.setGlobals = function () {

    /* Callbacks default responses. */

    global.DEFAULT_OK_RESPONSE = {
        result: "Ok",
        message: "Operation Succeeded"
    };

    global.DEFAULT_FAIL_RESPONSE = {
        result: "Fail",
        message: "Operation Failed"
    };

    global.DEFAULT_RETRY_RESPONSE = {
        result: "Retry",
        message: "Retry Later"
    };

    global.CUSTOM_OK_RESPONSE = {
        result: "Ok, but check Message",
        message: "Custom Message"
    };

    global.CUSTOM_FAIL_RESPONSE = {
        result: "Fail Because",
        message: "Custom Message"
    };

    /* This is the Execution Datetime */

    global.EXECUTION_DATETIME = new Date();

    /* Time Periods Definitions. */

    global.marketFilesPeriods =
        '[' +
        '[' + 24 * 60 * 60 * 1000 + ',' + '"24-hs"' + ']' + ',' +
        '[' + 12 * 60 * 60 * 1000 + ',' + '"12-hs"' + ']' + ',' +
        '[' + 8 * 60 * 60 * 1000 + ',' + '"08-hs"' + ']' + ',' +
        '[' + 6 * 60 * 60 * 1000 + ',' + '"06-hs"' + ']' + ',' +
        '[' + 4 * 60 * 60 * 1000 + ',' + '"04-hs"' + ']' + ',' +
        '[' + 3 * 60 * 60 * 1000 + ',' + '"03-hs"' + ']' + ',' +
        '[' + 2 * 60 * 60 * 1000 + ',' + '"02-hs"' + ']' + ',' +
        '[' + 1 * 60 * 60 * 1000 + ',' + '"01-hs"' + ']' + ']';

    global.marketFilesPeriods = JSON.parse(global.marketFilesPeriods);

    global.dailyFilePeriods =
        '[' +
        '[' + 45 * 60 * 1000 + ',' + '"45-min"' + ']' + ',' +
        '[' + 40 * 60 * 1000 + ',' + '"40-min"' + ']' + ',' +
        '[' + 30 * 60 * 1000 + ',' + '"30-min"' + ']' + ',' +
        '[' + 20 * 60 * 1000 + ',' + '"20-min"' + ']' + ',' +
        '[' + 15 * 60 * 1000 + ',' + '"15-min"' + ']' + ',' +
        '[' + 10 * 60 * 1000 + ',' + '"10-min"' + ']' + ',' +
        '[' + 05 * 60 * 1000 + ',' + '"05-min"' + ']' + ',' +
        '[' + 04 * 60 * 1000 + ',' + '"04-min"' + ']' + ',' +
        '[' + 03 * 60 * 1000 + ',' + '"03-min"' + ']' + ',' +
        '[' + 02 * 60 * 1000 + ',' + '"02-min"' + ']' + ',' +
        '[' + 01 * 60 * 1000 + ',' + '"01-min"' + ']' + ']';

    global.dailyFilePeriods = JSON.parse(global.dailyFilePeriods);

    global.LOG_CONTROL = {
        "Assistant": {
            logInfo: true,
            logWarnings: false,
            logErrors: true,
            logContent: false,
            intensiveLogging: false
        },
        "Exchange API": {
            logInfo: true,
            logWarnings: true,
            logErrors: true,
            logContent: true,
            intensiveLogging: true
        },
        "Status Report": {
            logInfo: true,
            logWarnings: false,
            logErrors: true,
            logContent: false,
            intensiveLogging: false
        },
        "Data Set": {
            logInfo: true,
            logWarnings: false,
            logErrors: true,
            logContent: false,
            intensiveLogging: false
        },
        "Context": {
            logInfo: true,
            logWarnings: false,
            logErrors: true,
            logContent: false,
            intensiveLogging: false
        }
    };

    global.CURRENT_EXECUTION_AT = "Node"

    global.MARKET = {
        assetA: process.env.MARKET_ASSET_A,
        assetB: process.env.MARKET_ASSET_B,
        name: process.env.MARKET_ASSET_A + "_" + process.env.MARKET_ASSET_B
    }

    global.MARKET_PAIRS = {
        USDT_BTC: "USDT_BTC",
        BTC_USDT: "BTC_USDT"
    }
}
