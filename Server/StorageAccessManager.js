exports.newStorageAccessManager = function newStorageAccessManager() {

    let thisObject = {
        getPermission: getPermission,
        initialize: initialize
    }

    let connectionString;

    return thisObject;

    function initialize(serverConfig, callBackFunction) {

        switch (serverConfig.environment) {

            case "Develop": {

                connectionString = serverConfig.configAndPlugins.Develop.connectionString;
                break;
            }

            case "Production": {

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

        return "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=" + sasToken + "";

    }
}

