exports.newSocialTradingFunctionLibrariesUserProfile = function () {

    let thisObject = {
        getUserProfileInfo: getUserProfileInfo,
        createUserProfile: createUserProfile
    }

    return thisObject

    async function getUserProfileInfo(profileMessage) {

    }

    async function createUserProfile(profileMessage) {

        return new Promise(userProfileCreatingProcess)

        async function userProfileCreatingProcess(resolve, reject) {

            /*
            These are the properties at the message that we expect here:
    
            storageProviderName             Must be "Github" for now, because it is the only storage provider we are currently working with.        
            storageProviderUsername         Must be the Github username, not email or anything else.
            storageProviderToken            Must be a valid Github Token.
            userAppType                     Possible values for this field are: "Social Trading Desktop App", "Social Trading Mobile App"
                  
            At this function we are going to:
    
            1. We will check if the storageProviderName has a fork of Superalgos already created. If not, we will create the fork.
            2. We will check for the User Profile and read that file if exists. 
            3. If the user profile file does not exist, then we are going to create it. Create a walleet and sign the User Profile.
            4. Add to the User Profile the User App based on userAppType.
            5. Create a Storage Container for "My-Social-Trading-Data".
            6. Create the Signing Accounts and sign them.
    
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
                return
            }
            if (profileMessage.storageProviderName !== 'Github') {
                let response = {
                    result: 'Error',
                    message: 'storageProviderName Not Supported.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.storageProviderUsername === undefined) {
                let response = {
                    result: 'Error',
                    message: 'storageProviderUsername is Undefined.'
                }
                resolve(JSON.stringify(response))
                return
            }
            if (profileMessage.storageProviderToken === undefined) {
                let response = {
                    result: 'Error',
                    message: 'storageProviderToken is Undefined.'
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

            const SUPERALGOS_ORGANIZATION_NAME = 'Superalgos'
            const GOVERNANCE_PLUGINS_REPO_NAME = 'Governance-Plugins'
            const GOVERNANCE_PLUGINS_REPO_BRANCH = 'develop'
            const { Octokit } = SA.nodeModules.octokit
            const octokit = new Octokit({
                auth: profileMessage.storageProviderToken,
                userAgent: 'Superalgos ' + SA.version
            })
            let userProfile
            let targetNode
            let targetNodeTypeCount
            let response = {
                result: 'Ok'
            }

            await checkCreateFork()
            if (response.result === 'Error') { 
                resolve(response) 
                return
            }
            await checkCreateUserProfile()
            if (response.result === 'Error') { 
                resolve(response) 
                return
            }
            addUserAppsNodes()
            if (response.result === 'Error') { 
                resolve(response) 
                return
            }
            await addSigningAccounts()
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
            saveUserAppFile()
            if (response.result === 'Error') { 
                resolve(response) 
                return
            }

            resolve(response)

            async function checkCreateFork() {
                /*
                We will check if the storageProviderName has a fork of Superalgos already created. If not, we will create the fork.
                */
                await octokit.rest.repos.get({
                    owner: profileMessage.storageProviderUsername,
                    repo: GOVERNANCE_PLUGINS_REPO_NAME
                })
                    .then(repositoryFound)
                    .catch(repositoryNotFound)

                async function repositoryFound(repository) {
                    if (repository.data.parent.name === GOVERNANCE_PLUGINS_REPO_NAME && repository.data.parent.owner.login === SUPERALGOS_ORGANIZATION_NAME) {
                        /* We already have a fork, and we don't need to create one. */
                    } else {
                        /* We do not have a fork, and we need to create one. */
                        await octokit.rest.repos.createFork({
                            owner: SUPERALGOS_ORGANIZATION_NAME,
                            repo: GOVERNANCE_PLUGINS_REPO_NAME
                        })
                            .then(succeedCreatingFork)
                            .catch(errorCreatingFork)
                    }
                }

                async function repositoryNotFound(err) {

                    if (err.status === 404) {
                        /* We do not have a fork, and we need to create one. */
                        await octokit.rest.repos.createFork({
                            owner: SUPERALGOS_ORGANIZATION_NAME,
                            repo: GOVERNANCE_PLUGINS_REPO_NAME
                        })
                            .then(succeedCreatingFork)
                            .catch(errorCreatingFork)

                    } else {
                        response = {
                            result: 'Error',
                            message: 'Error accessing Github.',
                            stack: err.stack
                        }
                        resolve(response)
                    }
                }

                async function succeedCreatingFork(fork) {
                    /* In this case, we have nothing to do. */
                }

                async function errorCreatingFork(err) {
                    response = {
                        result: 'Error',
                        message: 'Error creating Fork at Github.',
                        stack: err.stack
                    }
                    resolve(response)
                }
            }

            async function checkCreateUserProfile() {
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

                function userProfileDoesNotExist() {
                    /*
                    Create a new User Profile
                    */
                    userProfile = {
                        type: 'User Profile',
                        name: profileMessage.storageProviderUsername,
                        project: 'Governance',
                        id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
                    }
                    /*
                    Create a Wallet for the new User Profile and get the Private Key.
                    */
                    const Web3 = SA.nodeModules.web3
                    let web3 = new Web3()
                    let account = web3.eth.accounts.create()
                    let address = account.address
                    let privateKey = account.privateKey
                    /*
                    Sign the User Profile with the Wallet Private Key.
                    */
                    let signature = web3.eth.accounts.sign(profileMessage.storageProviderUsername, privateKey)
                    let config = {
                        codeName: profileMessage.storageProviderUsername,
                        signature: signature
                    }
                    userProfile.config = JSON.stringify(config)
                    response.message = "New User Profile Created."
                    response.address = address
                    response.privateKey = privateKey
                }
            }

            function addUserAppsNodes() {
                if (userProfile.userApps === undefined) {
                    userProfile.userApps = {
                        type: 'User Apps',
                        name: 'New User Apps',
                        project: 'User-Apps',
                        id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                        config: '{}'
                    }
                }

                switch (profileMessage.userAppType) {
                    case "Social Trading Desktop App": {
                        if (userProfile.userApps.desktopApps === undefined) {
                            userProfile.userApps.desktopApps = {
                                type: 'Desktop Apps',
                                name: 'New Desktop Apps',
                                project: 'User-Apps',
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}',
                                socialTradingDesktopApps: []
                            }
                        }
                        targetNode = {
                            type: 'Social Trading Desktop App',
                            name: 'New Social Trading Desktop App',
                            project: 'User-Apps',
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: '{}',
                        }
                        userProfile.userApps.desktopApps.socialTradingDesktopApps.push(targetNode)
                        targetNodeTypeCount = userProfile.userApps.desktopApps.socialTradingDesktopApps.length
                        break
                    }
                    case "Social Trading Mobile App": {
                        if (userProfile.userApps.mobilepApps === undefined) {
                            userProfile.userApps.mobilepApps = {
                                type: 'Mobile Apps',
                                name: 'New Mobile Apps',
                                project: 'User-Apps',
                                id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                config: '{}',
                                socialTradingDesktopApps: []
                            }
                        }
                        targetNode = {
                            type: 'Social Trading Mobile App',
                            name: 'New Social Trading Mobile App',
                            project: 'User-Apps',
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: '{}',
                        }
                        userProfile.userApps.mobilepApps.socialTradingDesktopApps.push(targetNode)
                        targetNodeTypeCount = userProfile.userApps.mobilepApps.socialTradingDesktopApps.length
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

            async function pushUserProfileAndPullRequest() {

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

            function updateInMemoryUserProfile(){
                
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

            function saveUserAppFile() {
                /*
                We will save a file to a special git ignored folder.
                */
                let filePath = global.env.PATH_TO_SECRETS + '/'
                let fileName = profileMessage.userAppType.replace(' ','').replace(' ','').replace(' ','').replace(' ','').replace(' ','').replace(' ','').replace(' ','') + ".json"
                let fileContent = {
                    userProfile: {
                        id: userProfile.id,
                        codeName: JSON.parse(userProfile.config).codeName
                    },
                    storageProvider: {
                        name: profileMessage.storageProviderName,
                        userName: profileMessage.storageProviderUsername,
                        token: profileMessage.storageProviderToken,
                    }
                }
                SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, JSON.stringify(fileContent, undefined, 4))
            }
        }
    }
}