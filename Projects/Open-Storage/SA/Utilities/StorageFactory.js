exports.newOpenStorageUtilitiesStorageFactory = function newOpenStorageUtilitiesStorageFactory() {
    let thisObject = {
        getStorageClient: getStorageClient
    }

    let clients = {
        githubStorage: require('./StorageClients/GithubStorage').newOpenStorageUtilitiesGithubStorage(),
        awsS3Storage: require('./StorageClients/AWSS3Storage').newOpenStorageUtilitiesAWSS3Storage()
    }

    return thisObject

    /**
     * @param {string} containerType
     *
     */
    function getStorageClient(containerType) {
        switch (containerType) {
            case 'Github Storage Container': {
                return clients.githubStorage
            }
            case 'AWS S3 Storage Container': {
                return clients.awsS3Storage
            }
            case 'Superalgos Storage Container': {
                // TODO Build the Superalgos Storage Provider
                return undefined
            }
        }
    }
}

