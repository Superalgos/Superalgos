function newListItem() {
    const MODULE_NAME = 'List Item'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    let thisObject = {
        container: undefined,
        fitFunction: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize()
    thisObject.container.isDraggeable = false
    thisObject.container.isWheelable = false
    thisObject.container.detectMouseOver = true
    thisObject.container.isClickeable = true
    thisObject.container.frame.width = SIDE_PANEL_WIDTH * 0.75
    thisObject.container.frame.height = SIDE_PANEL_WIDTH * 0.75

    let name
    let project
    let type

    let onMouseOverEventSubscriptionId
    let onMouseNotOverEventSubscriptionId
    let onMouseClickEventSubscriptionId

    let isMouseOver = false
    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseNotOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(onMouseClickEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
    }

    function initialize(pName, pProject, pType) {
        name = pName
        project = pProject
        type = pType

        onMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        onMouseNotOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseNotOver', onMouseNotOver)
        onMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)
    }

    function getContainer(point) {
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        }
    }

    function onMouseOver(event) {
        isMouseOver = true
    }

    function onMouseNotOver() {
        isMouseOver = false
    }

    function onMouseClick(event) {
        UI.projects.superalgos.spaces.designSpace.workspace.replaceWorkspaceByLoadingOne(project, name)
    }

    function physics() {

    }

    function draw() {
        let icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType('Superalgos', type)
        let backgroundColor = UI_COLOR.BLACK
        let labelColor

        const RED_LINE_HIGHT = 4
        const OPACITY = 1

        let params = {
            cornerRadius: 0,
            lineWidth: 1,
            container: thisObject.container,
            borderColor: UI_COLOR.RUSTED_RED,
            castShadow: false,
            backgroundColor: backgroundColor,
            opacity: OPACITY
        }

        if (isMouseOver === false) {
            labelColor = UI_COLOR.WHITE
        } else {
            labelColor = UI_COLOR.TITANIUM_YELLOW
        }

        UI.projects.superalgos.utilities.drawPrint.roundedCornersBackground(params)

        UI.projects.superalgos.utilities.drawPrint.drawLabel(name, 1 / 2, 3.0 / 10, -5, 0, 15, thisObject.container, labelColor)
        UI.projects.superalgos.utilities.drawPrint.drawLabel(type, 1 / 2, 7.2 / 10, -5, 0, 15, thisObject.container, labelColor)
        UI.projects.superalgos.utilities.drawPrint.drawIcon(icon, 1 / 2, 1 / 2, 0, 0, 80, thisObject.container)
    }
}
