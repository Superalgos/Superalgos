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
                            TS.projects.foundations.globals.taskConstants.TASK_NODE = JSON.parse(message.event.taskDefinition)
                            TS.projects.foundations.globals.taskConstants.NETWORK_NODE = JSON.parse(message.event.networkDefinition)
                            TS.projects.foundations.globals.taskConstants.MANAGED_TASKS = JSON.parse(message.event.managedTasksDefinition)
                            if (message.event.dependencyFilters !== undefined) {
                                TS.projects.foundations.globals.taskConstants.DEPENDENCY_FILTERS = JSON.parse(message.event.dependencyFilters)
                            }
                            TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE, 'Session Reference')
                            bootingProcess();
                        } catch (err) {
                            SA.logger.error('Task Server -> Task -> preLoader -> eventReceived -> ' + err.stack)
                        }
                    }
                } catch (err) {
                    SA.logger.error('Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE -> ' + err.stack)
                    SA.logger.error('Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE = ' + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE).substring(0, 1000))
                }
            } else {

                try {
                    /*
                    When the user starts the task at the UI using the DEBUG menu item, it runs from here, intead of from above.
                    */
                    TS.projects.foundations.globals.taskConstants.EVENT_SERVER_CLIENT_MODULE_OBJECT.listenToEvent('Task Server', 'Debug Task Started', undefined, 'Task Server', undefined, startDebugging)

                    function startDebugging(message) {
                        try {
                            TS.projects.foundations.globals.taskConstants.TASK_NODE = JSON.parse(message.event.taskDefinition)
                            TS.projects.foundations.globals.taskConstants.NETWORK_NODE = JSON.parse(message.event.networkDefinition)
                            TS.projects.foundations.globals.taskConstants.MANAGED_TASKS = JSON.parse(message.event.managedTasksDefinition)
                            if (message.event.dependencyFilters !== undefined) {
                                TS.projects.foundations.globals.taskConstants.DEPENDENCY_FILTERS = JSON.parse(message.event.dependencyFilters)
                            }
                            TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_REFERENCES = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(TS.projects.foundations.globals.taskConstants.TASK_NODE, 'Session Reference')
                            bootingProcess()

                        } catch (err) {
                            SA.logger.error('Task Server -> Task -> preLoader -> startDebugging -> ' + err.stack)
                        }
                    }
                } catch (err) {
                    SA.logger.error('Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE -> ' + err.stack)
                    SA.logger.error('Task Server -> Task -> preLoader -> TS.projects.foundations.globals.taskConstants.TASK_NODE = ' + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE).substring(0, 1000))
                }
            }
        }

        async function bootingProcess() {
            try {
                initializeProjectDefinitionNode()
                setupTradingSignals()
                setupTaskHeartbeats()
                await setupOpenStorage()
                await setupP2PNetworkClient()
                startProcesses()

                function initializeProjectDefinitionNode() {
                    TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE = SA.projects.visualScripting.utilities.nodeFunctions.findNodeInNodeMesh(TS.projects.foundations.globals.taskConstants.TASK_NODE, 'Project Definition')
                    if (TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE === undefined) {
                        SA.logger.error('Task Server -> Task -> bootingProcess -> Project Definition not found. ')
                        TS.projects.foundations.globals.taskVariables.FATAL_ERROR_MESSAGE = 'Project Definition not found. Fatal Error, can not continue. Fix the problem and try again.'
                        TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess
                        throw ('Fatal Error')
                    }
                    if (TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName === undefined) {
                        SA.logger.error('Task Server -> Task -> bootingProcess -> Project Definition with codeName undefined. ')
                        TS.projects.foundations.globals.taskVariables.FATAL_ERROR_MESSAGE = 'Project Definition with codeName undefined. Fatal Error, can not continue. Fix the problem and try again.'
                        TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess
                        throw ('Fatal Error')
                    }
                    if (TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName === '') {
                        SA.logger.error('Task Server -> Task -> bootingProcess -> Project Definition without codeName. ')
                        TS.projects.foundations.globals.taskVariables.FATAL_ERROR_MESSAGE = 'Project Definition without codeName. Fatal Error, can not continue. Fix the problem and try again.'
                        TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess
                        throw ('Fatal Error')
                    }
                }

                function setupTradingSignals() {
                    /*
                    If we received a Bot Instance with a child Social Trading Bot Reference with a reference parent, 
                    that would mean that we will need Trading Signals.
                    */
                    if (
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.socialTradingBotReference === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.socialTradingBotReference.referenceParent === undefined
                    ) {
                        return
                    }
                    TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS = {
                        incomingCandleSignals: TS.projects.tradingSignals.modules.incomingCandleSignals.newTradingSignalsModulesIncomingCandleSignals(),
                        outgoingCandleSignals: TS.projects.tradingSignals.modules.outgoingCandleSignals.newTradingSignalsModulesOutgoingCandleSignals()
                    }

                    TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.initialize()
                    TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.outgoingCandleSignals.initialize()
                }

                async function setupOpenStorage() {
                    /*
                    If we received a Bot Instance with a child Social Trading Bot Reference with a reference parent, 
                    that would mean that we will need Open Storage
                    */
                    if (
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.socialTradingBotReference === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.socialTradingBotReference.referenceParent === undefined
                    ) {
                        return
                    }
                    TS.projects.foundations.globals.taskConstants.OPEN_STORAGE_CLIENT =
                        SA.projects.openStorage.modules.openStorageTaskServerClient.newOpenStorageModulesOpenStorageTaskServerClient()
                    TS.projects.foundations.globals.taskConstants.OPEN_STORAGE_CLIENT.initialize()
                }

                async function setupP2PNetworkClient() {
                    /*
                    A Network Client will be setup only if the Task node has a P2P Network Client node.                    
                    */
                    if (
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient === undefined
                    ) {
                        return
                    }
                    /*
                    The Task needs to Identify itself against the P2P Network with a Signing Account, and for that it needs to 
                    reference to an App Server. If we don't find that, then we can not continue.
                    */
                    if (
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference.referenceParent === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference.referenceParent.signingAccount === undefined
                    ) {
                        SA.logger.error('Task Server -> Task -> bootingProcess -> setupP2PNetworkClient -> The Task needs to have a taskServerAppReference referencing an App Server with a Signing Account in order for this task to be able to connect to the P2P Network. ')
                        throw ('Fatal Error')
                    }
                    /*
                    The Network Client needs to know which type of network and which specific network to connect to. In order to do that. 
                    a P2P Network Reference must be present and pointing to a P2P Network. If we don't find that, then we can not continue.
                    */
                    if (
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient.p2pNetworkReference === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient.p2pNetworkReference.referenceParent === undefined ||
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient.p2pNetworkReference.referenceParent.config.codeName === undefined
                    ) {
                        SA.logger.error('Task Server -> Task -> bootingProcess -> setupP2PNetworkClient -> The Task needs to have a p2pNetworkReference referencing a P2P Network or Permissioned P2P Network with a codeName config property in order for this task to be able to connect to the P2P Network. ')
                        throw ('Fatal Error')
                    }
                    TS.projects.foundations.globals.taskConstants.P2P_NETWORK = {}
                        /*
                        We set up the P2P Network Client.
                        */
                    TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient = SA.projects.network.modules.p2pNetworkClient.newNetworkModulesP2PNetworkClient()
                        /*
                        We setup the callback function for the circunstances that we receive a message comming from the P2P Network that is not the response to a request sent, but a notification.
                        */
                    let eventReceivedCallbackFunction
                        /*
                        For now, if Trading Signals is activated, then we will assume that the incoming notifications are in fact Signals. In the future this assumption should be removed once we have another use case for notifications and this should be generalized. 
                        */
                    if (TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS !== undefined) {
                        eventReceivedCallbackFunction = TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.incomingCandleSignals.signalReceived
                    }
                    /*
                    Here is where we do initialize the Network Client.
                    */
                    TS.projects.foundations.functionLibraries.taskFunctions.taskHearBeat("Synchronising User Profiles", false)

                    let PULL_USER_PROFILES = false                                                                                  /* Do not update all user profiles when starting from Task Server */       
                    await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.initialize(
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.taskServerAppReference.referenceParent.signingAccount.config.codeName,
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient.p2pNetworkReference.referenceParent.type,
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient.p2pNetworkReference.referenceParent.config.codeName,
                        global.env.TASK_SERVER_APP_MAX_OUTGOING_PEERS,
                        global.env.TASK_SERVER_APP_MAX_OUTGOING_START_PEERS,
                        eventReceivedCallbackFunction,
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.p2pNetworkClient,                                   // This parameter is sent only when initialized by a Task Server.
                        PULL_USER_PROFILES,                                                                                        
                        TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.socialTradingBotReference                       // Social Trading Bot Reference potentially connected to this task
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
                            SA.logger.error("Task Server -> Task -> bootingProcess -> Process Instance without a Reference Parent. This process will not be executed. -> Process Instance = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex]));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode === undefined) {
                            SA.logger.error("Task Server -> Task -> bootingProcess -> Process Definition without parent Bot Definition. -> Process Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode === undefined) {
                            SA.logger.error("Task Server -> Task -> bootingProcess -> Bot Definition without parent Mine. -> Bot Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName === undefined) {
                            SA.logger.error("Task Server -> Task -> bootingProcess -> Process Definition without a codeName defined. -> Process Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName === undefined) {
                            SA.logger.error("Task Server -> Task -> bootingProcess -> Bot Definition without a codeName defined. -> Bot Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode));
                            continue
                        }

                        if (TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName === undefined) {
                            SA.logger.error("Task Server -> Task -> bootingProcess -> Mine without a codeName defined. -> Mine Definition = " + JSON.stringify(TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode));
                            continue
                        }

                        startProcessInstance(processIndex);
                    }
                }
            } catch (err) {
                SA.logger.error('Task Server -> Task -> bootingProcess -> Fatal Error. Can not run this task. -> err = ' + err + ' -> err.message = ' + err.message + ' -> err.stack = ' + err.stack + '.')
            }
        }

        function startProcessInstance(processIndex) {

            const ROOT_MODULE = require('./ProcessInstance')
            let root = ROOT_MODULE.newProcessInstance()

            root.start(processIndex)
        }
    }
}