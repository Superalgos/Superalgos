function newGobernanceAssetsSpace() {
    const MODULE_NAME = 'Assets Space'

    let thisObject = {
        container: undefined,
        sidePanelTab: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME)
    thisObject.container.isDraggeable = false

    return thisObject

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
    }

    function initialize() {
        
        setupSidePanelTab()

        function setupSidePanelTab() {
            thisObject.sidePanelTab = newSidePanelTab()
            thisObject.sidePanelTab.container.connectToParent(thisObject.container, false, false)
            thisObject.sidePanelTab.tabIcon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName('Governance', 'governance-tab')
            thisObject.sidePanelTab.tabLabel = 'Governance'
            thisObject.sidePanelTab.initialize('right')
            openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
            closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

            browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        }
    }

    function resize() {
        thisObject.container.frame.width = UI.projects.education.globals.docs.DOCS_SPACE_WIDTH
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
    }

    function physics() {
        if (UI.projects.foundations.spaces.designSpace.workspace === undefined) { return }
        thisObject.sidePanelTab.physics()
    }

    function getContainer(point, purpose) {
        if (thisObject.sidePanelTab === undefined) { return }
        let container

        container = thisObject.sidePanelTab.getContainer(point, purpose)
        if (container !== undefined) { return container }

        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function onOpening() {

    }

    function onClosing() {

    }

    function draw() {
        thisObject.sidePanelTab.draw()
    }
}
