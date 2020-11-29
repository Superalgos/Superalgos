exports.newEnvironment = function () {

    let thisObject = {
        WEB_SOCKETS_INTERFACE_PORT: 18041,
        STORAGE_PATH: './Data-Storage',
        PROJECTS_PATH: './Projects',
        LOG_PATH: './Log-Files',
        PROJECTS_REQUIRED_PATH: '../Projects'
    }

    return thisObject;
}