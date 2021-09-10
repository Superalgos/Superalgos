exports.newSocialTradingModulesQueriesProfileFollowing = function newSocialTradingModulesQueriesProfileFollowing() {
    /*
    This module represents the query that allows a Network Client to know
    all the User or Bot profiles that are being followed by a certain User or Bot profile.
    */
    let thisObject = {
        array: undefined,
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
        thisObject.array = undefined
        thisObject.profile = undefined
    }

    function initialize(queryReceived) {

        thisObject.array = Array.from(thisObject.profile.following)

        NT.projects.socialTrading.utilities.queriesValidations.profilesValidations(queryReceived, thisObject)
        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.array)

    }

    function execute() {

        let response = []

        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = thisObject.array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_DOWN: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let arrayItem = thisObject.array[i]
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