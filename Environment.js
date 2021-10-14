const path = require("path")

if (process.env.PACKAGED_PATH) {
    basePath = process.env.PACKAGED_PATH
} else {
    basePath = __dirname
}
exports.newEnvironment = function () {

    let thisObject = {
        BASE_PATH: basePath,
        WEB_SERVER_URL: 'localhost',
        CLIENT_WEB_SOCKETS_INTERFACE_PORT: 18041,
        CLIENT_HTTP_INTERFACE_PORT: 34248,
        PATH_TO_DATA_STORAGE: path.join(basePath, './Platform/My-Data-Storage'),
        PATH_TO_PROJECTS: path.join(basePath, './Projects'),
        PATH_TO_LOG_FILES: path.join(basePath, './Platform/My-Log-Files'),
        PATH_TO_PROJECTS_REQUIRED: path.join(basePath, './Projects'),
        PATH_TO_PROJECT_SCHEMA: path.join(basePath, './Projects/ProjectsSchema.json'),
        PATH_TO_CLIENT: path.join(basePath, './Platform'),
        PATH_TO_DEFAULT_WORKSPACE: path.join(basePath, './Projects/Foundations/Plugins/Workspaces'),
        PATH_TO_MY_WORKSPACES: path.join(basePath, './Platform/My-Workspaces'),
        PATH_TO_FONTS: path.join(basePath, './Platform/WebServer/Fonts')
    }

    if (process.env.PORTABLE_EXECUTABLE_DIR) {
        thisObject.PATH_TO_DATA_STORAGE = path.join(process.env.PORTABLE_USER_DOCUMENTS, '/Superalgos/Platform/My-Data-Storage')
        thisObject.PATH_TO_LOG_FILES = path.join(process.env.PORTABLE_USER_DOCUMENTS, '/Superalgos/Platform/My-Log-Files')
        thisObject.PATH_TO_MY_WORKSPACES = path.join(process.env.PORTABLE_USER_DOCUMENTS, '/Superalgos/Platform/My-Workspaces')
    }

    return thisObject
}