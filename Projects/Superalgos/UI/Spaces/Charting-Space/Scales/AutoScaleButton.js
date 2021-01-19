function newAutoScaleButton() {
    let thisObject = {
        container: undefined,
        fitFunction: undefined,
        parentContainer: undefined,
        autoMinScale: undefined,
        autoMaxScale: undefined,
        setStatus: setStatus,
        draw: draw,
        getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
        initialize: initialize,
        finalize: finalize
    }

    /* Cointainer stuff */
    thisObject.container = newContainer()
    thisObject.container.name = 'Auto Scale Button'
    thisObject.container.initialize()
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = false
    thisObject.container.frame.containerName = 'Auto Scale Button'

    const ICON_SIZE = 36
    let onMouseWheelEventSubscriptionId
    let coordinateSystem
    let axis
    let currentStatus
    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(onMouseWheelEventSubscriptionId)
        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.fitFunction = undefined
        thisObject.parentContainer = undefined
        thisObject.panels = undefined

        coordinateSystem = undefined
        axis = undefined
    }

    function initialize(pAxis, pCoordinateSystem) {
        axis = pAxis
        coordinateSystem = pCoordinateSystem
        thisObject.autoMinScale = coordinateSystem.autoMinYScale
        thisObject.autoMaxScale = coordinateSystem.autoMaxYScale

        switch (axis) {
            case 'X': {
                thisObject.container.frame.width = ICON_SIZE
                thisObject.container.frame.height = ICON_SIZE

                let position = {
                    x: thisObject.container.parentContainer.frame.width * 7 / 8,
                    y: thisObject.container.parentContainer.frame.height / 2
                }

                thisObject.container.frame.position = position
                break
            }
            case 'Y': {
                thisObject.container.frame.width = ICON_SIZE
                thisObject.container.frame.height = ICON_SIZE

                let position = {
                    x: thisObject.container.parentContainer.frame.width * 7 / 8,
                    y: thisObject.container.parentContainer.frame.height / 2
                }

                thisObject.container.frame.position = position
                break
            }
        }
        onMouseWheelEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseWheel', onMouseWheel)
    }

    function setStatus(autoMinScale, autoMaxScale) {
        thisObject.autoMinScale = autoMinScale
        thisObject.autoMaxScale = autoMaxScale

        if (thisObject.autoMinScale === false && thisObject.autoMaxScale === false) {
            currentStatus = 1
        }
        if (thisObject.autoMinScale === true && thisObject.autoMaxScale === false) {
            currentStatus = 2
        }
        if (thisObject.autoMinScale === false && thisObject.autoMaxScale === true) {
            currentStatus = 4
        }
        if (thisObject.autoMinScale === true && thisObject.autoMaxScale === true) {
            currentStatus = 6
        }
    }
    function onMouseWheel(event) {
        
        currentStatus = currentStatus + event.delta
        if (currentStatus === 7) { currentStatus = 1 }
        if (currentStatus === 0) { currentStatus = 6 }

        switch (currentStatus) {
            case 1: {
                thisObject.autoMinScale = false
                thisObject.autoMaxScale = false
                update()
                return
            }
            case 2: {
                thisObject.autoMinScale = true
                thisObject.autoMaxScale = false
                update()
                return
            }
            case 3: {
                thisObject.autoMinScale = false
                thisObject.autoMaxScale = false
                update()
                return
            }
            case 4: {
                thisObject.autoMinScale = false
                thisObject.autoMaxScale = true
                update()
                return
            }
            case 5: {
                thisObject.autoMinScale = false
                thisObject.autoMaxScale = false
                update()
                return
            }
            case 6: {
                thisObject.autoMinScale = true
                thisObject.autoMaxScale = true
                update()
                return
            }
        }

        function update() {
            switch (axis) {
                case 'X': {
                    coordinateSystem.autoMinXScale = thisObject.autoMinScale
                    coordinateSystem.autoMaxXScale = thisObject.autoMaxScale
                    break
                }
                case 'Y': {
                    coordinateSystem.autoMinYScale = thisObject.autoMinScale
                    coordinateSystem.autoMaxYScale = thisObject.autoMaxScale
                    break
                }
            }

            coordinateSystem.recalculateScale()
        }
    }

    function getContainer(point, purpose) {
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        }
    }

    function draw() {
        let icon
        switch (axis) {
            case 'X': {
                if (thisObject.autoMinScale === false && thisObject.autoMaxScale === false) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-time-scale-manual')
                }
                if (thisObject.autoMinScale === true && thisObject.autoMaxScale === false) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-time-scale-auto-min')
                }
                if (thisObject.autoMinScale === false && thisObject.autoMaxScale === true) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-time-scale-auto-max')
                }
                if (thisObject.autoMinScale === true && thisObject.autoMaxScale === true) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-time-scale-auto-min-max')
                }
                UI.projects.superalgos.utilities.drawPrint.drawIcon(icon, 0, 0, 0, 0, ICON_SIZE, thisObject.container)
                break
            }
            case 'Y': {
                if (thisObject.autoMinScale === false && thisObject.autoMaxScale === false) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-scale-manual')
                }
                if (thisObject.autoMinScale === true && thisObject.autoMaxScale === false) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-scale-auto-min')
                }
                if (thisObject.autoMinScale === false && thisObject.autoMaxScale === true) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-scale-auto-max')
                }
                if (thisObject.autoMinScale === true && thisObject.autoMaxScale === true) {
                    icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'toggle-auto-scale-auto-min-max')
                }
                UI.projects.superalgos.utilities.drawPrint.drawIcon(icon, 0, 0, 0, 0, ICON_SIZE, thisObject.container)
                break
            }
        }
    }
}
