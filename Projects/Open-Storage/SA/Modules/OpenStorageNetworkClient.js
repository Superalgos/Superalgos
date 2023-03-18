exports.newOpenStorageModulesOpenStorageNetworkClient = function newOpenStorageModulesOpenStorageNetworkClient() {
    /*
    This module receives a file to save, and it knows which are
    the available storages for the Network Node currently running.

    So it will pick one of the available and try to save the file there.
    If it does not succeed, it will try at the other available storage until
    it suceeds. 

    Once the file could be saved, it will return the id of the Storage Conatainer
    where the file is localted. 
    */
    let thisObject = {
        availableStorage: undefined,
        persistSocialGraph: persistSocialGraph,
        //loadSocialGraphFile: loadSocialGraphFile,
        initialize: initialize,
        finalize: finalize
    }

    //let web3
    let eventsByPathMap
    let saveOneFileCanRun
    //let filesLoadedByIdMap
    //let saveIntervalId

    return thisObject

    function finalize() {
        //web3 = undefined
        eventsByPathMap  = undefined
        saveOneFileCanRun  = undefined
        //filesLoadedByIdMap  = undefined
        //saveIntervalId  = undefined
    }

    async function initialize() {
        //web3 = new SA.nodeModules.web3()
        eventsByPathMap = new Map()
        saveOneFileCanRun = true
        //filesLoadedByIdMap = new Map()
        thisObject.availableStorage = NT.networkApp.p2pNetworkNode.node.availableStorage

        // This client saves on an independent loop to avoid race cases with external save requests
        // saveIntervalId = possibly assign value from set interval in future
        setInterval(saveMultipleFiles, 1000)
    }

    async function persistSocialGraph(filePath, fileName, fileContent) {
        // Check to see if the current path has other events associated with it already
        let contentArray = eventsByPathMap.get(filePath)
        let eventsToSave = undefined

        if (contentArray === undefined) {
            // If not set a new entry in events map
            eventsToSave = fileContent

            eventsByPathMap.set(filePath, [fileName, eventsToSave])

        } else {
            // If path exists then we check if we should combine events to save or not 
            let combinedEvents
            if (fileName === 'Data.Range.json') {
                // Replace content with new value
                combinedEvents = fileContent
            } else if (fileName === 'Events.json') {
                // Combine events 
                eventsToSave = JSON.parse(contentArray[1])
                let parsedFileContent = JSON.parse(fileContent)
                let rawEvents = eventsToSave.concat(parsedFileContent)
                combinedEvents = JSON.stringify(rawEvents)
            }

            eventsByPathMap.set(filePath, [fileName, combinedEvents])
        }
    }

    /*
    TODO: move any github loading functions from Projects\Social-Trading\NT\Modules\Storage.js here 
    async function loadSocialGraphFile(fileKeys) {
        if (fileKeys === undefined) {
            let response = {
                result: 'Error',
                message: 'It is not possible to retrieve this post'
            }
            return response
        }
        /*
        When the Web App makes a query that includes Post text as responses,
        we need to fetch the text from the the storage container of the author
        of such posts, since the Network Nodes do not store that info themselves, 
        they just store the structure of the social graph.
        
        return new Promise(loadPostAsync)

        async function loadPostAsync(resolve, reject) {

            let file
            let notLoadedCount = 0

            for (let i = 0; i < fileKeys.length; i++) {

                if (file !== undefined) {
                    continue
                }

                let fileKey = fileKeys[i]
                /*
                We are going to load this file from the Storage Containers defined.
                We are going to try to read it first from the first Storage container
                and if it is not possible we will try with the next ones.
                
                let fileName = fileKey.fileName
                let filePath = "Posts/" + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(fileKey.timestamp)
                let password = fileKey.password
                let storageContainer = SA.projects.network.globals.memory.maps.STORAGE_CONTAINERS_BY_ID.get(fileKey.storageContainerId)

                switch (storageContainer.parentNode.type) {
                    case 'Github Storage': {
                        await SA.projects.openStorage.utilities.githubStorage.loadFile(fileName, filePath, storageContainer)
                            .then(onFileLoaded)
                            .catch(onFileNotLoaded)
                        break
                    }
                    case 'Superalgos Storage': {
                        // TODO Build the Superalgos Storage Provider
                        break
                    }
                }

                function onFileLoaded(fileData) {
                    file = JSON.parse(SA.projects.foundations.utilities.encryption.decrypt(fileData, password))
                    let response = {
                        result: 'Ok',
                        message: 'Post Text Found',
                        postText: file.content
                    }
                    resolve(response)
                }

                function onFileNotLoaded() {
                    notLoadedCount++
                    if (notLoadedCount === fileKeys.length) {
                        let response = {
                            result: 'Error',
                            message: 'Post Content Not Available At The Moment'
                        }
                        resolve(response)
                    }
                }
            }
        }
    }
    */

    async function saveMultipleFiles() {
        eventsByPathMap.forEach(saveOneFile)
    }

    async function saveOneFile(contentArray, filePath) {
        // Avoid running save operations if saving already in progress
        if (saveOneFileCanRun === false) { return }
        saveOneFileCanRun = false

        // Cleaning these maps before the next async operation.
        eventsByPathMap.delete(filePath)
              
        if (thisObject.availableStorage === undefined) {
            SA.logger.error('Cannot Save Social Graph Because Available Storage is Undefined')
            return
        }

        if (thisObject.availableStorage.storageContainerReferences.length === 0) {
            SA.logger.error('Cannot Save Post Because Storage Container References is Zero')
            return
        }

        // Take relative path off front of file path
        let repoFilePath = filePath.slice(2);

        let fileName = contentArray[0]
        let fileContent = contentArray[1]
        let repoFileName
        let repoFileContent
        let password
        if (fileName === "Data.Range.json" || fileName === "Events.json") {
            // Save an unencrypted dataRange file
            repoFileName = fileName.slice(0, -5)
            repoFileContent = fileContent
            password = undefined
        } 
            
        /* else {
            // Encrypt events 
            repoFileName = web3.eth.accounts.hashMessage(encryptedFileContent)
            let web3 = new SA.nodeModules.web3()
            password = SA.projects.foundations.utilities.encryption.randomPassword()
            repoFileContent = SA.projects.foundations.utilities.encryption.encrypt(fileContent, password)
        } */

        //We are going to save this file at all of the Storage Containers defined.
        let savedCount = 0
        let notSavedCount = 0
        // let fileKeys = []
        for (let i = 0; i < thisObject.availableStorage.storageContainerReferences.length; i++) {
            let storageContainerReference = thisObject.availableStorage.storageContainerReferences[i]
            if (storageContainerReference.referenceParent === undefined) { continue }
            if (storageContainerReference.referenceParent.parentNode === undefined) { continue }

            let storageContainer = storageContainerReference.referenceParent

            switch (storageContainer.type) {
                case 'Github Storage Container': {
                    await SA.projects.openStorage.utilities.githubStorage.saveFile(repoFileName, repoFilePath, repoFileContent, storageContainer)
                        .then(onFileSaved)
                        .catch(onFileNotSaved)
                    break
                }
                case 'Superalgos Storage Container': {
                    // TODO Build the Superalgos Storage Provider
                    break
                }
            }

            function onFileSaved() {
                /* 
                let fileKey = {
                    timestamp: timestamp,
                    fileName: repoFileName,
                    storageContainerId: storageContainer.id,
                    password: password
                }
                fileKeys.push(fileKey)
                */
                savedCount++
                // Check if this file has been saved in all available storage 
                if (savedCount + notSavedCount === thisObject.availableStorage.storageContainerReferences.length) {
                    allFilesSaved()
                }
            }

            function onFileNotSaved(err) {
                SA.logger.error('Open Storage Network Client -> saveOneFile -> err = ' + err)
                notSavedCount++
                // Check if this file has been saved in all available storage 
                if (savedCount + notSavedCount === thisObject.availableStorage.storageContainerReferences.length) {
                    allFilesSaved()
                }
            }

            function allFilesSaved() {
                // Once the file has been saved to all available repositories 
                if (notSavedCount > 0) {
                    SA.logger.error('Storage Provider Failed to Save File to at least 1 Storage Provider')  
                } else {
                    SA.logger.info('File Successfully save to all Storage Providers')
                }
            }
        }
        saveOneFileCanRun = true
    }
}