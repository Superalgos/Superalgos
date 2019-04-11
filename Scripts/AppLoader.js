let dashboard;

function newAppLoader() {

    const MODULE_NAME = "App Loader";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const INTENSIVE_LOG = false;
    const logger = newWebDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        loadModules: loadModules
    };

    return thisObject;

    function loadModules() {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] loadModules -> Entering function."); }

            let modulesArray = [

                /* CloudWebScripts */

                /* Plotters */

                /* PlotterPanels */


                "Globals.js",
                "Ecosystem.js",
                "MQService",

                "BottomSpace/DeleteTradingHistory.js",

                "TopSpace/CurrentEvent.js",
                "TopSpace/EndUser.js",
                "TopSpace/Login.js",

                "Panels/TimeControlPanel.js",
                "Panels/ProductsPanel.js",
                "Panels/PanelTabButton.js",

                "Spaces/BottomSpace.js",
                "Spaces/TopSpace.js",
                "Spaces/PanelsSpace.js",
                "Spaces/ChartSpace.js",
                "Spaces/FloatingSpace.js",

                "Files/SingleFile.js",
                "Files/FileCloud.js",
                "Files/MarketFiles.js",
                "Files/DailyFiles.js",
                "Files/FileCursor.js",
                "Files/FileSequence.js",
                "Files/FileStorage.js",

                "FloatingSpace/NoteSets.js",
                "FloatingSpace/Note.js",
                "FloatingSpace/ProfileBalls.js",
                "FloatingSpace/ProfileBall.js",
                "FloatingSpace/FloatingObject.js",
                "FloatingSpace/FloatingLayer.js",

                "Exchange/ExchangeAPI.js",

                "Scales/ChartGrid.js",
                "Scales/RightScale.js",
                "Scales/TimeScale.js",

                "BreakpointsBar.js",
                "Plotter.js",
                "PlotterPanel.js",

                "PlottersManager.js",
                "ProductStorage.js",
                "CompetitionStorage.js",
                "ProductCard.js",

                "SplashScreen.js",
                "Canvas.js",
                "EventHandler.js",
                "Frame.js",

                "ViewPort.js",
                "TimeMachine.js",
                "Candle.js",
                "VolumeBar.js",
                "ChartUtilities.js",
                "TimelineChart.js",
                
                "Animation.js",

                "Container.js",
                "Displace.js",

                "Azure/azure-storage.blob.js",
                "TimeLineCoordinateSystem.js",
                "Utilities.js",
                "Dashboard.js"
            ];

            let downloadedCounter = 0;
            let versionParam = window.canvasApp.version;
            if (versionParam === undefined) { versionParam = ''; }
            else {
                versionParam = '?' + versionParam;
            }

            for (let i = 0; i < modulesArray.length; i++) {

                let path = window.canvasApp.urlPrefix + modulesArray[i] + versionParam;

                REQUIREJS([path], onRequired);

                if (INFO_LOG === true) { logger.write("[INFO] loadModules -> Module Requested."); }
                if (INFO_LOG === true) { logger.write("[INFO] loadModules -> path = " + path); }
                if (INFO_LOG === true) { logger.write("[INFO] loadModules -> total requested = " + (i + 1)); }

                function onRequired(pModule) {

                    try {

                        if (INFO_LOG === true) { logger.write("[INFO] loadModules -> onRequired -> Entering function."); }
                        if (INFO_LOG === true) { logger.write("[INFO] loadModules -> onRequired -> Module Downloaded."); }
                        if (INFO_LOG === true) { logger.write("[INFO] loadModules -> onRequired -> path = " + path); }

                        downloadedCounter++;

                        if (INFO_LOG === true) { logger.write("[INFO] loadModules -> onRequired -> downloadedCounter = " + downloadedCounter); }

                        if (downloadedCounter === modulesArray.length) {

                            if (INFO_LOG === true) { logger.write("[INFO] loadModules -> onRequired -> Starting Advanced Algos Platform."); }

                            dashboard = newDashboard();

                            dashboard.start();
                        }

                    } catch (err) {

                        if (ERROR_LOG === true) { logger.write("[ERROR] loadModules -> onRequired -> err = " + err); }

                    }
                }
            }

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] loadModules -> err = " + err); }

        }
    }
}