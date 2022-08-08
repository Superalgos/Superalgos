exports.newBitcoinFactoryBotModulesDashboardClient = function (processIndex) {

    const MODULE_NAME = "Dashboard-Client"
    const DASHBOARD_CLIENT_VERSION = 1

    let thisObject = {
        initialize: initialize,
        start: start
    }


    return thisObject

    function initialize(pStatusDependenciesModule, callBackFunction) {
        try {
            console.log((new Date()).toISOString(), 'Running Dashboard Client v.' + DASHBOARD_CLIENT_VERSION)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_OK_RESPONSE)
        } catch (err) {
            TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).UNEXPECTED_ERROR = err
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME,
                "[ERROR] initialize -> err = " + err.stack)
            callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_FAIL_RESPONSE)
        }
    }

    async function start(callBackFunction) {
        try {
            await getNextHistoricTestCaseReport()
                .then(onSuccess)
                .catch(onError)

            async function onSuccess(nextHistoricTestCaseReport) {
                console.log((new Date()).toISOString(), 'Dashboard will wait 10 minutes then run again.')
                await SA.projects.foundations.utilities.asyncFunctions.sleep(600000)
                start(callBackFunction)
            }

            async function onError(err) {
                console.log((new Date()).toISOString(), 'Operation Failed. Err:', err, 'Retrying in 30 seconds...')
                callBackFunction(TS.projects.foundations.globals.standardResponses.DEFAULT_RETRY_RESPONSE)
            }
        }
        catch (err) {
            console.log((new Date()).toISOString(), 'An error has occured in fetching our dashboard data.')
            TS.projects.foundations.globals.loggerVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).BOT_MAIN_LOOP_LOGGER_MODULE_OBJECT.write(MODULE_NAME, "[ERROR] run -> loop -> startProcessExecutionEvents -> onStarted -> Operation Failed. Aborting the process.");
            TS.projects.foundations.functionLibraries.processFunctions.stopProcess(processIndex, callBackFunction, nextLoopTimeoutHandle)
            return
        }
    }

    async function getNextHistoricTestCaseReport() {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {

            let message = {
                type: 'Get Next Historic Test Case Report'
            }

            let queryMessage = {
                messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                sender: 'Dashboard-Client',
                instance: TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.config.clientInstanceName,
                recipient: 'Network Node',
                message: message,
                testClientVersion: DASHBOARD_CLIENT_VERSION
            }

            let messageHeader = {
                requestType: 'Query',
                networkService: 'Machine Learning',
                queryMessage: JSON.stringify(queryMessage)
            }

            if (TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient === undefined) {
                reject('Not connected yet... Please hold on...')
                return
            }
            await TS.projects.foundations.globals.taskConstants.P2P_NETWORK.p2pNetworkClient.machineLearningNetworkServiceClient.sendMessage(messageHeader)
                .then(onSuccess)
                .catch(onError)
            async function onSuccess(response) {
                if (response.data.dashboardData === undefined) {
                    reject('There is a problem with the data at the network node.')
                    return
                }
                
                // If the data needed is defined we will save it.
                if (response.data.dashboardData !== undefined) {
                    let folder = response.data.dashboardData
                    let numberOfServers = folder.length
                    let pathData = response.data.folderHead

                    // Here we grab the name of the user running each server and set up our path.
                    for (let n = 0; n < numberOfServers; n++) {
                        let thisServer = folder[n]
                        let thisPathData = pathData[n]
                        let pathArray = thisPathData.split(',')
                        let pathHead = pathArray[0]
                        let reportFolder = []
                        let numOfServerReports = thisServer.length
                        
                        
                        for (let r = 0; r < numOfServerReports; r++) {
                            reportFolder = pathArray[r + 1]   
                            reportFile = thisServer[r]                         
                        
                        // Now we check if the file path exists and if not create it.
                        let basePath = global.env.PATH_TO_DATA_STORAGE
                        let project = 'Project'
                        let bf = 'Bitcoin-Factory'
                        let dashboard = 'Dashboard'
                        let serverFile = pathHead
                        let fileName = reportFolder
                        let pathToFile = basePath + '/' + project + '/' + bf + '/' + dashboard + '/' + serverFile + '/' + fileName
                        let pathExists = checkFiles(pathToFile)

                        // If the path exists we are ready to save.
                        if (pathExists !== true) {
                            console.log((new Date()).toISOString(), 'Something Is Wrong. A problem was encountered in creating the path to save the report file.')
                        }
                        SA.nodeModules.fs.writeFileSync(pathToFile, reportFile)
                        }
                        if ((n + 1) === numberOfServers) {
                            console.log((new Date()).toISOString(), 'Dashboard Data is up to date.')
                            resolve() 
                        }
                    }
                }
            }
            async function onError(err) {
                reject(err)
            }

            /*
            Function for verifying that all needed files are created.
            If a needed file is not available, we will create a new one.
            */
            function checkFiles(reportPath) {
                let localP = global.env.PATH_TO_DATA_STORAGE
                let localD = localP.length
                let reportPL = reportPath.length
                let workingPath = reportPath.slice(localD, reportPL)
                let thisPath = workingPath.split('/')

                let reportFolderMainPath = localP
                let reports = thisPath[1]
                let reportPathFolder = thisPath[2]
                let dashboardFolder = thisPath[3]
                let reportServerFolder = thisPath[4]
    
    
                if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports) !== true) {
                    filePath = reportFolderMainPath + '/' + reports
                    SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                }

                if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports + '/' + reportPathFolder) !== true) {
                    filePath = reportFolderMainPath + '/' + reports + '/' + reportPathFolder
                    SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                }

                if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + dashboardFolder) !== true) {
                    filePath = reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + dashboardFolder
                    SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                }

                if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + dashboardFolder + '/' + reportServerFolder) !== true) {
                    filePath = reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + dashboardFolder + '/' + reportServerFolder
                    SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
                }
                return true
            }

        }
    }
}
