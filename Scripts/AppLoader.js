function newAppLoader() {

    const FULL_LOG = false;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "App Loader";

    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        loadModules: loadModules
    };

    return thisObject;

    function loadModules() {

        let modulesArray = [    

            "ViewPort.js",
            "TimeMachine.js",
            "Candle.js",
            "VolumeBar.js",
            "ChartUtilities.js",
            "TimelineChart.js",
            "ChartGrid.js",
            "Animation.js",

            "Container.js",
            "Displace.js",

            "Azure/azure-storage.blob.js",
            "TimeLineCoordinateSystem.js",
            "Utilities.js",
            "Dashboard.js"
        ];

        let downloadedCounter = 0;

        for (let i = 0; i < modulesArray.length; i++) {

            let path = modulesArray[i];

            REQUIREJS([path], onRequired);

            function onRequired(pModule) {

                console.log(path + " downloaded.");
                downloadedCounter++;

                if (downloadedCounter === modulesArray.length) {

                    dashboardStart(); // This formally starts the app.
                }
            }
        }
    }
}