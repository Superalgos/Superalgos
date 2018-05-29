function newAppLoader() {

    const FULL_LOG = false;
    const LOG_FILE_CONTENT = false;

    const MODULE_NAME = "App Loader";

    let thisObject = {
        loadModules: loadModules
    };

    return thisObject;

    function loadModules() {


        let modulesArray = [    

            "Panels/TimeControlPanel.js",
            "Panels/ProductsPanel.js",

            "Spaces/PanelsSpace.js",
            "Spaces/ChartSpace.js",
            "Spaces/FloatingSpace.js",

            "Files/SingleFile.js",
            "Files/FileCloud.js",
            "Files/MarketFiles.js",
            "Files/DailyFiles.js",
            "Files/FileCursor.js",
            "Files/FileSequence.js",

            "FloatingSpace/NoteSets.js",
            "FloatingSpace/Note.js",
            "FloatingSpace/ProfileBalls.js",
            "FloatingSpace/ProfileBall.js",
            "FloatingSpace/FloatingObject.js",
            "FloatingSpace/FloatingLayer.js",

            "CloudVM/PoloniexAPIClient.js",
            "CloudVM/CloudSupport.js",
            "CloudVM/CloudRequire.js",
            "CloudVM/WebFS.js",
            "CloudVM/CloudVM.js",

            "WebDebugLog.js",
            "Plotter.js",
            "PlotterPanel.js",

            "ProductStorage.js",
            "CompetitionStorage.js",
            "ProductCard.js",
            "Ecosystem.js",

            "SplashScreen.js",
            "Canvas.js",
            "Button.js",
            "TextButton.js",
            "ImageButton.js",
            "EventHandler.js",
            "Frame.js",

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

                console.log(MODULE_NAME + ": " + path + " downloaded.");
                downloadedCounter++;

                if (downloadedCounter === modulesArray.length) {

                    dashboardStart(); // This formally starts the app.
                }
            }
        }
    }
}