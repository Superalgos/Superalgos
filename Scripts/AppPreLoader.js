
/* Callbacks default responses. */

let GLOBAL = {};

GLOBAL.DEFAULT_OK_RESPONSE = {
    result: "Ok",
    message: "Operation Succeeded"
};

GLOBAL.DEFAULT_FAIL_RESPONSE = {
    result: "Fail",
    message: "Operation Failed"
};

GLOBAL.DEFAULT_RETRY_RESPONSE = {
    result: "Retry",
    message: "Retry Later"
};

GLOBAL.CUSTOM_OK_RESPONSE = {
    result: "Ok, but check Message",
    message: "Custom Message"
};

GLOBAL.CUSTOM_FAIL_RESPONSE = {
    result: "Fail Because",
    message: "Custom Message"
}; 

function loadAdvancedAlgosPlatform() {

    console.log("AppPreLoader : " + "[INFO] loadAdvancedAlgosPlatform -> Entering function.");

    /* The first thing to do here is to add the canvas where all the action is going to happen. */

    let canvas = document.createElement('canvas');

    canvas.id = "canvas";
    canvas.width = 1400;
    canvas.height = 600;
    canvas.style.border = "0";
    canvas.style = "position:absolute; top:0px; left:0px; z-index:1";

    let body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);

    /* The second thing to do is to send the tokenSession to the server, so that it can prepare the server side data structures needed. */

    let sessionToken = window.SESSION_TOKEN;
    if (sessionToken === undefined) { sessionToken = ""}

    let path = "AABrowserAPI/authenticateUser/" + sessionToken;

    callServer(undefined, path, onServerReponded);

    function onServerReponded(pResponseFromServer) {

        console.log("AppPreLoader : " + "[INFO] loadAdvancedAlgosPlatform -> onServerReponded -> Entering function.");

        let responseFromServer = JSON.parse(pResponseFromServer);

        err = responseFromServer.err;

        if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {

            console.log("Authentication Error. " + err.message);
            return;

        }

        window.USER_PROFILE = responseFromServer.userProfile;

        loadDebugModule();
    }

    function loadDebugModule() {

        console.log("AppPreLoader : " + "[INFO] loadDebugModule -> Entering function.");

        let path = "WebDebugLog.js";

        REQUIREJS([path], onRequired);

        function onRequired(pModule) {

            console.log("AppPreLoader : " + "[INFO] " + path + " downloaded.");

            loadModules();

        }
    }

    /* And Finally, we start loading all the scripts we will inmediatelly need. */

    function loadModules() {

        console.log("AppPreLoader : " + "[INFO] loadModules -> Entering function.");

        let path = "Scripts/AppLoader.js";

        REQUIREJS([path], onRequired);

        function onRequired(pModule) {

            console.log("AppPreLoader : " + "[INFO] " + path + " downloaded.");

            let APP_LOADER_MODULE = newAppLoader();
            APP_LOADER_MODULE.loadModules();

        }
    }
}

function callServer(pContentToSend, pPath, callBackFunction) {

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {

            callBackFunction(xhttp.responseText);

        }
    };

    if (pContentToSend === undefined) {

        xhttp.open("GET", pPath, true);
        xhttp.send();

    } else {

        let blob = new Blob([pContentToSend], { type: 'text/plain' });

        xhttp.open("POST", pPath, true);
        xhttp.send(blob);

    }
}
