function newWorkspacesSystemActionWorkspaceFunctions() {
    let thisObject = {
        workspacesSubmenu: workspacesSubmenu,
        collapseAllRootNodes: collapseAllRootNodes
    }

    return thisObject

    /* build submenus of all existing workspaces of every project for the system menu */
    async function workspacesSubmenu(type) {
        let subMenu = []
        /* get the array of workspaces: [[…],[…],…] */
        let response = await httpRequestAsync(undefined, 'ListWorkspaces')

        if (type === 'plugin') {
            /* for plugin workspaces, the first value of the workspace array is a non-empty string containing the project */
            let pluginWorkspaces = JSON.parse(response.message).filter(x => x[0] !== '')
            let pluginWorkspaceProjects = []

            for (let workspace of pluginWorkspaces) {
                if (pluginWorkspaceProjects.includes(workspace[0])) { continue }
                pluginWorkspaceProjects.push(workspace[0])
            }
            /* for every project, collect the corresponding worspaces into a submenu and assign them the switchWorkspace action*/
            for (let project of pluginWorkspaceProjects) {
                let projectSubmenuItem = {label: project, subMenu: []}
                let projectPluginWorkspaces = JSON.parse(response.message).filter(x => x[0] === project)
                for (let workspace of projectPluginWorkspaces) {
                    let label = workspace[1].replace('Plugin → ', '').replace('.json', '')
                    let action = {name: 'switchWorkspace', params: ['\'' + project + '\'', '\'' + label + '\'']}
                    projectSubmenuItem.subMenu.push({label: label, action: action})
                }
                subMenu.push(projectSubmenuItem)
            }
        } else if (type === 'user') {
            /* user workspaces have no associated project */
            let userWorkspaces = JSON.parse(response.message).filter(x => x[0] === '')
            for (let workspace of userWorkspaces) {
                let label = workspace[1].replace('.json', '')
                let action = {name: 'switchWorkspace', params: ['\'\'', '\'' + label + '\'']}
                subMenu.push({label: label, action: action})
            }
        }
        return subMenu
    }

    function collapseAllRootNodes() {
        let rootNodes = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode.rootNodes
        for (let rootNode of rootNodes) {
            if (rootNode.payload === undefined) { continue }
            if (rootNode.payload.floatingObject === undefined) { continue }
            if (rootNode.payload.floatingObject.isCollapsed !== true) {
                rootNode.payload.floatingObject.collapseToggle()
            }
        }
    }
}