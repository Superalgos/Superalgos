exports.newSocialTradingModulesSignal = function newSocialTradingModulesSignal() {
    /*
    A Signal is an action taken by a bot that needs to be 
    delivered to all the followers of that bot respecting
    the rule to deliver it fist to the bots belonging to 
    users with the highers ranking. 

    An Signal is attached to the Social Graph as a new post
    from the Bot producing the signal.
    */
    let thisObject = {
        /* Unique Key */
        signalId: undefined,
        /* Referenced Entities Unique Keys */
        emitterUserProfileId: undefined,
        targetUserProfileId: undefined,
        emitterBotProfileId: undefined,
        targetBotProfileId: undefined,
        emitterPostHash: undefined,
        targetPostHash: undefined,
        /* Signal Unique Properties */
        signalType: undefined,
        signalData: undefined,
        timestamp: undefined,
        /* Bot Related Properties */
        botAsset: undefined,
        botExchange: undefined,
        botEnabled: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize(signalReceived) {
        /*
        Store the message properties into this object properties.
        */
        thisObject.signalId = signalReceived.signalId
        thisObject.emitterUserProfileId = signalReceived.emitterUserProfileId
        thisObject.targetUserProfileId = signalReceived.targetUserProfileId
        thisObject.emitterBotProfileId = signalReceived.emitterBotProfileId
        thisObject.targetBotProfileId = signalReceived.targetBotProfileId
        thisObject.emitterPostHash = signalReceived.emitterPostHash
        thisObject.targetPostHash = signalReceived.targetPostHash
        thisObject.signalType = signalReceived.signalType
        thisObject.signalData = signalReceived.signalData
        thisObject.timestamp = signalReceived.timestamp
        thisObject.botAsset = signalReceived.botAsset
        thisObject.botExchange = signalReceived.botExchange
        thisObject.botEnabled = signalReceived.botEnabled
        /*
        Local Variables
        */
        let emitterUserProfile
        let targetUserProfile
        let emitterBotProfile
        let targetBotProfile
        /*
        Validate Emitter User Profile.
        */
        if (thisObject.emitterUserProfileId === undefined) {
            throw ('Emitter User Profile Id Not Provided.')
        }
        emitterUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(thisObject.emitterUserProfileId)
        if (emitterUserProfile === undefined) {
            throw ('Emitter User Profile Not Found.')
        }
        /*
        Validate Target User Profile.
        */
        if (thisObject.targetUserProfileId !== undefined) {
            targetUserProfile = SA.projects.network.globals.memory.maps.USER_SOCIAL_PROFILES_BY_USER_PROFILE_ID.get(thisObject.targetUserProfileId)
            if (targetUserProfile === undefined) {
                throw ('Target User Profile Not Found.')
            }
        }
        /*
        Validate Emitter Bot Profile.
        */
        if (thisObject.emitterBotProfileId !== undefined) {
            emitterBotProfile = emitterUserProfile.bots.get(thisObject.emitterBotProfileId)
            if (emitterBotProfile === undefined) {
                throw ('Emitter Bot Profile Not Found.')
            }
        }
        /*
        Validate Target Bot Profile.
        */
        if (thisObject.targetBotProfileId !== undefined) {
            targetBotProfile = emitterUserProfile.bots.get(thisObject.targetBotProfileId)
            if (targetBotProfile === undefined) {
                throw ('Target Bot Profile Not Found.')
            }
        }

        if (tradingSignals()) {
            signalCounters()
            return
        }

        function tradingSignals() {
            /*
            Is it related to Trading?
            */
            if (
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.TRIGGER_ON ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.TRIGGER_OFF ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.TAKE_POSITION ||
                thisObject.signalType === SA.projects.socialTrading.globals.signalTypes.CLOSE_POSITION
            ) {
                /*
                We will create a new Bot Post with the Signal info attached to it.
                */
                if (emitterBotProfile === undefined) {
                    throw ('Emitter Bot Profile Id Not Provided.')
                }

                emitterBotProfile.addPost(
                    thisObject.emitterUserProfileId,
                    thisObject.targetUserProfileId,
                    thisObject.emitterBotProfileId,
                    thisObject.targetBotProfileId,
                    thisObject.emitterPostHash,
                    thisObject.targetPostHash,
                    SA.projects.socialTrading.globals.postTypes.SIGNAL_POST,
                    thisObject.timestamp,
                    thisObject.signalType,
                    thisObject.signalData
                )
                return true
            }
        }

        function signalCounters() {
            emitterUserProfile.emitterSignalsCount++
            if (targetUserProfile !== undefined) {
                targetUserProfile.targetSignalsCount++
            }
            if (emitterBotProfile !== undefined) {
                emitterUserProfile.emitterSignalsCount++
            }
            if (targetBotProfile !== undefined) {
                targetBotProfile.targetSignalsCount++
            }
        }
    }
}