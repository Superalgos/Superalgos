exports.newSocialTradingFunctionLibrariesPostsStorage = function () {
     
    let thisObject = {
        savePostAtStorage: savePostAtStorage,
        loadPostFromStorage: loadPostFromStorage,
        removePostAtStorage: removePostAtStorage
    }

    return thisObject

    async function savePostAtStorage(
        eventMessage,
        socialEntity
    ) {

        return new Promise(savePostAsync)

        async function savePostAsync(resolve, reject) {

            let availableStorage = socialEntity.node.availableStorage
            if (availableStorage === undefined) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Post Because Available Storage is Undefined'
                }
                resolve(response)
                return
            }

            if (availableStorage.storageContainerReferences.length === 0) {
                let response = {
                    result: 'Error',
                    message: 'Cannot Save Post Because Storage Container References is Zero'
                }
                resolve(response)
                return
            }
            /*
            Prepare the content to be saved
            */
            let timestamp = (new Date()).valueOf()
            let file = {
                userName: eventMessage.userName,
                timestamp: timestamp,
                content: eventMessage.postText,
                images: eventMessage.postImage
            }

            let web3 = new SA.nodeModules.web3()
            let fileContent = JSON.stringify(file)
            let password = SA.projects.foundations.utilities.encryption.randomPassword()
            let encryptedFileContent = SA.projects.foundations.utilities.encryption.encrypt(fileContent, password)
            let fileName = web3.eth.accounts.hashMessage(encryptedFileContent)
            let filePath = "Posts/" + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(timestamp)
            /*
            We are going to save this file at all of the Storage Containers defined.
            */
            let savedCount = 0
            let notSavedCount = 0
            let fileKeys = []

            for (let i = 0; i < availableStorage.storageContainerReferences.length; i++) {
                let storageContainerReference = availableStorage.storageContainerReferences[i]
                if (storageContainerReference.referenceParent === undefined) {
                    continue
                }
                if (storageContainerReference.referenceParent.parentNode === undefined) {
                    continue
                }

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
                        storageContainerId: storageContainer.id,
                        password: password
                    }
                    fileKeys.push(fileKey)
                    savedCount++
                    if (savedCount + notSavedCount === availableStorage.storageContainerReferences.length) {
                        allFilesSaved()
                    }
                }

                function onFileNodeSaved() {
                    notSavedCount++
                    if (savedCount + notSavedCount === availableStorage.storageContainerReferences.length) {
                        allFilesSaved()
                    }
                }

                function allFilesSaved() {
                    if (savedCount > 0) {
                        /*
                        Here we modify the eventMessage that is going to continue its journey to 
                        the P2P Network Node.
                        */
                        eventMessage.originPostHash = fileName
                        /*
                        The post text is eliminated, since it is now at the user's storage,
                        and a hash of the content was generated, and that is what is going to
                        the Network Node.
                        */
                        eventMessage.postText = undefined;

                        eventMessage.postImage = undefined;

                        eventMessage.userName = undefined;

                        /*
                        The file key contains all the information needed to later retrieve this post.
                        */
                        eventMessage.fileKeys = fileKeys

                        let response = {
                            result: 'Ok',
                            message: 'Post Saved'
                        }
                        resolve(response)
                    } else {
                        let response = {
                            result: 'Error',
                            message: 'Storage Provider Failed to Save at least 1 Post File'
                        }
                        resolve(response)
                    }
                }
            }
        }
    }

    async function loadPostFromStorage(
        fileKeys
    ) {
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
        */
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
                */
                let fileName = fileKey.fileName
                let filePath = "Posts/" + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(fileKey.timestamp)
                let password = fileKey.password
                let storageContainer = SA.projects.network.globals.memory.maps.STORAGE_CONTAINERS_BY_ID.get(fileKey.storageContainerId)

                try {
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
                } catch (err) {
                    reject(err)
                }

                function onFileLoaded(fileData) {
                    file = JSON.parse(SA.projects.foundations.utilities.encryption.decrypt(fileData, password))
                    let response = {
                        result: 'Ok',
                        message: 'Post Text Found',
                        postText: file.content,
                        postImage: file.images,
                        userName: file.userName
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

    async function removePostAtStorage(eventMessage, socialEntity) {
        return new Promise(removePostAsync);
      
        async function removePostAsync(resolve, reject) {
          let availableStorage = socialEntity.node.availableStorage;
      
          // Check if available storage is defined
          if (!availableStorage) {
            let response = {
              result: "Error",
              message: "Cannot remove post because available storage is undefined",
            };
            resolve(response);
            return;
          }
      
          // Check if there are any storage container references
          if (!availableStorage.storageContainerReferences || !availableStorage.storageContainerReferences.length) {
            let response = {
              result: "Error",
              message: "Cannot remove post because storage container references are zero",
            };
            resolve(response);
            return;
          }
      
          // Get file keys
          let fileKeys = eventMessage.fileKeys;
          if (!fileKeys || !fileKeys.length) {
            let response = {
              result: "Error",
              message: "Cannot remove post because file keys are missing",
            };
            resolve(response);
            return;
          }
      
          // Iterate over all the file keys and delete the content and path for each one          
          let removedCount = 0;
          for (let i = 0; i < fileKeys.length; i++) {

            let fileKey = fileKeys[i];        
            
            let filePath = "Posts/" + SA.projects.foundations.utilities.filesAndDirectories.pathFromDatetime(fileKey.timestamp *1)
            let fileName = fileKey.fileName;
            let storageContainer = SA.projects.network.globals.memory.maps.STORAGE_CONTAINERS_BY_ID.get(fileKey.storageContainerId)

            try {
                switch (storageContainer.parentNode.type) {
                    case 'Github Storage': {

                        await SA.projects.openStorage.utilities.githubStorage.removeFile(fileName, filePath, storageContainer)
                            
                        break
                    }
                    case 'Superalgos Storage': {
                        // TODO Build the Superalgos Storage Provider
                        break
                    }
                }
            } catch (err) {
                reject(err)
            }
      
      
            // Increment the count of removed files
            removedCount++;
          }
      
          // Check if any files were removed
          if (removedCount > 0) {
            let response = {
              result: "Ok",
              message: "Post removed",
            };
            resolve(response);
          } else {
            let response = {
              result: "Error",
              message: "Storage provider failed to remove the post file",
            };
            resolve(response);
          }
        }
    } 
}
