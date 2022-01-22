exports.newSocialTradingModulesQueriesFollowing = function newSocialTradingModulesQueriesFollowing() {
    /*
    This module represents the query that allows a Social Entities to know
    all the Social Personas or Social Trading Bots that are being followed 
    by a certain Social Entity.
    */
    let thisObject = {
        array: undefined,
        socialEntity: undefined,
        initialIndex: undefined,
        amountRequested: undefined,
        direction: undefined,
        run: run,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.array = undefined
        thisObject.socialEntity = undefined
    }

    function initialize(queryReceived) {

        thisObject.array = Array.from(thisObject.socialEntity.following)

        NT.projects.socialTrading.utilities.queriesValidations.socialValidations(queryReceived, thisObject)
        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.array)

    }

    function run() {

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
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested && i >= 0; i--) {
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
                originSocialPersonaId: arrayItem.originSocialPersonaId,
                originSocialTradingBotId: arrayItem.originSocialTradingBotId
            }
            response.push(postResponse)
        }
    }
}