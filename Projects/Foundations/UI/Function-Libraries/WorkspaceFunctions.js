function newFoundationsFunctionLibraryWorkspaceFunctions() {
    let thisObject = {
        addMissingWorkspaceProjects: addMissingWorkspaceProjects,
        checkForMissingReferences: checkForMissingReferences,
        fixMissingReferences: fixMissingReferences
    }

    return thisObject

    function addMissingWorkspaceProjects(node, rootNodes) {
        for (let k = 0; k < PROJECTS_SCHEMA.length; k++) {
            let projectDefinition = PROJECTS_SCHEMA[k]
            let project = projectDefinition.name
            let alreadyExist = false

            for (let j = 0; j < rootNodes.length; j++) {
                let rootNode = rootNodes[j]
                if (rootNode.type === project + ' Project') {
                    alreadyExist = true
                }
            }

            if (alreadyExist === false) {
                let child = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(node, project + ' Project', rootNodes, project)
                if (child === undefined) {
                    continue
                }
                child.project = project
                child.projectDefinition.name = project
                child.projectDefinition.config = "{ \n  \"codeName\": \"" + project + "\"\n}"
            }
        }
    }

    // This function scales the current workspace and highlights any nodes that have unresolved references 
    function checkForMissingReferences(rootNodes) {
        let nodes
        for (let i = 0; i < rootNodes.length; i++) {
            if (rootNodes[i] !== undefined) {
                nodes = UI.projects.visualScripting.utilities.hierarchy.getHiriarchyMap(rootNodes[i]) 
                for (let [key, value] of nodes) {
                    // Check nodes that have a saved reference parent
                    if (value.savedPayload.referenceParent !== undefined) {
                        // Highlight nodes that do not have an active reference connected to their reference parent
                        if (value.payload.referenceParent === undefined) {
                            console.log("[WARN] Reference Parent not found in the current workspace.\n Node:", value.name, " Type:", value.type, " ID:", key, " Node Object:", value)
                            UI.projects.foundations.spaces.floatingSpace.inMapMode = true
                            value.payload.uiObject.setWarningMessage('Reference Parent not found in the current workspace.', 10)
                        }
                           
                    }
                }
                
            }
        }
       
    }

    // This function fixes any missing references leveraging the docs search engine 
    function fixMissingReferences(rootNodes) {
        let nodes
        let docIndex = UI.projects.education.spaces.docsSpace.searchEngine.documentIndex


        for (let i = 0; i < rootNodes.length; i++) {
            if (rootNodes[i] !== undefined) {
                nodes = UI.projects.visualScripting.utilities.hierarchy.getHiriarchyMap(rootNodes[i])
                for (let [key, value] of nodes) {
                    // Check nodes that have a saved reference parent
                    if (value.savedPayload.referenceParent !== undefined) {
                        // Highlight nodes that do not have an active reference connected to their reference parent
                        // Filter out data mines in the trading mine process dependencies
                        if (value.type !== 'Data Mine Data Dependencies' && value.type !== 'Data Dependency') {
                            if (value.payload.referenceParent === undefined) {
                                console.log("[WARN] Reference Parent not found in the current workspace.\n Node:", value.name, " Type:", value.type, " ID:", key, " Node Object:", value)
                                UI.projects.foundations.spaces.floatingSpace.inMapMode = true
                                // value.payload.uiObject.setWarningMessage('Reference Parent not found in the current workspace.', 10)

                                // Search in the workspace for the reference and try to attach it
                                docIndex.search(value.savedPayload.referenceParent.type, {
                                    pluck: 'docsSchemaDocument:type',
                                    enrich: true,
                                    limit: 1000
                                }).then(function (results) {
                                    let workspaceItems = results.filter(function (result) {
                                        return result.doc.category === 'Workspace'
                                    })
                                    if (workspaceItems.length > 0) {
                                        // Not the wisest choice to get the first result, but the search engine will for sure return the most relevant doc as first.
                                        UI.projects.foundations.spaces.designSpace.workspace.getNodeById(workspaceItems[0].doc.docsSchemaDocument.nodeId).then(function (node) {
                                            console.log("Found a node to attach to: ", node)
                                            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(value, node)
                                            console.log("Attached successfully")
                                        })

                                    }
                                })
                            }
                        }

                    }
                }

            }
        }

    }
}
