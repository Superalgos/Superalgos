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

      let ecosystem = await loadEcosystem()
      window.localStorage.setItem('ecosystem', JSON.stringify(ecosystem))
      let plotters = getPlotters(ecosystem)

      let modulesArray = [

        'Globals.js',
        'Ecosystem.js',
        'MQService',

        'ChartsSpace/ChartUtilities.js',
        'ChartsSpace/PlottersManager.js',
        'ChartsSpace/TimelineChart.js',
        'ChartsSpace/TimeMachine.js',
        'ChartsSpace/ViewPort.js',
        'ChartsSpace/TimeLineCoordinateSystem.js',

        'TopSpace/CurrentEvent.js',
        'TopSpace/Login.js',

        'StrategySpace/StrategizerGateway.js',

        'StrategySpace/Workspace/Workspace.js',
        'StrategySpace/Workspace/FunctionLibraries/PartsFromNodes.js',
        'StrategySpace/Workspace/FunctionLibraries/AttachDetach.js',
        'StrategySpace/Workspace/FunctionLibraries/NodeDeleter.js',
        'StrategySpace/Workspace/FunctionLibraries/ProtocolNode.js',
        'StrategySpace/Workspace/FunctionLibraries/StringifyNode.js',


        'Utilities/RoundedCornersBackground.js',

        'Panels/TimeControlPanel.js',
        'Panels/ProductsPanel.js',
        'Panels/PanelTabButton.js',
        'Panels/ProductCard.js',

        'ControlsToolBox/SidePanel.js',
        'ControlsToolBox/SidePanelTab.js',

        'Spaces/CockpitSpace.js',
        'Spaces/TopSpace.js',
        'Spaces/PanelsSpace.js',
        'Spaces/ChartSpace.js',
        'Spaces/FloatingSpace.js',
        'Spaces/StrategySpace.js',

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
        'FloatingSpace/StrategyPartConstructor.js',
        'FloatingSpace/StrategyPart.js',
        'FloatingSpace/StrategyPartTitle.js',
        'FloatingSpace/CircularMenu.js',
        'FloatingSpace/CircularMenuItem.js',
        'FloatingSpace/CodeEditor.js',

        'Scales/RateScale.js',
        'Scales/TimeScale.js',
        'Scales/TimePeriodScale.js',
        'Scales/Commons.js',

        'CockpitSpace/AssetBalances.js',
        'CockpitSpace/Speedometer.js',
        'CockpitSpace/RestartSimulation.js',
        'CockpitSpace/GraphQLRestartSimulation.js',
        'CockpitSpace/FullScreen.js',

        'Plotter.js',
        'PlotterPanel.js',

        'ProductStorage.js',
        'CompetitionStorage.js',

        'SplashScreen.js',
        'Canvas.js',
        'EventHandler.js',
        'Frame.js',

        'Animation.js',

        'Container.js',
        'Displace.js',

        'Utilities.js',
        'Dashboard.js'
      ]

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

              dashboard = newDashboard()

              dashboard.start()
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

  async function loadEcosystem() {
    if (INFO_LOG === true) { logger.write('[INFO] loadEcosystem -> Entering function.') }

    let headers
    let accessToken = window.localStorage.getItem('access_token')
    if (accessToken !== null) {
      headers = {
        authorization: 'Bearer ' + accessToken
      }
    }

    let response = await axios({
      url: window.canvasApp.graphQL.masterAppApiUrl,
      method: 'post',
      data: {
        query: `
          query {
            web_GetEcosystem {
              id
              devTeams {
                codeName
                displayName
                host {
                  url
                  storage
                  container
                  accessKey
                }
                bots {
                  codeName
                  displayName
                  type
                  profilePicture
                  repo
                  configFile
                  cloneId
                  products{
                    codeName
                    displayName
                    description
                    dataSets{
                      codeName
                      type
                      validPeriods
                      filePath
                      fileName
                      dataRange{
                        filePath
                        fileName
                      }
                    }
                    exchangeList{
                      name
                    }
                    plotter{
                      devTeam
                      codeName
                      moduleName
                      repo
                    }
                  }
                }
                plotters {
                  codeName
                  displayName
                  modules{
                    codeName
                    moduleName
                    description
                    profilePicture
                    panels{
                      codeName
                      moduleName
                      event
                    }
                  }
                  repo
                  configFile
                }
              }
              hosts {
                codeName
                displayName
                host {
                  url
                  storage
                  container
                  accessKey
                }
                competitions {
                  codeName
                  displayName
                  description
                  startDatetime
                  finishDatetime
                  formula
                  plotter{
                    devTeam
                    codeName
                    host{
                      url
                      storage
                      container
                      accessKey
                    }
                    moduleName
                    repo
                  }
                  rules
                  prizes
                  participants
                  repo
                  configFile
                }
                plotters {
                  codeName
                  displayName
                  modules{
                    codeName
                    moduleName
                    description
                    profilePicture
                    panels{
                      codeName
                      moduleName
                      event
                    }
                  }
                  repo
                  configFile
                }
              }
            }
          }
          `
      },
      headers: headers
    })

    if (response.data.errors) {
      if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + ' : ' + '[ERROR] AppPreLoader -> loadEcosystem -> response.text = ' + JSON.stringify(res.data.errors)) }
      throw error
    }

    return response.data.data.web_GetEcosystem
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
