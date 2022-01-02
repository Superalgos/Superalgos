exports.newPluginsUtilitiesNodes = function () {

    let thisObject = {
        fromSavedPluginToInMemoryStructure: fromSavedPluginToInMemoryStructure
    }

    return thisObject

    function fromSavedPluginToInMemoryStructure(pluginFile) {
        /*
        This function scans a plugin file as saved from the UI and turn it
        into a node structure equivalent to the one used inside the TS when 
        sent from the UI. 
        */
        let rootObject = undefined
        let objectsMap = new Map()
        generateObjects(pluginFile)
        setReferences(rootObject)

        return rootObject

        function generateObjects(currentNode, parentObject, propertyType) {
            if (currentNode === undefined) { return }

            let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(currentNode.project + '-' + currentNode.type)
            if (schemaDocument === undefined) { return }

            let currentObject = {}
            currentObject.name = currentNode.name
            currentObject.type = currentNode.type
            currentObject.id = currentNode.id
            currentObject.project = currentNode.project

            if (currentNode.code !== undefined) {
                currentObject.code = currentNode.code
            }

            if (currentNode.config !== undefined &&
                currentNode.config !== ""
            ) {
                try {
                    currentObject.config = JSON.parse(currentNode.config)
                } catch (err) {
                    currentObject.config = {}
                }                
            }

            if (
                currentNode.savedPaylaod !== undefined &&
                currentNode.savedPaylaod.referenceParent !== undefined &&
                currentNode.savedPaylaod.referenceParent.id !== undefined
            ) {
                currentObject.referenceParent = currentNode.savedPaylaod.referenceParent.id
            }

            if (parentObject === undefined) {
                rootObject = currentObject
            } else {
                currentObject.parentNode = parentObject
                switch (propertyType) {
                    case "node": {
                        currentObject.parentNode[schemaDocument.propertyNameAtParent] = currentObject
                        break
                    }
                    case "array": {
                        currentObject.parentNode[schemaDocument.propertyNameAtParent].push(currentObject)
                        break
                    }
                }
            }

            objectsMap.set(currentObject.id, currentObject)

            /* We scan through this node children */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            generateObjects(currentNode[property.name], currentObject, property.type)
                        }
                            break
                        case 'array': {
                            let currentNodePropertyArray = currentNode[property.name]
                            if (currentNodePropertyArray !== undefined) {
                                currentObject[property.name] = []
                                for (let m = 0; m < currentNodePropertyArray.length; m++) {
                                    generateObjects(currentNodePropertyArray[m], currentObject, property.type)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function setReferences(currentObject) {
            if (currentObject === undefined) { return }

            let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(currentObject.project + '-' + currentObject.type)
            if (schemaDocument === undefined) { return }

            if (
                currentObject.referenceParent !== undefined
            ) {
                currentObject.referenceParent = objectsMap.get(currentObject.referenceParent)
            }

            /* We scan through this node children */
            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            setReferences(currentObject[property.name])
                        }
                            break
                        case 'array': {
                            let currentObjectPropertyArray = currentObject[property.name]
                            if (currentObjectPropertyArray !== undefined) {
                                for (let m = 0; m < currentObjectPropertyArray.length; m++) {
                                    setReferences(currentObjectPropertyArray[m])
                                }
                            }
                            break
                        }
                    }
                }
            }
        }
    }
}