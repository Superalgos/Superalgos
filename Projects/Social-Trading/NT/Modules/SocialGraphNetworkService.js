exports.newSocialTradingModulesSocialGraphNetworkService = function newSocialTradingModulesSocialGraphNetworkService() {
    /*
    This module represents the Social Graph Network Service that 
    deals with the Social Graph this node maintains when it is running.
    
    The Social Graph is one of the services the Network Node provides.

    This service is responsible for maintaining the whole Social Graph
    or relationships between User and Bot profiles and also between 
    their posts.
    */
    let thisObject = {
        storage: undefined,
        clientInterface: undefined,
        peerInterface: undefined,
        serviceInterface: undefined,
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

        thisObject.storage.finalize()
        thisObject.clientInterface.finalize()
        thisObject.peerInterface.finalize()
        thisObject.serviceInterface.finalize()

        thisObject.storage = undefined
        thisObject.clientInterface = undefined
        thisObject.peerInterface = undefined
        thisObject.serviceInterface = undefined
    }

    async function initialize() {
        /*
        The Storage deals with persisting the Social Graph.
        */
        thisObject.storage = NT.projects.socialTrading.modules.storage.newSocialTradingModulesStorage()
        thisObject.clientInterface = NT.projects.socialTrading.modules.clientInterface.newSocialTradingModulesClientInterface()
        thisObject.peerInterface = NT.projects.socialTrading.modules.peerInterface.newSocialTradingModulesPeerInterface()
        thisObject.serviceInterface = NT.projects.socialTrading.modules.serviceInterface.newSocialTradingModulesServiceInterface()

        thisObject.storage.initialize()
        thisObject.clientInterface.initialize()
        thisObject.peerInterface.initialize()
        thisObject.serviceInterface.initialize()

        let userProfiles = Array.from(SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID)

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i][1]
            let userProfileId = userProfile.id

            loadSigningAccounts()

            function loadSigningAccounts() {
                /*
                For each User Profile Plugin, we will check all the Signing Accounts
                and load them in memory to easily find them when needed.

                Some of these Signing Accounts will belong to P2P Social Personas, or Social 
                Trading Bots.
                */
                let signingAccounts = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile, 'Signing Account')

                for (let j = 0; j < signingAccounts.length; j++) {

                    let signingAccount = signingAccounts[j]
                    let socialClient = signingAccount.parentNode
                    let config = signingAccount.config
                    let signatureObject = config.signature
                    let web3 = new SA.nodeModules.web3()                    

                    loadSocialPersonas()
                    loadSocialTradingBots()

                    function loadSocialPersonas() {
                        /*
                        If the Signing Account is for a Social Persona, we will add the node to the map.
                        */
                        if (
                            socialClient.type === "Social Persona" &&
                            socialClient.config !== undefined
                        ) {
                            if (socialClient.config.codeName === undefined) {
                                return
                            }
                            if (socialClient.config.handle === undefined) {
                                return
                            }

                            let blockchainAccount = web3.eth.accounts.recover(signatureObject)

                            socialPersona = SA.projects.socialTrading.modules.socialGraphSocialPersona.newSocialTradingModulesSocialGraphSocialPersona()
                            socialPersona.initialize(
                                userProfileId,
                                socialClient.config.handle,
                                blockchainAccount,
                                ranking
                            )
                            /*
                            Store in memory all Social Personas found.
                            */
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.set(socialPersona.id, socialPersona)
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_HANDLE.set(socialClient.config.handle, socialPersona)
                        }
                    }
                    
                    function loadSocialTradingBots() {
                        /*
                        If the Signing Account is for a Social Trading Bots, we will add the node to the map.
                        */
                        if (
                            socialClient.type === "Social Trading Bot" &&
                            socialClient.config !== undefined
                        ) {
                            if (socialClient.config.codeName === undefined) {
                                return
                            }
                            if (socialClient.config.handle === undefined) {
                                return
                            }

                            let blockchainAccount = web3.eth.accounts.recover(signatureObject)

                            socialTradingBot = SA.projects.socialTrading.modules.socialGraphSocialPersona.newSocialTradingModulesSocialGraphSocialTradingBot()
                            socialTradingBot.initialize(
                                userProfileId,
                                socialClient.config.handle,
                                blockchainAccount,
                                ranking
                            )
                            /*
                            Store in memory all Social Personas found.
                            */
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_TRADING_BOTS_BY_ID.set(socialTradingBot.id, socialTradingBot)
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_TRADING_BOTS_BY_HANDLE.set(socialClient.config.handle, socialTradingBot)
                        }
                    }
                }
            }
        }
    }
}