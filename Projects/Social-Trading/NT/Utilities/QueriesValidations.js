exports.newSocialTradingUtilitiesQueriesValidations = function newSocialTradingUtilitiesQueriesValidations() {
    /*
    This module have a few functions that are often needed at Queries Modules.
    */
    let thisObject = {
        socialValidations: socialValidations,
        postValidations: postValidations,
        arrayValidations: arrayValidations
    }

    return thisObject

    function socialValidations(queryReceived, thisObject) {
        /*
        Validate Social Personas
        */
        if (queryReceived.originSocialPersonaId !== undefined) {
            thisObject.socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(queryReceived.originSocialPersonaId)
            if (thisObject.socialEntity === undefined) {
                throw ('Origin Social Persona Not Found.')
            }
        }

        if (queryReceived.targetSocialPersonaId !== undefined) {
            thisObject.socialEntity = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(queryReceived.targetSocialPersonaId)
            if (thisObject.socialEntity === undefined) {
                throw ('Target Social Persona Not Found.')
            }
        }

        /*
        Validate Social Trading Bot
        */
        if (queryReceived.targetSocialTradingBotId !== undefined) {
            thisObject.socialEntity = thisObject.socialEntity.bots.get(queryReceived.targetSocialTradingBotId)
            if (thisObject.socialEntity === undefined) {
                throw ('Target Social Trading Bot Not Found.')
            }
        }
    }

    function postValidations(queryReceived, thisObject) {
        /*
        If we have a Social Entity defined, then we will look
        into the posts of that Social Entity, otherwise we will 
        look into all posts of any Social Entity.
        */
        if (
            queryReceived.targetSocialPersonaId !== undefined ||
            queryReceived.targetSocialTradingBotId !== undefined
        ) {
            thisObject.post = thisObject.socialEntity.posts.get(queryReceived.originPostHash)

            if (thisObject.post === undefined) {
                thisObject.post = thisObject.socialEntity.posts.get(queryReceived.targetPostHash)
            }

            if (thisObject.post === undefined) {
                throw ('Target Post Not Found At Target Social Entity.')
            }
        } else {
            thisObject.post = SA.projects.socialTrading.globals.memory.maps.POSTS.get(queryReceived.originPostHash)

            if (thisObject.post === undefined) {
                throw ('Target Post Not Found Among All The Posts.')
            }
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