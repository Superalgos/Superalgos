function newFileStorage() {

    const MODULE_NAME = 'File Cloud'
    const INFO_LOG = false
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    logger.fileName = MODULE_NAME

    thisObject = {
        getBlobToText: getBlobToText
    };

    return thisObject;

    function getBlobToText(pContainerName, pPath, callBackFunction) {

        try {
            if (INFO_LOG === true) { logger.write('[INFO] getBlobToText -> Entering function.') }

            let xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState === 4 && this.status === 200) {

                    try {
                        let response = JSON.parse(xhttp.responseText);
                        callBackFunction(response.err, response.text, "");
                    } catch (err) {
                        if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[ERROR] AppPreLoader -> getBlobToText -> Invalid JSON received. "); }
                        if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[ERROR] AppPreLoader -> getBlobToText -> response.text = " & response.text); }
                        callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE, "", "");
                    }
                }
            };


            let request = {
                conatinerName: pContainerName,
                path: pPath
            };

            request = JSON.stringify(request);

            let path = window.canvasApp.urlPrefix + "FileService";

            let blob = new Blob([request], { type: 'text/plain' });

            xhttp.open("POST", path, true);
            xhttp.send(blob);

        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] getBlobToText -> err = ' + err) }
        }
    }
}