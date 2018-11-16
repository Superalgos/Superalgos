exports.newStorageAccessManager = function newStorageAccessManager() {

    let thisObject = {
        getPermission: getPermission,
        initialize: initialize
    }

    let permissions;

    return thisObject;

    function initialize(pServerConfig, callBackFunction) {

        permissions = pServerConfig.storagePermissions;

        callBackFunction();
    }

    function getPermission(pContainer, pType, pDays) {

        let azure = require('azure-storage');
        let blobService = azure.createBlobService(permissions.connectionString);

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

