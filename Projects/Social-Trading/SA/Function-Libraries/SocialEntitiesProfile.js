exports.newSocialTradingFunctionLibrariesSocialEntitiesProfile = function () {

    let thisObject = {
        createSocialEntity: createSocialEntity,
        deleteSocialEntity: deleteSocialEntity,
        listSocialEntities: listSocialEntities
    }

    return thisObject

    async function createSocialEntity() {
        return new Promise(userProfileCreatingProcess)

        async function userProfileCreatingProcess(resolve, reject) {

            /*
            These are the properties at the message that we expect here:
    
            userAppType                     Possible values for this field are: "Social Trading Desktop App", "Social Trading Mobile App"
            socialEntityType                "Social Persona" or "Social Trading Bot"
            socialEntityHandle              A string of 20 characters max.
            
            At this function we are going to:
    
            1. Load from the user app file the info regarding of where the User Profile is stored, including the token to access it.
            2. Load the user profile from storage. 
            3. Add the social entity to the User Profile.
            4. Create the Signing Account for the Social Entity.
            5. Create a Storage Container for the new Social Entity.
            6. Save the updated User Profile to it's storage location.
    
            TODO: We need to check that the socialEntityHandle is unique among all Social Entities that currently exist.
            */

            /*
            Message Properties Validations
            */
            if (profileMessage.storageProviderName === undefined) {
                let response = {
                    result: 'Error',
                    message: 'storageProviderName is Undefined.'
                }
                resolve(JSON.stringify(response))
            }
            if (profileMessage.storageProviderName !== 'Github') {
                let response = {
                    result: 'Error',
                    message: 'storageProviderName Not Supported.'
                }
                resolve(JSON.stringify(response))
            }
            if (profileMessage.storageProviderUsername === undefined) {
                let response = {
                    result: 'Error',
                    message: 'storageProviderUsername is Undefined.'
                }
                resolve(JSON.stringify(response))
            }
            if (profileMessage.storageProviderToken === undefined) {
                let response = {
                    result: 'Error',
                    message: 'storageProviderToken is Undefined.'
                }
                resolve(JSON.stringify(response))
            }
            if (profileMessage.userAppType === undefined) {
                let response = {
                    result: 'Error',
                    message: 'userAppType is Undefined.'
                }
                resolve(JSON.stringify(response))
            }
            if (profileMessage.userAppType !== 'Social Trading Desktop App' && profileMessage.userAppType !== 'Social Trading Mobile App') {
                let response = {
                    result: 'Error',
                    message: 'userAppType Not Supported.'
                }
                resolve(JSON.stringify(response))
            }

            const SUPERALGOS_ORGANIZATION_NAME = 'Superalgos'
            const GOVERNANCE_PLUGINS_REPO_NAME = 'Governance-Plugins'
            const GOVERNANCE_PLUGINS_REPO_BRANCH = 'develop'
            const { Octokit } = SA.nodeModules.octokit
            const octokit = new Octokit({
                auth: profileMessage.storageProviderToken,
                userAgent: 'Superalgos ' + SA.version
            })
            let storageProviderName
            let storageProviderUsername
            let storageProviderToken
            let userProfile
            let targetNode
            let targetNodeTypeCount
            let response = {
                result: 'Ok'
            }

            loadUserAppFile()
            if (response.result === 'Error') { return }
            await loadUserProfileFromStorage()
            if (response.result === 'Error') { return }
            addSocialEntitiesNodes()
            if (response.result === 'Error') { return }
            await addSigningAccounts()
            if (response.result === 'Error') { return }
            await pushProfileAndPullRequest()
            if (response.result === 'Error') { return }
            saveUserAppFile()

            resolve(response)

            function loadUserAppFile() {
                /*
                We will load the user profile file for this type of User App.
                */
                try {
                    let filePath = global.env.PATH_TO_SECRETS + '/'
                    let fileName = profileMessage.userAppType.replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '') + ".json"
                    let fileContent = JSON.parse(SA.nodeModules.fs.readFileSync(filePath + '/' + fileName))

                    storageProviderName = fileContent.storageProvider.name
                    storageProviderUsername = fileContent.storageProvider.userName
                    storageProviderToken = fileContent.storageProvider.token
                } catch (err) {
                    response = {
                        result: 'Error',
                        message: 'Error loading User Profile File.',
                        stack: err.stack
                    }
                }
            }

            async function loadUserProfileFromStorage() {
                /*
                We will check for the User Profile and read that file if exists. 
                */
                let userProfileUrl =
                    'https://raw.githubusercontent.com/' +
                    SUPERALGOS_ORGANIZATION_NAME +
                    '/' +
                    GOVERNANCE_PLUGINS_REPO_NAME +
                    '/' +
                    GOVERNANCE_PLUGINS_REPO_BRANCH +
                    '/User-Profiles/' +
                    profileMessage.storageProviderUsername +
                    '.json'

                await SA.projects.foundations.utilities.webAccess.fetchAPIDataFile(userProfileUrl)
                    .then(userProfileExists)
                    .catch(userProfileDoesNotExist)

                function userProfileExists(fileContent) {
                    userProfile = JSON.parse(fileContent)
                    response.message = "Existing User Profile Upgraded."
                }

                function userProfileDoesNotExist(err) {
                    response = {
                        result: 'Error',
                        message: 'Error loading User Profile File.',
                        stack: err.stack
                    }
                }
            }

            function addSocialEntitiesNodes() {

                switch (profileMessage.socialEntityType) {
                    case "Social Persona": {
                        if (userProfile.socialPersonas === undefined) {
                            userProfile.socialPersonas = {
                                type: 'Social Personas',
                                name: 'New Social Personas',
                                project: 'Social-Trading',
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}'
                            }
                        }
                        targetNode = {
                            type: 'Social Persona',
                            name: 'New Social Persona',
                            project: 'Social-Trading',
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: JSON.stringify({handle: profileMessage.socialEntityHandle}),
                        }
                        userProfile.socialPersonas.socialPersonas.push(targetNode)
                        targetNodeTypeCount = userProfile.socialPersonas.socialPersonas.length                        
                        break
                    }
                    case "Social Trading Bot": {
                        if (userProfile.userBots === undefined) {
                            userProfile.userBots = {
                                type: 'User Bots',
                                name: 'New User Bots',
                                project: 'Governance',
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}'
                            }
                        }
                        if (userProfile.userBots.socialTradingBots === undefined) {
                            userProfile.userBots.socialTradingBots = {
                                type: 'Social Trading Bots',
                                name: 'New Social Trading Bots',
                                project: 'Social-Trading',
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}'
                            }
                        }
                        targetNode = {
                            type: 'Social Trading Bot',
                            name: 'New Social Trading Bot',
                            project: 'Social-Trading',
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: JSON.stringify({handle: profileMessage.socialEntityHandle}),
                        }
                        userProfile.userBots.socialTradingBots.socialTradingBots.push(targetNode)
                        targetNodeTypeCount = userProfile.userBots.socialTradingBots.socialTradingBots.length                          
                        break
                    }
                }
            }

            async function addSigningAccounts() {
                SA.projects.governance.utilities.signingAccounts.installSigningAccount(
                    userProfile,
                    targetNode,
                    targetNodeTypeCount,
                    response
                )
                if (response.result === 'Error') { resolve(response) }
            }

            async function pushProfileAndPullRequest() {

                await SA.projects.communityPlugins.utilities.pluginsAtGithub.pushPluginFileAndPullRequest(
                    JSON.stringify(userProfile, undefined, 4),
                    profileMessage.storageProviderToken,
                    GOVERNANCE_PLUGINS_REPO_NAME,
                    profileMessage.storageProviderUsername,
                    'User-Profiles',
                    profileMessage.storageProviderUsername
                )
                    .then()
                    .catch(profileNotPushed)

                function profileNotPushed(err) {
                    response = {
                        result: 'Error',
                        message: 'Error pushing the User Profile to Github.',
                        stack: err.stack
                    }
                    resolve(response)
                }
            }

            function saveUserAppFile() {
                /*
                We will save a file to a special git ignored folder.
                */
                let filePath = global.env.PATH_TO_MY_SOCIAL_TRADING_DATA + '/'
                let fileName = "AppData.json"
                let fileContent = {
                    userProfile: {
                        id: userProfile.id,
                        name: userProfile.name
                    }
                }
                SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, JSON.stringify(fileContent, undefined, 4))
            }
        }
    }

    async function deleteSocialEntity() {

    }

    async function listSocialEntities() {

    }

    async function addOpenStorage() {

        const SOCIAL_TRADING_REPO_NAME = "My-Social-Trading-Data"
        /*
        Create this repository at Github 
        */
        await octokit.rest.repos.createForAuthenticatedUser({
            name: SOCIAL_TRADING_REPO_NAME,
            private: false
        })
            .then(repositoryCreated)
            .catch(repositoryNotCreated)

        function repositoryCreated() {
            addNodes()
        }

        function repositoryNotCreated(err) {
            if (err.status === 422) {
                /*
                Repo already existed, so no need to create it. 
                */
                addNodes()
            } else {
                response = {
                    result: 'Error',
                    message: 'Error creating Repo at Github.',
                    stack: err.stack
                }
                resolve(response)
            }
        }

        function addNodes() {
            /*
            Add the User Storage nodes to the User Profile
            */
            if (userProfile.userStorage === undefined) {
                userProfile.userStorage = {
                    type: 'User Storage',
                    name: 'New User Storage',
                    project: 'Open-Storage',
                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    config: '{}'
                }
            }

            if (userProfile.userStorage.githubStorage === undefined) {
                userProfile.userStorage.githubStorage = {
                    type: 'Github Storage',
                    name: 'New Github Storage',
                    project: 'Open-Storage',
                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    config: '{}',
                    githubStorageContainers: []
                }
            }
            let storageContainer = {
                type: 'Github Storage Container',
                name: 'New Github Storage Container',
                project: 'Open-Storage',
                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                config: JSON.stringify(
                    {
                        codeName: SOCIAL_TRADING_REPO_NAME,
                        githubUserName: profileMessage.storageProviderUsername,
                        repositoryName: SOCIAL_TRADING_REPO_NAME
                    }
                )
            }
            userProfile.userStorage.githubStorage.githubStorageContainers.push(storageContainer)
        }
    }
}


