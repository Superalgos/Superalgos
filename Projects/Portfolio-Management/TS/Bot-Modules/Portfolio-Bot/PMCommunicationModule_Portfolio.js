/*  PMCommunicationModule - Portfolio-Manager's Version.
 *  Fascilitates communications between the Portfolio Manager and its managed sessions.
 *  Session Key naming convention: name + type + id
 */

exports.newPMCommunicationModule_Portfolio = function (callerId) {
    const MODULE_NAME = 'PM Communication Module - Portfolio';

    moduleObj = {
        beginListening: beginListening
    }

    const SESSION_ID = callerId;

    return moduleObj;


    /* Listeners Section: */
    function beginListening() {
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
            SESSION_ID,
            'Quote Asset Balance',
            undefined,
            SESSION_ID,
            undefined,
            getQuoteAssetBalance)
    }



    /* eventsCallBack Section: */
    function getQuoteAssetBalance() {
        let quoteBal = 100.47;
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
            SESSION_ID,
            'Quote Asset Balance Reply',
            quoteBal
        )
    }
}