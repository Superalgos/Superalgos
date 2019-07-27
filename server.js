
require('dotenv').config()

CONSOLE_LOG = process.env.CONSOLE_LOG === 'true'
CONSOLE_ERROR_LOG = process.env.CONSOLE_ERROR_LOG === 'true'
LOG_FILE_CONTENT = process.env.LOG_FILE_CONTENT === 'true'

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

let http = require('http')
let port = process.env.PORT || 1337
let isHttpServerStarted = false

startHtttpServer()

function startHtttpServer() {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> startHtttpServer -> Entering function.') }

  try {
    if (isHttpServerStarted === false) {
      gWebServer = http.createServer(onBrowserRequest).listen(port)
      isHttpServerStarted = true
    }
  } catch (err) {
    console.log('[ERROR] server -> startHtttpServer -> Error = ' + err.stack)
  }
}

function onBrowserRequest(request, response) {
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

    case 'MQService':
      {
        let filePath = './node_modules/@superalgos/mqservice/orderLifeCicle/webDependency.js'

        respondWithFile(filePath, response)
        break
      }

    case 'Plotter.js':
      {
        respondWithFile('./Plotter.js', response)
      }
      break

    case 'PlotterPanel.js':
      {
        respondWithFile('./PlotterPanel.js', response)
      }
      break

    case 'Ecosystem.js':
      {
        respondWithFile('./Ecosystem.js', response)
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
        if (requestParameters[3] === undefined) {
          respondWithFile(process.env.PATH_TO_CANVAS_APP + '/StrategySpace/' + requestParameters[2], response)
          return
        }
        if (requestParameters[4] === undefined) {
          respondWithFile(process.env.PATH_TO_CANVAS_APP + '/StrategySpace/' + requestParameters[2] + '/' + requestParameters[3], response)
          return
        }
        if (requestParameters[5] === undefined) {
          respondWithFile(process.env.PATH_TO_CANVAS_APP + '/StrategySpace/' + requestParameters[2] + '/' + requestParameters[3] + '/' + requestParameters[4], response)
          return
        }
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
        respondWithFile('./Scripts/' + requestParameters[2], response)
      }
      break

    case 'Plotters': // This means the plotter folder, not to be confused with the Plotters script!
      {
        let devTeam = requestParameters[2]
        let codeName = requestParameters[3]
        let moduleName = requestParameters[4]
        let filePath = './Plotters/' + devTeam + '/plotters/' + codeName + '/' + moduleName
        respondWithFile(filePath, response)
      }
      break

    case 'PlotterPanels': // This means the PlotterPanels folder, not to be confused with the Plotter Panels scripts!
      {
        let devTeam = requestParameters[2]
        let codeName = requestParameters[3]
        let moduleName = requestParameters[4]
        let filePath = './Plotters/' + devTeam + '/plotters/' + codeName + '/' + moduleName
        respondWithFile(filePath, response)
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

    case 'UserEcosystem.js':
      {
        let fs = require('fs')

        try {
          let filePath = process.env.CONFIG_PATH + '/ecosystem.json'
          fs.readFile(filePath, onFileRead)
        } catch (e) {
          console.log('[ERROR] Error reading the user ecosystem.', e)
        }

        function onFileRead(err, userEcosystem) {
          if (err) {
            respondWithContent(undefined, response)
          } else {
            let responseContent = 'function getUserEcosystem(){ return ' + userEcosystem + '}'
            respondWithContent(responseContent, response)
          }
        }
      }
      break

    case 'Storage':
      {
        respondWithFile(process.env.STORAGE_PATH + '/' + request.url.substring(9), response)
      }
      break

    case 'ReadUserConfig':
      {
        respondWithFile(process.env.CONFIG_PATH + '/userConfig.json', response)
      }
      break

    case 'WriteUserConfig':
      {
        let fs = require('fs')
        let body = '';

        request.on('data', function (data) {
            body += data;
            // Too much POST data
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
          try {
            let filePath = process.env.CONFIG_PATH + '/userConfig.json'
            fs.writeFile(filePath, body, onFileWrite)
          } catch (e) {
            console.log('[ERROR] Error writing user config.', e)
            respondWithContent(undefined, response)
          }

          function onFileWrite(err) {
            if (err) {
              respondWithContent(undefined, response)
            } else {
              let responseContent = 'User config updated.'
              respondWithContent(responseContent, response)
            }
          }
        });
      }
      break

    default:
      {
        homePage()
      }
  }

  function homePage() {
    if (requestParameters[1] === '') {
      let fs = require('fs')
      try {
        let fileName = 'index.html'
        fs.readFile(fileName, onFileRead)

        function onFileRead(err, file) {
          if (CONSOLE_LOG === true) { console.log('[INFO] server -> onBrowserRequest -> onFileRead -> Entering function.') }

          try {
            let fileContent = file.toString()

            /* The second request parameters is the sessionToken, if it exists. */

            if (requestParameters[2] !== '' && requestParameters[2] !== undefined) {
              fileContent = fileContent.replace("window.canvasApp.sessionToken = ''", "window.canvasApp.sessionToken = '" + requestParameters[2] + "'")
            }

            respondWithContent(fileContent, response)
          } catch (err) {
            console.log('[ERROR] server -> onBrowserRequest -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
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

function respondWithFile(fileName, response) {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithFile -> Entering function.') }

  let fs = require('fs')
  if (fileName.indexOf('undefined') > 0) {
    console.log('[WRN] server -> respondWithFile -> Received request for undefined file. ')
    respondWithContent(undefined, response)
  } else {
    try {
      fs.readFile(fileName, onFileRead)

      function onFileRead(err, file) {
        if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithFile -> onFileRead -> Entering function.') }
        if (!err) {
          respondWithContent(file.toString(), response)
        } else {
          respondWithContent(undefined, response)
        }
      }
    } catch (err) {
      returnEmptyArray()
    }
  }
}

function respondWithContent(content, response) {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithContent -> Entering function.') }

  try {
    response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
    response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
    response.setHeader('Expires', '0') // Proxies.
    response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

    if (content !== undefined) {
      response.writeHead(200, { 'Content-Type': 'text/html' })
      response.write(content)
    } else {
      response.writeHead(404, { 'Content-Type': 'text/html' });
      response.write('The specified key does not exist.')
    }
    response.end('\n')
  } catch (err) {
    returnEmptyArray(response)
  }
}

function respondWithImage(fileName, response) {
  if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithImage -> Entering function.') }

  let fs = require('fs')
  try {
    fs.readFile(fileName, onFileRead)

    function onFileRead(err, file) {
      if (CONSOLE_LOG === true) { console.log('[INFO] server -> respondWithImage -> onFileRead -> Entering function.') }

      try {
        response.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // HTTP 1.1.
        response.setHeader('Pragma', 'no-cache') // HTTP 1.0.
        response.setHeader('Expires', '0') // Proxies.
        response.setHeader('Access-Control-Allow-Origin', '*') // Allows to access data from other domains.

        response.writeHead(200, { 'Content-Type': 'image/png' })
        response.end(file, 'binary')
      } catch (err) {
        console.log('[ERROR] server -> respondWithImage -> onFileRead -> File Not Found: ' + fileName + ' or Error = ' + err.stack)
      }
    }
  } catch (err) {
    console.log('[ERROR] server -> respondWithImage -> err = ' + err.stack)
  }
}

function returnEmptyArray(response) {
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
