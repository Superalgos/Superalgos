exports.newOpenStorageModulesOpenStorageClient = function newOpenStorageModulesOpenStorageClient() {
    /*
    This module receives a file to save, and it know which are
    the available storages for the social trading bot currently running.

    So it will pick one of the available and try to save the file there.
    If it does not suceed, it will try at the other available storage until
    it suceeds. 

    Once the file could be saved, it will return the id of the Storage Conatainer
    where the file is localted. 
    */
    let thisObject = {
        saveFile: saveFile,
        loadFile: loadFile,
        initialize: initialize,
        finalize: finalize
    }
    let availableStorage
    return thisObject

    function finalize() {
        availableStorage = undefined
    }

    async function initialize() {
        availableStorage = TS.projects.foundations.globals.taskConstants.TASK_NODE.bot.socialTradingBotReference.referenceParent.availableStorage
    }

    async function saveFile(fileName, filePath, fileContent) {

        for (let i = 0; i < availableStorage.storageContainerReferences.length; i++) {
            let storageContainerReference = availableStorage.storageContainerReferences[i]
            if (availableStorage.storageContainerReferences.referenceParent === undefined) { continue }
            if (availableStorage.storageContainerReferences.referenceParent.parentNode === undefined) { continue }

            let storageContainer = availableStorage.storageContainerReferences.referenceParent

            await SA.projects.openStorage.utilities.githubStorage.saveFile(fileName, filePath, fileContent, storageContainer)
        }
    }

    async function loadFile() {

    }
}