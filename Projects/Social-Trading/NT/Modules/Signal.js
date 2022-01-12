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
        emitterSocialPersonaId: undefined,
        targetSocialPersonaId: undefined,
        emitterSocialTradingBotId: undefined,
        targetSocialTradingBotId: undefined,
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
        thisObject.emitterSocialPersonaId = signalReceived.emitterSocialPersonaId
        thisObject.targetSocialPersonaId = signalReceived.targetSocialPersonaId
        thisObject.emitterSocialTradingBotId = signalReceived.emitterSocialTradingBotId
        thisObject.targetSocialTradingBotId = signalReceived.targetSocialTradingBotId
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
        Validate Emitter Social Persona.
        */
        if (thisObject.emitterSocialPersonaId === undefined) {
            throw ('Emitter Social Persona Id Not Provided.')
        }
        emitterUserProfile = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.emitterSocialPersonaId)
        if (emitterUserProfile === undefined) {
            throw ('Emitter Social Persona Not Found.')
        }
        /*
        Validate Target Social Persona.
        */
        if (thisObject.targetSocialPersonaId !== undefined) {
            targetUserProfile = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.targetSocialPersonaId)
            if (targetUserProfile === undefined) {
                throw ('Target Social Persona Not Found.')
            }
        }
        /*
        Validate Emitter Social Trading Bot.
        */
        if (thisObject.emitterSocialTradingBotId !== undefined) {
            emitterBotProfile = emitterUserProfile.bots.get(thisObject.emitterSocialTradingBotId)
            if (emitterBotProfile === undefined) {
                throw ('Emitter Social Trading Bot Not Found.')
            }
        }
        /*
        Validate Target Social Trading Bot.
        */
        if (thisObject.targetSocialTradingBotId !== undefined) {
            targetBotProfile = emitterUserProfile.bots.get(thisObject.targetSocialTradingBotId)
            if (targetBotProfile === undefined) {
                throw ('Target Social Trading Bot Not Found.')
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
                    throw ('Emitter Social Trading Bot Id Not Provided.')
                }

                emitterBotProfile.addPost(
                    thisObject.emitterSocialPersonaId,
                    thisObject.targetSocialPersonaId,
                    thisObject.emitterSocialTradingBotId,
                    thisObject.targetSocialTradingBotId,
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