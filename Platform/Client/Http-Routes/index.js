/**
 * 
 * @returns Map<string, ({}, {}) => void>
 */
exports.newHttpRoutes = function newHttpRoutes() {
    const routeMap = new Map()
    addRoutes()
    return routeMap

    function addRoutes() {
        const routes = [
            require('./app').newAppRoute(),
            require('./bitcoin-factory').newBitCoinFactoryRoute(),
            require('./ccxt').newCCXTRoute(),
            require('./chart-layers').newChartLayersRoute(),
            require('./default').newDefaultRoute(),
            require('./dex').newDEXRoute(),
            require('./dir-content').newDirContentRoute(),
            require('./docs').newDocsRoute(),
            require('./environment').newEnvironmentRoute(),
            require('./external-scripts').newExternalScriptsRoute(),
            require('./files').newFilesRoute(),
            require('./fonts').newFontsRoute(),
            require('./gifs').newGIFsRoute(),
            require('./gov').newGOVRoute(),
            require('./icon-names').newIconNamesRoute(),
            require('./icons').newIconsRoute(),
            require('./images').newImagesRoute(),
            require('./legacy-plotter').newLegacyPlotterRoute(),
            require('./list-function-libraries').newListFunctionLibrariesRoute(),
            require('./list-global-files').newListGlobalFilesRoute(),
            require('./list-node-action-functions').newListNodeActionFunctionsRoute(),
            require('./list-space-files').newListSpaceFilesRoute(),
            require('./list-system-action-functions').newListSystemActionFunctionsRoute(),
            require('./list-utilities-files').newListUtilitiesFilesRoute(),
            require('./list-workspaces').newListWorkspacesRoute(),
            require('./load-my-workspace').newLoadMyWorkspaceRoute(),
            require('./load-plugin').newLoadPluginRoute(),
            require('./locales').newLocalesRoute(),
            require('./plotter-panel').newPlotterPanelRoute(),
            require('./plotters').newPlottersRoute(),
            require('./plugin-file-names').newPluginFileNamesRoute(),
            require('./pngs').newPNGsRoute(),
            require('./projects-menu').newProjectsMenuRoute(),
            require('./projects-schema').newProjectsSchemaRoute(),
            require('./projects').newProjectsRoute(),
            require('./save-plugin').newSavePluginRoute(),
            require('./save-workspace').newSaveWorkspaceRoute(),
            require('./schema').newSchemaRoute(),
            require('./secrets').newSecretsRoute(),
            require('./social-bots').newSocialBotsRoute(),
            require('./storage').newStorageRoute(),
            require('./web-server').newWebServerRoute(),
            require('./web3').newWEB3Route(),
            require('./webhook').newWebhookRoute(),
            require('./workspace').newWorkspaceRoute(),
        ]

        routes.forEach(r => routeMap.set(r.endpoint, r.command))
    }
}