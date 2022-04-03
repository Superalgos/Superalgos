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
        initialize: initialize,
        finalize: finalize
    }

    let indexLastSavedEvent = -1
    let gitCommandRunning = false

    return thisObject

    function finalize() {
        thisObject.p2pNetworkNode = undefined
    }

    async function initialize(
        p2pNetworkNode,
        p2pNetworkReachableNodes
    ) {
        thisObject.p2pNetworkNode = p2pNetworkNode
        /*
        The strategy to syncronize this node with the rest of the network is like this:

        * First we will locate the most up to date node, download its events, and override
        the ones we might have, with those events.

        * Second we will load and apply to the social graph all these events.

        * Third we will run the service and start processing online events. We know that 
        there might be a hole on the dataset caused by the download time.
        
        * Fourth to fill the hole in the dataset, we will repeat the previous process after
        5 minutes.
        */
        await syncronizeWithTheNetwork()
        setInterval(saveEventsAtStorage, 60 * 1000)
        setTimeout(syncronizeWithTheNetwork, 5 * 60 * 1000)

        async function syncronizeWithTheNetwork() {
            await syncronizeOurStorageWithAnUpToDateNode()
            await loadEventsFromStorageAndApplyThemToTheSocialGraph()
        }

        async function syncronizeOurStorageWithAnUpToDateNode() {
            /*
            Our mission here is to update this node storage and to do that we need to
            know which is the single node that has the most complete history. Note
            that that node could be ourselves.
            */
            let p2pNetworkNodeMostUpToDate
            let maxDataRangeEnd = 0
            /*
            Check if we have the Data Range file, to know how up to date is this node.
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

            for (let i = 0; i < p2pNetworkReachableNodes.p2pNodesToConnect.length; i++) {
                let p2pNetworkNode = p2pNetworkReachableNodes.p2pNodesToConnect[i]
                let p2pNetworkNodeCodeName = p2pNetworkNode.node.config.codeName
                let userProfileCodeName = p2pNetworkNode.userProfile.config.codeName
                let dataRangeFile = await loadFileFromGithubRepository('Data.Range', '/Nodes/' + p2pNetworkNodeCodeName, userProfileCodeName)
                /*
                Searching for the node that is most up-to-date
                */
                if (dataRangeFile !== undefined) {
                    if (maxDataRangeEnd < dataRangeFile.end) {
                        maxDataRangeEnd = dataRangeFile.end
                        p2pNetworkNodeMostUpToDate = p2pNetworkNode
                    }
                }
            }
            /*
            We will check that the node most up to date is not ourselves.
            */
            if (p2pNetworkNodeMostUpToDate.node.id === thisObject.p2pNetworkNode.node.id) {
                /*
                There is no need to update ourselves from some other node, because no other
                is more up to date than ourselves.
                */
                return
            }
            /*
            We will use the node with the most recent history.
            */
            let p2pNetworkNodeCodeName = p2pNetworkNodeMostUpToDate.node.config.codeName
            let userProfileCodeName = p2pNetworkNodeMostUpToDate.userProfile.config.codeName
            await cloneNetworkNodeRepo(userProfileCodeName)
            await transferFilesFromClonnedRepo(p2pNetworkNodeCodeName)
            deleteTemporaryFiles()

            async function loadFileFromGithubRepository(fileName, filePath, owner) {

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
                                console.log('')
                                console.log("[ERROR] There was an error clonning this Network node repo. " + repoURL);
                                console.log('')
                                console.log(error)
                                throw (error)
                            } else {
                                console.log('[INFO] Clonning repo ' + repoURL + ' succeed.')
                                resolve()
                            }
                        })
                }
            }

            async function transferFilesFromClonnedRepo(p2pNetworkNodeCodeName) {
                const path = require("path")
                const repo = 'My-Network-Nodes-Data'

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

            return new Promise(promiseWork)

            function promiseWork(resolve, reject) {

                SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories('./My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName + '/', onFiles)

                function onFiles(fileList) {

                    for (let i = 0; i < fileList.length; i++) {
                        let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName + '/' + fileList[i]

                        for (let k = 0; k < 5; k++) {
                            filePath = filePath.replace('\\', '/')
                        }

                        let fileContent = SA.nodeModules.fs.readFileSync(filePath)

                        let eventsList = JSON.parse(fileContent)

                        for (let j = 0; j < eventsList.length; j++) {
                            let storedEvent = eventsList[j]

                            try {
                                let event = NT.projects.socialTrading.modules.event.newSocialTradingModulesEvent()
                                event.initialize(storedEvent)

                                if (SA.projects.socialTrading.globals.memory.maps.EVENTS.get(storedEvent.eventId) === undefined) {
                                    event.run()

                                    SA.projects.socialTrading.globals.memory.maps.EVENTS.set(storedEvent.eventId, event)
                                    SA.projects.socialTrading.globals.memory.arrays.EVENTS.push(event)
                                    indexLastSavedEvent = SA.projects.socialTrading.globals.memory.arrays.EVENTS.length - 1
                                }

                            } catch (err) {
                                if (err.stack !== undefined) {
                                    console.log('[ERROR] Client Interface -> err.stack = ' + err.stack)
                                }
                                let errorMessage = err.message
                                if (errorMessage === undefined) {
                                    errorMessage = err
                                }
                                console.log('Could not apply the event from storage. -> errorMessage = ' + errorMessage + ' -> event.id = ' + event.id)
                            }
                        }
                    }
                    resolve()
                }
            }
        }
    }

    async function saveEventsAtStorage() {

        await saveOneMinuteOfEvents()
        await doGit()

        function saveOneMinuteOfEvents() {
            return new Promise(promiseWork)

            async function promiseWork(resolve, reject) {


                /*
                Here we will save all the events that were not saved before,
                in one minute batched files.
                */
                let lastMinute = Math.trunc((new Date()).valueOf() / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS) - 1
                let lastLastMinute = lastMinute - 1
                let lastTimestamp = lastMinute * SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS
                let lastLastTimestamp = lastLastMinute * SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS
                let eventsFromLastMinute = []
                let eventsFromLastLastMinute = []
                let dontMoveIndexForward = false

                for (let i = indexLastSavedEvent + 1; i < SA.projects.socialTrading.globals.memory.arrays.EVENTS.length; i++) {
                    let event = SA.projects.socialTrading.globals.memory.arrays.EVENTS[i]
                    let eventMinute = Math.trunc(event.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                    /*
                    We will save events only of the last last closed minute.
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
                    if (
                        eventMinute === lastMinute
                    ) {
                        eventsFromLastMinute.push(eventToSave)
                        dontMoveIndexForward = true
                    }
                    if (
                        eventMinute === lastLastMinute
                    ) {
                        eventsFromLastLastMinute.push(eventToSave)
                        if (dontMoveIndexForward === false) {
                            indexLastSavedEvent = i
                        }
                    }
                }

                saveEventsFile(eventsFromLastLastMinute, lastLastTimestamp)
                saveEventsFile(eventsFromLastMinute, lastTimestamp)
                saveDataRangeFile()

                function saveEventsFile(eventsToSave, timestamp) {

                    const fileContent = JSON.stringify(eventsToSave, undefined, 4)
                    const fileName = "Events" + ".json"

                    let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName + '/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(timestamp)

                    SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
                    SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, fileContent)
                }

                function saveDataRangeFile() {
                    const dataRange = {
                        begin: 0,
                        end: 0
                    }
                    firstEvent = SA.projects.socialTrading.globals.memory.arrays.EVENTS[0]
                    if (firstEvent !== undefined) {
                        dataRange.begin = Math.trunc(firstEvent.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS) * SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS
                        dataRange.end = (Math.trunc((new Date()).valueOf() / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS) - 1) * SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS
                    } else {
                        return
                    }

                    const fileContent = JSON.stringify(dataRange, undefined, 4)
                    const fileName = "Data.Range" + ".json"

                    let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNode.node.config.codeName + '/'

                    SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
                    SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, fileContent)
                    resolve()
                }
            }
        }

        async function doGit() {
            if (gitCommandRunning === true) {
                return
            }
            gitCommandRunning = true
            const options = {
                baseDir: process.cwd() + '/My-Network-Nodes-Data',
                binary: 'git',
                maxConcurrentProcesses: 6,
            }
            const commitMessage = 'New Events'
            const git = SA.nodeModules.simpleGit(options)

            let status = await git.status();
            if (!status.files.some(file => file.path.includes('My-Network-Nodes-Data'))) return

            await git.add('./*')
            await git.commit(commitMessage)
            await git.push('origin')
            gitCommandRunning = false
        }
    }
}