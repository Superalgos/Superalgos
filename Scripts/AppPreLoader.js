
function loadAPP() {

    let path = "Scripts/AppLoader.js";

    REQUIREJS([path], onRequired);

    function onRequired(pModule) {

        console.log(path + " downloaded.");

        let APP_LOADER_MODULE = newAppLoader();
        APP_LOADER_MODULE.loadModules();

    }
}

