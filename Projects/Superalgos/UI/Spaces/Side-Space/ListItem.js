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
    thisObject.container.frame.height = SIDE_PANEL_WIDTH * 0.40

    let prefix = "User "
    let label 
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
        label = name

        let splittedName = name.split('→')
        if (splittedName.length === 2) {
            label = splittedName[1]
            prefix = splittedName[0]
        }

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
        let backgroundColor
        let labelColor

        if (prefix === "User ") {
            backgroundColor = UI_COLOR.MANGANESE_PURPLE
        } else {
            backgroundColor = UI_COLOR.BLACK
        }

        const RED_LINE_HIGHT = 4
        const OPACITY = 1

        let params = {
            cornerRadius: 0,
            lineWidth: 1,
            container: thisObject.container,
            borderColor: UI_COLOR.BLACK,
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

        UI.projects.superalgos.utilities.drawPrint.drawLabel(label, 1 / 2, 2.5 / 10, -5, 0, 15, thisObject.container, labelColor)
        UI.projects.superalgos.utilities.drawPrint.drawLabel(prefix + type, 1 / 2, 8.5 / 10, -5, 0, 15, thisObject.container, labelColor)
        UI.projects.superalgos.utilities.drawPrint.drawIcon(icon, 1 / 2, 1 / 2, 0, 0, 50, thisObject.container)
    }
}

