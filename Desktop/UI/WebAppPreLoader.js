
function loadSuperalgos() {

    let browser = checkBrowserVersion()
    if ((browser.name !== "Chrome" && browser.name !== "Safari") || (browser.name === "Chrome" && parseInt(browser.version) < 85) || (browser.name === "Safari" && parseInt(browser.version) < 13)) {
        alert("Superalgos is officially supported on Google Chrome 85 or Safari 13.1 and above. Your browser version has been detected as potentially beneath this. If you continue you may experience some functionaility issues.\n\nDetected Browser: " + browser.name + "\nVersion: " + browser.version)
    }

    loadGlobals()

    function loadGlobals() {
        let path = "Globals.js"
        REQUIREJS([path], onRequired)

        function onRequired(pModule) {
            setupEnvironment()
        }
    }

    function setupEnvironment() {
        httpRequest(undefined, 'Environment', onResponse)

        function onResponse(err, file) {
            UI.environment = JSON.parse(file)
            setupClientNode()
        }
    }

    function setupClientNode() {
        httpRequest(undefined, 'ClientNode', onResponse)

        function onResponse(err, file) {
            UI.clientNode = JSON.parse(file)
            setupProjectsSchema()
        }
    }

    function setupProjectsSchema() {
        httpRequest(undefined, 'ProjectsSchema', onResponse)

        function onResponse(err, file) {
            UI.schemas.projectSchema = JSON.parse(file)
            loadModules()
        }
    }

    function loadModules() {
        let path = "WebAppLoader.js"
        REQUIREJS([path], onRequired)

        function onRequired(pModule) {
            let APP_LOADER_MODULE = newWebAppLoader()
            APP_LOADER_MODULE.loadModules()
        }
    }
}

function httpRequest(pContentToSend, pPath, callBackFunction) {
    let xmlHttpRequest = new XMLHttpRequest()
    xmlHttpRequest.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            try {
                callBackFunction(undefined, xmlHttpRequest.responseText)
            } catch (err) {
                console.log('[ERROR] httpRequest -> httpRequest -> err.stack = ' + err.stack)
                console.log('[ERROR] httpRequest -> httpRequest -> pContentToSend = ' + pContentToSend)
                console.log('[ERROR] httpRequest -> httpRequest -> pPath = ' + pPath)
                console.log('[ERROR] httpRequest -> httpRequest -> xmlHttpRequest.responseText = ' + xmlHttpRequest.responseText)
                console.log('[ERROR] httpRequest -> httpRequest -> callBackFunction = ' + callBackFunction)

            }
            return
        } else if (this.readyState === 4 && this.status === 404) {
            callBackFunction({ result: "Fail", message: xmlHttpRequest.responseText.trim(), code: xmlHttpRequest.responseText.trim() })
            return
        }
    }

    if (pContentToSend === undefined) {
        xmlHttpRequest.open("GET", pPath, true)
        xmlHttpRequest.send()
    } else {
        try {
            let blob = new Blob([pContentToSend], { type: 'text/plain' })
            xmlHttpRequest.open("POST", pPath, true)
            xmlHttpRequest.send(blob)
        } catch (err) {
            if (ERROR_LOG === true) { console.log("[ERROR] callServer -> err.message = " + err.message) }
            callBackFunction({ result: "Fail", message: err.message })
        }
    }
}

function checkBrowserVersion() {

    let ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []
    if (/trident/i.test(M[1])) {
        tem = /\brv[ :]+(\d+)/g.exec(ua) || []
        return { name: 'IE', version: (tem[1] || '') }
    }
    if (M[1] === 'Chrome') {
        tem = ua.match(/\bOPR|Edge\/(\d+)/)
        if (tem != null) { return { name: 'Opera', version: tem[1] } }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?']
    if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]) }
    return {
        name: M[0],
        version: M[1]
    }
}
