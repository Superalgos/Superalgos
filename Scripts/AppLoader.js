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
                'ChartsSpace/ViewPort.js',

                'Globals.js',
                'Ecosystem.js',
                'UserEcosystem.js',
                'MQService',

                'ChartsSpace/ChartUtilities.js',
                'ChartsSpace/PlottersManager.js',
                'ChartsSpace/TimelineChart.js',
                'ChartsSpace/TimeMachine.js',
                'ChartsSpace/TimeLineCoordinateSystem.js',

                'DesignerSpace/Workspace/Workspace.js',
                'DesignerSpace/Workspace/FunctionLibraries/UiObjectsFromNodes.js',
                'DesignerSpace/Workspace/FunctionLibraries/ChainAttachDetach.js',
                'DesignerSpace/Workspace/FunctionLibraries/ReferenceAttachDetach.js',
                'DesignerSpace/Workspace/FunctionLibraries/NodeDeleter.js',
                'DesignerSpace/Workspace/FunctionLibraries/ProtocolNode.js',
                'DesignerSpace/Workspace/FunctionLibraries/NodeChildren.js', 
                'DesignerSpace/Workspace/FunctionLibraries/TaskFunctions.js',
                'DesignerSpace/Workspace/FunctionLibraries/SessionFunctions.js',
                'DesignerSpace/Workspace/FunctionLibraries/ShortcutKeys.js',
                'DesignerSpace/Workspace/FunctionLibraries/OnFocus.js',
                
                'Utilities/RoundedCornersBackground.js',

                'Panels/TimeControlPanel.js',
                'Panels/ProductsPanel.js',
                'Panels/PanelTabButton.js',
                'Panels/ProductCard.js',
                'Panels/PlotterPanel.js',
                
                'ControlsToolBox/SidePanel.js',
                'ControlsToolBox/SidePanelTab.js',

                'Spaces/CockpitSpace.js',
                'Spaces/TopSpace.js',
                'Spaces/PanelsSpace.js',
                'Spaces/ChartSpace.js',
                'Spaces/FloatingSpace.js',
                'Spaces/DesignerSpace.js',

                'Files/SingleFile.js',
                'Files/FileCloud.js',
                'Files/MarketFiles.js',
                'Files/DailyFiles.js',
                'Files/FileCursor.js',
                'Files/FileSequence.js',
                'Files/FileStorage.js',

                'FloatingSpace/NoteSets.js',
                'FloatingSpace/Note.js',
                'FloatingSpace/ProfileBalls.js',
                'FloatingSpace/ProfileBall.js',
                'FloatingSpace/FloatingObject.js',
                'FloatingSpace/FloatingLayer.js',
                'FloatingSpace/UiObjectConstructor.js',
                'FloatingSpace/UiObject.js',
                'FloatingSpace/UiObjectTitle.js',
                'FloatingSpace/CircularMenu.js',
                'FloatingSpace/CircularMenuItem.js',
                'FloatingSpace/CircularProgressBar.js',
                'FloatingSpace/CodeEditor.js',
                'FloatingSpace/ConfigEditor.js',
                'FloatingSpace/ConditionEditor.js',
                'FloatingSpace/FormulaEditor.js',

                'Scales/RateScale.js',
                'Scales/TimeScale.js',
                'Scales/TimePeriodScale.js',
                'Scales/Commons.js',

                'CockpitSpace/AssetBalances.js',
                'CockpitSpace/Speedometer.js',
                'CockpitSpace/FullScreen.js',

                'SystemEventHandler.js',

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
                'Displace.js',

                'Utilities.js',
                'Dashboard.js'
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
        return [ // TODO This should be at te ecosystem file.
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
        let devTeams = ecosystem.devTeams
        let hosts = ecosystem.hosts

        plotters = plotters.concat(addScript(devTeams))
        plotters = plotters.concat(addScript(hosts))

        return plotters
    }

    function addScript(pDevTeamsOrHosts) {
        if (INFO_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> addScript -> Entering function.') }
        const htmlLinePlotter = 'Plotters/@devTeam@/@repo@/@module@.js'
        const htmlLinePlotterPanel = 'PlotterPanels/@devTeam@/@repo@/@module@.js'
        let plotters = []

        for (let i = 0; i < pDevTeamsOrHosts.length; i++) {
            let devTeam = pDevTeamsOrHosts[i]
            for (let j = 0; j < devTeam.plotters.length; j++) {
                let plotter = devTeam.plotters[j]
                if (plotter.modules !== undefined) {
                    for (let k = 0; k < plotter.modules.length; k++) {
                        let module = plotter.modules[k]
                        let htmlLineCopy = htmlLinePlotter

                        let stringToInsert
                        stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName)
                        stringToInsert = stringToInsert.replace('@repo@', plotter.repo)
                        stringToInsert = stringToInsert.replace('@module@', module.moduleName)

                        plotters.push(stringToInsert)

                        if (module.panels !== undefined) {
                            for (let l = 0; l < module.panels.length; l++) {
                                let panel = module.panels[l]
                                let htmlLineCopy = htmlLinePlotterPanel

                                let stringToInsert
                                stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName)
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

