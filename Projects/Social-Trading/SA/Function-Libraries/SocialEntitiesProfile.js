exports.newSocialTradingFunctionLibrariesSocialEntitiesProfile = function () {

    let thisObject = {
        createSocialEntity: createSocialEntity,
        deleteSocialEntity: deleteSocialEntity,
        listSocialEntities: listSocialEntities
    }

    return thisObject

    async function createSocialEntity() {
        addOpenStorage()
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