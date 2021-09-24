exports.newEnvironment = function () {

    let thisObject = {
        WEB_SERVER_URL: 'localhost',
        CLIENT_WEB_SOCKETS_INTERFACE_PORT: 18041,
        CLIENT_HTTP_INTERFACE_PORT: 34248,
        PATH_TO_DATA_STORAGE: './Data-Storage',
        PATH_TO_PROJECTS: './Projects',
        PATH_TO_LOG_FILES: './Log-Files',
        PATH_TO_PROJECTS_REQUIRED: './Projects',
        PATH_TO_PROJECT_SCHEMA: './Projects/ProjectsSchema.json',
        PATH_TO_CLIENT: './Platform',
        PATH_TO_DEFAULT_WORKSPACE: './Projects/Foundations/Plugins/Workspaces',
        PATH_TO_MY_WORKSPACES: './My-Workspaces',
        PATH_TO_FONTS: './Platform/WebServer/Fonts'
    }

    return thisObject
}