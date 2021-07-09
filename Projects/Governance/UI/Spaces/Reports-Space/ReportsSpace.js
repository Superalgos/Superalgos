function newGobernanceReportsSpace() {
    const MODULE_NAME = 'Reports Space'

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
    thisObject.container.name = MODULE_NAME
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.detectMouseOver = true
    thisObject.container.status = 'hidden'

    resize()

    let browserResizedEventSubscriptionId
    let openingEventSubscriptionId
    let closingEventSubscriptionId

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

            thisObject.sidePanelTab = UI.projects.foundations.spaces.sideSpace.createSidePanelTab(thisObject.container, 'Governance', 'governance-tab', 'Governance', 'right')

            openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
            closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

            browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        }
    }

    function resize() {
        thisObject.container.frame.width = UI.projects.governance.globals.reports.REPORTS_SPACE_WIDTH
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
    }

    function physics() {
        if (UI.projects.foundations.spaces.designSpace.workspace === undefined) { return }

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

    }
}
