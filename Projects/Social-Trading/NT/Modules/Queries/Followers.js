exports.newSocialTradingModulesQueriesFollowers = function newSocialTradingModulesQueriesFollowers() {
    /*
    This module represents the query that allows a Social Entity to know
    all the User or Bot profiles that are following a certain Social Persona or Social Trading Bot.
    */
    let thisObject = {
        array: undefined,
        socialEntity: undefined,
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
        thisObject.socialEntity = undefined
    }

    function initialize(queryReceived) {

        thisObject.array = Array.from(thisObject.socialEntity.followers)

        NT.projects.socialTrading.utilities.queriesValidations.socialValidations(queryReceived, thisObject)
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
            case NT.projects.socialTrading.globals.queryConstants.DIRECTION_DOWN: {
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
                emitterSocialPersonaId: arrayItem.emitterSocialPersonaId,
                emitterSocialTradingBotId: arrayItem.emitterSocialTradingBotId
            }
            response.push(postResponse)
        }
    }
}