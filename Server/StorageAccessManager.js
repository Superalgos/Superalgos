exports.newStorageAccessManager = function newStorageAccessManager() {

    let thisObject = {
        getPermissions: getPermissions,
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
                filePath = '../' + 'Storage' + '/' + 'Storage.Permissions.json';
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

    function getPermissions(pTeams) {

        let azure = require('azure-storage');
        let blobService = azure.createBlobService(permissions.connectionString);

        let startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);

        let expiryDate = new Date(startDate);
        expiryDate.setDate(startDate.getDate() + 3);

        for (let i = 0; i < pTeams.length; i++) {

            let team = pTeams[i];

            if (team.readConnectionString !== undefined) {

                let azurePermissions = azure.BlobUtilities.SharedAccessPermissions.READ;

                let container = team.codeName;
                let blobName = undefined;

                let sharedAccessPolicy = {
                    AccessPolicy: {
                        Permissions: azurePermissions,
                        Start: startDate,
                        Expiry: expiryDate
                    }
                };

                let sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
                team.readConnectionString = "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=" + sasToken + "";
            }

            if (team.writeConnectionString !== undefined) {

                let azurePermissions = azure.BlobUtilities.SharedAccessPermissions.WRITE;

                let container = team.codeName;
                let blobName = undefined;

                let sharedAccessPolicy = {
                    AccessPolicy: {
                        Permissions: azurePermissions,
                        Start: startDate,
                        Expiry: expiryDate
                    }
                };

                let sasToken = blobService.generateSharedAccessSignature(container, blobName, sharedAccessPolicy);
                team.readConnectionString = "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=" + sasToken + "";
            }
        }

        return pTeams;
    }
}


/*

  "Develop": {
    "aaplatform": {
      "readConnectionString": "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=st=2018-05-21T07%3A16%3A54Z&se=2018-08-19T07%3A16%3A54Z&sp=r&sv=2017-07-29&sr=c&sig=YzkqXqAaXsbyn5hOgHCLDjKL8xcSkjBa0e9E1nNdoEI%3D"
    },
    "aamasters": {
      "readConnectionString": "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=st=2018-05-18T11%3A46%3A36Z&se=2018-08-16T11%3A46%3A36Z&sp=r&sv=2017-07-29&sr=c&sig=XHpklrDCK3Ta7Zp2F1S6UWkKgd2Sf0wTUUWcrykhh%2FA%3D",
      "writeConnectionString": "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=st=2018-05-18T11%3A47%3A35Z&se=2018-08-16T11%3A47%3A35Z&sp=w&sv=2017-07-29&sr=c&sig=MENzxltuTVcXCgM%2BCtgfGkNtEULelIEHk0ke1nFCr6E%3D"
    },
    "aabash": {
      "readConnectionString": "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=st=2018-06-10T17%3A12%3A13Z&se=2018-09-08T17%3A12%3A13Z&sp=r&sv=2017-07-29&sr=c&sig=zb1JWz2Fl1baO2VjFFP4qKzobV85%2F79c2dXWX4fuBLc%3D",
      "writeConnectionString": "BlobEndpoint=https://aadevelop.blob.core.windows.net;SharedAccessSignature=st=2018-06-10T17%3A13%3A51Z&se=2018-09-08T17%3A13%3A51Z&sp=w&sv=2017-07-29&sr=c&sig=OCrxZggKIQS0Vm8wKA1SAhhTbSlq%2BRd7VqQhp8NUhF8%3D"
    }
  }

*/