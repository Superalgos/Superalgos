const { response } = require("express");

const clientNode = async (req, res) => {
    let response = {}
    try {
        response = {
        name: ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.name,
        type: ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.type,
        id: ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.id,
        project: ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.project,
        config: JSON.stringify(ST.socialTradingApp.p2pNetworkClient.p2pNetworkClientIdentity.node.config)                            
        }
    } catch (error) {
        console.log(error);
        response = {error: "Could not fetch Client Node config"}
    }
    return response;

}

const projectsSchema = async (req, res) => {
    let response = {}
    try {
        let fs = SA.nodeModules.fs
        let fileName = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsSchema.json'
        response = fs.readFileSync(fileName).toString()

    } catch (error) {
        console.log(error);
        return {error: "Could not fetch "}
    }
    return response;
}

module.exports = {
    clientNode,
    projectsSchema
};

