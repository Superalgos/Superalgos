const {defaultService} = require('../services');

const clientNode = async (req, res) => {
    const result = await defaultService.clientNode(req);
    res.send(result);
};

const projectsSchema = async (req, res) => {
    //const result = await defaultService.projectsSchema(req);
    //res.send(result);
    let response
    try {
        let fs = SA.nodeModules.fs
        let fileName = global.env.PATH_TO_PROJECTS + '/' + 'ProjectsSchema.json'
        response = fs.readFileSync(fileName).toString()

    } catch (error) {
        console.log(error);
        response = {error: "Could not fetch "}
    }
    res.send(response);
};

const projects = async (req, res) => {
    try {
        let requestPathAndParameters = req.params[0] // Remove version information
        let fs = SA.nodeModules.fs
        let fileName = global.env.PATH_TO_PROJECTS + '/' + requestPathAndParameters
        response = fs.readFileSync(fileName).toString()

    } catch (error) {
        console.log(error);
        response = {error: "Could not fetch data"}
    }
    res.send(response);
};

const environment = async (req, res) => {
    const result = JSON.stringify(global.env);
    res.send(result);
};

module.exports = {
    clientNode,
    projectsSchema,
    projects,
    environment
};