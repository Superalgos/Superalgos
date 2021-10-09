const path = require("path")

exports.newEnvironment = function () {

    let thisObject = {
        WEB_SERVER_URL: 'localhost',
        CLIENT_WEB_SOCKETS_INTERFACE_PORT: 18041,
        CLIENT_HTTP_INTERFACE_PORT: 34248,
        PATH_TO_DATA_STORAGE: path.join(__dirname, './Platform/My-Data-Storage'),
        PATH_TO_PROJECTS: path.join(__dirname, './Projects'),
        PATH_TO_LOG_FILES: path.join(__dirname, './Platform/My-Log-Files'),
        PATH_TO_PROJECTS_REQUIRED: path.join(__dirname, './Projects'),
        PATH_TO_PROJECT_SCHEMA: path.join(__dirname, './Projects/ProjectsSchema.json'),
        PATH_TO_CLIENT: path.join(__dirname, './Platform'),
        PATH_TO_DEFAULT_WORKSPACE: path.join(__dirname, './Projects/Foundations/Plugins/Workspaces'),
        PATH_TO_MY_WORKSPACES: path.join(__dirname, './Platform/My-Workspaces'),
        PATH_TO_FONTS: path.join(__dirname, './Platform/WebServer/Fonts')
    }

    return thisObject
}