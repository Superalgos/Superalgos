function newPanelsVisibleButton() {
    let thisObject = {
        container: undefined,
        fitFunction: undefined,
        parentContainer: undefined,
        panels: undefined,
        showPanels: true,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize,
        finalize: finalize
    }

    /* Container stuff */
    thisObject.container = newContainer()
    thisObject.container.name = 'Panels Visible Button'
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.frame.containerName = 'Panels Visible Button'

    let onMouseClickEventSuscriptionId
    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseClickEventSuscriptionId)
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.parentContainer = undefined
        thisObject.panels = undefined
    }

    function initialize(panels) {
        thisObject.panels = panels
        setPanelVisibility()

        thisObject.container.frame.width = 25
        thisObject.container.frame.height = 25

        let position = {
            x: thisObject.container.frame.width * 1 / 8,
            y: 45
        }

        thisObject.container.frame.position = position

        /* Lets listen to our own events to react when we have a Mouse Click */
        onMouseClickEventSuscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    }

    function onMouseClick(event) {
        if (thisObject.showPanels === false) {
            thisObject.showPanels = true
        } else {
            thisObject.showPanels = false
        }
        setPanelVisibility()
    }

    function setPanelVisibility() {
        for (let i = 0; i < thisObject.panels.length; i++) {
            let panel = UI.projects.foundations.spaces.panelSpace.getPanel(thisObject.panels[i])
            panel.isVisible = thisObject.showPanels
        }
    }

    function getContainer(point) {
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        }
    }

    function draw() {
        let icon
        if (thisObject.showPanels === true) {
            icon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName( 'Foundations', 'plotter-panel')
        } else {
            icon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName( 'Foundations', 'toggle-panel-off')
        }

        UI.projects.foundations.utilities.drawPrint.drawIcon(icon, 1 / 2, 1 / 2, 0, 0, 14, thisObject.container)
    }
}
