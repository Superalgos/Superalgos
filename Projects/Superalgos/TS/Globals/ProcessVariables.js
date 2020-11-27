exports.newSuperalgosGlobalsProcessVariables = function () {
    /*
    We need to count how many process instances we deployd and how many of them have already finished their job, either
    because they just finished or because there was a request to stop the proceses. In this way, once we reach the
    amount of instances started, we can safelly destroy the rest of the objects running and let this nodejs process die.
    */
    let thisObject = {
        ENDED_PROCESSES_COUNTER: 0,
        TOTAL_PROCESS_INSTANCES_CREATED: 0
    }

    return thisObject
}