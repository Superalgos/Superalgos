function newGovernanceFunctionLibraryAssets() {
    let thisObject = {
        installMissingAssets: installMissingAssets
    }

    return thisObject

    function installMissingAssets(
        node,
        rootNodes
    ) {
        let folderPath = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'folderPath')

        if (folderPath === undefined || folderPath === "") {
            node.payload.uiObject.setErrorMessage(
                "folderPath Config Property undefined.",
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
            return
        }
        node.payload.uiObject.setInfoMessage(
            "Hold on while we install all the assets inside the this path: " + folderPath + ". This might take a minute or two.",
            UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
            )
        httpRequest(undefined, 'DirContent' + '/' + folderPath, onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to get Directory Content from the Client')
                return
            }
            let filePathArray = JSON.parse(data)
            let totalAssets = 0
            for (let i = 0; i < filePathArray.length; i++) {
                let filePath = filePathArray[i]
                if (filePath.indexOf('node_modules') >= 0) { continue }
                let foldersArray = removeFirstFromArray(filePath.split('\\'))
                totalAssets++
                createNodesFromPath(node, foldersArray)
            }
            node.payload.uiObject.setInfoMessage(
                "A total of : " + totalAssets + " assets have been installed.",
                UI.projects.governance.globals.designer.SET_INFO_COUNTER_FACTOR
                )
        }

        function removeFirstFromArray(array) {
            /*
            Don't want to use splice here because this will be used 
            recursively and can have problems because we will be
            passing a pointer to the array at several branches.
            */
            let newArray = []
            for (let i = 1; i < array.length; i++) {
                newArray.push(array[i])
            }
            return newArray
        }

        function createNodesFromPath(node, pathArray) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            if (pathArray.length === 0) { return }

            let nextItem = pathArray[0]
            pathArray = removeFirstFromArray(pathArray)

            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            /*
            Here we will check that the node corresponding to the next item does not already exist.
            */
            let exist = false
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            if (childNode !== undefined) {
                                let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'codeName')
                                if (nextItem === codeName) {
                                    exist = true
                                    createNodesFromPath(childNode, pathArray)
                                }
                            }
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    if (childNode !== undefined) {
                                        let codeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'codeName')
                                        if (nextItem === codeName) {
                                            exist = true
                                            createNodesFromPath(childNode, pathArray)
                                        }
                                    }
                                }
                            }
                            break
                        }
                    }
                }
            }
            if (exist === true) { return }
            if (pathArray.length === 0) {
                /*
                The last element of the path is an Asset.
                */
                let childNode = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Asset')
                childNode.config = JSON.stringify({ codeName: nextItem })
                childNode.name = nextItem

            } else {
                /*
                All previous elements are an Asset Class.
                */
                let childNode = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Asset Class')
                childNode.config = JSON.stringify({ codeName: nextItem })
                childNode.name = nextItem
                createNodesFromPath(childNode, pathArray)
            }
        }
    }
}
