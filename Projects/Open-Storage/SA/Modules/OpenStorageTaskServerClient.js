exports.newOpenStorageModulesOpenStorageTaskServerClient = function newOpenStorageModulesOpenStorageTaskServerClient() {
    /*
    This module receives a file to save, and it knows which are
    the available storages for the social trading bot currently running.

    So it will pick one of the available and try to save the file there.
    If it does not succeed, it will try at the other available storage until
    it suceeds. 

    Once the file could be saved, it will return the id of the Storage Conatainer
    where the file is localted. 
    */
    let thisObject = {
        persistSignal: persistSignal,
        loadSignalFile: loadSignalFile,
        initialize: initialize,
        finalize: finalize
    }
    let availableStorage
    let web3
    let saveIntervalId
    let socialTradingBotsMap
    let candlesSignalsMap
    let saveOneFileCanRun
    let filesLoadedByIdMap

    return thisObject

    function finalize() {
        filesLoadedByIdMap = undefined
        socialTradingBotsMap = undefined
        candlesSignalsMap = undefined
        availableStorage = undefined
        web3 = undefined
        clearInterval(saveIntervalId)
    }

    async function initialize() {
        filesLoadedByIdMap = new Map()
        socialTradingBotsMap = new Map()
        candlesSignalsMap = new Map()
        saveOneFileCanRun = true
        web3 = new SA.nodeModules.web3()
        availableStorage = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.socialTradingBotReference.referenceParent.availableStorage

        saveIntervalId = setInterval(saveMultipleFiles, 1000)
    }

    function persistSignal(candleSignals, socialTradingBot) {

        let candlesSignalsToSave = candlesSignalsMap.get(socialTradingBot.id)
        if (candlesSignalsToSave === undefined) {
            candlesSignalsToSave = []

            candlesSignalsMap.set(socialTradingBot.id, candlesSignalsToSave)
        }

        candlesSignalsToSave.push(candleSignals)
        socialTradingBotsMap.set(socialTradingBot.id, socialTradingBot)

    }

    async function loadSignalFile(fileKey) {
        return new Promise(promiseWork)

        async function promiseWork(resolve, reject) {
            /*
            Control if this file was not already laoded. 
            Because the same file can be stored at multiple storage
            containers for resilience, we are going to load the first
            one and the rest we are going to ingore the load request.
            */
            if (filesLoadedByIdMap.get(fileKey.fileId) === true) {
                resolve()
            }
            /*
            We are going to load this file from the Storage Containers defined.
            We are going to try to read it first from the first Storage container
            and if it is not possible we will try with the next ones.
            */
            let fileName = fileKey.fileName
            let filePath = SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(fileKey.timestamp)
            let password = fileKey.password
            let storageContainer = SA.projects.network.globals.memory.maps.STORAGE_CONTAINERS_BY_ID.get(fileKey.storageContainerId)
            let fileContent

            switch (storageContainer.parentNode.type) {
                case 'Github Storage': {
                    await SA.projects.openStorage.utilities.githubStorage.loadFile(fileName, filePath, storageContainer)
                        .then(onFileLoaded)
                        .catch(onFileNotLoaded)

                    function onFileLoaded(encryptedFileContent) {
                        fileContent = SA.projects.foundations.utilities.encryption.decrypt(encryptedFileContent, password)
                        /*
                        We are going to remember that we already loaded this file from one of it's storage containers.
                        */
                        filesLoadedByIdMap.set(fileKey.fileId, true)
                        resolve(fileContent)
                    }

                    function onFileNotLoaded(error) {
                        SA.logger.error('Open Storage Client -> onFileNotLoaded -> Error = ' + error)
                        resolve()
                    }

                    break
                }
                case 'Superalgos Storage': {
                    // TODO Build the Superalgos Storage Provider
                    break
                }
            }
        }
    }

    async function saveMultipleFiles() {
        candlesSignalsMap.forEach(saveOneFile)
    }

    async function saveOneFile(candlesSignalsToSave, socialTradingBotId) {

        if (candlesSignalsToSave.length === 0) { return }
        if (saveOneFileCanRun === false) { return }

        saveOneFileCanRun = false

        let socialTradingBot = socialTradingBotsMap.get(socialTradingBotId)
        /*
        Cleaning these maps before the next async operation.
        */
        candlesSignalsMap.delete(socialTradingBotId)
        socialTradingBotsMap.delete(socialTradingBotId)

        let timestamp = (new Date()).valueOf()
        let file = {
            timestamp: timestamp,
            content: candlesSignalsToSave
        }

        let fileContent = JSON.stringify(file)
        let password = SA.projects.foundations.utilities.encryption.randomPassword()
        let encryptedFileContent = SA.projects.foundations.utilities.encryption.encrypt(fileContent, password)
        let fileName = web3.eth.accounts.hashMessage(encryptedFileContent)
        let filePath = SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(timestamp)
        let fileId = SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId()
        /*
        We are going to save this file at all of the Storage Containers defined.
        */
        for (let i = 0; i < availableStorage.storageContainerReferences.length; i++) {
            let storageContainerReference = availableStorage.storageContainerReferences[i]
            if (storageContainerReference.referenceParent === undefined) { continue }
            if (storageContainerReference.referenceParent.parentNode === undefined) { continue }

            let storageContainer = storageContainerReference.referenceParent

            switch (storageContainer.type) {
                case 'Github Storage Container': {
                    await SA.projects.openStorage.utilities.githubStorage.saveFile(fileName, filePath, encryptedFileContent, storageContainer)
                        .then(onFileSaved)
                        .catch(onFileNodeSaved)
                    break
                }
                case 'Superalgos Storage Container': {
                    // TODO Build the Superalgos Storage Provider
                    break
                }
            }

            function onFileSaved() {

                let fileKey = {
                    timestamp: timestamp,
                    fileName: fileName,
                    fileId: fileId,
                    storageContainerId: storageContainer.id,
                    password: password
                }
                SA.logger.debug('Open Storage Task Server Client -> Candle signal file has been saved, broadcasting signal')
                TS.projects.foundations.globals.taskConstants.TRADING_SIGNALS.outgoingCandleSignals.broadcastFileKey(fileKey, socialTradingBot)
            }

            function onFileNodeSaved() {
                /*
                The content then will be saved at the next run of this function.
                */
            }
        }

        saveOneFileCanRun = true
    }
}