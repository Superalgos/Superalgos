exports.newSocialTradingModulesStorage = function newSocialTradingModulesStorage() {
    /*
    This module represents the Social Graph Physical Storage.
    It is used to save the in-memory events and also to load
    them when the node is starting. 

    Each node has a github repository to store its social graph.                        TODO: Integrate this with Open Storage Project
    That Github repository can be used by any other node to get the history of          TODO: Build the mechanism to retrieve information form other node's storage
    events that can build the social graph.
    
    Each Network Node saves locally all unsaved events, every one minute,
    and after saving, pushes the changes to it's Github repo, which 
    acts as a backup of itself, and also for other new nodes to bootstrap
    their own copy of the social graph.
    */
    let thisObject = {
        p2pNetworkNode: undefined,
        p2pNetworkReachableNodes: undefined,
        openStorageClient: undefined,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {
        thisObject.p2pNetworkNode = undefined
        thisObject.p2pNetworkReachableNodes = undefined
        thisObject.openStorageClient = undefined
    }

    async function initialize(
        p2pNetworkNode,
        p2pNetworkReachableNodes
    ) {
        thisObject.p2pNetworkNode = p2pNetworkNode
        thisObject.p2pNetworkReachableNodes = p2pNetworkReachableNodes
        thisObject.openStorageClient = SA.projects.openStorage.modules.openStorageNetworkClient.newOpenStorageModulesOpenStorageNetworkClient()
        thisObject.openStorageClient.initialize()

        /*
        The strategy to synchronize this node with the rest of the network is like this:

        * First we will locate the most up-to-date node, download its events, and override
        the ones we might have, with those events.

        * Second we will load and apply to the social graph all these events.

        * Third we will run the service and start processing online events. We know  
        there might be a hole in the dataset caused by the download time.
        
        * Fourth to fill the hole in the dataset, we will repeat the previous process after
        5 minutes.
        */
        await syncronizeWithTheNetwork()
        setInterval(saveEventsAtStorage, 60 * 1000)
        setInterval(syncronizeWithTheNetwork, 5 * 60 * 1000)

        async function syncronizeWithTheNetwork() {
            await syncronizeOurStorageWithAnUpToDateNode()
            await loadEventsFromStorageAndApplyThemToTheSocialGraph()
        }

        async function syncronizeOurStorageWithAnUpToDateNode() {
            SA.logger.info("Synchronizing storage")
            /*
            Our mission here is to update this node storage and to do that we need to
            know which is the single node that has the most complete history. Note
            that that node could be ourselves.
            */
            let p2pNetworkNodeMostUpToDate
            let maxDataRangeEnd = 0
            /*
            Check if we have the Data Range file, to know how up-to-date this node is.
            */
            const fileName = "Data.Range" + ".json"
            let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName + '/'
            let fileContent
            try {
                fileContent = SA.nodeModules.fs.readFileSync(filePath + '/' + fileName)
                let fileObject = JSON.parse(fileContent)
                p2pNetworkNodeMostUpToDate = thisObject.p2pNetworkNode
                maxDataRangeEnd = fileObject.end
            } catch (err) {
                // This means the file does not exist.
            }

            SA.logger.info("MOST UP TO DATE NETWORK NODE = " + p2pNetworkNodeMostUpToDate)

            for (let i = 0; i < p2pNetworkReachableNodes.p2pNodesToConnect.length; i++) {
                let p2pNetworkNode = p2pNetworkReachableNodes.p2pNodesToConnect[i]
                let p2pNetworkNodeCodeName = p2pNetworkNode.node.config.codeName
                let userProfileCodeName = p2pNetworkNode.userProfile.config.codeName
                let dataRangeFile = await loadFileFromGithubRepository('Data.Range', '/Nodes/' + p2pNetworkNodeCodeName, userProfileCodeName)
                SA.logger.info(userProfileCodeName)
                /*
                 * Searching for the node that is most up-to-date
                 */
                SA.logger.info("IS DATA RANGE FILE UNDEFINED? " + dataRangeFile)
                if (dataRangeFile !== undefined) {
                    if (maxDataRangeEnd < dataRangeFile.end) {
                        maxDataRangeEnd = dataRangeFile.end
                        p2pNetworkNodeMostUpToDate = p2pNetworkNode
                    }
                }
            }
            /*
             * We can not continue if we cannot identify the most up to date node.
             */
            SA.logger.info("MOST UP TO DATE NETWORK NODE #2 = " + p2pNetworkNodeMostUpToDate)
            if (p2pNetworkNodeMostUpToDate === undefined){
                return
            }
            /*
            We will check that the node most up-to-date is not ourselves.
            */
            if (p2pNetworkNodeMostUpToDate.node.id === thisObject.p2pNetworkNode.node.id) {
                /*
                 * There is no need to update ourselves from some other node because no other
                 * is more up-to-date than ourselves.
                 */
                SA.logger.info("WE ARE THE MOST UP TO DATE NETWORK NODE")
                return
            }
            /*
             * We will use the node with the most recent history.
             */
            let p2pNetworkNodeCodeName = p2pNetworkNodeMostUpToDate.node.config.codeName
            let userProfileCodeName = p2pNetworkNodeMostUpToDate.userProfile.config.codeName
            SA.logger.info("USER PROFILE MOST UPDATED = " + userProfileCodeName)
            await cloneNetworkNodeRepo(userProfileCodeName)
            await transferFilesFromClonnedRepo(p2pNetworkNodeCodeName)
            deleteTemporaryFiles()

            async function loadFileFromGithubRepository(fileName, filePath, owner) {

                SA.logger.info("Loading files from Github repo")

                const completePath = filePath + '/' + fileName + '.json'
                const repo = 'My-Network-Nodes-Data'
                const branch = 'main'
                const URL = "https://raw.githubusercontent.com/" + owner + "/" + repo + "/" + branch + "/" + completePath
                /*
                This function helps a caller to use await syntax while the called
                function uses callbacks, specifically for retrieving files.
                */
                let promise = new Promise((resolve, reject) => {

                    const axios = SA.nodeModules.axios
                    axios
                        .get(URL)
                        .then(res => {
                            resolve(res.data)
                        })
                        .catch(error => {
                            resolve()
                        })
                })

                return promise
            }

            async function cloneNetworkNodeRepo(username) {

                SA.logger.info("Cloning " + username + "'s repo!")

                return new Promise(promiseWork)

                async function promiseWork(resolve, reject) {
                    const repo = 'My-Network-Nodes-Data'
                    const {exec} = require("child_process")
                    const path = require("path")

                    deleteTemporaryFiles()

                    SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync('./Temp/')

                    let repoURL = 'https://github.com/' + username + '/' + repo

                    exec('git clone ' + repoURL,
                        {
                            cwd: path.join('./Temp')
                        },
                        async function (error) {
                            if (error) {
                                SA.logger.error('')
                                SA.logger.error("There was an error cloning " + username + "'s Network node repo. " + repoURL);
                                SA.logger.error('')
                                SA.logger.error(error)
                                throw (error)
                            } else {
                                SA.logger.info("Cloning "+ username +"'s repo @ " + repoURL + "was successful.")
                                resolve()
                            }
                        })
                }
            }

            async function transferFilesFromClonnedRepo(p2pNetworkNodeCodeName) {
                const path = require("path")
                const repo = 'My-Network-Nodes-Data'
                SA.logger.info("Transferring from cloned repo!")

                let originPath = path.join('./Temp', repo, 'Nodes', p2pNetworkNodeCodeName)
                let targetPath = path.join(repo, 'Nodes', thisObject.p2pNetworkNode.node.config.codeName)
                await transferFiles()

                async function transferFiles() {
                    return new Promise(promiseWork)

                    async function promiseWork(resolve, reject) {

                        SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories(originPath + '/', onFiles)

                        function onFiles(fileList) {
                            for (let i = 0; i < fileList.length; i++) {
                                let originFilePath = originPath + '/' + fileList[i]
                                let fileContent = SA.nodeModules.fs.readFileSync(originFilePath)
                                let targetFilePath = targetPath + '\\' + fileList[i]
                                let targeDirPath = targetFilePath.replace('Events.json', '')
                                for (let k = 0; k < 10; k++) {
                                    targeDirPath = targeDirPath.replace('\\', '/')
                                }
                                SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(targeDirPath)
                                SA.nodeModules.fs.writeFileSync(targetFilePath, fileContent)
                            }
                            resolve()
                        }
                    }
                }
            }

            function deleteTemporaryFiles() {
                try {
                    SA.nodeModules.fs.rmSync('./Temp/', {recursive: true})
                } catch (err) {
                    /*
                    not a big deal.
                    */
                }
            }
        }

        async function loadEventsFromStorageAndApplyThemToTheSocialGraph() {
            SA.logger.info("Loading events to apply to social graph!");
            return new Promise(promiseWork);
        
            function promiseWork(resolve, reject) {
                const baseDirectory = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName + '/';
                getAllFilesInDirectoryAndSubdirectories(baseDirectory, onFiles);

                async function onFiles(fileList) {
                    for (let i = 0; i < fileList.length; i++) {
                        const filePath = fileList[i];
                        SA.logger.info("Load events filePath = " + filePath);
        
                        try {
                            const fileContent = await SA.nodeModules.fs.promises.readFile(filePath);
                            
                            if (fileContent.length === 0 || fileContent === '[]') {
                                SA.logger.info("Empty file. Skipping..." + filePath );
                                continue;
                            }

                            const eventsList = JSON.parse(fileContent);
        
                            console.table(eventsList);
        
                            for (let j = 0; j < eventsList.length; j++) {
                                const storedEvent = eventsList[j];
                                
                                SA.logger.info("Stored Event = " + storedEvent );
                                
                                try {
                                    const event = NT.projects.socialTrading.modules.event.newSocialTradingModulesEvent();
                                    event.initialize(storedEvent);
        
                                    SA.logger.info("EVENT = " + event );
        
                                    if (SA.projects.socialTrading.globals.memory.maps.EVENTS.get(storedEvent.eventId) === undefined) {
                                        event.run();
        
                                        SA.projects.socialTrading.globals.memory.maps.EVENTS.set(storedEvent.eventId, event);
                                        SA.projects.socialTrading.globals.memory.arrays.EVENTS.push(event);
                                    }
                                } catch (err) {
                                    if (err.stack !== undefined) {
                                        SA.logger.error('Client Interface -> err.stack = ' + err.stack);
                                    }
                                    let errorMessage = err.message;
                                    if (errorMessage === undefined) {
                                        errorMessage = err;
                                    }
                                    SA.logger.error('Could not apply the event from storage. -> errorMessage = ' + errorMessage + ' -> event.id = ' + storedEvent.eventId);
                                    continue;
                                }
                            }
                        } catch (err) {
                            if (err.stack !== undefined) {
                                SA.logger.error('Client Interface -> err.stack = ' + err.stack);
                            }
                            let errorMessage = err.message;
                            if (errorMessage === undefined) {
                                errorMessage = err;
                            }
                            SA.logger.error('Could not read file. -> errorMessage = ' + errorMessage + ' -> filePath = ' + filePath);
                            continue;
                        }
                    }
        
                    resolve();
                }
            }
        }
        
        function getAllFilesInDirectoryAndSubdirectories(dir, callback) {
            const { promisify } = SA.nodeModules.util;
            const { resolve } = SA.nodeModules.path;
            const fs = SA.nodeModules.fs;
            const readdir = promisify(fs.readdir);
            const stat = promisify(fs.stat);
        
            getFiles(dir)
                .then(files => {
                    const pathAndNames = files.map(file => resolve(dir, file));
                    callback(pathAndNames);
                })
                .catch(e => {
                    callback([]);
                });
        
            async function getFiles(dir) {
                const subdirs = await readdir(dir);
                const files = await Promise.all(subdirs.map(async (subdir) => {
                    const res = resolve(dir, subdir);
                    return (await stat(res)).isDirectory() ? getFiles(res) : res;
                }));
                return files.reduce((a, f) => a.concat(f), []);
            }
        }
    }

    async function saveEventsAtStorage() {
        SA.logger.debug('Saving events at storage!')
        await saveOneMinuteOfEvents()

        function saveOneMinuteOfEvents() {
            /*
            Here we will save all the events that were not saved before,
            in one minute batched files.
            */
            let lastMinute = Math.trunc((new Date()).valueOf() / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS) - 1
            let eventsToSaveByTimestamp = {}
    
            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {

                for (let i = 0; i < SA.projects.socialTrading.globals.memory.arrays.EVENTS_TO_SAVE.length; i++) {
                    let event = SA.projects.socialTrading.globals.memory.arrays.EVENTS_TO_SAVE[i]
                    /*
                    We will save all events that have not been saved yet.
                    */
                    let eventToSave = {
                        eventId: event.eventId,
                        eventType: event.eventType,
                        originSocialPersonaId: event.originSocialPersonaId,
                        targetSocialPersonaId: event.targetSocialPersonaId,
                        originSocialTradingBotId: event.originSocialTradingBotId,
                        targetSocialTradingBotId: event.targetSocialTradingBotId,
                        originPostHash: event.originPostHash,
                        targetPostHash: event.targetPostHash,
                        timestamp: event.timestamp,
                        fileKeys: event.fileKeys,
                        botAsset: event.botAsset,
                        botExchange: event.botExchange,
                        botEnabled: event.botEnabled
                    }

                    
                    SA.logger.info("Timestamp = " + event.timestamp)
                    SA.logger.info("Event to save = " + JSON.stringify(eventToSave))
                    

                    if (event.timestamp in eventsToSaveByTimestamp) {
                        // If timestamp exists then we add this event to the timestamp's array
                        eventsToSaveByTimestamp[event.timestamp].push(eventToSave)
                    } else {
                        // This timestamp does not have any other events associated with it so we will make a new entry
                        eventsToSaveByTimestamp[event.timestamp] = [eventToSave]
                    }
                }

                // Empty que of events needing saved
                SA.projects.socialTrading.globals.memory.arrays.EVENTS_TO_SAVE.splice(0, SA.projects.socialTrading.globals.memory.arrays.EVENTS_TO_SAVE.length)

                saveEventsFile(eventsToSaveByTimestamp)
                

                function saveEventsFile(eventsToSaveByTimestamp) {
                    for (let timestamp in eventsToSaveByTimestamp) {
                        let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName + '/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(Number(timestamp))
                        let openStorageFilePath =  "./Nodes/" + thisObject.p2pNetworkNode.node.config.codeName + '/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(Number(timestamp))
                        let eventsToSave = eventsToSaveByTimestamp[timestamp]
                        const fileContent = JSON.stringify(eventsToSave, undefined, 4)
                        const fileName = "Events" + ".json"

                        try {
                            SA.logger.info('Are we saving to an old file? ' + SA.nodeModules.fs.existsSync(filePath))
                            if ( SA.nodeModules.fs.existsSync(filePath) /*check if timestamp already has a file*/ ) {
                                // If the path exists then we load the old file and append new events
                                if (eventsToSave.length !== 0) { 
                                    // Load and merge events
                                    let storedContent = SA.nodeModules.fs.readFileSync(filePath + '/' + fileName)
    
                                    let eventsList = JSON.parse(storedContent)
                                    let joinedEventsArray = eventsList.concat(eventsToSave)
                                    const updatedFileContent = JSON.stringify(joinedEventsArray, undefined, 4)

                                    // Save Events locally           
                                    SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, updatedFileContent)
                                    SA.logger.info("Local Events file path = " + filePath + '/' + fileName )
                                                                        
                                    SA.logger.info("Open Storage Event file path = " + openStorageFilePath + '/' + fileName )
                                    
                                    // Save Events in Open Storage
                                    thisObject.openStorageClient.persistSocialGraph(openStorageFilePath, fileName, updatedFileContent)

                                    saveDataRangeFile()
                                }       
                            } else {
                                // Create a new file for this timestamp
                                if (eventsToSave.length !== 0) { 
                                    // Save Events locally                    
                                    SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
                                    SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, fileContent)
                                   
                                    SA.logger.info("Made Open Storage Event file directory = " + openStorageFilePath + '/' + fileName )
                                    
                                    // Save Events in Open Storage
                                    thisObject.openStorageClient.persistSocialGraph(openStorageFilePath, fileName, fileContent)
                                    
                                    SA.logger.info("Github Event file path = " + openStorageFilePath + '/' + fileName )

                                    saveDataRangeFile()
                                }
                            }
                        } catch (error) {
                            // Add unsaved events back to queue
                            SA.projects.socialTrading.globals.memory.arrays.EVENTS_TO_SAVE.push(eventsToSave)
                            SA.logger.error("Something went wrong while saving event:")
                            SA.logger.error(error)
                            continue
                        }
                    }
                }

                function saveDataRangeFile() {
                    const dataRange = {
                        begin: 0,
                        end: 0
                    }
                    let firstEvent = SA.projects.socialTrading.globals.memory.arrays.EVENTS[0]
                    if (firstEvent !== undefined) {
                        dataRange.begin = Math.trunc(firstEvent.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS) * SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS
                        dataRange.end = lastMinute * SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS
                    } else {
                        return
                    }

                    try {
                        const fileContent = JSON.stringify(dataRange, undefined, 4)
                        const fileName = "Data.Range" + ".json"

                        let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName
                        let openStorageFilePath = './Nodes/' + thisObject.p2pNetworkNode.node.config.codeName 

                        SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
                        SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, fileContent)
                        SA.logger.info("Local DataRange file path = " + filePath + '/' + fileName )
                        // Save data range file in open storage
                        thisObject.openStorageClient.persistSocialGraph(openStorageFilePath, fileName, fileContent)
                        SA.logger.info("Github DataRange file path = " + openStorageFilePath + '/' + fileName )
                    } catch (error) {
                        SA.logger.error("Something went wrong while saving Data Range file:")
                        SA.logger.error(error)
                    }
                    resolve()
                }
            }
        }
    }
}
