function newApiMaintenanceFunctions() {
    let thisObject = {
        installAPIResponseFieldRefs: installAPIResponseFieldRefs
    }

    return thisObject

    function installAPIResponseFieldRefs(node, rootNodes) {
        console.log('this is the node', node, 'this is rootnodes', rootNodes)
        
        let mineName = node.payload.chainParent.payload.chainParent.payload.chainParent.name
        let apiMapNode
        let apiResponseFields = []
        // Gather API Response fields
        for (let i = 0; i < rootNodes.length; i++) { 
            if (rootNodes[i].name === mineName && rootNodes[i].type === 'API Map') {
                apiMapNode = rootNodes[i]

                for (let x = 0; x < apiMapNode.apiVersions.length; x++) {
                    let versionNode = apiMapNode.apiVersions[x] 

                    let endpointCodeName
                    for (let y = 0; y < versionNode.apiEndpoints.length; y++) {
                        let apiEndpoints = versionNode.apiEndpoints[y]
                        let endpointConfig = JSON.parse(apiEndpoints.config)
                        endpointCodeName = endpointConfig.codeName
                        
                        let responseCode
                        for (let z = 0; z < apiEndpoints.apiQueryResponses.apiQueryResponses.length; z++) {
                            let apiQueryResponses = apiEndpoints.apiQueryResponses.apiQueryResponses[z]
                            console.log('these are the response fields', apiQueryResponses)
                            let queryConfig = JSON.parse(apiQueryResponses.config)
                            responseCode = queryConfig.codeName

                            for (let v = 0; v < apiQueryResponses.apiResponseSchema.apiResponseFields.apiResponseFields.length; v++) {
                                let apiResponseField = apiQueryResponses.apiResponseSchema.apiResponseFields.apiResponseFields[v]
                                apiResponseFields.push([endpointCodeName, responseCode, apiResponseField])
                                // Now recursivly walk the rest of the response fields
                                if (apiResponseField.apiResponseFields !== undefined) {
                                    walkResponseFields(endpointCodeName, responseCode, apiResponseField.apiResponseFields)
                                }
                                console.log('these are the api response schemas', apiResponseFields)
                                function walkResponseFields(endpointCodeName, responseCode, apiResponseField) {
                                    for (let h = 0; h < apiResponseField.length; h++) {
                                        let nextApiResponseField = apiResponseField[h]
                                        apiResponseFields.push([endpointCodeName, responseCode, nextApiResponseField])

                                        if (nextApiResponseField.apiResponseFields !== undefined) {
                                            walkResponseFields(endpointCodeName, responseCode, nextApiResponseField.apiResponseFields)
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for (let x = 0; x < node.properties.length; x++) { 
            let nodeConfig =  JSON.parse(node.properties[x].config)
            let endpointConfig = JSON.parse(node.payload.chainParent.payload.chainParent.config)
            nodeConfig.codeName
            nodeConfig.apiQueryResponse
            // we have the name for the reference here
            apiResponseFields
            // we have all of the responce fields here
            for (let y = 0; y < apiResponseFields.length; y++) {
                if (endpointConfig.apiEndpoint === apiResponseFields[y][0]) {
                    // Make sure response is from the right Query type
                    if (nodeConfig.apiQueryResponse === apiResponseFields[y][1]) {
                        let fieldConfig = JSON.parse(apiResponseFields[y][2].config)
                        // Now look for matching codeNames between record property and api map
                        if (fieldConfig.codeName === nodeConfig.codeName) {
                            console.log('this is a match!')
                            console.log('this is the field ', fieldConfig.codeName, 'this is the config', nodeConfig.codeName)
                            // then reestablish references
                            if (node.properties[x].payload.node.apiResponseFieldReference !== undefined) {
                                UI.projects.visualScripting.nodeActionFunctions.attachDetach.referenceAttachNode(node.properties[x].payload.node.apiResponseFieldReference, apiResponseFields[y][2])
                            } 
                        }
                    }
                }
            }
        }
    }
}
