exports.loadSuperalgos = () => {

    loadGlobals()

    function loadGlobals() {
        let {UI} = require('./Globals');
        setupEnvironment(UI);
    }

    function setupEnvironment(UI) {
        let ENVIRONMENT = require('../../Environment');
        UI.environment = ENVIRONMENT.newEnvironment();
        setupClientNode(UI);
    }

    function setupClientNode(UI) {
        UI.clientNode = DK.desktopApp.p2pNetworkClient.node;
        setupProjectsSchema(UI);
    }

    function setupProjectsSchema(UI) {
        UI.schemas.projectSchema = require('../../Projects/ProjectsSchema.json');
        loadModules(UI)
    }

    function loadModules(UI) {
        let react = require('../scripts/start');
        react.start(JSON.parse(DK.desktopApp.p2pNetworkClient.node.config).webPort);

        /*        let APP_LOADER_MODULE = require('./WebAppLoader');
        APP_LOADER_MODULE.newWebAppLoader(UI);*/
    }
}