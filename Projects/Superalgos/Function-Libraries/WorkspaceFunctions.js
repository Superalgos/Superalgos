function newSuperalgosFunctionLibraryWorkspaceFunctions() {
    thisObject = {
        addMissingWorkspaceProjects: addMissingWorkspaceProjects
    }

    return thisObject

    function addMissingWorkspaceProjects(node, rootNodes) {
        let url = 'ProjectNames'
        httpRequest(undefined, url, onResponse)

        function onResponse(err, pProjects) {
            let projects = JSON.parse(pProjects)
            for (let i = 0; i < projects.length; i++) {
                let project = projects[i]
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
                }
            }
        }
    }
}
