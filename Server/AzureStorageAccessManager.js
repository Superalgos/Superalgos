exports.newAzureStorageAccessManager = function newAzureStorageAccessManager() {

    let thisObject = {
        getPermission: getPermission,
        initialize: initialize
    }

    let connectionString;
    let blobEndpoint;

    return thisObject;

    function initialize(serverConfig, callBackFunction) {

        switch (serverConfig.environment) {

            case "Develop": {

                blobEndpoint = serverConfig.productsStorage.Develop.fileUri;
                connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                break;
            }

            case "Production": {

                blobEndpoint = serverConfig.productsStorage.Production.fileUri;
                connectionString = serverConfig.configAndPlugins.Production.connectionString;
                break;
            }
        }

        callBackFunction();
    }

    function getPermission(pContainer, pType, pDays) {

        let azure = require('azure-storage');
        let blobService = azure.createBlobService(connectionString);

        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);

        let expiryDate = new Date(startDate);
        expiryDate.setDate(startDate.getDate() + pDays);

        let azurePermissions;

        switch (pType) {
            case "READ": {
                azurePermissions = azure.BlobUtilities.SharedAccessPermissions.READ;
                break;
            }
            case "WRITE": {
                azurePermissions = azure.BlobUtilities.SharedAccessPermissions.WRITE;
                break;
            }
            case "DELETE": {
                azurePermissions = azure.BlobUtilities.SharedAccessPermissions.DELETE;
                break;
            }
        }
        
        let blobName = undefined;

        let sharedAccessPolicy = {
            AccessPolicy: {
                Permissions: azurePermissions,
                Start: startDate,
                Expiry: expiryDate
            }
        };

        let sasToken = blobService.generateSharedAccessSignature(pContainer, blobName, sharedAccessPolicy);

        return "BlobEndpoint=" + blobEndpoint + ";SharedAccessSignature=" + sasToken + "";

    }
}

