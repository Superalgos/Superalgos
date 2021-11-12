exports.newSocialTradingModulesStorage = function newSocialTradingModulesStorage() {
    /*
    This module represents the Network Node Physical Storage.
    It is used to save the in-memory events and also to load
    them when the node is starting. 

    Each node has a github repository to store its social graph. 
    That Github repository can be used by any other node to get the history of
    events that can build the social graph.
    
    Each Network Node saves locally all unsaved events, every one minute,
    and after saving, pushes the changes to it's Github repo, which 
    acts as a backup of itself, and also for other new nodes to bootstrap
    their own copy of the social graph.
    */
    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    let indexLastSavedEvent = -1

    return thisObject

    function finalize() {

    }

    function initialize() {
        loadEventsFromStorage()
        setInterval(saveEventsAtStorage, 60000)
    }

    async function loadEventsFromStorage() {

        SA.projects.foundations.utilities.filesAndDirectories.getAllFilesInDirectoryAndSubdirectories('./My-Network-Nodes-Data/Nodes/Node-1/', onFiles)

        function onFiles(fileList) {

            for (let i = 0; i < fileList.length; i++) {
                let filePath = './My-Network-Nodes-Data/Nodes/Node-1/' + fileList[i]

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
                        NT.projects.network.globals.memory.maps.EVENTS.set(storedEvent.eventId, event)
                        NT.projects.network.globals.memory.arrays.EVENTS.push(event)
                        indexLastSavedEvent = NT.projects.network.globals.memory.arrays.EVENTS.length - 1
                    } catch (err) {
                        if (err.stack !== undefined) {
                            console.log('[ERROR] Client Interface -> err.stack = ' + err.stack)
                        }
                        let errorMessage = err.message
                        if (errorMessage === undefined) { errorMessage = err }
                        console.log ('Could not apply the event from storage. -> errorMessage = ' + errorMessage)
                    }
                }
            }
        }
    }

    async function saveEventsAtStorage() {

        let oneMore = true
        let needToDoGit = false

        while (oneMore === true) {
            oneMore = saveOneMinuteOfEvents()
            if (oneMore === true) {
                needToDoGit = true
            }
        }

        if (needToDoGit === true) {
            doGit()
        }

        function saveOneMinuteOfEvents() {
            /*
            Here we will save all the events that were not saved before,
            in one minute batched files.
            */
            let eventsToSave = []
            let minuteToSave

            for (let i = indexLastSavedEvent + 1; i < NT.projects.network.globals.memory.arrays.EVENTS.length; i++) {
                let event = NT.projects.network.globals.memory.arrays.EVENTS[i]

                let currentMinute = Math.trunc((new Date()).valueOf() / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)
                let eventMinute = Math.trunc(event.timestamp / SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS)

                if (minuteToSave === undefined) {
                    minuteToSave = eventMinute
                }
                /*
                We will save events only of the last closed minute.
                We will also pack events into one minute chunks only.
                */
                if (
                    eventMinute < currentMinute &&
                    eventMinute === minuteToSave
                ) {
                    let eventToSave = {
                        eventId: event.eventId,
                        eventType: event.eventType,
                        emitterUserProfileId: event.emitterUserProfileId,
                        targetUserProfileId: event.targetUserProfileId,
                        emitterBotProfileId: event.emitterBotProfileId,
                        targetBotProfileId: event.targetBotProfileId,
                        emitterPostHash: event.emitterPostHash,
                        targetPostHash: event.targetPostHash,
                        timestamp: event.timestamp,
                        botAsset: event.botAsset,
                        botExchange: event.botExchange,
                        botEnabled: event.botEnabled
                    }

                    eventsToSave.push(eventToSave)
                    indexLastSavedEvent = i
                }
            }

            if (eventsToSave.length === 0) { return false }

            let timestamp = minuteToSave * SA.projects.foundations.globals.timeConstants.ONE_MIN_IN_MILISECONDS

            const fileContent = JSON.stringify(eventsToSave, undefined, 4)
            const fileName = "Events" + ".json"

            let filePath = './My-Network-Nodes-Data/Nodes/Node-1/' + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(timestamp)

            SA.projects.foundations.utilities.filesAndDirectories.mkDirByPathSync(filePath + '/')
            SA.nodeModules.fs.writeFileSync(filePath + '/' + fileName, fileContent)

            return true
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