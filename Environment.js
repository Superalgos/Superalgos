exports.newEnvironment = function () {

    let thisObject = {
        WEB_SERVER_URL: '192.168.1.106',
        WEB_SOCKETS_INTERFACE_PORT: 18042,
        HTTP_INTERFACE_PORT: 34249,
        PATH_TO_TASK_SERVER: './TaskServer',
        PATH_TO_DATA_STORAGE: './Data-Storage',
        PATH_TO_PROJECTS: './Projects',
        PATH_TO_LOG_FILES: './Log-Files',
        PATH_TO_PROJECTS_REQUIRED: '../Projects',
        PATH_TO_UI: './UI',
        PATH_TO_DATA_FILES: './UI/Data-Files/src',
        PATH_TO_CLIENT: './Client/',
        PATH_TO_DEFAULT_WORKSPACE: './Projects/Superalgos/Plugins/Workspaces',
        PATH_TO_MY_WORKSPACES: './My-Workspaces',
        PATH_TO_FONTS: './Client/WebServer/Fonts'
    }

    return thisObject
}