exports.newProcessInstance = function newProcessInstance() {

    const MODULE_NAME = "Process Instance";
    const WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START = 10000 // This avoid a race condition that could happen if one process finished before all the other even started.

    let thisObject = {
        start: start
    }

    let logDisplace = "Task Server" + "                                              ";
    return thisObject;

    function start(processIndex) {
        try {
            let botModuleObject
            let VARIABLES_BY_PROCESS_INDEX
            /*
            We will use a logger for what happens before and after the bot main loop.
            */
            VARIABLES_BY_PROCESS_INDEX = {
                LOGS_TO_DELETE_QUEUE: [],
                PROCESS_INSTANCE_LOGGER_MODULE_OBJECT: TS.projects.foundations.taskModules.debugLog.newFoundationsTaskModulesDebugLog(processIndex)
            }
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.set(processIndex, VARIABLES_BY_PROCESS_INDEX)
            /*  We will add the process id to its key so that it is unique and it can later be finalized. */
            TS.projects.foundations.globals.taskVariables.LOGGER_MAP.set('Pre-Bot-Main-Loop' + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].id, TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT)
            /*
            There are a few variables with the scope of the process instance. We will store it here so that it can be
            accessed from where it is needed.
            */
            VARIABLES_BY_PROCESS_INDEX = {
                MAIN_LOOP_COUNTER: 0,
                PROCESS_KEY:
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].name + '-' +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].type + '-' +
                    TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].id
            }
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.set(processIndex, VARIABLES_BY_PROCESS_INDEX)
            /*
            There are also a few constants at the process level. We initialize them here.
            */
            let CONSTANTS_BY_PROCESS_INDEX = {}
            TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.set(processIndex, CONSTANTS_BY_PROCESS_INDEX)
            /*
            We also need to initialize this here.
            */
            let MODULE_OBJECTS_BY_PROCESS_INDEX = {}
            TS.projects.foundations.globals.processModuleObjects.MODULE_OBJECTS_BY_PROCESS_INDEX_MAP.set(processIndex, MODULE_OBJECTS_BY_PROCESS_INDEX)
            /* 
            We will scan the project schema until we find the module that will run the bot
            associated to this process. Note that for being able to find the module that represents
            the bot type received via websockets events, at the PROJECTS SCHEMA a botModule must be 
            defined with the same type at the property botType.
            */
            for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
                let projectDefinition = PROJECTS_SCHEMA[i]
                if (projectDefinition.name !== TS.projects.foundations.globals.taskConstants.PROJECT_DEFINITION_NODE.config.codeName) { continue }
                for (let j = 0; j < projectDefinition.TS.botModules.length; j++) {
                    botModuleDefinition = projectDefinition.TS.botModules[j]
                    if (botModuleDefinition.botType === TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.type) {
                        try {
                            TS.projects.foundations.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED++
                            let project = TS.projects[projectDefinition.propertyName]
                            let botModule = project.botModules[botModuleDefinition.propertyName]
                            let moduleFunction = botModule[botModuleDefinition.functionName]
                            botModuleObject = moduleFunction(processIndex)
                            botModuleObject.initialize(onInitializeReady);
                        }
                        catch (err) {
                            console.log(logDisplace + "[ERROR] start -> err = " + err.stack);
                            setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                        }
                    }
                }
            }

            function onInitializeReady(err) {

                if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {

                    botModuleObject.run(whenRunFinishes);

                    function whenRunFinishes(err) {

                        TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).MAIN_LOOP_COUNTER = 0;

                        let botId = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.parentNode.config.codeName + "." + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.parentNode.config.codeName + "." + TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.processes[processIndex].referenceParent.config.codeName;

                        if (err.result === TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE.result) {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> onInitializeReady -> whenStartFinishes -> Bot execution finished successfully.");
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[INFO] start -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.persist()
                        } else {
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> err = " + err.message);
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Execution will be stopped. ");
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Bye.");
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> whenStartFinishes -> Bot Id = " + botId);

                            console.log(logDisplace + "Process Instance : [ERROR] start -> onInitializeReady -> whenStartFinishes -> Bot execution was aborted.");
                            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.persist()
                        }
                        setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                    }

                } else {
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> err = " + err.message);
                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] start -> onInitializeReady -> Bot will not be started. ");
                    console.log(logDisplace + "Process Instance : [ERROR] start -> onInitializeReady -> err = " + err.message);

                    TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).PROCESS_INSTANCE_LOGGER_MODULE_OBJECT.persist()
                    setTimeout(exitProcessInstance, WAIT_TIME_FOR_ALL_PROCESS_INSTANCES_TO_START)
                }
            }

            function exitProcessInstance() {
                TS.projects.foundations.globals.processVariables.ENDED_PROCESSES_COUNTER++

                if (TS.projects.foundations.globals.processVariables.ENDED_PROCESSES_COUNTER === TS.projects.foundations.globals.processVariables.TOTAL_PROCESS_INSTANCES_CREATED) {
                    TS.projects.foundations.functionLibraries.nodeJSFunctions.exitProcess()
                }
            }
        } catch (err) {
            console.log("[ERROR] Task Server -> " + TS.projects.foundations.globals.taskConstants.TASK_NODE.name + " -> Process Instance -> Start -> Err = " + err.stack);
        }
    }
}




