let dashboard

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

            window.localStorage.removeItem('ecosystem')

            let plotters
            let modulesArray = []
           
            plotters = defaultPlotters()
            modulesArray = ['UserEcosystem.js']
       
            modulesArray = modulesArray.concat([
                'ChartingSpace/Viewport.js',

                'Globals.js',
                'Ecosystem.js',
                'UserEcosystem.js',
                'AppSchema.js',
                'MQService',

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
                
                'Utilities/RoundedCornersBackground.js',

                'Panels/LayersPanel.js',
                'Panels/PanelTabButton.js',
                'Panels/Layer.js',
                'Panels/PlotterPanel.js',
                'Panels/PanelsVisibleButton.js',
                
                'ControlsToolBox/SidePanel.js',
                'ControlsToolBox/SidePanelTab.js',

                'Spaces/CockpitSpace.js',
                'Spaces/TopSpace.js',
                'Spaces/PanelsSpace.js',
                'Spaces/ChartingSpace.js',
                'Spaces/FloatingSpace.js',
                'Spaces/DesignSpace.js',

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

                'Scales/RateScale.js',
                'Scales/TimeScale.js',
                'Scales/TimeFrameScale.js',
                'Scales/Commons.js',
                'Scales/AutoScaleButton.js',
                
                'CockpitSpace/AssetBalances.js',
                'CockpitSpace/Speedometer.js',
                'CockpitSpace/FullScreen.js',

                'SystemEventHandler.js',

                'Recording.js',
                'Plotter.js',
                'LegacyPlotter.js',
                'PlotterPanel.js',

                'ProductStorage.js',

                'SplashScreen.js',
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
            let versionParam = window.canvasApp.version
            if (versionParam === undefined) { versionParam = '' } else {
                versionParam = '?' + versionParam
            }

            for (let i = 0; i < modulesArray.length; i++) {
                let path = window.canvasApp.urlPrefix + modulesArray[i] + versionParam

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
                                dashboard = newDashboard()
                                dashboard.start()
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
            'Plotters/AAMasters/Plotters-Candles-Volumes/Candles.js',
            'Plotters/AAMasters/Plotters-Candles-Volumes/CandlePanel.js',
            'Plotters/AAMasters/Plotters-Candles-Volumes/Volumes.js',
            'Plotters/AAMasters/Plotters-Candles-Volumes/VolumePanel.js',
            'Plotters/AAMasters/Plotters-Stairs-Patterns/CandleStairs.js',
            'Plotters/AAMasters/Plotters-Stairs-Patterns/VolumeStairs.js',
            'Plotters/AAMasters/Plotters-Bollinger-Bands/BollingerBands.js',
            'Plotters/AAMasters/Plotters-Bollinger-Bands/BollingerBandsPanel.js',
            'Plotters/AAMasters/Plotters-Bollinger-Bands/PercentageBandwidth.js',
            'Plotters/AAMasters/Plotters-Trading-Simulation/TradingSimulation.js',
            'Plotters/AAMasters/Plotters-Trading-Simulation/TradingSimulationPanel.js',
            'Plotters/AAMasters/Plotters-Trading-Simulation/Conditions.js',
            'Plotters/AAMasters/Plotters-Trading-Simulation/Strategies.js',
            'Plotters/AAMasters/Plotters-Trading-Simulation/Trades.js',
            'Plotters/AAMasters/Plotters-Trading-Simulation/SimulationExecution.js',
            'Plotters/AAMasters/Plotters-Trading-Simulation/SimulationExecutionPanel.js'
        ]
    }

    function getPlotters(ecosystem) {
        if (INFO_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> Entering function.') }

        let plotters = []
        let dataMines = ecosystem.dataMines
        let hosts = ecosystem.hosts

        plotters = plotters.concat(addScript(dataMines))
        plotters = plotters.concat(addScript(hosts))

        return plotters
    }

    function addScript(pDataMinesOrHosts) {
        if (INFO_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> addScript -> Entering function.') }
        const htmlLinePlotter = 'Plotters/@dataMine@/@repo@/@module@.js'
        const htmlLinePlotterPanel = 'PlotterPanels/@dataMine@/@repo@/@module@.js'
        let plotters = []

        for (let i = 0; i < pDataMinesOrHosts.length; i++) {
            let dataMine = pDataMinesOrHosts[i]
            for (let j = 0; j < dataMine.plotters.length; j++) {
                let plotter = dataMine.plotters[j]
                if (plotter.modules !== undefined) {
                    for (let k = 0; k < plotter.modules.length; k++) {
                        let module = plotter.modules[k]
                        let htmlLineCopy = htmlLinePlotter

                        let stringToInsert
                        stringToInsert = htmlLineCopy.replace('@dataMine@', dataMine.codeName)
                        stringToInsert = stringToInsert.replace('@repo@', plotter.repo)
                        stringToInsert = stringToInsert.replace('@module@', module.moduleName)

                        plotters.push(stringToInsert)

                        if (module.panels !== undefined) {
                            for (let l = 0; l < module.panels.length; l++) {
                                let panel = module.panels[l]
                                let htmlLineCopy = htmlLinePlotterPanel

                                let stringToInsert
                                stringToInsert = htmlLineCopy.replace('@dataMine@', dataMine.codeName)
                                stringToInsert = stringToInsert.replace('@repo@', plotter.repo)
                                stringToInsert = stringToInsert.replace('@module@', panel.moduleName)

                                plotters.push(stringToInsert)
                            }
                        }
                    }
                }
            }
        }
        return plotters
    }
}

