exports.newEnvironment = function () {

    let thisObject = {
        WEB_SERVER_URL: 'localhost',
        CLIENT_WEB_SOCKETS_INTERFACE_PORT: 18041,
        NETWORK_WEB_SOCKETS_INTERFACE_PORT: 18042,
        DESKTOP_WEB_SOCKETS_INTERFACE_PORT: 18043,
        DESKTOP_WEB_SOCKETS_INTERFACE_HOST: 'localhost',
        CLIENT_HTTP_INTERFACE_PORT: 34248,
        DESKTOP_HTTP_INTERFACE_PORT: 34249,
        PATH_TO_DATA_STORAGE: './Data-Storage',
        PATH_TO_PROJECTS: './Projects',
        PATH_TO_LOG_FILES: './Log-Files',
        PATH_TO_PROJECTS_REQUIRED: './Projects',
        PATH_TO_PROJECT_SCHEMA: './Projects/ProjectsSchema.json',
        PATH_TO_CLIENT: './Platform',
        PATH_TO_DESKTOP: './Desktop',
        PATH_TO_DEFAULT_WORKSPACE: './Projects/Foundations/Plugins/Workspaces',
        PATH_TO_MY_WORKSPACES: './My-Workspaces',
        PATH_TO_FONTS: './Platform/WebServer/Fonts'
    }

    return thisObject
}