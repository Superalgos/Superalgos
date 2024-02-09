exports.newSocialTradingAppBootstrapingProcess = function newSocialTradingAppBootstrapingProcess() {
    /*
    This module is useful for all Apps that needs to operate with the Social Graph Network Service. 
    
    This process will:
    
    1. Load Social Personas Maps.
    2. Load Social Trading Bots Maps. 

    */
    let thisObject = {
        run: run
    }
    return thisObject

    async function run() {

        let userProfiles = Array.from(SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID)

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i][1]

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
                    let ranking = 0 // TODO replace with real ranking.                

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
                            if (socialClient.config.handle === undefined || socialClient.config.handle === "") {
                                SA.logger.warn('User Profile ' + userProfile.name + ' ' + socialClient.config.codeName + ' does not have a Config Property handle defined.')
                                return
                            }

                            let blockchainAccount = web3.eth.accounts.recover(signatureObject)

                            socialPersona = SA.projects.socialTrading.modules.socialGraphSocialPersona.newSocialTradingModulesSocialGraphSocialPersona()
                            socialPersona.initialize(
                                userProfile,
                                socialClient,
                                socialClient.config.handle,
                                blockchainAccount,
                                ranking
                            )
                            /*
                            Store in memory all Social Personas found.
                            */
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_ID.set(socialPersona.id, socialPersona)
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_PERSONAS_BY_HANDLE.set(socialClient.config.handle, socialPersona)
                            SA.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_SOCIAL_ENTITY_ID.set(socialPersona.id, userProfile)
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
                            if (socialClient.config.handle === undefined || socialClient.config.handle === "") {
                                SA.logger.warn('User Profile ' + userProfile.name + ' ' + socialClient.config.codeName + ' does not have a Config Property handle defined.')
                                return
                            }

                            let blockchainAccount = web3.eth.accounts.recover(signatureObject)

                            socialTradingBot = SA.projects.socialTrading.modules.socialGraphSocialTradingBot.newSocialTradingModulesSocialGraphSocialTradingBot()
                            socialTradingBot.initialize(
                                userProfile,
                                socialClient,
                                socialClient.config.handle,
                                blockchainAccount,
                                ranking
                            )
                            /*
                            Store in memory all Social Personas found.
                            */
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_TRADING_BOTS_BY_ID.set(socialTradingBot.id, socialTradingBot)
                            SA.projects.socialTrading.globals.memory.maps.SOCIAL_TRADING_BOTS_BY_HANDLE.set(socialClient.config.handle, socialTradingBot)
                            SA.projects.socialTrading.globals.memory.maps.USER_PROFILES_BY_SOCIAL_ENTITY_ID.set(socialTradingBot.id, userProfile)
                        }
                    }
                }
            }
        }
    }
}