exports.newSocialTradingFunctionLibrariesSocialEntitiesProfile = function () {

    let thisObject = {
        createSocialEntity: createSocialEntity,
        deleteSocialEntity: deleteSocialEntity,
        listSocialEntities: listSocialEntities
    }

    return thisObject

    async function createSocialEntity(profileMessage) {
        return new Promise(userProfileCreatingProcess)

        async function userProfileCreatingProcess(resolve, reject) {

            /*
            These are the properties at the message that we expect here:
    
            userAppType                     Possible values for this field are: "Social Trading Desktop App", "Social Trading Mobile App"
            socialEntityType                "Social Persona" or "Social Trading Bot"
            socialEntityHandle              A string of 25 characters max.
            
            At this function we are going to:
    
            1. Load from the user app file the info regarding of where the User Profile is stored, including the token to access it.
            2. Load the user profile from storage. 
            3. Add the social entity to the User Profile.
            4. Create the Signing Account for the Social Entity.
            5. Create a Storage Container for the new Social Entity.
            6. Adding the Available Storage to the Social Entity.
            7. Save the updated User Profile to it's storage location.
    
            TODO: We need to check that the socialEntityHandle is unique among all Social Entities that currently exist.

            This request, if ok, will send back the following data:

            socialEntityId                  The Id of the Social Entity just created.
            */

            /*
            Message Properties Validations
            */
            if (profileMessage.socialEntityHandle === undefined) {
                let response = {
                    result: 'Error',
                    message: 'socialEntityHandle is Undefined.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.socialEntityHandle.length > 25) {
                let response = {
                    result: 'Error',
                    message: 'socialEntityHandle.length > 25.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.socialEntityHandle.indexOf(' ') !== -1) { // TODO : check for all other characters not wanted at the handle.
                let response = {
                    result: 'Error',
                    message: 'socialEntityHandle cannot include spaces.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.socialEntityType === undefined) {
                let response = {
                    result: 'Error',
                    message: 'socialEntityType is Undefined.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.socialEntityType !== 'Social Persona' && profileMessage.socialEntityType !== 'Social Trading Bot') {
                let response = {
                    result: 'Error',
                    message: 'socialEntityType Not Supported.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.userAppType === undefined) {
                let response = {
                    result: 'Error',
                    message: 'userAppType is Undefined.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.userAppType !== 'Social Trading Desktop App' && profileMessage.userAppType !== 'Social Trading Mobile App') {
                let response = {
                    result: 'Error',
                    message: 'userAppType Not Supported.'
                }
                resolve(JSON.stringify(response))
                return
            }

            let storageProviderName
            let storageProviderUsername
            let storageProviderToken
            let storageContainer
            let userProfile
            let targetNode
            let targetNodeTypeCount
            let response = {
                result: 'Ok'
            }
            let savedPayloadNode = {
                position: {
                    x: 0,
                    y: 0
                },
                targetPosition: {
                    x: 0,
                    y: 0
                },
                floatingObject: {
                    isPinned: false,
                    isFrozen: false,
                    isCollapsed: false,
                    angleToParent: 2,
                    distanceToParent: 3,
                    arrangementStyle: 0
                },
                uiObject: {
                    isRunning: false
                }
            }

            loadUserAppFile()
            if (response.result === 'Error') {
                resolve(response)
                return
            }

            const SUPERALGOS_ORGANIZATION_NAME = 'Superalgos'
            const GOVERNANCE_PLUGINS_REPO_NAME = 'Governance-Plugins'
            const GOVERNANCE_PLUGINS_REPO_BRANCH = 'develop'
            const SOCIAL_TRADING_REPO_NAME = profileMessage.socialEntityHandle + "-" + profileMessage.socialEntityType.replace(' ', '-') + "-Data"
            const { Octokit } = SA.nodeModules.octokit
            const { retry } = SA.nodeModules.retry
            const RetryOctokit = Octokit.plugin(retry)
            const octokit = new RetryOctokit({
                auth: storageProviderToken,
                userAgent: 'Superalgos ' + SA.version
            })

            await loadUserProfileFromStorage()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            addSocialEntitiesNodes()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            await addSigningAccounts()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            await addOpenStorageNodes()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            addAvailableStorageNodes()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            await pushUserProfileAndPullRequest()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            updateInMemoryUserProfile()
            if (response.result === 'Error') { 
                resolve(response) 
                return
            }
            saveApiAppFile()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            reloadSecretsArray()
            if (response.result === 'Error') {
                resolve(response)
                return 
            }

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
                    storageProviderUsername +
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
                                name: profileMessage.socialEntityHandle,
                                project: 'Social-Trading',
                                savedPayload: savedPayloadNode,
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}',
                                socialPersonas: []
                            }
                        }
                        targetNode = {
                            type: 'Social Persona',
                            name: profileMessage.socialEntityHandle,
                            project: 'Social-Trading',
                            savedPayload: savedPayloadNode,
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: JSON.stringify({ handle: profileMessage.socialEntityHandle }),
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
                                savedPayload: savedPayloadNode,
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}'
                            }
                        }
                        if (userProfile.userBots.socialTradingBots === undefined) {
                            userProfile.userBots.socialTradingBots = {
                                type: 'Social Trading Bots',
                                name: 'New Social Trading Bots',
                                project: 'Social-Trading',
                                savedPayload: savedPayloadNode,
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}'
                            }
                        }
                        targetNode = {
                            type: 'Social Trading Bot',
                            name: 'New Social Trading Bot',
                            project: 'Social-Trading',
                            savedPayload: savedPayloadNode,
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: JSON.stringify({ handle: profileMessage.socialEntityHandle }),
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
                    response,
                    savedPayloadNode
                )
                if (response.result === 'Error') { resolve(response) }
            }

            async function addOpenStorageNodes() {
                return new Promise(promiseWork)

                async function promiseWork(resolve, reject) {
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
                                savedPayload: savedPayloadNode,
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}'
                            }
                        }

                        if (storageProviderName === "Github") {
                            if (userProfile.userStorage.githubStorage === undefined) {
                                userProfile.userStorage.githubStorage = {
                                    type: 'Github Storage',
                                    name: 'New Github Storage',
                                    project: 'Open-Storage',
                                    savedPayload: savedPayloadNode,
                                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                    config: '{}',
                                    githubStorageContainers: []
                                }
                            }
                            storageContainer = {
                                type: 'Github Storage Container',
                                name: SOCIAL_TRADING_REPO_NAME,
                                project: 'Open-Storage',
                                savedPayload: savedPayloadNode,
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: JSON.stringify(
                                    {
                                        codeName: SOCIAL_TRADING_REPO_NAME,
                                        githubUserName: storageProviderUsername,
                                        repositoryName: SOCIAL_TRADING_REPO_NAME
                                    }
                                )
                            }
                            userProfile.userStorage.githubStorage.githubStorageContainers.push(storageContainer)
                        }
                        /*
                        Return the id of the node just created.
                        */
                        response.socialEntityId = targetNode.id
                        resolve()
                    }
                }
            }

            function addAvailableStorageNodes() {

                targetNode.availableStorage = {
                    type: 'Available Storage',
                    name: profileMessage.socialEntityHandle + ' Available Storage',
                    project: 'Open-Storage',
                    savedPayload: savedPayloadNode,
                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    storageContainerReferences: [],
                    config: '{}'
                }

                let storageContainerReference = {
                    type: 'Storage Container Reference',
                    name: 'New Storage Container Reference',
                    project: 'Open-Storage',
                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    config: '{}',
                    savedPayload: {
                        position: {
                            x: 0,
                            y: 0
                        },
                        targetPosition: {
                            x: 0,
                            y: 0
                        },
                        floatingObject: {
                            isPinned: false,
                            isFrozen: false,
                            isCollapsed: false,
                            angleToParent: 2,
                            distanceToParent: 3,
                            arrangementStyle: 0
                        },
                        uiObject: {
                            isRunning: false
                        },
                        referenceParent: {
                            type: storageContainer.type,
                            name: storageContainer.name,
                            id: storageContainer.id
                        }
                    }
                }
                
                targetNode.availableStorage.storageContainerReferences.push(storageContainerReference)
            }

            async function pushUserProfileAndPullRequest() {

                await SA.projects.communityPlugins.utilities.pluginsAtGithub.pushPluginFileAndPullRequest(
                    JSON.stringify(userProfile, undefined, 4),
                    storageProviderToken,
                    GOVERNANCE_PLUGINS_REPO_NAME,
                    storageProviderUsername,
                    'User-Profiles',
                    storageProviderUsername,
                    GOVERNANCE_PLUGINS_REPO_BRANCH
                )
                    .then()
                    .catch(profileNotPushed)

                function profileNotPushed(err) {
                    response = {
                        result: 'Error',
                        message: 'Error pushing the updated User Profile to Github.',
                        stack: err.stack
                    }
                    resolve(response)
                }
            }

            function updateInMemoryUserProfile() {

                let inMemoryUserProfile = SA.projects.communityPlugins.utilities.nodes.fromSavedPluginToInMemoryStructure(
                    userProfile
                )
                if (userProfile === undefined) {
                    response = {
                        result: 'Error',
                        message: 'Update User Profile could not be loadded into memory.'
                    }
                    return
                }

                SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.set(userProfile.id, inMemoryUserProfile)
            }

            function saveApiAppFile() {
                let filePath = global.env.PATH_TO_SECRETS + '/'
                let fileName = "ApisSecrets.json"
                let fileContent
                let secretsFile
              
                // Check if the file exists
                let fileExists = SA.nodeModules.fs.existsSync(filePath + '/' + fileName)
              
                if (!fileExists) {
                  // Create the file if it doesn't exist
                  SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, JSON.stringify({ secrets: [] }, undefined, 4));
                }
              
                try {
                  fileContent = SA.nodeModules.fs.readFileSync(filePath + '/' + fileName)
                } catch (err) {
                  const response = {
                    result: 'Error',
                    message: 'Error occurred while reading the ApisSecrets.json: ' + err.message
                  };
                  resolve(response)
                }
              
                try {
                  secretsFile = JSON.parse(fileContent)
                } catch (err) {
                  const response = {
                    result: 'Error',
                    message: 'Error encountered parsing ApisSecrets File: ' + err.message
                  };
                  resolve(response)
                }
              
                // Check if the content was returned correctly
                if (!(secretsFile != null && Array.isArray(secretsFile) && secretsFile.every(item => typeof item === 'object' && item.nodeCodeName && item.apiToken))) {
                  const expectedContent = 'Expected file content: "secrets": [{ "nodeCodeName": "Github-Storage-Container-userName-Data", "apiToken": "gitToken1" }, { "nodeCodeName": "Github-Storage-Container-handle-Data", "apiToken": "gitToken2" }, ...]'
                  const response = {
                    result: 'Error',
                    message: 'Error: Invalid file content. ' + expectedContent
                  };
                  resolve(response)
                }
              
                // Check if the secret already exists
                let existingSecretIndex = -1;
                if (secretsFile && secretsFile.secrets != null) {
                  existingSecretIndex = secretsFile.secrets.findIndex((secret) => {
                    return secret && secret.nodeCodeName === SOCIAL_TRADING_REPO_NAME;
                  });
                }
              
                // Replace the existing secret with the new one
                if (existingSecretIndex !== -1) {
                  if (profileMessage.storageProviderToken != null) {
                    secretsFile.secrets[existingSecretIndex].apiToken = profileMessage.storageProviderToken
                  } else {
                    const response = {
                      result: 'Error',
                      message: 'Error: The storage provider token is null or undefined.'
                    };
                    resolve(response);
                  }
                } else {
                  // Add a new secret
                  let secret = {
                    nodeCodeName: SOCIAL_TRADING_REPO_NAME,
                    apiToken: profileMessage.storageProviderToken
                  };
              
                  secretsFile.secrets.push(secret)
                }
              
                try {
                  SA.nodeModules.fs.writeFileSync(
                    filePath + '/' + fileName,
                    JSON.stringify(secretsFile, undefined, 4)
                  );
                } catch (err) {
                  const response = {
                    result: 'Error',
                    message: 'Error occurred while writing to the ApisSecrets file: ' + err.message
                  };
                  resolve(response)
                }
              
                const response = {
                  result: 'Success',
                  message: 'ApisSecrets.json updated successfully.'
                };
                resolve(response)
            }

            function reloadSecretsArray() {
                try {
                    let fileContent = JSON.parse(SA.nodeModules.fs.readFileSync(SA.nodeModules.path.join(global.env.PATH_TO_SECRETS, 'SigningAccountsSecrets.json')))
                    SA.secrets.signingAccountSecrets.array = fileContent.secrets
                } catch (err) {
                    // some magic handling
                } 
                
                for (let i = 0; i < SA.secrets.signingAccountSecrets.array.length; i++) {
                    let secret = SA.secrets.signingAccountSecrets.array[i]
                    SA.secrets.signingAccountSecrets.map.set(secret.nodeCodeName, secret)
                }
            }
        }
    }

    async function deleteSocialEntity() {

    }

    async function listSocialEntities(profileMessage) {
        return new Promise(userProfileCreatingProcess)

        async function userProfileCreatingProcess(resolve, reject) {

            /*
            These are the properties at the message that we expect here:
    
            userAppType                     Possible values for this field are: "Social Trading Desktop App", "Social Trading Mobile App"
            socialEntityType                "Social Persona" or "Social Trading Bot"
            
            At this function we are going to:
    
            1. Load from the user app file the info regarding of where the User Profile is stored, including the token to access it.
            2. Load the user profile from memory. 
            3. List the results.

            This request, if ok, will send back the following data:

            socialEntities                  An array of social entities, with an id, codeName and handle.

            */

            /*
            Message Properties Validations
            */
            if (profileMessage.socialEntityType === undefined) {
                let response = {
                    result: 'Error',
                    message: 'socialEntityType is Undefined.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.socialEntityType !== 'Social Persona' && profileMessage.socialEntityType !== 'Social Trading Bot') {
                let response = {
                    result: 'Error',
                    message: 'socialEntityType Not Supported.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.userAppType === undefined) {
                let response = {
                    result: 'Error',
                    message: 'userAppType is Undefined.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.userAppType !== 'Social Trading Desktop App' && profileMessage.userAppType !== 'Social Trading Mobile App') {
                let response = {
                    result: 'Error',
                    message: 'userAppType Not Supported.'
                }
                resolve(JSON.stringify(response))
                return
            }

            let userProfileId
            let userProfile

            let response = {
                result: 'Ok'
            }

            loadUserAppFile()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            await loadUserProfileFromMemory()
            if (response.result === 'Error') {
                resolve(response)
                return
            }
            listSocialEntities()
            if (response.result === 'Error') {
                resolve(response)
                return
            }

            resolve(response)

            function loadUserAppFile() {
                /*
                We will load the user profile file for this type of User App.
                */
                try {
                    let filePath = global.env.PATH_TO_SECRETS + '/'
                    let fileName = profileMessage.userAppType.replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '').replace(' ', '') + ".json"
                    let fileContent = JSON.parse(SA.nodeModules.fs.readFileSync(filePath + '/' + fileName))

                    userProfileId = fileContent.userProfile.id

                } catch (err) {
                    response = {
                        result: 'Error',
                        message: 'Error loading User Profile File.',
                        stack: err.stack
                    }
                }
            }

            async function loadUserProfileFromMemory() {
                /*
                We will get the user profile from an in memory map.
                */
                userProfile = SA.projects.network.globals.memory.maps.USER_PROFILES_BY_ID.get(userProfileId)

                if (userProfile === undefined) {
                    response = {
                        result: 'Error',
                        message: 'User Profile Not Found.'
                    }
                }
            }

            function listSocialEntities() {

                let socialEntities = []

                switch (profileMessage.socialEntityType) {
                    case "Social Persona": {
                        if (userProfile.socialPersonas !== undefined) {
                            for (let i = 0; i < userProfile.socialPersonas.socialPersonas.length; i++) {
                                let socialPersona = userProfile.socialPersonas.socialPersonas[i]
                                let config = socialPersona.config
                                let socialEntity = {
                                    id: socialPersona.id,
                                    codeName: config.codeName,
                                    handle: config.handle
                                }
                                socialEntities.push(socialEntity)
                            }
                        }
                        break
                    }
                    case "Social Trading Bot": {
                        if (userProfile.userBots !== undefined) {
                            if (userProfile.userBots.socialTradingBots !== undefined) {
                                for (let i = 0; i < userProfile.userBots.socialTradingBots.socialTradingBots.length; i++) {
                                    let socialTradingBot = userProfile.userBots.socialTradingBots.socialTradingBots[i]
                                    let config = socialTradingBot.config
                                    let socialEntity = {
                                        id: socialTradingBot.id,
                                        codeName: config.codeName,
                                        handle: config.handle
                                    }
                                    socialEntities.push(socialEntity)
                                }
                            }
                        }
                        break
                    }
                }
                response = {
                    result: 'Ok',
                    message: 'Request Processed.',
                    socialEntities: socialEntities
                }
            }
        }
    }
}


