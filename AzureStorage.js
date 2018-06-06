exports.newAzureStorage = function newAzureStorage(BOT, logger) {

    let FULL_LOG = true;
    let LOG_FILE_CONTENT = false;

    let bot = BOT;
    const ROOT_DIR = './';

    const MODULE_NAME = "Azure Storage";
    const REQUEST_TIMEOUT = 180;

    let thisObject = {
        createBlobService: createBlobService
    };

    return thisObject;

    function createBlobService(pConnectionString) {

        return newBlobService(pConnectionString);

    }

    function newBlobService(pConnectionString) {

        let endPoint;
        let SAS;
        let https = require('https');

        let thisObject = {
            getBlobToText: getBlobToText,
            createBlockBlobFromText: createBlockBlobFromText
        };

        let properties = pConnectionString.split(";");
        endPoint = properties[0].substring("BlobEndpoint=https://".length);
        SAS = properties[1].substring("SharedAccessSignature=".length);

        return thisObject;

        function getBlobToText(pContainerName, pBlobPath, callBackFunction) {

            getBlob(endPoint, pContainerName, pBlobPath, SAS, onContentArrived);

            function onContentArrived(err, pContent) {

                let response = null;

                if (err === null) {
                    err = checkForStorageErrors(pContent)
                }

                callBackFunction(err, pContent, response);

            }
        }

        function createBlockBlobFromText(pContainerName, pBlobPath, pBlobContent, callBackFunction) {

            putBlob(endPoint, pContainerName, pBlobPath, pBlobContent, SAS, onFinished);

            function onFinished(err, pContent) {

                let result = null;
                let response = null;

                if (err === null) {
                    err = checkForStorageErrors(pContent)
                }

                callBackFunction(err, result, response);

            }
        }

        function checkForStorageErrors(pData) {

            let err = null;

            if (pData !== undefined) {

                if (pData.indexOf("<Code>BlobNotFound</Code>") > 0) {

                    err = {
                        code: 'BlobNotFound'
                    };
                }

                if (pData.indexOf("<Code>ParentNotFound</Code>") > 0) {

                    err = {
                        code: 'ParentNotFound'
                    };
                }

                if (pData.indexOf("<Code>AuthenticationFailed</Code>") > 0) {

                    err = {
                        code: 'AuthenticationFailed'
                    };
                }

                if (pData.indexOf("<Code>ServerBusy</Code>") > 0) {

                    err = {
                        code: 'ServerBusy'
                    };
                }

                if (pData.indexOf("<Code>AuthorizationPermissionMismatch</Code>") > 0) {

                    err = {
                        code: 'AuthorizationPermissionMismatch'
                    };
                }
            }

            return err;
        }

        function getBlob(pEndPoint, pContainer, pBlobPath, pSAS, callBack) {

            let options = {
                host: pEndPoint,
                port: 443,
                path: '/' + pContainer + '/' + pBlobPath + '?' + pSAS + '&timeout=' + REQUEST_TIMEOUT,
                method: 'GET',
                headers: {},
                agent: false 
            }

            let responseData = '';
            let err = null;

            /* We add the headers. */

            options.headers['x-ms-version'] = '2017-07-29';
            //options.headers['Connection'] = 'Keep-Alive';

            /* Making the https get call. */

            let request = https.request(options, onResponse);
            request.end(); //This actually sends the request.
            request.on('error', onError);

            function onError(err) {

                callBack(err);

            }

            function onResponse(response) {
                response.on('data', onPieceOfDataArrived);
                response.on('end', onAllDataArrived);
            }

            function onPieceOfDataArrived(pData) {

                responseData = responseData + pData.toString();
            }

            function onAllDataArrived() {

                callBack(err, responseData)

            }
        }

        function putBlob(pEndPoint, pContainer, pBlobPath, pBlobContent, pSAS, callBack) {

            let options = {
                host: pEndPoint,
                port: 443,
                path: '/' + pContainer + '/' + pBlobPath + '?' + pSAS + '&timeout=' + REQUEST_TIMEOUT,
                method: 'PUT',
                headers: {},
                agent: false
            }

            let responseData = '';
            let err = null;
            let responseCode;

            /* We add the headers. */

            options.headers['x-ms-version'] = '2017-07-29';
            options.headers['Content-Length'] = pBlobContent.length;
            options.headers['x-ms-blob-type'] = 'BlockBlob';
            //options.headers['Connection'] = 'Keep-Alive';

            /* Making the https get call. */

            let request = https.request(options, onResponse);
            request.body = pBlobContent;
            request.write(pBlobContent);
            request.end(); //This actually sends the request.
            request.on('error', onError);

            function onError(err) {

                callBack(err);

            }

            function onResponse(response) {

                responseCode = response.statusCode;

                if (responseCode === 201) {

                    callBack(err); // No problems. 

                }

                response.on('data', onPieceOfDataArrived);
                response.on('end', onAllDataArrived);
            }

            function onPieceOfDataArrived(pData) {
                responseData = responseData + pData.toString();
            }

            function onAllDataArrived() {

                if (responseCode !== 201) {

                    callBack(err, responseData);; // Some problem found. 

                }
            }
        }
    }
}

