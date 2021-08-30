exports.newBootstrap = function newBootstrap() {
    /*
    This module helps the Network Node to bootstrap, by
    loading all the services and data that needs to start
    operating.
    */
    let thisObject = {
        /* Framework Functions */
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        
         let pluginFileNames = await SA.projects.foundations.utilities.plugins.getPluginFileNames(
            'Governance',
            'User-Profiles'
        )
        for (let i = 0; i < pluginFileNames.length; i++) {
            let pluginFileName = pluginFileNames[i]

            let pluginFileContent = await SA.projects.foundations.utilities.plugins.getPluginFileContent(
                'Governance',
                'User-Profiles',
                pluginFileName
            )

            let userProfilePlugin = JSON.parse(pluginFileContent)
            let config = JSON.parse(userProfilePlugin.config)
            let signatureObject = JSON.parse(config.signature)
            let web3 = new NT.nodeModules.web3()
            let bloackchainAddress = web3.eth.accounts.recover(signatureObject)
            let ranking = 0 // TODO: read the blockchain balance and transactions from the Treasury Account to calculate the profile ranking.
            let userProfileId = userProfilePlugin.id
            let userHandle = config.signature.message

            let userProfile = NT.modules.socialGraphUserProfile.newNetworkModulesSocialGraphUserProfile()
            userProfile.initialize(
                userProfileId,
                userHandle,
                bloackchainAddress,
                ranking
            )

            NT.globals.memory.maps.USER_PROFILES_BY_ID.set(userProfileId, userProfile)
            NT.globals.memory.maps.USER_PROFILES_BY_HANDLE.set(userHandle, userProfile)

        }
    }
}