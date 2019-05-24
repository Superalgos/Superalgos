
require('dotenv').config()

CONSOLE_LOG = process.env.CONSOLE_LOG === "true"
CONSOLE_ERROR_LOG = process.env.CONSOLE_ERROR_LOG === "true"
LOG_FILE_CONTENT = process.env.LOG_FILE_CONTENT === "true"

if (CONSOLE_LOG === true) { console.log('[INFO] server -> Node Server Starting.') }

global.DEFAULT_OK_RESPONSE = {
  result: 'Ok',
  message: 'Operation Succeeded'
}

global.DEFAULT_FAIL_RESPONSE = {
  result: 'Fail',
  message: 'Operation Failed'
}

global.DEFAULT_RETRY_RESPONSE = {
  result: 'Retry',
  message: 'Retry Later'
}

global.CUSTOM_OK_RESPONSE = {
  result: 'Ok, but check Message',
  message: 'Custom Message'
}

global.CUSTOM_FAIL_RESPONSE = {
  result: 'Fail Because',
  message: 'Custom Message'
}

let storageData
let http = require('http')
let port = process.env.PORT || 1337
let isHttpServerStarted = false
const AZURE_STORAGE = require('./Server/AzureStorage')
const MINIO_STORAGE = require('./Server/MinioStorage')
let ecosystemObject = require("./Server/config/ecosystem.json");

switch (process.env.STORAGE_PROVIDER) {
    case 'Azure': {
        storage = AZURE_STORAGE.newAzureStorage();
        break;
    }
    case 'Minio': {
        storage = MINIO_STORAGE.newMinioStorage();
        break;
    }
    default: {
        console.log('[ERROR] server -> Storage Provider not supported -> process.env.STORAGE_PROVIDER = ' + process.env.STORAGE_PROVIDER)
        return;
    }
}

initialize()

function initialize () {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> initialize -> Entering function.') }

    /* Clear all cached information. */

  storageData = new Map()

  const CONFIG_READER = require('./Server/ConfigReader')
  let configReader = CONFIG_READER.newConfigReader()

  configReader.initialize(ecosystemObject, storageData, storage, onInitialized)

  function onInitialized (err) {
    if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
      console.log('[ERROR] server -> initialize -> onInitialized -> err.message = ' + err.message)
      console.log('[ERROR] server -> initialize -> onInitialized -> Terminating Execution. ')

      return
    }

    configReader.loadConfigs(onConfigsLoaded)

    function onConfigsLoaded (err, pEcosystemObject) {
      if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
        console.log('[ERROR] server -> initialize -> onInitialized -> onConfigsLoaded -> err.message = ' + err.message)
        console.log('[ERROR] server -> initialize -> onInitialized -> onConfigsLoaded -> Terminating Execution. ')

        return
      }

      ecosystemObject = pEcosystemObject

      storage.initialize(storageData, ecosystemObject) // TODO do not initialize as a general option

      startHtttpServer ()
    }
  }
}

function startHtttpServer () {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> startHtttpServer -> Entering function.') }

  try {
    if (isHttpServerStarted === false) {
      gWebServer = http.createServer(onBrowserRequest).listen(port)
      isHttpServerStarted = true
    }
  } catch (err) {
    console.log('[ERROR] server -> startHtttpServer -> Error = ' + err)
  }
}

function onBrowserRequest (request, response) {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> Entering function.') }
  if (CONSOLE_LOG === true && request.url.indexOf('NO-LOG') === -1) { console.log('[INFO] server -> onBrowserRequest -> request.url = ' + request.url) }

  let requestParameters = request.url.split('/')

  if (requestParameters[1].indexOf('index.html') >= 0) {
        /*
        We use this to solve the problem when someone is arriving to the site with a sessionToken in the queryString. We extract here that
        token, that will be sent later embedded into the HTML code, so that it can enter into the stardard circuit where any site can put
        the sessionToken into their HTML code and from there the Browser app will log the user in.
        */

    let queryString = requestParameters[1].split('?')

    requestParameters[1] = ''
    requestParameters[2] = queryString[1]
    homePage()

    return
  }

  requestParameters = request.url.split('?') // Remove version information
  requestParameters = requestParameters[0].split('/')

  switch (requestParameters[1]) {

    case process.env.REINITIALIZE_COMMAND: {
      initialize()

      respondWithContent('Node JS Server Reinitilized.', response)
    }
      break

    case 'MQService':
          {
              let filePath = "./node_modules/@superalgos/mqservice/orderLifeCicle/webDependency.js"

              respondWithFile(filePath, response)
              break;
        }

    // case 'FileService':
    //     {

    //         processPost(request, response, onPostReceived)

    //         function onPostReceived(pData) {

    //             let request = JSON.parse(pData);

    //             storage.readData(undefined, request.path, request.conatinerName, false, onReady)

    //             function onReady(err, pFileContent) {

    //                 let responseToClient = {
    //                     err: err,
    //                     text: pFileContent
    //                 };

    //                 respondWithContent(JSON.stringify(responseToClient), response);
    //             }
    //         }

    //         break;
    //     }
    case 'Plotter.js':
      {
        /*

        This file is built dinamically because it has the code to instantiate the different configured Plotters. The instantiation code
        will be generated using a pre-defined string with replacement points. We will go through the configuration file to learn
        about all the possible plotters the system can load.

        */

        let fs = require('fs')
        try {
          let fileName = 'Plotter.js'
          fs.readFile(fileName, onFileRead)

          function onFileRead (err, file) {
            if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> Entering function.') }

            try {
              let fileContent = file.toString()

              /* This is the string we will use to insert into the Plotters.js script. */

              let caseString = '' +
                                '        case "@newFunctionName@":' + '\n' +
                                '        {' + '\n' +
                                '            plotter = newPlotterName();' + '\n' +
                                '        }' + '\n' +
                                '        break;' + '\n' + '\n'

              let devTeams = ecosystemObject.devTeams
              let hosts = ecosystemObject.hosts

              addToFileContent(devTeams)
              addToFileContent(hosts)

              function addToFileContent (pDevTeamsOrHosts) {
                if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> addToFileContent -> Entering function.') }

                for (let i = 0; i < pDevTeamsOrHosts.length; i++) {
                  let devTeam = pDevTeamsOrHosts[i]

                  for (let j = 0; j < devTeam.plotters.length; j++) {
                    let plotter = devTeam.plotters[j]

                    for (let k = 0; k < plotter.modules.length; k++) {

                      let module = plotter.modules[k]

                      let caseStringCopy = caseString

                      let newFunctionName = devTeam.codeName + plotter.codeName + module.codeName
                      newFunctionName = newFunctionName.replace(/-/g, '')

                      let stringToInsert
                      stringToInsert = caseStringCopy.replace('@newFunctionName@', newFunctionName)
                      stringToInsert = stringToInsert.replace('newPlotterName', 'new' + newFunctionName)

                      let firstPart = fileContent.substring(0, fileContent.indexOf('// Cases'))
                      let secondPart = fileContent.substring(fileContent.indexOf('// Cases'))

                      fileContent = firstPart + stringToInsert + secondPart
                    }
                  }
                }
              }

              respondWithContent(fileContent, response)
            } catch (err) {
              console.log('[ERROR] server -> onBrowserRequest -> File Not Found: ' + fileName + ' or Error = ' + err)
            }
          }
        } catch (err) {
          console.log(err)
        }
      }
      break

    case 'PlotterPanel.js':
      {
        /*

        This file is build dinamically because it has the code to instantiate the different configured Plotter Panels. The instantiation code
        will be generated using a pre-defined string with replacement points. We will go through the configuration file to learn
        about all the possible plotters panels the system can load.

        */

        let fs = require('fs')
        try {
          let fileName = 'PlotterPanel.js'
          fs.readFile(fileName, onFileRead)

          function onFileRead (err, file) {
            if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> Entering function.') }

            try {
              let fileContent = file.toString()

                            /* This is the string we will use to insert into the Plotters.js script. */

              let caseString = '' +
                                '        case "@newFunctionName@":' + '\n' +
                                '        {' + '\n' +
                                '            plotterPanel = newPlotterPanelName();' + '\n' +
                                '        }' + '\n' +
                                '        break;' + '\n' + '\n'

              let devTeams = ecosystemObject.devTeams
              let hosts = ecosystemObject.hosts

              addToFileContent(devTeams)
              addToFileContent(hosts)

              function addToFileContent (pDevTeamsOrHosts) {
                if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> addToFileContent -> Entering function.') }

                for (let i = 0; i < pDevTeamsOrHosts.length; i++) {
                  let devTeam = pDevTeamsOrHosts[i]

                  for (let j = 0; j < devTeam.plotters.length; j++) {
                    let plotter = devTeam.plotters[j]

                    for (let k = 0; k < plotter.modules.length; k++) {

                      let module = plotter.modules[k]

                      for (let l = 0; l < module.panels.length; l++) {

                          let panel = module.panels[l]

                          let caseStringCopy = caseString

                          let newFunctionName = devTeam.codeName + plotter.codeName + module.codeName + panel.codeName
                          newFunctionName = newFunctionName.replace(/-/g, '')

                          let stringToInsert
                          stringToInsert = caseStringCopy.replace('@newFunctionName@', newFunctionName)
                          stringToInsert = stringToInsert.replace('newPlotterPanelName', 'new' + newFunctionName)

                          let firstPart = fileContent.substring(0, fileContent.indexOf('// Cases'))
                          let secondPart = fileContent.substring(fileContent.indexOf('// Cases'))

                          fileContent = firstPart + stringToInsert + secondPart
                        }
                    }
                  }
                }
              }

              respondWithContent(fileContent, response)
            } catch (err) {
              console.log('[ERROR] server -> onBrowserRequest -> File Not Found: ' + fileName + ' or Error = ' + err)
            }
          }
        } catch (err) {
          console.log(err)
        }
      }
      break

    case 'Ecosystem.js':
      {
        /*

        At this page we need to insert the configuration file for the whole system that we assamble before at the begining of this module
        execution. So what we do is to load a template file with an insertion point where the configuration json is injected in.

        */

        let fs = require('fs')
        try {
          let fileName = 'Ecosystem.js'
          fs.readFile(fileName, onFileRead)

          function onFileRead (err, file) {
            if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> Entering function.') }

            try {
              let fileContent = file.toString()
              let insertContent = JSON.stringify(ecosystemObject)

              fileContent = fileContent.replace('"@ecosystem.json@"', insertContent)

              respondWithContent(fileContent, response)
            } catch (err) {
              console.log('[ERROR] server -> onBrowserRequest -> File Not Found: ' + fileName + ' or Error = ' + err)
            }
          }
        } catch (err) {
          console.log(err)
        }
      }
      break

    case 'CloudAppWrapper': // This means the BrowserRun folder.
      {
        let filePath = requestParameters[2]

        if (requestParameters[3] !== undefined) {
          filePath = filePath + '/' + requestParameters[3]
        }

        if (requestParameters[4] !== undefined) {
          filePath = filePath + '/' + requestParameters[4]
        }

        respondWithFile(process.env.PATH_TO_CLOUD_APP_WRAPPER_COMPONENT + '/' + filePath, response)
      }
      break

    case 'Images': // This means the Scripts folder.
      {
        let path = './Images/' + requestParameters[2]

        if (requestParameters[3] !== undefined) {
          path = path + '/' + requestParameters[3]
        }

        if (requestParameters[4] !== undefined) {
          path = path + '/' + requestParameters[4]
        }

        if (requestParameters[5] !== undefined) {
          path = path + '/' + requestParameters[5]
        }

        path = unescape(path)

        respondWithImage(path, response)
      }
      break

    case 'favicon.ico': // This means the Scripts folder.
      {
        respondWithImage('./Images/' + 'favicon.ico', response)
      }
      break

    case 'CockpitSpace': // This means the CockpitSpace folder.
      {
        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/CockpitSpace/' + requestParameters[2], response)
      }
      break

    case 'TopSpace': // This means the TopSpace folder.
      {
        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/TopSpace/' + requestParameters[2], response)
      }
      break

    case 'StrategySpace': // This means the StrategySpace folder.
        {
              respondWithFile(process.env.PATH_TO_CANVAS_APP + '/StrategySpace/' + requestParameters[2], response)
        }
        break

    case 'ControlsToolBox': // This means the StrategySpace folder.
        {
              respondWithFile(process.env.PATH_TO_CANVAS_APP + '/ControlsToolBox/' + requestParameters[2], response)
        }
        break

    case 'Utilities': // This means the StrategySpace folder.
        {
              respondWithFile(process.env.PATH_TO_CANVAS_APP + '/Utilities/' + requestParameters[2], response)
        }
        break

    case 'Scripts': // This means the Scripts folder.
      {
        if (requestParameters[2] === 'AppLoader.js') {
          let fs = require('fs')
          try {
            let fileName = './Scripts/' + 'AppLoader.js'
            fs.readFile(fileName, onFileRead)

            function onFileRead (err, file) {
              if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> Entering function.') }

              try {
                let fileContent = file.toString()

                addPlotters()

                function addPlotters () {
                  if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> Entering function.') }

                  let htmlLinePlotter = '' + '\n' +
                                        '            "Plotters/@devTeam@/@repo@/@module@.js",'

                  let htmlLinePlotterPanel = '' + '\n' +
                                        '            "PlotterPanels/@devTeam@/@repo@/@module@.js",'

                  let devTeams = ecosystemObject.devTeams
                  let hosts = ecosystemObject.hosts

                  addScript(devTeams)
                  addScript(hosts)

                  function addScript (pDevTeamsOrHosts) {
                    if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> addPlotters -> addScript -> Entering function.') }

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

                                    let firstPart = fileContent.substring(0, fileContent.indexOf('/* Plotters */') + 14)
                                    let secondPart = fileContent.substring(fileContent.indexOf('/* Plotters */') + 14)

                                    fileContent = firstPart + stringToInsert + secondPart

                                    if (module.panels !== undefined) {

                                        for (let l = 0; l < module.panels.length; l++) {

                                            let panel = module.panels[l]

                                            let htmlLineCopy = htmlLinePlotterPanel

                                            let stringToInsert
                                            stringToInsert = htmlLineCopy.replace('@devTeam@', devTeam.codeName)
                                            stringToInsert = stringToInsert.replace('@repo@', plotter.repo)
                                            stringToInsert = stringToInsert.replace('@module@', panel.moduleName)

                                            let firstPart = fileContent.substring(0, fileContent.indexOf('/* PlotterPanels */') + 19)
                                            let secondPart = fileContent.substring(fileContent.indexOf('/* PlotterPanels */') + 19)

                                            fileContent = firstPart + stringToInsert + secondPart
                                          }
                                      }
                                  }
                              }
                        }
                    }
                  }
                }

                respondWithContent(fileContent, response)
              } catch (err) {
                console.log('[ERROR] server -> onBrowserRequest -> File Not Found: ' + fileName + ' or Error = ' + err)
              }
            }
          } catch (err) {
            console.log(err)
          }
        } else {
          respondWithFile('./Scripts/' + requestParameters[2], response)
        }
      }
      break

    case 'Plotters': // This means the plotter folder, not to be confused with the Plotters script!
      {
        storage.readData(requestParameters[2] + '/' + 'plotters', requestParameters[3], requestParameters[4], true, onDataArrived)

        function onDataArrived (err, pData) {
          if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
            console.log('[ERROR] server -> onBrowserRequest -> Plotters -> onDataArrived -> Could not read a file. ')
            console.log('[ERROR] server -> onBrowserRequest -> Plotters -> onDataArrived -> err.message = ' + err.message)

            pData = ''
          }

          respondWithContent(pData, response)
        }
      }
      break

    case 'PlotterPanels': // This means the PlotterPanels folder, not to be confused with the Plotter Panels scripts!
      {
        storage.readData(requestParameters[2] + '/' + 'plotters', requestParameters[3], requestParameters[4], true, onDataArrived)

        function onDataArrived (err, pData) {
          if (err.result !== global.DEFAULT_OK_RESPONSE.result) {
            console.log('[ERROR] server -> onBrowserRequest -> Plotters -> PlotterPanels -> Could not read a file. ')
            console.log('[ERROR] server -> onBrowserRequest -> Plotters -> PlotterPanels -> err.message = ' + err.message)

            pData = ''
          }

          respondWithContent(pData, response)
        }
      }
      break
    case 'Panels':
      {
        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
      }
      break

    case 'ChartLayers':
      {
        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
      }
      break

    case 'Azure':
      {
        respondWithFile('./' + requestParameters[1] + '/' + requestParameters[2], response)
      }
      break

    case 'Spaces':
      {
        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
      }
      break

    case 'Scales':
      {
        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
      }
      break

    case 'Files':
      {
        respondWithFile(process.env.PATH_TO_FILES_COMPONENT + '/' + requestParameters[2], response)
      }
      break

    case 'FloatingSpace':
      {
        respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
      }
      break

    case 'ChartsSpace':
        {
            respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1] + '/' + requestParameters[2], response)
        }
        break

    default:
      {
        homePage()
      }
  }

  function homePage () {
    if (requestParameters[1] === '') {
      let fs = require('fs')
      try {
        let fileName = 'index.html'
        fs.readFile(fileName, onFileRead)

        function onFileRead (err, file) {
          if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> Entering function.') }

          try {
            let fileContent = file.toString()

                        /* The second request parameters is the sessionToken, if it exists. */

            if (requestParameters[2] !== '' && requestParameters[2] !== undefined) {
              fileContent = fileContent.replace("window.canvasApp.sessionToken = ''", "window.canvasApp.sessionToken = '" + requestParameters[2] + "'")
            }

            respondWithContent(fileContent, response)
          } catch (err) {
            console.log('[ERROR] server -> onBrowserRequest -> File Not Found: ' + fileName + ' or Error = ' + err)
          }
        }
      } catch (err) {
        console.log(err)
      }
    } else {
      respondWithFile(process.env.PATH_TO_CANVAS_APP + '/' + requestParameters[1], response)
    }
  }
}

function respondWithContent (content, response) {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithContent -> Entering function.') }

  try {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
    response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
    response.setHeader('Expires', '0') // Proxies.
    response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.write(content)
    response.end('\n')
        // console.log("Content Sent: " + content);
  } catch (err) {
    returnEmptyArray(response)
  }
}

function respondWithFile (fileName, response) {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithFile -> Entering function.') }

  let fs = require('fs')
  try {
    if (fileName.indexOf('undefined') > 0) {
      console.log('[WRN] server -> respondWithFile -> Received request for undefined file. ')
      return
    }

    fs.readFile(fileName, onFileRead)

    function onFileRead (err, file) {
      if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithFile -> onFileRead -> Entering function.') }

      try {
        let htmlResponse = file.toString()

        response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
        response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
        response.setHeader('Expires', '0') // Proxies.
        response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

                // response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(htmlResponse)
        response.end('\n')
                // console.log("File Sent: " + fileName);
                //
      } catch (err) {
        console.log('[ERROR] server -> respondWithFile -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err)
        returnEmptyArray()
      }
    }
  } catch (err) {
    returnEmptyArray()
  }
}

function respondWithImage (fileName, response) {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithImage -> Entering function.') }

  let fs = require('fs')
  try {
    fs.readFile(fileName, onFileRead)

    function onFileRead (err, file) {
      if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithImage -> onFileRead -> Entering function.') }

      try {
        response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
        response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
        response.setHeader('Expires', '0') // Proxies.
        response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

        response.writeHead(200, { 'Content-Type': 'image/png' })
        response.end(file, 'binary')
      } catch (err) {
        console.log('[ERROR] server -> respondWithImage -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err)
      }
    }
  } catch (err) {
    console.log('[ERROR] server -> respondWithImage -> err = ' + err)
  }
}

function returnEmptyArray (response) {
  try {
    if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithFile -> returnEmptyArray -> Entering function.') }

    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
    response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
    response.setHeader('Expires', '0') // Proxies.

    response.writeHead(200, { 'Content-Type': 'text/html' })
    response.write('[]')
    response.end('\n')
  } catch (err) {
    console.log('[ERROR] server -> returnEmptyArray -> err.message ' + err.message)
  }
}

function processPost (request, response, callback) {
  let data = ''
  if (typeof callback !== 'function') return null

  if (request.method == 'POST') {
    request.on('data', function (pData) {
      data += pData
      if (data.length > 1e6) {
        data = ''
        response.writeHead(413, { 'Content-Type': 'text/plain' }).end()
        request.connection.destroy()
      }
    })

    request.on('end', function () {
      callback(data)
    })
  } else {
    response.writeHead(405, { 'Content-Type': 'text/plain' })
    response.end()
  }
}
