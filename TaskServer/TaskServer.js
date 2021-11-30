exports.newTaskServer = function newTaskServer() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {

        /* Setting up the handling of Node JS process events */
        let NODE_JS_PROCESS = require('./NodeJsProcess.js');
        let NODE_JS_PROCESS_MODULE = NODE_JS_PROCESS.newNodeJsProcess()
        NODE_JS_PROCESS_MODULE.initialize()

        /* Setting up the global Event Handler */
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT = TS.projects.foundations.taskModules.eventServerClient.newFoundationsTaskModulesEventServerClient()
        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.initialize(preLoader)

        function preLoader() {
            /*
            We read the first string sent as an argument when the process was created by the Task Manager. 
            There we will find the information of the identity
            of this Task and know exactly what to run within this server instance. 
            */
            let taskId = process.argv[2] // reading what comes as an argument of the nodejs process.
            if (taskId !== undefined) {
                /* 
                The Task Manager sent the info via a process argument. In this case we listen to 
                an event with the Task Info that should be emitted at the UI;
                Also here is where any managedTasks will initially be recorded.
                */
                try {
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent('Task Server - ' + taskId, 'Run Task', undefined, 'Task Server - ' + taskId, undefined, eventReceived)
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent('Task Manager - ' + taskId, 'Nodejs Process Ready for Task')
                    function eventReceived(message) {
                        try {
                            setUpAppSchema(JSON.parse(message.event.projectSchemas))
                            TS.projects.foundations.globals.taskConstants.TASK_NODE = JSON.parse(message.event.taskDefinition);
                            TS.projects.foundations.globals.taskConstants.NETWORK_NODE = JSON.parse(message.event.networkDefinition);
                            TS.projects.foundations.globals.taskConstants.MANAGED_TASKS = JSON.parse(message.event.managedTasksDefinition);
                            SA.projects.visualScripting.utilities.nodeFunctions.getManagedSessions(TS.projects.foundations.globals.taskConstants.MANAGED_TASKS);
                            bootingProcess();
                        } catch (err) {
                            console.log('[ERROR] Task Server -> Task -> preLoader -> eventReceived -> ' + err.stack)
                        }
                    }
                } catch (err) {
                    console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE -> ' + err.stack)
                    console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE = ' + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE).substring(0, 1000))
                }
            }
            else {

                try {
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent('Task Server', 'Debug Task Started', undefined, 'Task Server', undefined, startDebugging)
                    function startDebugging(message) {
                        try {
                            setUpAppSchema(JSON.parse(message.event.projectSchemas))
                            TS.projects.foundations.globals.taskConstants.TASK_NODE = JSON.parse(message.event.taskDefinition)
                            TS.projects.foundations.globals.taskConstants.NETWORK_NODE = JSON.parse(message.event.networkDefinition)
                            bootingProcess()

                        } catch (err) {
                            console.log('[ERROR] Task Server -> Task -> preLoader -> startDebugging -> ' + err.stack)
                        }
                    }
                } catch (err) {
                    console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE -> ' + err.stack)
                    console.log('[ERROR] Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE = ' + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE).substring(0, 1000))
                }
            }

            function setUpAppSchema(projectSchemas) {
                /* Setup the APP_SCHEMA_MAP based on the APP_SCHEMA_ARRAY */
                for (let i = 0; i < projectSchemas.length; i++) {
                    let project = projectSchemas[i]

                    for (let j = 0; j < project.schema.length; j++) {
                        let schemaDocument = project.schema[j]
                        let key = project.name + '-' + schemaDocument.type
                        SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.set(key, schemaDocument)
                    }
                }
            }
        }

        async function bootingProcess() {
            try {
                initializeProjectDefinitionNode()
                await setupNetwork()
                setupTaskHeartbeats()
                startProcesses()

                function initializeProjectDefinitionNode() {
                    TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(TS.projects.foundations.globals.taskConstants.TASK_NODE, 'Project Definition')
                    if (TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE === undefined) {
                        console.log("[ERROR] Task Server -> Task -> bootingProcess -> Project Definition not found. ")
                        TS.projects.foundations.globals.taskVariables.FATAL_ERROR_MESSAGE = 'Project Definition not found. Fatal Error, can not continue. Fix the problem and try again.'
                        TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess
                        throw ('Fatal Error')
                    }
                    if (TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName === undefined) {
                        console.log("[ERROR] Task Server -> Task -> bootingProcess -> Project Definition with codeName undefined. ")
                        TS.projects.foundations.globals.taskVariables.FATAL_ERROR_MESSAGE = 'Project Definition with codeName undefined. Fatal Error, can not continue. Fix the problem and try again.'
                        TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess
                        throw ('Fatal Error')
                    }
                    if (TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName === '') {
                        console.log("[ERROR] Task Server -> Task -> bootingProcess -> Project Definition without codeName. ")
                        TS.projects.foundations.globals.taskVariables.FATAL_ERROR_MESSAGE = 'Project Definition without codeName. Fatal Error, can not continue. Fix the problem and try again.'
                        TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess
                        throw ('Fatal Error')
                    }
                }

                async function setupNetwork() {
                    /*
                    If we received a App Server Reference Node and a Signing Account, then we will connect to the P2P Network
                    */
                    if (
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference.referenceParent === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference.referenceParent.signingAccount === undefined
                    ) {
                        return
                    }
                    TS.projects.foundations.globals.taskConstants.P2P_NETWORK = {}
                    /*
                    We set up ourselves as a Network Client.
                    */
                    TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient = SA.projects.network.modules.p2pNetworkClient.newNetworkModulesP2PNetworkClient()
                    await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.initialize()
                    /*
                    We will read all user profiles plugins and get from there our network identity.
                    */
                    TS.projects.foundations.globals.taskConstants.P2P_NETWORK.userProfiles = SA.projects.network.modules.userProfiles.newNetworkModulesUserProfiles()
                    await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.userProfiles.initialize(TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference.referenceParent.config.codeName, TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient)
                    /*
                    We set up the P2P Network.
                    */
                    TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetwork = SA.projects.network.modules.p2pNetwork.newNetworkModulesP2PNetwork()
                    await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetwork.initialize('Network Client')
                    /*
                    Set up the connections to network nodes.
                    */
                    TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkPeers = SA.projects.network.modules.p2pNetworkPeers.newNetworkModulesP2PNetworkPeers()
                    await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkPeers.initialize(
                        'Network Client',
                        TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient,
                        TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetwork,
                        global.env.TASK_SERVER_APP_MAX_OUTGOING_PEERS
                    )
                }  

                function setupTaskHeartbeats() {
                    /* 
                    Heartbeat sent to the UI 
                    */
                    let key = TS.projects.foundations.globals.taskConstants.TASK_NODE.name + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.type + '-' + TS.projects.foundations.globals.taskConstants.TASK_NODE.id

                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.createEventHandler(key)
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Running') // Meaning Task Running
                    TS.projects.foundations.globals.taskConstants.TASK_HEARTBEAT_INTERVAL_HANDLER = setInterval(taskHearBeat, 1000)

                    function taskHearBeat() {

                        /* The heartbeat event is raised at the event handler of the instance of this task, created at the TS. */
                        let event = {
                            seconds: (new Date()).getSeconds()
                        }
                        TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.raiseEvent(key, 'Heartbeat', event)
                    }
                }

                function startProcesses() {
                    for (let processIndex = 0; processIndex < TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes.length; processIndex++) {
                        /*
                        Here we will validate that the process is connected all the way to a Mine
                        and that nodes in the middle have whatever config is mandatory.
                        */
                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent === undefined) {
                            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Process Instance without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode === undefined) {
                            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Process Definition without parent Bot Definition. -> Process Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode === undefined) {
                            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Bot Definition without parent Mine. -> Bot Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName === undefined) {
                            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Process Definition without a codeName defined. -> Process Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName === undefined) {
                            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Bot Definition without a codeName defined. -> Bot Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName === undefined) {
                            console.log("[ERROR] Task Server -> Task -> bootingProcess -> Mine without a codeName defined. -> Mine Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode));
                            continue
                        }

                        startProcessInstance(processIndex);
                    }
                }
            } catch (err) {
                console.log('[ERROR] Task Server -> Task -> bootingProcess -> Fatal Error. Can not run this task. -> ' + err.stack)
            }
        }

        function startProcessInstance(processIndex) {

            const ROOT_MODULE = require('./ProcessInstance')
            let root = ROOT_MODULE.newProcessInstance()

            root.start(processIndex)
        }
    }
}