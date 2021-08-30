exports.newProfilePosts = function newProfilePosts() {
    /*
    Each User or Bot Profile can have posts. This query
    is designed for Network Clients to fetch the posts
    metadata they need from the Social Graph.

    This is the query to be executed to fill a Profile page
    with all of its posts.
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
        let array = Array.from(thisObject.profile.posts)

        switch (thisObject.direction) {
            case NT.globals.queryConstants.DIRECTION_FUTURE: {
                for (let i = thisObject.initialIndex; i < thisObject.initialIndex + thisObject.amountRequested; i++) {
                    let arrayItem = array[i]
                    if (arrayItem === undefined) { break }
                    addToResponse(arrayItem)
                }
                break
            }
            case NT.globals.queryConstants.DIRECTION_PAST: {
                for (let i = thisObject.initialIndex; i > thisObject.initialIndex - thisObject.amountRequested; i--) {
                    let arrayItem = array[i]
                    if (arrayItem === undefined) { break }
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