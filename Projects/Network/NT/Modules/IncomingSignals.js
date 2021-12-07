exports.newNetworkModulesIncomingSignals = function newNetworkModulesIncomingSignals() {
    /*
    This module process all incoming signals.
    */
    let thisObject = {
        newSignal: newSignal,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function newSignal(signalMessage) {
        /*
        Here we check that the entity sending the Signal is belonging to some User Profile,
        and that the Signature to the message matches with that entity.
        */
    }
}