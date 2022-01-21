exports.newSocialTradingFunctionLibrariesUserProfile = function () {

    let thisObject = {
        createUserProfile: createUserProfile
    }

    return thisObject


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
            const GOVERNANCE_PLUGINS_REPO_NAME = 'Governance-Project-Plugins'
            const { Octokit } = SA.nodeModules.octokit
            const octokit = new Octokit({
                auth: profileMessage.storageProviderToken,
                userAgent: 'Superalgos ' + SA.version
            })
            let userProfile
            let response = {
                result: 'Ok'
            }

            //await checkCreateFork()
            await checkCreateUserProfile()
            await addOpenStorage()
            await addUserApps()
            await addSigningAccounts()
            await saveUserProfileToAppStorage()

            async function checkCreateFork() {
                /*
                Step #1 : We will check if the storageProviderName has a fork of Superalgos already created. If not, we will create the fork.
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
                        let response = {
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
                    let response = {
                        result: 'Error',
                        message: 'Error creating Fork at Github.',
                        stack: err.stack
                    }
                    resolve(response)
                }
            }

            async function checkCreateUserProfile() {
                /*
                Step #2 : We will check for the User Profile and read that file if exists. 
                */
                let userProfileUrl =
                    'https://raw.githubusercontent.com/' +
                    SUPERALGOS_ORGANIZATION_NAME +
                    '/' +
                    GOVERNANCE_PLUGINS_REPO_NAME +
                    '/develop/User-Profiles/' +
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
                    let userProfileConfig = {
                        signature: signature
                    }
                    userProfile.config = JSON.stringify(userProfileConfig)
                    response.message = "New User Profile Created."
                    response.address = address
                    response.privateKey = privateKey
                }
            }

            async function addUserApps() {
                userProfile.userApps = {
                    type: 'User Apps',
                    name: 'New User Apps',
                    project: 'User-Apps',
                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                    config: '{}'
                }

                switch (profileMessage.userAppType) {
                    case "Social Trading Desktop App": {
                        userProfile.userApps.desktopApps = {
                            type: 'Desktop Apps',
                            name: 'New Desktop Apps',
                            project: 'User-Apps',
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: '{}',
                            socialTradingDesktopApps: [
                                {
                                    type: 'Social Trading Desktop App',
                                    name: 'New Social Trading Desktop App',
                                    project: 'User-Apps',
                                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                    config: '{}',
                                }
                            ]
                        }
                        break
                    }
                    case "Social Trading Mobile App": {
                        userProfile.userApps.desktopApps = {
                            type: 'Mobile Apps',
                            name: 'New Mobile Apps',
                            project: 'User-Apps',
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: '{}',
                            socialTradingDesktopApps: [
                                {
                                    type: 'Social Trading Mobile App',
                                    name: 'New Social Trading Mobile App',
                                    project: 'User-Apps',
                                    id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                                    config: '{}',
                                }
                            ]
                        }
                        break
                    }
                }
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

                function repositoryCreated(err) {
                    if (err.status === 230) {
                        /*
                        Repo already existed, so no need to create it. 
                        */
                        addNodes()
                    } else {
                        let response = {
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
                    userProfile.userStorage = {
                        type: 'User Storage',
                        name: 'New User Storage',
                        project: 'Open-Storage',
                        id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                        config: '{}',
                        githubStorage: {
                            type: 'Github Storage',
                            name: 'New Github Storage',
                            project: 'Open-Storage',
                            id: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            config: '{}',
                            githubStorageContainers: [
                                {
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
                            ]
                        }
                    }
                }
            }

            async function addSigningAccounts() {
                /*
                Creating the Signing Accounts nodes.
                */


                /*
                Saving the Signing Accounts at the Secrets File.
                */
            }

            async function saveUserProfileToAppStorage() {
                /*
                We will save a file to a special git ignored folder.
                */
            }
        }
    }
}