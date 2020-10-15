let postLoader

function newAppLoader() {
    const MODULE_NAME = 'App Loader'
    const INFO_LOG = false
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    logger.fileName = MODULE_NAME

    let thisObject = {
        loadModules: loadModules
    }

    return thisObject

    async function loadModules() {
        try {
            if (INFO_LOG === true) { logger.write('[INFO] loadModules -> Entering function.') }

            let plotters
            let modulesArray = []

            plotters = defaultPlotters()

            modulesArray = modulesArray.concat([
                'ChartingSpace/Viewport.js',

                'Globals.js',

                'Workspace.js',

                'ChartingSpace/EdgeEditor.js',
                'ChartingSpace/ChartUtilities.js',
                'ChartingSpace/PlottersManager.js',
                'ChartingSpace/TimelineChart.js',
                'ChartingSpace/TimeMachine.js',
                'ChartingSpace/CoordinateSystem.js',

                'DesignSpace/Workspace/Workspace.js',
                'DesignSpace/Workspace/FunctionLibraries/UiObjectsFromNodes.js',
                'DesignSpace/Workspace/FunctionLibraries/ChainAttachDetach.js',
                'DesignSpace/Workspace/FunctionLibraries/ReferenceAttachDetach.js',
                'DesignSpace/Workspace/FunctionLibraries/NodeDeleter.js',
                'DesignSpace/Workspace/FunctionLibraries/ProtocolNode.js',
                'DesignSpace/Workspace/FunctionLibraries/NodeCloning.js',
                'DesignSpace/Workspace/FunctionLibraries/NodeChildren.js',
                'DesignSpace/Workspace/FunctionLibraries/TaskFunctions.js',
                'DesignSpace/Workspace/FunctionLibraries/SessionFunctions.js',
                'DesignSpace/Workspace/FunctionLibraries/ShortcutKeys.js',
                'DesignSpace/Workspace/FunctionLibraries/OnFocus.js',
                'DesignSpace/Workspace/FunctionLibraries/SuperScripts.js',
                'DesignSpace/Workspace/FunctionLibraries/CryptoEcosystemFunctions.js',
                'DesignSpace/Workspace/FunctionLibraries/WebhookFunctions.js',
                'DesignSpace/Workspace/FunctionLibraries/DependenciesFilter.js',
                'DesignSpace/Workspace/FunctionLibraries/NodePath.js',
                'DesignSpace/Workspace/FunctionLibraries/DataMineFunctions.js',
                'DesignSpace/Workspace/FunctionLibraries/DataStorageFunctions.js',
                'DesignSpace/Workspace/FunctionLibraries/ChartingSpaceFunctions.js',
                'DesignSpace/Workspace/FunctionLibraries/TutorialFunctions.js',   
                'DesignSpace/Workspace/FunctionLibraries/PluginsFunctions.js',  

                'Utilities/CoordinateTransformations.js',
                'Utilities/DateRateTransformations.js',
                'Utilities/Download.js',
                'Utilities/Clipboard.js',
                'Utilities/DrawPrint.js',
                'Utilities/LoadSaveFrame.js',
                'Utilities/LoadSaveTutorial.js',
                'Utilities/NodeConfig.js',
                'Utilities/Hiriarchy.js',
                'Utilities/Folders.js',
                'Utilities/Branches.js',
                'Utilities/Meshes.js',
                'Utilities/NodeChildren.js',
                'Utilities/Menu.js',
                'Utilities/Dates.js',

                'Panels/LayersPanel.js',
                'Panels/UpDownButton.js',
                'Panels/LeftRightButton.js',
                'Panels/Layer.js',
                'Panels/PlotterPanel.js',
                'Panels/PanelsVisibleButton.js',

                'SideSpace/SidePanelTab.js',
                'SideSpace/ListView.js',
                'SideSpace/ListItem.js',

                'Spaces/CockpitSpace.js',
                'Spaces/TopSpace.js',
                'Spaces/PanelsSpace.js',
                'Spaces/ChartingSpace.js',
                'Spaces/FloatingSpace.js',
                'Spaces/DesignSpace.js',
                'Spaces/SideSpace.js',
                'Spaces/DocSpace.js',
                'Spaces/ChatSpace.js',
                'Spaces/TutorialSpace.js',

                'Files/SingleFile.js',
                'Files/FileCloud.js',
                'Files/MarketFiles.js',
                'Files/DailyFiles.js',
                'Files/FileCursor.js',
                'Files/FileSequence.js',
                'Files/FileStorage.js',

                'FloatingSpace/FloatingObject.js',
                'FloatingSpace/FloatingLayer.js',
                'FloatingSpace/UiObjectConstructor.js',
                'FloatingSpace/UiObject.js',
                'FloatingSpace/UiObjectTitle.js',
                'FloatingSpace/CircularMenu.js',
                'FloatingSpace/CircularMenuItem.js',
                'FloatingSpace/CircularProgressBar.js',
                'FloatingSpace/BusyProgressBar.js',
                'FloatingSpace/CodeEditor.js',
                'FloatingSpace/ConfigEditor.js',
                'FloatingSpace/ConditionEditor.js',
                'FloatingSpace/FormulaEditor.js',
                'FloatingSpace/Picker.js',

                'Scales/RateScale.js',
                'Scales/TimeScale.js',
                'Scales/TimeFrameScale.js',
                'Scales/Commons.js',
                'Scales/AutoScaleButton.js',

                'CockpitSpace/AssetBalances.js',
                'CockpitSpace/Speedometer.js',
                'CockpitSpace/FullScreen.js',

                'EventsServerClient.js',

                'Plotting/Plotter.js',
                'Plotting/NodesHighlights.js',
                'Plotting/NodesErrors.js',
                'Plotting/NodesWarnings.js',
                'Plotting/NodesInfos.js',
                'Plotting/NodesValues.js',
                'Plotting/NodesStatus.js',
                'Plotting/NodesProgress.js',
                'Plotting/NodesRunning.js',
                'Plotting/NodesAnnouncements.js',
                'Plotting/RecordValues.js',

                'LegacyPlotter.js',
                'PlotterPanel.js',

                'VideoRecorder.js',
                'ProductStorage.js',
                'Canvas.js',
                'EventHandler.js',
                'Frame.js',
                'Animation.js',
                'Container.js',
                'Utilities.js',
                'PostLoader.js'
            ])

            modulesArray = modulesArray.concat(plotters)

            let downloadedCounter = 0

            for (let i = 0; i < modulesArray.length; i++) {
                let path = modulesArray[i] 

                REQUIREJS([path], onRequired)

                if (INFO_LOG === true) { logger.write('[INFO] loadModules -> Module Requested.') }
                if (INFO_LOG === true) { logger.write('[INFO] loadModules -> path = ' + path) }
                if (INFO_LOG === true) { logger.write('[INFO] loadModules -> total requested = ' + (i + 1)) }

                function onRequired(pModule) {
                    try {
                        if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> Entering function.') }
                        if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> Module Downloaded.') }
                        if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> path = ' + path) }

                        downloadedCounter++

                        if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> downloadedCounter = ' + downloadedCounter) }

                        if (downloadedCounter === modulesArray.length) {
                            if (INFO_LOG === true) { logger.write('[INFO] loadModules -> onRequired -> Starting Advanced Algos Platform.') }
                            setTimeout(() => {
                                postLoader = newPostLoader()
                                postLoader.start()
                            }, 500)

                        }
                    } catch (err) {
                        if (ERROR_LOG === true) { logger.write('[ERROR] loadModules -> onRequired -> err = ' + err.stack) }
                    }
                }
            }
        } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] loadModules -> err = ' + err.stack) }
        }
    }

    function defaultPlotters() {
        return [
            'Plotters/Masters/Plotters-Candles-Volumes/Candles.js',
            'Plotters/Masters/Plotters-Candles-Volumes/CandlePanel.js',
            'Plotters/Masters/Plotters-Candles-Volumes/Volumes.js',
            'Plotters/Masters/Plotters-Candles-Volumes/VolumePanel.js',
            'Plotters/Masters/Plotters-Bollinger-Bands/BollingerBands.js',
            'Plotters/Masters/Plotters-Bollinger-Bands/BollingerBandsPanel.js',
            'Plotters/Masters/Plotters-Bollinger-Bands/PercentageBandwidth.js'
        ]
    }
}

