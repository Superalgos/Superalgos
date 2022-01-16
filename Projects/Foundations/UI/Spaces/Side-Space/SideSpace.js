function newFoundationsSideSpace() {
    let thisObject = {
        sidePanelTab: undefined,
        container: undefined,
        leftTabs: undefined,
        rightTabs: undefined,
        physics: physics,
        draw: draw,
        createSidePanelTab: createSidePanelTab,
        deleteSidePanelTab: deleteSidePanelTab,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    let existingTabs = new Map()

    return thisObject

    function initialize() {
        thisObject.leftTabs = []
        thisObject.rightTabs = []
    }

    function finalize() {
        thisObject.leftTabs = undefined
        thisObject.rightTabs = undefined
        existingTabs = undefined
    }

    function createSidePanelTab(container, porject, iconName, label, side) {

        let sidePanel

        sidePanel = newSidePanelTab()
        sidePanel.container.connectToParent(container, false, false)
        sidePanel.tabIcon = UI.projects.workspaces.spaces.designSpace.getIconByProjectAndName(porject, iconName)
        sidePanel.tabLabel = label
        sidePanel.initialize(side)

        let key = porject + '-' + iconName + '-' + label + '-' + side
        if (existingTabs.get(key) !== undefined) { return existingTabs.get(key) }

        switch (side) {
            case 'left': {
                thisObject.leftTabs.push(sidePanel)
                sidePanel.index = thisObject.leftTabs.length

                existingTabs.set(key, sidePanel)
                break
            }
            case 'right': {
                thisObject.rightTabs.push(sidePanel)
                sidePanel.index = thisObject.rightTabs.length

                existingTabs.set(key, sidePanel)
                break
            }
        }

        return sidePanel
    }

    function deleteSidePanelTab(porject, iconName, label, side) {

        let key = porject + '-' + iconName + '-' + label + '-' + side
        if (existingTabs.get(key) !== undefined) {
            let sidePanelTab = existingTabs.get(key)

            switch (side) {
                case 'left': {
                    thisObject.leftTabs.splice(sidePanelTab.index - 1, 1)
                    break
                }
                case 'right': {
                    thisObject.rightTabs.splice(sidePanelTab.index - 1, 1)
                    break
                }
            }

            sidePanelTab.finalize()
            existingTabs.delete(key)

            /*
            Reindex Remaining SidTabs
            */
            let indexLeft = 1
            let indexRight = 1

            existingTabs.forEach(reindex)

            function reindex(sideTab, key, map) {
                switch (sideTab.screenside) {
                    case 'left': {
                        sideTab.index = indexLeft
                        indexLeft++
                        break
                    }
                    case 'right': {
                        sideTab.index = indexRight
                        indexRight++
                        break
                    }
                }

            }
        }
    }

    function getContainer(point, purpose) {

    }

    function physics() {
        existingTabs.forEach(sideTabPhysics)

        function sideTabPhysics(sideTab, key, map) {
            sideTab.physics()
        }
    }

    function draw() {
        existingTabs.forEach(sideTabDraw)

        function sideTabDraw(sideTab, key, map) {
            sideTab.draw()
        }
    }
}
