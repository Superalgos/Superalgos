
function newDeleteTradingHistory() {

    const MODULE_NAME = "Delete Trading History";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    var thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize
    };

    var container = newContainer();
    container.initialize();
    thisObject.container = container;

    thisObject.container.frame.width = 50;
    thisObject.container.frame.height = BOTTOM_SPACE_HEIGHT;

    container.frame.position.x = viewPort.visibleArea.topRight.x;
    container.frame.position.y = viewPort.visibleArea.bottomLeft.y;

    container.isDraggeable = false;
    container.isClickeable = true;

    let icon;
    let canDrawIcon = false;

    return thisObject;

    function initialize(callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            icon = new Image();

            icon.onload = onImageLoad;

            function onImageLoad() {
                canDrawIcon = true;
            }

            icon.src = window.canvasApp.urlPrefix + "Images/Icons/trash.png";

            thisObject.container.eventHandler.listenToEvent("onMouseClick", onClick);

            if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE); }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err.message = " + err.message); }
            if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE); }
        }
    }

    function onClick() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] onClick -> Entering function."); }

            let user = window.localStorage.getItem("user");

            if (user === null) { return; }

            /*

            To delete the trading history we will follow these steps:

            1. Get the status report of that bot.
            2. Iterate through all the entries for the startMode received by parameters.
            3. For each entry, get the execution history file belonging to that entry.
            4. Iterate on each entry of each execution history file to get the date of each execution that we will use to locate the
               execution context file.
            6. Delete every execution context file found.
            7. Delete the execution history file after finishing the interation.
            8. Delete the Sequence file belonging to the received Start Mode.
            9. Save the Status Report without the records of this Start Mode. 
        
            */

            let storage = AzureStorage.Blob;

            let readOnlyBlobService;
            let writeOnlyBlobService;
            let deleteOnlyBlobService;

            let readConnectionString = window.USER_PROFILE.storagePermissions.get(window.DEV_TEAM + "." + "READ");

            if (readConnectionString !== undefined) {
                readOnlyBlobService = storage.createBlobService(readConnectionString);
            }

            let writeConnectionString = window.USER_PROFILE.storagePermissions.get(window.DEV_TEAM + "." + "WRITE");

            if (writeConnectionString !== undefined) {
                writeOnlyBlobService = storage.createBlobService(writeConnectionString);
            }

            let deleteConnectionString = window.USER_PROFILE.storagePermissions.get(window.DEV_TEAM + "." + "DELETE");

            if (deleteConnectionString !== undefined) {
                deleteOnlyBlobService = storage.createBlobService(deleteConnectionString);
            }

            let containerName = window.DEV_TEAM.toLowerCase();

            let statusReportFilePath = window.DEV_TEAM + "/" + window.CURRENT_BOT_CODE_NAME + ".1.0" + "/" + "AACloud.1.1" + "/" + "Poloniex" + "/" + "dataSet.V1" + "/" + "Reports" + "/" + "Trading-Process";
            let statusReportFileName = window.CURRENT_START_MODE + "." + "Status.Report.USDT_BTC.json";

            readOnlyBlobService.getBlobToText(containerName, statusReportFilePath + "/" + statusReportFileName, onStatusReport);

            function onStatusReport(err, text, response) {

                try {

                    if (INFO_LOG === true) { logger.write("[INFO] onClick -> onStatusReport -> Entering function."); }

                    if (err && err.code === 'BlobNotFound') {

                        console.log(statusReportFilePath + "/" + statusReportFileName + " not found. No history detected for this start mode.");
                        return;
                    }

                    let statusReport = JSON.parse(text);

                    let toBeDeleted = 0;
                    let deleted = 0;

                    for (let i = 0; i < statusReport.runs.length; i++) {

                        /* For each record, we will get the execution history file. */

                        let filePath = window.DEV_TEAM + "/" + window.CURRENT_BOT_CODE_NAME + ".1.0" + "/" + "AACloud.1.1" + "/" + "Poloniex" + "/" + "dataSet.V1" + "/" + "Output" + "/" + "Trading-Process";
                        let fileName = "Execution.History." + window.CURRENT_START_MODE + "." + i + ".json";

                        readOnlyBlobService.getBlobToText(containerName, filePath + "/" + fileName, onExecutionHistory);

                        function onExecutionHistory(err, text, response) {

                            let executionHistory = JSON.parse(text);

                            for (let j = 0; j < executionHistory.length; j++) {

                                let dateTime = new Date(executionHistory[j][0]);

                                let datePath = dateTime.getUTCFullYear() + "/" + pad(dateTime.getUTCMonth() + 1, 2) + "/" + pad(dateTime.getUTCDate(), 2) + "/" + pad(dateTime.getUTCHours(), 2) + "/" + pad(dateTime.getUTCMinutes(), 2);

                                let filePath = window.DEV_TEAM + "/" + window.CURRENT_BOT_CODE_NAME + ".1.0" + "/" + "AACloud.1.1" + "/" + "Poloniex" + "/" + "dataSet.V1" + "/" + "Output" + "/" + "Trading-Process" + "/" + datePath;
                                let fileName = "Execution.Context." + window.CURRENT_START_MODE + "." + i + ".json";

                                deleteOnlyBlobService.deleteBlob(containerName, filePath + "/" + fileName, onDeleted);

                                toBeDeleted++;

                                function onDeleted(err, text, response) {

                                    if (err) {

                                        console.log(filePath + "/" + fileName + " NOT deleted.");
                                        console.log("err.message = " + err.message);
                                    } else {

                                        console.log(filePath + "/" + fileName + " deleted.");

                                    }

                                    deleted++;

                                    if (toBeDeleted === deleted) {

                                        updateStatusReport();

                                    }
                                }
                            }

                            /* Now we delete the execution history file. */

                            deleteOnlyBlobService.deleteBlob(containerName, filePath + "/" + fileName, onExecutionHistoryDeleted);

                            function onExecutionHistoryDeleted(err, text, response) {

                                console.log(filePath + "/" + fileName + " deleted.");

                            }
                        }
                    }

                    function updateStatusReport() {

                        try {

                            if (INFO_LOG === true) { logger.write("[INFO] onClick -> onStatusReport -> updateStatusReport -> Entering function."); }

                            statusReport.runs = [];

                            /* Here is where we update the current Status Report file with the new version without records for the current Start Mode. */

                            let fileContent = JSON.stringify(statusReport);

                            writeOnlyBlobService.createBlockBlobFromText(containerName, statusReportFilePath + "/" + statusReportFileName, fileContent, onStatusReportUpdated);

                            function onStatusReportUpdated(err, text, response) {

                                console.log(statusReportFilePath + "/" + statusReportFileName + " updated.");

                            }

                            /* Finally we delete the sequence file. */

                            let filePath = window.DEV_TEAM + "/" + window.CURRENT_BOT_CODE_NAME + ".1.0" + "/" + "AACloud.1.1" + "/" + "Poloniex" + "/" + "dataSet.V1" + "/" + "Output" + "/" + "Trading-Process";
                            let fileName = "Execution.History." + window.CURRENT_START_MODE + "." + "Sequence" + ".json";

                            deleteOnlyBlobService.deleteBlob(containerName, filePath + "/" + fileName, onDeleted);

                            function onDeleted(err, text, response) {

                                console.log(filePath + "/" + fileName + " deleted.");

                            }

                        } catch (err) {

                            if (ERROR_LOG === true) { logger.write("[ERROR] onClick -> onStatusReport -> updateStatusReport -> err.message = " + err.message); }

                        }

                    }

                } catch (err) {

                    if (ERROR_LOG === true) { logger.write("[ERROR] onClick -> onStatusReport -> err.message = " + err.message); }

                }
            }

            function pad(str, max) {
                str = str.toString();
                return str.length < max ? pad("0" + str, max) : str;
            }


        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] onClick -> err.message = " + err.message); }

        }
    }

    function getContainer(point) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] getContainer -> Entering function."); }

            let container;

            /* First we check if this point is inside this object UI. */

            if (thisObject.container.frame.isThisPointHere(point, true) === true) {

                return this.container;

            } else {

                /* This point does not belong to this space. */

                return undefined;
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] getContainer -> err.message = " + err.message); }

        }
    }

    function draw() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] draw -> Entering function."); }

            let sessionToken = window.localStorage.getItem('sessionToken');

            if (sessionToken === null || sessionToken === "") {
                /* not logged in */
                return;
            }

            thisObject.container.frame.draw(false, false);

            if (canDrawIcon === false) { return; }

            let breakpointsHeight = 14;

            let imageHeight = 15;
            let imageWidth = 15;

            let imagePoint = {
                x: 10,
                y: thisObject.container.frame.height / 2 - imageHeight / 2 + breakpointsHeight
            };

            imagePoint = thisObject.container.frame.frameThisPoint(imagePoint);

            browserCanvasContext.drawImage(icon, imagePoint.x, imagePoint.y, imageWidth, imageHeight);


        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] draw -> err.message = " + err.message); }

        }
    }
}