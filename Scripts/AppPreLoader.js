
function loadAdvancedAlgosPlatform() {

    let canvas = document.createElement('canvas');

    canvas.id = "canvas";
    canvas.width = 1400;
    canvas.height = 600;
    canvas.style.border = "0";
    canvas.style = "position:absolute; top:0px; left:0px; z-index:1";

    let body = document.getElementsByTagName("body")[0];
    body.appendChild(canvas);

    let path = "Scripts/AppLoader.js";

    REQUIREJS([path], onRequired);

    function onRequired(pModule) {

        console.log(path + " downloaded.");

        let APP_LOADER_MODULE = newAppLoader();
        APP_LOADER_MODULE.loadModules();

    }
}

