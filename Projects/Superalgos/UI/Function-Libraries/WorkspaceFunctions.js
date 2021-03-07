function newSuperalgosFunctionLibraryWorkspaceFunctions() {
    thisObject = {
        addMissingWorkspaceProjects: addMissingWorkspaceProjects
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
                let child = UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(node, project + ' Project', rootNodes, project)
                child.project = project
                child.projectDefinition.name = project
                child.projectDefinition.config = "{ \n  \"codeName\": \"" + project + "\"\n}" 
            }
        }
    }
}
