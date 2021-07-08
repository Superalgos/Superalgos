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

    return thisObject

    function initialize() {
        leftTabs = []
        rightTabs = []
    }

    function finalize() {
        leftTabs = undefined
        rightTabs = undefined
    }

    function createSidePanelTab(container, porject, iconName, label, side) {

        let sidePanel

        sidePanel = newSidePanelTab()
        sidePanel.container.connectToParent(container, false, false)
        sidePanel.tabIcon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(porject, iconName)
        sidePanel.tabLabel = label
        sidePanel.initialize(side)

        switch (side) {
            case 'left': {
                leftTabs.push(sidePanel)
                sidePanel.index = leftTabs.length
                break
            }
            case 'right': {
                rightTabs.push(sidePanel)
                sidePanel.index = rightTabs.length
                break
            }
        }

        return sidePanel
    }

    function getContainer(point, purpose) {

    }

    function physics() {
        for (let i = 0; i < leftTabs.length; i++) {
            let sideTab = leftTabs[i]
            sideTab.physics()
        }
        for (let i = 0; i < rightTabs.length; i++) {
            let sideTab = rightTabs[i]
            sideTab.physics()
        }
    }

    function draw() {
        for (let i = 0; i < leftTabs.length; i++) {
            let sideTab = leftTabs[i]
            sideTab.draw()
        }
        for (let i = 0; i < rightTabs.length; i++) {
            let sideTab = rightTabs[i]
            sideTab.draw()
        }
    }
}
