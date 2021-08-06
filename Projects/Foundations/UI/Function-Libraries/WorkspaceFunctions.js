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
                let child = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(node, project + ' Project', rootNodes, project)
                child.project = project
                child.projectDefinition.name = project
                child.projectDefinition.config = "{ \n  \"codeName\": \"" + project + "\"\n}" 
            }
        }
    }

    function checkForMissingReferences() {
        console.log("this action is working")
    }
}
