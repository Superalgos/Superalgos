exports.newSuperalgosGlobalsStandardResponses = function () {
    /* Callbacks default responses. */
    let thisObject = {
        DEFAULT_OK_RESPONSE: {
            result: "Ok",
            message: "Operation Succeeded"
        },
        DEFAULT_FAIL_RESPONSE: {
            result: "Fail",
            message: "Operation Failed"
        },
        DEFAULT_RETRY_RESPONSE: {
            result: "Retry",
            message: "Retry Later"
        },
        CUSTOM_OK_RESPONSE: {
            result: "Ok, but check Message",
            message: "Custom Message"
        },
        CUSTOM_FAIL_RESPONSE: {
            result: "Fail Because",
            message: "Custom Message"
        }
    }

    return thisObject
}