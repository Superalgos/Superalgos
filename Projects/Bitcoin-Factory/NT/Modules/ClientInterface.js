exports.newBitcoinFactoryModulesClientInterface = function newBitcoinFactoryModulesClientInterface() {
    /*
    This module represents the Interface the Machine Learning Network Service have 
    with Network Clients connected to it. 

    */
    let thisObject = {
        messageReceived: messageReceived,
        getStats: getStats,
        initialize: initialize,
        finalize: finalize
    }


    let queryMemories = new Map()
    let requestsToServer = []
    let responseFunctions = new Map()
    let statsByNetworkClients = new Map()
    let stats = {

    }

    return thisObject

    function finalize() {

    }

    async function initialize() {

    }

    async function messageReceived(
        messageHeader,
        userProfile,
        connectedUserProfiles
    ) {

        let connectedUserProfilesLabel = SA.projects.foundations.utilities.miscellaneousFunctions.pad(connectedUserProfiles.length, 3) + ' / ' + global.env.P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS
        if (messageHeader.requestType === undefined) {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Provided.'
            }
            return response
        }

        if (messageHeader.requestType !== 'Query') {
            let response = {
                result: 'Error',
                message: 'Client Interface requestType Not Supported.'
            }
            return response
        }

        switch (messageHeader.requestType) {
            case 'Query': {
                return await queryReceived(
                    messageHeader.queryMessage,
                    userProfile
                )
            }
        }
        async function queryReceived(
            queryMessage,
            userProfile
        ) {
            /*
     
            */
            let queryReceived
            try {
                queryReceived = JSON.parse(queryMessage)
            } catch (err) {
                let response = {
                    result: 'Error',
                    message: 'Client Interface queryMessage Not Correct JSON Format.'
                }
                return response
            }

            /* If the queryReceived is the correct format we hold a copy in memory for 10 min before saving to file. */
            if (queryReceived.sender === 'Test-Server' && queryReceived.response !== undefined) {
            let currentTimestamp = (new Date()).valueOf()
            let thisQueryReceived = queryReceived

            // Then we create a key for the map that holds the query messages in memory.
            let queryMemoryKeys = currentTimestamp
            queryMemory = queryMemories.get(queryMemoryKeys)
            if (queryMemory === undefined) {
                queryMemory = thisQueryReceived
                queryMemories.set(queryMemoryKeys, queryMemory)
            } else {
                    queryMemories.set(queryMemoryKeys, thisQueryReceived)
            }
            /* Finally we check our memory and remove any file that is older then 10 min. */
            isMemoryOld()

            
            function isMemoryOld() {
                let timestamp = (new Date()).valueOf()
                let oldestTimestamp = timestamp - 600000
                for (let [key, value] of queryMemories.entries()) {
                    /*
                        If value.response.files is defined it is the server sending a message.
                        If it is undefined it is the client responding with the message.
                    */
                    if (key < oldestTimestamp && value.response.files !== undefined) {

                        // Here we prepare our path to the file we are about to save.  
                        let basePath = global.env.PATH_TO_DATA_STORAGE
                        let project = 'Project'
                        let bf = 'Bitcoin-Factory'
                        let node = 'NetworkNode-ServerData'
                        let serverFile = value.userProfile
                        let fileName = value.instance
                        let extension = '.JSON'
                        let pathToFile = basePath + '/' + project + '/' + bf + '/' + node + '/' + serverFile + '/' + fileName + extension

                        // Here we make sure our path exists and if not create it.
                        checkFiles(pathToFile)

                        /* 
                            Here we prepare the file we are about to save. 
                            First we shorten our timeSeries data down to startStamp and endStamp.
                        */ 
                        let thisRecord = value
                        let thisTimeSeries = thisRecord.response.files.timeSeries.split('\r\n')
                        let l = thisTimeSeries.length - 2
                        let firstTimeSeries = thisTimeSeries[1]
                        let lastTimeSeries = thisTimeSeries[l]

                        // We create a Json object to hold our begin and end records.
                        let thisTimeSeriesRecord = {
                            Begin: firstTimeSeries,
                            End: lastTimeSeries
                        }

                        // We remove the old timeSeries data and replace it with the new data.
                        thisRecord.response.files.timeSeries = []
                        thisRecord.response.files.timeSeries.push(thisTimeSeriesRecord)

                        // Then we remove our parameters record because it already exists in the file.
                        thisRecord.response.files.parameters = []

                        let thisFileSave = JSON.stringify(thisRecord, null, 2)
                        SA.nodeModules.fs.writeFileSync(pathToFile, thisFileSave + ',' + '\n', {'flag':'a'})

                        // Finally we remove the test case from memory.
                        queryMemories.delete(key)
                    }

                    // Here we handle the situation for the response form the client.
                    if (key < oldestTimestamp && value.response.files === undefined) {
                        let thisRecord = value

                         // Here we prepare our path to the file we are about to save.  
                         let basePath = global.env.PATH_TO_DATA_STORAGE
                         let project = 'Project'
                         let bf = 'Bitcoin-Factory'
                         let node = 'NetworkNode-ServerData'
                         let serverFile = value.userProfile
                         let fileName = value.instance
                         let extension = '.JSON'
                         let pathToFile = basePath + '/' + project + '/' + bf + '/' + node + '/' + serverFile + '/' + fileName + extension
 
                         // Here we make sure our path exists and if not create it.
                         checkFiles(pathToFile)

                         // Here we change our response into a more readable format.
                         let thisRecordResponse = thisRecord.response.split(',')
                         thisRecord.response = thisRecordResponse

                         // Here we stringify and save out record.
                        let thisFileSave = JSON.stringify(thisRecord, null, 2)
                        SA.nodeModules.fs.writeFileSync(pathToFile, thisFileSave + ',' + '\n', {'flag':'a'})

                        // Finally we remove the test case from memory.
                        queryMemories.delete(key)
                    }
                }
            }
            }                


        switch (queryReceived.sender) {
            case 'Test-Client': {
                queryReceived.userProfile = userProfile.name
                return await testClientMessage(queryReceived, userProfile.name)
            }
            case 'Forecast-Client': {
                queryReceived.userProfile = userProfile.name
                return await forecastClientMessage(queryReceived, userProfile.name)
            }
            case 'Test-Server': {
                queryReceived.userProfile = userProfile.name
                return await testServerMessage(queryReceived, userProfile.name)
            }
            case 'Dashboard-Client': {
                queryReceived.userProfile = userProfile.name
                return await dashboardClientMessage(queryReceived, userProfile.name)
            }
        }
     }
     
        async function testClientMessage(queryReceived, userProfile) {
            /*
            Process the Request
            */
            let requestToServer = {
                queryReceived: queryReceived,
                timestamp: (new Date()).valueOf()
            }
            let testClientVersion = queryReceived.testClientVersion
            if (testClientVersion === undefined) { testClientVersion = 4 }
            requestsToServer.push(requestToServer)
            console.log((new Date()).toISOString(), '[INFO] Request From Test Client v.' + testClientVersion +
                '                 -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                ' -> userProfile = ' + userProfile +
                ' -> instance = ' + queryReceived.instance)

            /*
            Update the Statistics
            */
            let networkClientKey = queryReceived.sender + '/' + userProfile + '/' + queryReceived.instance
            statsByNetworkClient = statsByNetworkClients.get(networkClientKey)
            if (statsByNetworkClient === undefined) {
                statsByNetworkClient = {
                    userProfile: userProfile,
                    instance: queryReceived.instance,
                    type: queryReceived.sender,
                    clientVersion: queryReceived.testClientVersion,
                    requestsCount: 0,
                    responsesCount: 0,
                    requestNextTestCaseCount: 0,
                    lastSeen: 0
                }
            }
            if (queryReceived.message.type === "Get Next Test Case") {
                statsByNetworkClient.requestNextTestCaseCount++
            }
            statsByNetworkClient.requestsCount++
            statsByNetworkClient.lastSeen = (new Date()).valueOf()
            statsByNetworkClients.set(networkClientKey, statsByNetworkClient)

            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                responseFunctions.set(queryReceived.messageId, onResponseFromServer)
                function onResponseFromServer(queryReceived) {
                    /*
                    Process the Response
                    */
                    let response = {
                        result: 'Ok',
                        message: 'Server Responded.',
                        serverData: queryReceived
                    }
                    /*
                    Update the Statistics
                    */
                    statsByNetworkClient = statsByNetworkClients.get(networkClientKey)
                    statsByNetworkClient.responsesCount++
                    statsByNetworkClient.lastSeen = (new Date()).valueOf()
                    resolve(response)
                }
            }
        }

        async function forecastClientMessage(queryReceived, userProfile) {
            let requestToServer = {
                queryReceived: queryReceived,
                timestamp: (new Date()).valueOf()
            }
            let forecastClientVersion = queryReceived.testClientVersion
            if (forecastClientVersion === undefined) { forecastClientVersion = 1 }
            requestsToServer.push(requestToServer)
            console.log((new Date()).toISOString(), '[INFO] Request From Forecast Client v.' + forecastClientVersion +
                '             -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                ' -> userProfile = ' + userProfile +
                ' -> instance = ' + queryReceived.instance)
            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                responseFunctions.set(queryReceived.messageId, onResponseFromServer)
                function onResponseFromServer(queryReceived) {
                    let response = {
                        result: 'Ok',
                        message: 'Server Responded.',
                        serverData: queryReceived
                    }
                    resolve(response)
                }
            }
        }

        async function testServerMessage(queryReceived, userProfile) {
            if (queryReceived.messageId !== undefined) {
                let onResponseFromServer = responseFunctions.get(queryReceived.messageId)
                onResponseFromServer(queryReceived)
                responseFunctions.delete(queryReceived.messageId)
            }
            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                if (requestsToServer.length === 0) {
                    let response = {
                        result: 'Ok',
                        message: 'No Requests at the Moment.'
                    }
                    resolve(response)
                    return
                } else {
                    /*
                    First we will try to find a request sent specifically to the Test Server Instance sending this message.
                    If there is none, we will give it a generic request.
                    */
                    for (let i = 0; i < requestsToServer.length; i++) {
                        let requestToServer = requestsToServer[i]
                        if (
                            requestToServer.testServer !== undefined &&
                            requestToServer.testServer.userProfile === userProfile &&
                            requestToServer.testServer.instance === queryReceived.instance
                        ) {
                            requestsToServer.splice(i, 1)
                            checkExpiration(requestToServer)
                            return
                        }
                    }
                    /*
                    There are not request specific for this Test Server Instance, so we can assing the next generic one.
                    */
                    for (let i = 0; i < requestsToServer.length; i++) {
                        let requestToServer = requestsToServer[i]
                        if (
                            requestToServer.testServer === undefined
                        ) {
                            requestsToServer.splice(i, 1)
                            checkExpiration(requestToServer)
                            return
                        }
                    }
                    /*
                    For this Test Server Instance there are no requests at all.
                    */
                    let response = {
                        result: 'Ok',
                        message: 'No Requests at the Moment.'
                    }
                    resolve(response)
                    return

                    function checkExpiration(requestToServer) {
                        let now = (new Date()).valueOf()
                        if (now - requestToServer.timestamp < 2 * 60 * 1000) {
                            let response = {
                                result: 'Ok',
                                message: 'Request Found.',
                                clientData: JSON.stringify(requestToServer.queryReceived)
                            }

                            console.log((new Date()).toISOString(), '[INFO] Request Sent to Server                       -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                                ' -> userProfile = ' + userProfile +
                                ' -> instance = ' + queryReceived.instance)
                            resolve(response)
                        } else {
                            console.log((new Date()).toISOString(), '[WARN] Request Expired                              -> timestamp = ' + (new Date(requestToServer.timestamp)).toISOString() +
                                ' -> Websockets Clients = ' + connectedUserProfilesLabel +
                                ' -> Clients Requests Queue Size = ' + SA.projects.foundations.utilities.miscellaneousFunctions.pad(requestsToServer.length, 3) +
                                ' -> userProfile = ' + userProfile +
                                ' -> instance = ' + queryReceived.instance +
                                ' -> requestToServer.queryReceived = ' + JSON.stringify(requestToServer.queryReceived))
                            let response = {
                                result: 'Ok',
                                message: 'Next Request Already Expired.'
                            }

                            responseFunctions.delete(requestToServer.queryReceived.messageId)
                            resolve(response)
                        }
                    }
                }
            }
        }

        /* Here we handle all messages from the dashboard */
        async function dashboardClientMessage(queryReceived, userProfile) {
            let requestToDashboard = {
                queryReceived: queryReceived,
                timestamp: (new Date()).valueOf()
            }

            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {
                    /*
                        We will respond with all the historic test case data on file.
                    */
                    dashboardResponseController()

                    // Here is the controller for the dashboard response.
                function dashboardResponseController() {
                    let path = getBasePath()
                    checkFiles(path)
                    let historicReportFolder = getHistoricReportFolder(path)
                    
                    if (historicReportFolder.length === 1 && historicReportFolder[0] === 'undefined') {
                        return
                    }

                    let numberOfReports = historicReportFolder.length
                    buildResponse(historicReportFolder, numberOfReports, path)
                }


                function getBasePath() {
                    let basePath = global.env.PATH_TO_DATA_STORAGE
                    let project = 'Project'
                    let bf = 'Bitcoin-Factory'
                    let node = 'NetworkNode-ServerData'
                    let path = basePath + '/' + project + '/' + bf + '/' + node
                    return path
                }


                function getHistoricReportFolder(path) {
                    let thisFolder = SA.nodeModules.fs.readdirSync(path)     
                        return thisFolder
                }


                function buildResponse(historicReportFolder, numberOfReports, path) {
                    let responseMessageArray = [] 
                    let folderHeadArray = []
                    
                    let numberOfServers = numberOfReports
                    for (let count = 0; count < numberOfReports; count++) {
                        let folder = historicReportFolder[count]
                        let folderHead = folder
                        let folderPath = path + '/' + folder
                        let thisFolder = getHistoricReportFolder(folderPath)
                        let numOfFiles = thisFolder.length
                        let serverFile = []
                        let folderArray = []
                        for (let fileCount = 0; fileCount < numOfFiles; fileCount++) {
                            let filePath = path + '/' + folder + '/' + thisFolder[fileCount]
                            folderArray.push(thisFolder[fileCount])
                            let file = SA.nodeModules.fs.readFileSync(filePath, {encoding:'utf8', flag:'r'})
                            serverFile.push(file)
                        } 
                        responseMessageArray.push(serverFile)
                        folderHeadArray.push(folderHead + ',' + folderArray)

                    }
                    let response = {
                        result: 'Ok',
                        message: 'Network Node Responded.',
                        numberOfServers: numberOfServers,
                        folderHead: folderHeadArray,
                        dashboardData: responseMessageArray
                    }
                    resolve(response)
                }

            }
        }
    }

    function getStats() {
        let response = {
            networkNode: {
                messageQueueSize: requestsToServer.length
            },
            networkClients: Array.from(statsByNetworkClients)
        }
        return response
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
        let networkNodeServerDataFolder = thisPath[3]
        let reportServerFolder = thisPath[4]
    
    
        if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports) !== true) {
            filePath = reportFolderMainPath + '/' + reports
            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        }

        if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports + '/' + reportPathFolder) !== true) {
            filePath = reportFolderMainPath + '/' + reports + '/' + reportPathFolder
            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        }

        if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + networkNodeServerDataFolder) !== true) {
            filePath = reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + networkNodeServerDataFolder
            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        }

        if (SA.nodeModules.fs.existsSync(reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + reportServerFolder) !== true) {
            filePath = reportFolderMainPath + '/' + reports + '/' + reportPathFolder + '/' + networkNodeServerDataFolder + '/' + reportServerFolder
            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(filePath)
        }
    }
}
