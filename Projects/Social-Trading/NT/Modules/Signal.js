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
        originSocialPersonaId: undefined,
        targetSocialPersonaId: undefined,
        originSocialTradingBotId: undefined,
        targetSocialTradingBotId: undefined,
        originPostHash: undefined,
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
        thisObject.originSocialPersonaId = signalReceived.originSocialPersonaId
        thisObject.targetSocialPersonaId = signalReceived.targetSocialPersonaId
        thisObject.originSocialTradingBotId = signalReceived.originSocialTradingBotId
        thisObject.targetSocialTradingBotId = signalReceived.targetSocialTradingBotId
        thisObject.originPostHash = signalReceived.originPostHash
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
        let originSocialPersona
        let targetSocialPersona
        let originSocialTradingBot
        let targetSocialTradingBot
        /*
        Validate Origin Social Persona.
        */
        if (thisObject.originSocialPersonaId === undefined) {
            throw ('Origin Social Persona Id Not Provided.')
        }
        originSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.originSocialPersonaId)
        if (originSocialPersona === undefined) {
            throw ('Origin Social Persona Not Found.')
        }
        /*
        Validate Target Social Persona.
        */
        if (thisObject.targetSocialPersonaId !== undefined) {
            targetSocialPersona = SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.get(thisObject.targetSocialPersonaId)
            if (targetSocialPersona === undefined) {
                throw ('Target Social Persona Not Found.')
            }
        }
        /*
        Validate Origin Social Trading Bot.
        */
        if (thisObject.originSocialTradingBotId !== undefined) {
            originSocialTradingBot = originSocialPersona.bots.get(thisObject.originSocialTradingBotId)
            if (originSocialTradingBot === undefined) {
                throw ('Origin Social Trading Bot Not Found.')
            }
        }
        /*
        Validate Target Social Trading Bot.
        */
        if (thisObject.targetSocialTradingBotId !== undefined) {
            targetSocialTradingBot = originSocialPersona.bots.get(thisObject.targetSocialTradingBotId)
            if (targetSocialTradingBot === undefined) {
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
                if (originSocialTradingBot === undefined) {
                    throw ('Origin Social Trading Bot Id Not Provided.')
                }

                originSocialTradingBot.addPost(
                    thisObject.originSocialPersonaId,
                    thisObject.targetSocialPersonaId,
                    thisObject.originSocialTradingBotId,
                    thisObject.targetSocialTradingBotId,
                    thisObject.originPostHash,
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
            originSocialPersona.originSignalsCount++
            if (targetSocialPersona !== undefined) {
                targetSocialPersona.targetSignalsCount++
            }
            if (originSocialTradingBot !== undefined) {
                originSocialPersona.originSignalsCount++
            }
            if (targetSocialTradingBot !== undefined) {
                targetSocialTradingBot.targetSignalsCount++
            }
        }
    }
}