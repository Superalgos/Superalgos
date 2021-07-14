function newFoundationsSideSpace() {
    let thisObject = {
        sidePanelTab: undefined,
        container: undefined,
        leftTabs: undefined,
        rightTabs: undefined,
        physics: physics,
        draw: draw,
        createSidePanelTab, createSidePanelTab,
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
        sidePanel.tabIcon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(porject, iconName)
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

    function getContainer(point, purpose) {

    }

    function physics() {
        for (let i = 0; i < thisObject.leftTabs.length; i++) {
            let sideTab = thisObject.leftTabs[i]
            sideTab.physics()
        }
        for (let i = 0; i < thisObject.rightTabs.length; i++) {
            let sideTab = thisObject.rightTabs[i]
            sideTab.physics()
        }
    }

    function draw() {
        for (let i = 0; i < thisObject.leftTabs.length; i++) {
            let sideTab = thisObject.leftTabs[i]
            sideTab.draw()
        }
        for (let i = 0; i < thisObject.rightTabs.length; i++) {
            let sideTab = thisObject.rightTabs[i]
            sideTab.draw()
        }
    }
}
