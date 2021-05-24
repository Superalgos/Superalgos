exports.newSuperalgosUtilitiesErrorHandlingFunctions = function () {

    let thisObject = {
        throwHandledException: throwHandledException
    }

    return thisObject

    /*
    This function helps Bots to integrate their error handling to the In-App-Docs.
    */
    function throwHandledException(
        source,             // The Bot Type where the handled exception occured. This will be part of the Doc's page name.
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
            project: 'Superalgos',
            category: 'Topic',
            type: 'TS ' + source + ' Error - ' + message,
            placeholder: {}
        }
        TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(
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

        throw (err)
    }
}