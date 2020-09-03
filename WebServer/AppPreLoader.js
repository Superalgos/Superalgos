
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

let browserCanvas;                 // This is the canvas object of the browser.

function spacePad(str, max) {
    str = str.toString();
    return str.length < max ? spacePad(" " + str, max) : str;
}

function loadSuperalgos() {

    const MODULE_NAME = "App Pre-Loader";
    const INFO_LOG = false;

    setupHTMLTextArea()
    setupHTMLInput()
    setupHTMLCanvas()
    loadDebugModule()

    function setupHTMLTextArea() {
        let textArea = document.createElement('textarea');
        textArea.id = "textArea";
        textArea.spellcheck = false;
        textArea.style = 'resize: none;' +
            ' border: none;' +
            ' outline: none;' +
            'box-shadow: none;' +
            'overflow:hidden;' +
            'font-family: ' + 'Saira' + ';' +
            'font-size: 12px;' +
            'background-color: rgb(255, 255, 255);' +
            'color:rgb(255, 255, 255);' +
            'width: ' + 600 + 'px;' +
            'height: ' + 400 + 'px'

        let textAreaDiv = document.getElementById('textAreaDiv');
        textAreaDiv.appendChild(textArea);
        textAreaDiv.style = 'position:fixed; top:' + -1500 + 'px; left:' + 500 + 'px; z-index:10; '
    }

    function setupHTMLInput() {
        let input = document.createElement('input');
        input.id = "input";
        input.spellcheck = false;
        input.style = "border: none; outline: none; box-shadow: none; overflow:hidden;  width: 0px; height: 0px;";

        let inputDiv = document.getElementById('inputDiv');
        inputDiv.appendChild(input);
    }

    function setupHTMLCanvas() {
        let canvas = document.createElement('canvas');

        canvas.id = "canvas";
        canvas.width = 1400;
        canvas.height = 600;
        canvas.style.border = "0";
        canvas.style = "position:absolute; top:0px; left:0px; z-index:1";

        let canvasApp = document.getElementById('canvasApp');
        canvasApp.appendChild(canvas);

        browserCanvas = document.getElementById('canvas');

        browserCanvas.width = window.innerWidth;
        browserCanvas.height = window.innerHeight;
        browserCanvas.style.border = "none";

        browserCanvas.style.top = 0 + 'px';
    }

    function loadDebugModule() {
        let path = "WebDebugLog.js";
        REQUIREJS([path], onRequired);

        function onRequired(pModule) {
            if (INFO_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[INFO] " + path + " downloaded."); }
            loadModules();
        }
    }

    /* And Finally, we start loading all the scripts we will inmediatelly need. */
    function loadModules() {
        let path = "WebServer/AppLoader.js";
        REQUIREJS([path], onRequired);

        function onRequired(pModule) {
            if (INFO_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[INFO] " + path + " downloaded."); }
            let APP_LOADER_MODULE = newAppLoader();
            APP_LOADER_MODULE.loadModules();
        }
    }
}

function callServer(pContentToSend, pPath, callBackFunction) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, xhttp.responseText);
            return;
        } else if (this.readyState === 4 && this.status === 404) {
            callBackFunction({ result: "Fail", message: xhttp.responseText.trim(), code: xhttp.responseText.trim() });
            return;
        }
    };

    if (pContentToSend === undefined) {
        xhttp.open("GET", pPath, true);
        xhttp.send();
    } else {
        try {
            let blob = new Blob([pContentToSend], { type: 'text/plain' });
            xhttp.open("POST", pPath, true);
            xhttp.send(blob);
        } catch (err) {
            if (ERROR_LOG === true) { console.log(spacePad(MODULE_NAME, 50) + " : " + "[ERROR] callServer -> err.message = " & err.message); }
            callBackFunction({ result: "Fail", message: err.message })
        }
    }
}
