exports.newPostReplies = function newPostReplies() {
    /*
    Each Post regardless if it is authored by a User or Bot Profile,
    can have replies. This query is designed for Network Clients to 
    fetch the posts metadata that are replies to a certain post.
    */
    let thisObject = {
        profile: undefined,
        post: undefined,
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
        thisObject.post = undefined
    }

    function initialize(queryReceived) {

        NT.utilities.queriesValidations.profilesValidations(queryReceived, thisObject)
        NT.utilities.queriesValidations.postValidations(queryReceived, thisObject)
        NT.utilities.queriesValidations.arrayValidations(queryReceived, thisObject)

    }

    function execute() {

        let response = []
        let array = Array.from(thisObject.post.replies)

        switch (thisObject.direction) {
            case NT.globals.constants.queries.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = array[i]
                    if (post === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
            case NT.globals.constants.queries.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let arrayItem = array[i]
                    if (post === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
        }
        return response

        function addToResponse(post) {
            let postResponse = {
                emitterUserProfileId: post.emitterUserProfileId,
                targetUserProfileId: post.targetUserProfileId,
                emitterBotProfileId: post.emitterBotProfileId,
                targetBotProfileId: post.targetBotProfileId,
                emitterPostHash: post.emitterPostHash,
                targetPostHash: post.targetPostHash,
                postType: post.postType,
                timestamp: post.timestamp,
                repliesCount: post.replies.size,
                reactions: Array.from(post.reactions)
            }
            response.push(postResponse)
        }
    }
}