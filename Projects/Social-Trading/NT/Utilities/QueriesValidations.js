exports.newSocialTradingUtilitiesQueriesValidations = function newSocialTradingUtilitiesQueriesValidations() {
    /*
    This module have a few functions that are often needed at Queries Modules.
    */
    let thisObject = {
        profilesValidations: profilesValidations,
        postValidations: postValidations,
        arrayValidations: arrayValidations
    }

    return thisObject

    function profilesValidations(queryReceived, thisObject) {
        /*
        Validate User Profile
        */
        if (queryReceived.emitterUserProfileId !== undefined) {
            thisObject.profile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(queryReceived.emitterUserProfileId)
            if (thisObject.profile === undefined) {
                throw ('Emitter User Profile Not Found.')
            }
        }

        if (queryReceived.targetUserProfileId !== undefined) {
            thisObject.profile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(queryReceived.targetUserProfileId)
            if (thisObject.profile === undefined) {
                throw ('Target User Profile Not Found.')
            }
        }

        /*
        Validate Bot Profile
        */
        if (queryReceived.targetBotProfileId !== undefined) {
            thisObject.profile = thisObject.profile.bots.get(queryReceived.targetBotProfileId)
            if (thisObject.profile === undefined) {
                throw ('Target Bot Profile Not Found.')
            }
        }
    }

    function postValidations(queryReceived, thisObject) {
        /*
        Validate Post
        */
        thisObject.post = thisObject.profile.posts.get(queryReceived.targetPostHash)

        if (thisObject.post === undefined) {
            throw ('Target Post Not Found.')
        }
    }

    function arrayValidations(queryReceived, thisObject, array) {
        /* 
        Validate Initial Index 
        */
        if (queryReceived.initialIndex === undefined) {
            throw ('Initial Index Undefined.')
        }

        if (queryReceived.initialIndex === SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_LAST) {
            queryReceived.initialIndex = array.length - 1
        }

        if (queryReceived.initialIndex === SA.projects.socialTrading.globals.queryConstants.INITIAL_INDEX_FIRST) {
            queryReceived.initialIndex = 0
        }

        if (isNaN(queryReceived.initialIndex) === true) {
            throw ('Initial Post Is Not a Number.')
        }

        thisObject.initialIndex = queryReceived.initialIndex
        /* 
        Validate Amount Requested 
        */
        if (queryReceived.amountRequested === undefined) {
            throw ('Amount Requested Undefined.')
        }

        if (isNaN(queryReceived.amountRequested) === true) {
            throw ('Amount Requested Is Not a Number.')
        }

        if (queryReceived.amountRequested < SA.projects.socialTrading.globals.queryConstants.MIN_AMOUNT_REQUESTED) {
            throw ('Amount Requested Below Min.')
        }

        if (queryReceived.amountRequested > SA.projects.socialTrading.globals.queryConstants.MAX_AMOUNT_REQUESTED) {
            throw ('Amount Requested Above Max.')
        }

        thisObject.amountRequested = queryReceived.amountRequested
        /* 
        Validate Direction
        */
        if (queryReceived.direction === undefined) {
            throw ('Direction Undefined.')
        }

        if (
            queryReceived.direction !== SA.projects.socialTrading.globals.queryConstants.DIRECTION_FUTURE &&
            queryReceived.direction !== SA.projects.socialTrading.globals.queryConstants.DIRECTION_PAST &&
            queryReceived.direction !== SA.projects.socialTrading.globals.queryConstants.DIRECTION_UP &&
            queryReceived.direction !== SA.projects.socialTrading.globals.queryConstants.DIRECTION_DOWN
        ) {
            throw ('Direction Not Supported.')
        }

        thisObject.direction = queryReceived.direction

    }
}