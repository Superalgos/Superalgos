exports.newSocialTradingModulesQueriesPosts = function newSocialTradingModulesQueriesPosts() {
    /*
    Each Social Entity (Social personas or Social Trading Bots) can have posts. This query
    is designed for Social Entities to fetch the posts
    metadata they need from the Social Graph.

    This is the query to be executed to fill a Social Entity profile page
    with all of its posts.
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
        NT.projects.socialTrading.utilities.queriesValidations.socialValidations(queryReceived, thisObject)

        thisObject.array = Array.from(thisObject.socialEntity.posts)

        NT.projects.socialTrading.utilities.queriesValidations.arrayValidations(queryReceived, thisObject, thisObject.array)
    }

    function run() {

        let response = []

        switch (thisObject.direction) {
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = thisObject.array[i]
                    if (arrayItem === undefined) {
                        break
                    }
                    addToResponse(arrayItem[1], i)
                }
                break
            }
            case SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested && i >= 0; i--) {
                    let arrayItem = thisObject.array[i]
                    if (arrayItem === undefined) {
                        break
                    }
                    addToResponse(arrayItem[1], i)
                }
                break
            }
        }
        return response

        function addToResponse(post, index) {

            let postResponse = {
                index: index, 
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