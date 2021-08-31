exports.newSocialTradingModulesQueriesProfileFollowers = function newSocialTradingModulesQueriesProfileFollowers() {
    /*
    This module represents the query that allows a Network Client to know
    all the User or Bot profiles that are following a certain User or Bot profile.
    */
    let thisObject = {
        profile: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        execute: execute,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.profile = undefined
    }

    function initialize(queryReceived) {

        NT.utilities.queriesValidations.profilesValidations(queryReceived, thisObject)
        NT.utilities.queriesValidations.arrayValidations(queryReceived, thisObject)

    }

    function execute() {

        let response = []
        let array = Array.from(thisObject.profile.followers)

        switch (thisObject.direction) {
            case NT.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
            case NT.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let arrayItem = array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
        }
        return response

        function addToResponse(arrayItem) {
            let postResponse = {
                emitterUserProfileId: arrayItem.emitterUserProfileId,
                emitterBotProfileId: arrayItem.emitterBotProfileId
            }
            response.push(postResponse)
        }
    }
}