exports.newStorageAccessManager = function newStorageAccessManager() {

    let thisObject = {
        getPermission: getPermission,
        initialize: initialize
    }

    let permissions;

    return thisObject;

    function initialize(callBackFunction) {

        readStoragePermissions();

        function readStoragePermissions() {

            let filePath;

            try {
                let fs = require('fs');
                filePath = './' + 'Storage' + '/' + 'Storage.Permissions.json';
                permissions = JSON.parse(fs.readFileSync(filePath, 'utf8'));

                callBackFunction();

            }
            catch (err) {
                console.log("[ERROR] readStoragePermissions -> err = " + err.message);
                console.log("[HINT] readStoragePermissions -> You need to have a file at this path -> " + filePath);

                callBackFunction();
            }
        }
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

