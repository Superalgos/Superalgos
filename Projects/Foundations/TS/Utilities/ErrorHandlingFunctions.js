exports.newFoundationsUtilitiesErrorHandlingFunctions = function () {

    let thisObject = {
        throwHandledException: throwHandledException
    }

    return thisObject

    /*
    This function helps Bots to integrate their error handling to the In-App-Docs.
    */
    function throwHandledException(
        processIndex,       // The index of the process where the exception happened.
        MODULE_NAME,        // The name of the module where the exception happened.
        source,             // A user understandable source of the exception. This will be part of the Doc's page name.
        err,                // The Error object available, if any.
        message,            // The Message, which will be part of the Docs page name.
        node                // The closest node related to the exception.
    ) {
        if (err === undefined) {
            err = {
                message: message
            }
        }
        /*
        This is what the Docs Space will get.
        */
        let docs = {
            project: 'Foundations',
            category: 'Topic',
            type: 'TS ' + source + ' Error - ' + message,
            placeholder: {}
        }
        TS.projects.education.utilities.docsFunctions.buildPlaceholder(
            docs,
            err,
            node.name,
            node.code,
            node.config,
            node.value,
            err
        )
        /*
        This will be needed for the process level error handling. Must be added
        here after the buildPlaceholder function call otherwise it would be included as a
        placeholder.
        */
        err.docs = docs
        err.node = node
        /*
        Users will not always be watching the console when an exception happens, for that
        reason we will send it also to the Debug Logs.
        */
        let errorDetails = err.errorDetails
        if (errorDetails === undefined) { errorDetails = "No error details available."}
        TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
            "[ERROR] " + errorDetails)

        throw (err)
    }
}