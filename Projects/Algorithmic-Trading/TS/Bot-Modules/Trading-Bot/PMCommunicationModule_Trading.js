/*  PMCommunicationModule - Trading Bot's Version.
 *  Fascilitates communications between the Portfolio Manager and its managed sessions.
 *  Session Key naming convention: name + type + id
 */

exports.newPMCommunicationModule_Trading = function (callerId) {
    const MODULE_NAME = 'PM Communication Module - Trading';

    moduleObj = {
        beginListening: beginListening,
        getQuoteAssetBalance: getQuoteAssetBalance
    }

    const SESSION_ID = callerId;

    return moduleObj;


    /* Listeners Section: */
    function beginListening() {
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent(
            SESSION_ID,
            'Quote Asset Balance Reply',
            undefined,
            SESSION_ID,
            undefined,
            gotQuoteAssetBalance)
    }



    /* eventsCallBack Section: */
    function getQuoteAssetBalance() {
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(
            SESSION_ID,
            'Quote Asset Balance',
            undefined
        )
    }

    function gotQuoteAssetBalance() {
        let ret = arguments[0].event;
        console.log("Quote Asset Balance=>" + ret);
    }
}