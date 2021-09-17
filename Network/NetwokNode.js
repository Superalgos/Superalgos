exports.newNetworkNode = function newNetworkNode() {

    let thisObject = {
        run: run
    }

    let indexLastSavedEvent = -1

    return thisObject

    function run() {
        /*
        Let's start the Network Interfaces
        */
        NT.webSocketsInterface = NT.projects.network.modules.webSocketsInterface.newNetworkModulesWebSocketsInterface()
        NT.webSocketsInterface.initialize()

        start()

        async function start() {
            let socialGraphService = NT.projects.socialTrading.modules.socialGraph.newSocialGraph()
            await socialGraphService.initialize()

            setInterval(saveEventsAtStorage, 60000)
        }
    }

    async function saveEventsAtStorage() {

        let oneMore = true
        let needToDoGit = false

        while (oneMore === true) {
            oneMore = saveOneMinuteOfEvents()
            if (oneMore === true) {
                needToDoGit =  true
            }
        }

        if (needToDoGit === true) {
            doGit()
        }

        function saveOneMinuteOfEvents() {
            /*
            Here we will save all the events that were not saved before,
            in one minute chunchs files.
            */
            let eventsToSave = []
            let minuteToSave

            for (let i = indexLastSavedEvent + 1; i < NT.projects.socialTrading.globals.memory.arrays.EVENTS.length; i++) {
                let event = NT.projects.socialTrading.globals.memory.arrays.EVENTS[i]

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
