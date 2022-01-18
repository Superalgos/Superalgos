exports.newSocialTradingModulesQueriesPostReplies = function newSocialTradingModulesQueriesPostReplies() {
    /*
    Each Post regardless if it is authored by a Social Persona or Social Trading Bot,
    can have replies. This query is designed for Social Entities to 
    fetch the posts metadata that are replies to a certain post.

    This is the query executed at the Social Trading App to fill the page
    of a certain post, with all its replies.
    */
    let thisObject = {
        array: undefined,
        socialEntity: undefined,
        post: undefined,
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
        thisObject.post = undefined
    }

    function initialize(queryReceived) {

        thisObject.array = Array.from(thisObject.post.replies)

        NT.projects.socialTrading.utilities.queriesValidations.socialValidations(queryReceived, thisObject)
        NT.projects.socialTrading.utilities.queriesValidations.postValidations(queryReceived, thisObject)
        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.array)

    }

    function run() {

        let response = []


        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = thisObject.array[i]
                    if (post === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let arrayItem = thisObject.array[i]
                    if (post === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
        }
        return response

        function addToResponse(post) {

            let postResponse = {
                originSocialPersonaId: post.originSocialPersonaId,
                targetSocialPersonaId: post.targetSocialPersonaId,
                originSocialTradingBotId: post.originSocialTradingBotId,
                targetSocialTradingBotId: post.targetSocialTradingBotId,
                originPostHash: post.originPostHash,
                targetPostHash: post.targetPostHash,
                postType: post.postType,
                timestamp: post.timestamp,
                fileKeys: post.fileKeys,
                repliesCount: post.replies.size,
                reactions: Array.from(post.reactions),
                reaction: post.reactionsBySocialEntity.get(thisObject.socialEntity.id)
            }
            response.push(postResponse)
        }
    }
}