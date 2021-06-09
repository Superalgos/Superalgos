function newGovernanceFunctionLibraryAssets() {
    let thisObject = {
        installAssets: installAssets
    }

    return thisObject

    function installAssets(
        node,
        rootNodes
    ) {
        let folderPath = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(node.payload, 'folderPath')

        if (folderPath === undefined || folderPath === "") {
            node.payload.uiObject.setErrorMessage("folderPath Config Property undefined.")
            return
        }

        httpRequest(undefined, 'DirContent' + '/' + folderPath, onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to get Directory Content from the Client')
                return
            }
            let filePathArray = JSON.parse(data)
            for (let i = 0; i < filePathArray.length; i++) {
                let filePath = filePathArray[i]
                let foldersArray = removeFirstFromArray(filePath.split('\\'))
                createNodesFromPath(node, foldersArray)
            }
        }

        function removeFirstFromArray(array) {
            /*
            Don't want to use splice here because this will be used 
            recursivelly and can have problems because we will be
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
            Here we will check that the node corersponding to the next item does not already exist.
            */
            let exist = false
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            if (childNode !== undefined) {
                                let codeName = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(childNode.payload, 'codeName')
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
                                        let codeName = UI.projects.superalgos.utilities.nodeConfig.loadPropertyFromNodeConfig(childNode.payload, 'codeName')
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
                let childNode = UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Asset')
                childNode.config = JSON.stringify({ codeName: nextItem })
                childNode.name = nextItem

            } else {
                /*
                All previous elements are an Asset Class.
                */
                let childNode = UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(node, 'Asset Class')
                childNode.config = JSON.stringify({ codeName: nextItem })
                childNode.name = nextItem
                createNodesFromPath(childNode, pathArray)
            }
        }
    }
}
