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
        p2pNetworkNodeCodeName: undefined, 
        initialize: initialize,
        finalize: finalize
    }

    let indexLastSavedEvent = -1

    return thisObject

    function finalize() {

    }

    async function initialize(p2pNetworkNodeCodeName) {
        thisObject.p2pNetworkNodeCodeName = p2pNetworkNodeCodeName

        //await fetchMissingEventsFromOtherNodes()
        loadEventsFromStorage()
        setInterval(saveEventsAtStorage, 60000)
    }

    async function fetchMissingEventsFromOtherNodes() {
        /*
        Iterate and as
        */
    }

    async function loadEventsFromStorage() {

        return new Promise(promiseWork)

        function promiseWork(resolve, reject) {

            SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories('./My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNodeCodeName + '/', onFiles)

            function onFiles(fileList) {

                for (let i = 0; i < fileList.length; i++) {
                    let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNodeCodeName + '/' + fileList[i]

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
                            event.run()

                            SA.projects.socialTrading.globals.memory.maps.EVENTS.set(storedEvent.eventId, event)
                            SA.projects.socialTrading.globals.memory.arrays.EVENTS.push(event)
                            indexLastSavedEvent = SA.projects.socialTrading.globals.memory.arrays.EVENTS.length - 1
                        } catch (err) {
                            if (err.stack !== undefined) {
                                console.log('[ERROR] Client Interface -> err.stack = ' + err.stack)
                            }
                            let errorMessage = err.message
                            if (errorMessage === undefined) { errorMessage = err }
                            console.log('Could not apply the event from storage. -> errorMessage = ' + errorMessage)
                        }
                    }
                }
                resolve()
            }
        }
    }

    async function saveEventsAtStorage() {

        saveOneMinuteOfEvents()
        doGit()

        function saveOneMinuteOfEvents() {
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

                let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNodeCodeName + '/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(timestamp)

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

                let filePath = './My-Network-Nodes-Data/Nodes/' + thisObject.p2pNetworkNodeCodeName + '/'

                SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
                SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, fileContent)
            }
        }

        async function doGit() {
            const options = {
                baseDir: process.cwd() + '/My-Network-Nodes-Data',
                binary: 'git',
                maxConcurrentProcesses: 6,
            }
            const commitMessage = 'New Events'
            const git = SA.nodeModules.simpleGit(options)

            await git.add('./*')
            await git.commit(commitMessage)
            await git.push('origin')
        }
    }
}