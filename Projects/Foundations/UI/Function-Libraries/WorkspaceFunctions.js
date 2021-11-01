function newFoundationsFunctionLibraryWorkspaceFunctions() {
    let thisObject = {
        addMissingWorkspaceProjects: addMissingWorkspaceProjects,
        checkForMissingReferences:  checkForMissingReferences
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
                if (child === undefined) { continue }
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
}
