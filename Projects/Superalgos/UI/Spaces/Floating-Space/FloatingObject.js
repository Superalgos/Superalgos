
function newFloatingObject() {
    const MODULE_NAME = 'Floating Object'
    const ERROR_LOG = true

    const logger = newWebDebugLog()
    

    let thisObject = {
        fitFunction: undefined,
        container: undefined,
        positionLocked: false,
        isOnFocus: false,
        payload: undefined,                     // This is a reference to an object controlled by a Plotter. The plotter can change its internal value and we will see them from here.
        type: undefined,                        // Currently there are two types of Floating Objects: Profile Balls, and Notes.
        currentSpeed: 0,                        // This is the current speed of the floating object.
        currentMass: 0,                         // This is the current mass of the floating object, including its zoom applied.
        friction: 0,                            // This is a factor that will ultimatelly desacelerate the floating object.
        targetFriction: 0,
        rawMass: 0,                             // This is the mass value without zoom.
        rawRadius: 0,                           // This is the radius of this floating object without zoom.
        targetRadius: 0,                        // This is the target radius of the floating object with zoom applied. It should be animated until reaching this value.
        isPinned: false,
        isFrozen: false,
        angleToParent: undefined,
        distanceToParent: undefined,
        arrangementStyle: ARRANGEMENT_STYLE.CONCAVE,
        isCollapsed: false,
        isParentCollapsed: false,
        frozenManually: false,
        collapsedManually: false,
        typeStrokeStyle: undefined,
        nameStrokeStyle: undefined,
        forceFocus: forceFocus,
        removeForceFocus: removeForceFocus,
        setFocus: setFocus,
        removeFocus: removeFocus,
        unCollapseParent: unCollapseParent,
        getPinStatus: getPinStatus,
        getFreezeStatus: getFreezeStatus,
        getCollapseStatus: getCollapseStatus,
        getAngleToParent: getAngleToParent,
        getDistanceToParent: getDistanceToParent,
        getArrangementStyle: getArrangementStyle,
        nearbyFloatingObjects: [],
        setPosition: setPosition,
        pinToggle: pinToggle,
        freezeToggle: freezeToggle,
        collapseToggle: collapseToggle,
        angleToParentToggle: angleToParentToggle,
        distanceToParentToggle: distanceToParentToggle,
        arrangementStyleToggle: arrangementStyleToggle,
        physics: physics,
        invisiblePhysics: invisiblePhysics,
        initializeMass: initializeMass,
        initializeRadius: initializeRadius,
        initializeImageSize: initializeImageSize,
        initializeFontSize: initializeFontSize,
        initializeCurrentPosition: initializeCurrentPosition,
        radomizeCurrentSpeed: radomizeCurrentSpeed,
        drawBackground: drawBackground,
        drawMiddleground: drawMiddleground,
        drawForeground: drawForeground,
        drawOnFocus: drawOnFocus,
        updateMass: updateMass,                 // Function to update the mass when the zoom level changed.
        updateRadius: updateRadius,             // Function to update the radius when the zoom level changed.
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME, 'Circle')
    thisObject.container.isClickeable = true
    thisObject.container.isDraggeable = true
    thisObject.container.detectMouseOver = true
    thisObject.container.frame.radius = 0
    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0
    thisObject.typeStrokeStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
    thisObject.nameStrokeStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

    let selfMouseOverEventSubscriptionId
    let selfMouseClickEventSubscriptionId
    let spaceMouseOverEventSubscriptionId
    let spaceFocusAquiredEventSubscriptionId
    let lastParentAngle
    let forcedFocusCounter = 0

    const ON_FOCUS_RADIUS_FACTOR = 6

    return thisObject

    function finalize() {
        thisObject.container.eventHandler.stopListening(selfMouseOverEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfMouseClickEventSubscriptionId)
        UI.projects.superalgos.spaces.floatingSpace.container.eventHandler.stopListening(spaceMouseOverEventSubscriptionId)
        UI.projects.superalgos.spaces.floatingSpace.container.eventHandler.stopListening(spaceFocusAquiredEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.fitFunction = undefined
        thisObject.nearbyFloatingObjects = undefined
    }

    function initialize(type, payload) {
        thisObject.payload = payload
        thisObject.type = type

        selfMouseOverEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseOver', onMouseOver)
        selfMouseClickEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onMouseClick', onMouseClick)

        /* To consider that this object lost the focus, we monitor the space for 2 key events */
        spaceMouseOverEventSubscriptionId = UI.projects.superalgos.spaces.floatingSpace.container.eventHandler.listenToEvent('onMouseOver', mouseOverFlotingSpace)
        spaceFocusAquiredEventSubscriptionId = UI.projects.superalgos.spaces.floatingSpace.container.eventHandler.listenToEvent('onFocusAquired', someoneAquiredFocus)

        /* Assign a position and speed */

        thisObject.initializeCurrentPosition(thisObject.payload.targetPosition)
        thisObject.radomizeCurrentSpeed()
    }

    function getContainer(point) {


        if (thisObject.payload === undefined) { return }
        if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) { return }
        if (UI.projects.superalgos.spaces.floatingSpace.inMapMode === true) { return }

        let container

        container = thisObject.payload.uiObject.getContainer(point)
        if (container !== undefined) { return container }

        if (thisObject.container.frame.isThisScreenPointHere(point) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function getPinStatus() {
        return thisObject.isPinned
    }

    function pinToggle() {
        if (thisObject.isPinned !== true) {
            thisObject.isPinned = true
            thisObject.positionLocked = true
        } else {
            thisObject.isPinned = false
        }
        return thisObject.isPinned
    }

    function getFreezeStatus() {
        return thisObject.isFrozen
    }

    function getCollapseStatus() {
        return thisObject.isCollapsed
    }

    function unCollapseParent() {
        if (thisObject.payload !== undefined) {
            if (thisObject.payload.parentNode !== undefined) {
                if (thisObject.payload.parentNode.payload !== undefined) {
                    if (thisObject.payload.parentNode.payload.floatingObject !== undefined) {
                        if (thisObject.payload.parentNode.payload.floatingObject.isCollapsed === true) {
                            thisObject.payload.parentNode.payload.floatingObject.isCollapsed = false
                            thisObject.payload.parentNode.payload.floatingObject.collapsedManually = false
                            thisObject.payload.parentNode.payload.floatingObject.unCollapseParent()
                        }
                    }
                }
            }
        }
    }

    function getAngleToParent() {
        return thisObject.angleToParent
    }

    function getDistanceToParent() {
        return thisObject.distanceToParent
    }

    function getArrangementStyle() {
        return thisObject.arrangementStyle
    }

    function freezeToggle() {
        if (thisObject.isFrozen !== true) {
            thisObject.isFrozen = true
            thisObject.frozenManually = true
        } else {
            thisObject.isFrozen = false
            thisObject.frozenManually = false
        }
        return thisObject.isFrozen
    }

    function collapseToggle() {
        if (thisObject.isCollapsed !== true) {
            thisObject.isCollapsed = true
            thisObject.collapsedManually = true
        } else {
            thisObject.isCollapsed = false
            thisObject.collapsedManually = false
        }
        return thisObject.isCollapsed
    }

    function angleToParentToggle() {
        switch (thisObject.angleToParent) {
            case ANGLE_TO_PARENT.NOT_FIXED:
                thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_360
                break
            case ANGLE_TO_PARENT.RANGE_360:
                thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_180
                break
            case ANGLE_TO_PARENT.RANGE_180:
                thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_90
                break
            case ANGLE_TO_PARENT.RANGE_90:
                thisObject.angleToParent = ANGLE_TO_PARENT.RANGE_45
                break
            case ANGLE_TO_PARENT.RANGE_45:
                thisObject.angleToParent = ANGLE_TO_PARENT.NOT_FIXED
                break
        }

        return thisObject.angleToParent
    }

    function distanceToParentToggle() {
        switch (thisObject.distanceToParent) {
            case DISTANCE_TO_PARENT.NOT_FIXED:
                thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_025X
                break
            case DISTANCE_TO_PARENT.PARENT_025X:
                thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_050X
                break
            case DISTANCE_TO_PARENT.PARENT_050X:
                thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
                break
            case DISTANCE_TO_PARENT.PARENT_100X:
                thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_150X
                break
            case DISTANCE_TO_PARENT.PARENT_150X:
                thisObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_200X
                break
            case DISTANCE_TO_PARENT.PARENT_200X:
                thisObject.distanceToParent = DISTANCE_TO_PARENT.NOT_FIXED
                break
        }

        return thisObject.distanceToParent
    }

    function arrangementStyleToggle() {
        switch (thisObject.arrangementStyle) {
            case ARRANGEMENT_STYLE.CONCAVE:
                thisObject.arrangementStyle = ARRANGEMENT_STYLE.CONVEX
                break
            case ARRANGEMENT_STYLE.CONVEX:
                thisObject.arrangementStyle = ARRANGEMENT_STYLE.VERTICAL_RIGHT
                break
            case ARRANGEMENT_STYLE.VERTICAL_RIGHT:
                thisObject.arrangementStyle = ARRANGEMENT_STYLE.VERTICAL_LEFT
                break
            case ARRANGEMENT_STYLE.VERTICAL_LEFT:
                thisObject.arrangementStyle = ARRANGEMENT_STYLE.HORIZONTAL_BOTTOM
                break
            case ARRANGEMENT_STYLE.HORIZONTAL_BOTTOM:
                thisObject.arrangementStyle = ARRANGEMENT_STYLE.HORIZONTAL_TOP
                break
            case ARRANGEMENT_STYLE.HORIZONTAL_TOP:
                thisObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
                break
        }

        return thisObject.arrangementStyle
    }

    function invisiblePhysics() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.uiObject === undefined) { return }

        if (thisObject.payload.uiObject !== undefined) {
            thisObject.payload.uiObject.invisiblePhysics()
        }
    }

    function physics() {
        frozenPhysics()
        /* From here on, only if they are not too far. */
        if (UI.projects.superalgos.spaces.floatingSpace.isItFar(thisObject.payload)) { return }
        thisObjectPhysics()
        if (thisObject.payload.uiObject !== undefined) {
            thisObject.payload.uiObject.physics()
        }
        positionContraintsPhysics()
        focusPhysics()
        syncStylePhysics()
    }

    function syncStylePhysics() {
        if (thisObject.rawFontSize !== UI.projects.superalgos.spaces.floatingSpace.style.node.fontSize) {
            thisObject.rawFontSize = UI.projects.superalgos.spaces.floatingSpace.style.node.fontSize
            thisObject.targetFontSize = thisObject.rawFontSize * 1
        }
        if (thisObject.rawImageSize !== UI.projects.superalgos.spaces.floatingSpace.style.node.imageSize) {
            thisObject.rawImageSize = UI.projects.superalgos.spaces.floatingSpace.style.node.imageSize
            thisObject.targetImageSize = thisObject.rawImageSize * 1
        }
        thisObject.typeStrokeStyle = 'rgba(' + UI.projects.superalgos.spaces.floatingSpace.style.node.type.fontColor + ', 1)'
        thisObject.nameStrokeStyle = 'rgba(' + UI.projects.superalgos.spaces.floatingSpace.style.node.name.fontColor + ', 1)'
    }

    function focusPhysics() {
        forcedFocusCounter--
        if (forcedFocusCounter < 0) {
            forcedFocusCounter = 0
        }
    }

    function frozenPhysics() {
        if (thisObject.frozenManually !== false) { return }
        if (thisObject.payload === undefined) { return }
        let parent = thisObject.payload.chainParent
        if (parent !== undefined) {
            if (parent.payload !== undefined) {
                if (parent.payload.floatingObject !== undefined) {
                    thisObject.isFrozen = parent.payload.floatingObject.isFrozen
                }
            }
        }
    }

    function positionContraintsPhysics() {
        const MAX_DISTANCE_TO_PARENT = 5000
        const MIN_DISTANCE_TO_PARENT = 100
        const DEFAULT_NODE_TO_NODE_DISTANCE = 500 * UI.projects.superalgos.spaces.floatingSpace.settings.node.distancePercentage / 100

        if (thisObject.angleToParent !== ANGLE_TO_PARENT.NOT_FIXED && thisObject.isOnFocus !== true) {
            let parent = thisObject.payload.chainParent
            let distanceToParent
            let parentChildren
            let parentDistanceToGarndParent
            if (parent === undefined) {
                parentDistanceToGarndParent = DEFAULT_NODE_TO_NODE_DISTANCE
                distanceToParent = DEFAULT_NODE_TO_NODE_DISTANCE
                parentChildren = 1
            } else {
                if (parent.payload === undefined) { return }
                if (parent.payload.position === undefined) { return }
                distanceToParent = Math.sqrt(Math.pow(parent.payload.position.x - thisObject.container.frame.position.x, 2) + Math.pow(parent.payload.position.y - thisObject.container.frame.position.y, 2))  // ... we calculate the distance ...
                parentChildren = UI.projects.superalgos.spaces.designSpace.workspace.nodeChildren.childrenCount(parent, thisObject.payload.node)
                parentDistanceToGarndParent = parent.payload.distance
            }

            let axisCount = parentChildren.childrenCount
            let axisIndex = parentChildren.childIndex
            let baseAngle = 0
            let angleToParentAngle

            if (parentDistanceToGarndParent !== undefined) {
                switch (thisObject.distanceToParent) {
                    case DISTANCE_TO_PARENT.PARENT_025X:
                        distanceToParent = parentDistanceToGarndParent / 4
                        break
                    case DISTANCE_TO_PARENT.PARENT_050X:
                        distanceToParent = parentDistanceToGarndParent / 2
                        break
                    case DISTANCE_TO_PARENT.PARENT_100X:
                        distanceToParent = parentDistanceToGarndParent
                        break
                    case DISTANCE_TO_PARENT.PARENT_150X:
                        distanceToParent = parentDistanceToGarndParent * 1.5
                        break
                    case DISTANCE_TO_PARENT.PARENT_200X:
                        distanceToParent = parentDistanceToGarndParent * 2
                        break
                }
            }

            if (distanceToParent > MAX_DISTANCE_TO_PARENT) {
                distanceToParent = MAX_DISTANCE_TO_PARENT
            }

            if (distanceToParent < MIN_DISTANCE_TO_PARENT) {
                distanceToParent = MIN_DISTANCE_TO_PARENT
            }

            switch (thisObject.angleToParent) {
                case ANGLE_TO_PARENT.RANGE_360:
                    angleToParentAngle = 360
                    break
                case ANGLE_TO_PARENT.RANGE_180:
                    angleToParentAngle = 180
                    break
                case ANGLE_TO_PARENT.RANGE_90:
                    angleToParentAngle = 90
                    break
                case ANGLE_TO_PARENT.RANGE_45:
                    angleToParentAngle = 45
                    break
            }

            if (axisIndex === undefined) {
                axisCount = 1
                axisIndex = axisCount
            }

            if (parent !== undefined) {
                if (parent.payload.chainParent !== undefined && parent.payload.angle !== undefined) {
                    axisCount++
                    axisIndex++
                    baseAngle = parent.payload.angle + 180
                    lastParentAngle = parent.payload.angle
                } else {
                    if (lastParentAngle !== undefined) {
                        axisCount++
                        axisIndex++
                        baseAngle = lastParentAngle + 180
                    }
                }
            }

            let separatorAngle = (360 - angleToParentAngle) / 2
            let angleStep = angleToParentAngle / axisCount

            thisObject.payload.angle = baseAngle + separatorAngle + (axisIndex - 1) * angleStep
            if (thisObject.payload.angle >= 360) {
                thisObject.payload.angle = thisObject.payload.angle - 360
            }

            thisObject.payload.distance = distanceToParent

            if (thisObject.isPinned === true) {
                /* When an object is pinned, its angle to its parent needs to be calculated since it depends on where the user places the node. */
                /*
                if (thisObject.payload.chainParent !== undefined) {
                  let x = thisObject.container.frame.position.x - thisObject.payload.chainParent.payload.floatingObject.container.frame.position.x
                  let y = thisObject.container.frame.position.y - thisObject.payload.chainParent.payload.floatingObject.container.frame.position.y
        
                  thisObject.payload.angle = Math.atan(y / x)
                }
                */
                return
            }

            let newPosition
            if (parent !== undefined) {
                newPosition = {
                    x: parent.payload.position.x,
                    y: parent.payload.position.y
                }
            } else {
                return
            }

            let displacement

            switch (thisObject.arrangementStyle) {
                case ARRANGEMENT_STYLE.CONCAVE: {
                    displacement = {
                        x: distanceToParent * Math.cos(toRadians(thisObject.payload.angle)),
                        y: distanceToParent * Math.sin(toRadians(thisObject.payload.angle))
                    }

                    break
                }
                case ARRANGEMENT_STYLE.CONVEX: {
                    displacement = {
                        x: 2 * distanceToParent * Math.cos(toRadians(lastParentAngle)) + distanceToParent * Math.cos(toRadians(thisObject.payload.angle + 180)),
                        y: 2 * distanceToParent * Math.sin(toRadians(lastParentAngle)) + distanceToParent * Math.sin(toRadians(thisObject.payload.angle + 180))
                    }
                    break
                }
                case ARRANGEMENT_STYLE.HORIZONTAL_BOTTOM: {
                    displacement = {
                        x: distanceToParent * Math.tan(toRadians(thisObject.payload.angle)),
                        y: distanceToParent
                    }
                    break
                }
                case ARRANGEMENT_STYLE.HORIZONTAL_TOP: {
                    displacement = {
                        x: -distanceToParent * Math.tan(toRadians(thisObject.payload.angle)),
                        y: -distanceToParent
                    }
                    break
                }
                case ARRANGEMENT_STYLE.VERTICAL_RIGHT: {
                    displacement = {
                        x: distanceToParent,
                        y: distanceToParent * Math.tan(toRadians(thisObject.payload.angle))
                    }
                    break
                }
                case ARRANGEMENT_STYLE.VERTICAL_LEFT: {
                    displacement = {
                        x: -distanceToParent,
                        y: -distanceToParent * Math.tan(toRadians(thisObject.payload.angle))
                    }
                    break
                }
            }

            if (displacement.x > MAX_DISTANCE_TO_PARENT) {
                displacement.x = MAX_DISTANCE_TO_PARENT
            }
            if (displacement.y > MAX_DISTANCE_TO_PARENT) {
                displacement.y = MAX_DISTANCE_TO_PARENT
            }

            newPosition.x = newPosition.x + displacement.x
            newPosition.y = newPosition.y + displacement.y

            if (isNaN(newPosition.x) === false) {
                thisObject.container.frame.position.x = newPosition.x
            }
            if (isNaN(newPosition.y) === false) {
                thisObject.container.frame.position.y = newPosition.y
            }
        }
    }

    function thisObjectPhysics() {

        const ANIMATION_STEPS = UI.projects.superalgos.spaces.floatingSpace.settings.node.animationSteps

        imageSizePhysics()
        fontSizePhysics()
        radiusPhysics()

        /* Floating object position in screen coordinates */
        thisObject.payload.position.x = thisObject.container.frame.position.x
        thisObject.payload.position.y = thisObject.container.frame.position.y

        function imageSizePhysics() {
            // The imageSize also have a target.
            let imageSizeStep = (thisObject.targetImageSize - thisObject.currentImageSize) / ANIMATION_STEPS
            thisObject.currentImageSize = thisObject.currentImageSize + imageSizeStep
            if (thisObject.isOnFocus === true) {
                if (thisObject.currentImageSize > thisObject.targetImageSize) {
                    thisObject.currentImageSize = thisObject.targetImageSize
                }
            } else {
                if (thisObject.currentImageSize < thisObject.targetImageSize) {
                    thisObject.currentImageSize = thisObject.targetImageSize
                }
            }
        }

        function fontSizePhysics() {
            // The fontSize also have a target.
            let fontSizeStep = (thisObject.targetFontSize - thisObject.currentFontSize) / ANIMATION_STEPS
            thisObject.currentFontSize = thisObject.currentFontSize + fontSizeStep
            if (thisObject.isOnFocus === true) {
                if (thisObject.currentFontSize > thisObject.targetFontSize) {
                    thisObject.currentFontSize = thisObject.targetFontSize
                }
            } else {
                if (thisObject.currentFontSize < thisObject.targetFontSize) {
                    thisObject.currentFontSize = thisObject.targetFontSize
                }
            }
        }

        function radiusPhysics() {
            let animationStepSize

            if (thisObject.isOnFocus === true) {
                animationStepSize = (targetRadiusWithFocus() - targetRadiusWithoutFocus()) / ANIMATION_STEPS
                if (thisObject.container.frame.radius >= targetRadiusWithFocus()) { return }
                thisObject.container.frame.radius = thisObject.container.frame.radius + animationStepSize
                if (thisObject.container.frame.radius >= targetRadiusWithFocus()) {
                    thisObject.container.frame.radius = targetRadiusWithFocus()
                }
                thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
            } else {
                animationStepSize = (targetRadiusWithoutFocus() - targetRadiusWithFocus()) / ANIMATION_STEPS
                if (thisObject.container.frame.radius <= targetRadiusWithoutFocus()) { return }
                thisObject.container.frame.radius = thisObject.container.frame.radius + animationStepSize
                if (thisObject.container.frame.radius <= targetRadiusWithoutFocus()) {
                    thisObject.container.frame.radius = targetRadiusWithoutFocus()
                }
                thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
            }

        }
    }

    function onMouseOver(point) {
        if (thisObject.isOnFocus === false) {
            setFocus(point)
        }
    }

    function mouseOverFlotingSpace(point) {
        removeFocus()
    }

    function someoneAquiredFocus(floatingObject) {
        if (floatingObject === undefined || floatingObject.container === undefined) {
            return
        }
        if (thisObject.container === undefined) {
            return
        }
        if (floatingObject.container.id !== thisObject.container.id) {
            removeFocus()
        }
    }

    function forceFocus() {
        forcedFocusCounter = 10
        setFocus()
    }

    function removeForceFocus() {
        forcedFocusCounter = 0
        removeFocus()
    }

    function targetRadiusWithFocus() {
        return thisObject.rawRadius * ON_FOCUS_RADIUS_FACTOR * UI.projects.superalgos.spaces.floatingSpace.settings.node.radiusPercentage / 100
    }

    function targetRadiusWithoutFocus() {
        return thisObject.rawRadius * 1 * UI.projects.superalgos.spaces.floatingSpace.settings.node.radiusPercentage / 100
    }

    function setFocus(point) {
        thisObject.targetRadius = targetRadiusWithFocus()
        thisObject.currentMass = thisObject.rawMass * UI.projects.superalgos.spaces.floatingSpace.settings.node.massPercentage / 100
        thisObject.targetImageSize = thisObject.rawImageSize * 2.0
        thisObject.targetFontSize = thisObject.rawFontSize * 2.0

        thisObject.payload.uiObject.container.eventHandler.raiseEvent('onFocus', point)

        thisObject.positionLocked = true

        UI.projects.superalgos.spaces.floatingSpace.container.eventHandler.raiseEvent('onFocusAquired', thisObject)
        thisObject.isOnFocus = true
    }

    function removeFocus() {
        if (forcedFocusCounter > 0) {
            return
        }
        if (thisObject.payload === undefined) { return }
        if (thisObject.isOnFocus === true) {
            thisObject.targetRadius = targetRadiusWithoutFocus()
            thisObject.currentMass = thisObject.rawMass * UI.projects.superalgos.spaces.floatingSpace.settings.node.massPercentage / 100
            thisObject.targetImageSize = thisObject.rawImageSize * 1
            thisObject.targetFontSize = thisObject.rawFontSize * 1

            thisObject.payload.uiObject.container.eventHandler.raiseEvent('onNotFocus', thisObject.container)

            if (thisObject.isPinned !== true) {
                thisObject.positionLocked = false
            }
            thisObject.isOnFocus = false
        }
    }

    function onMouseClick(pPoint) {
        let event = {
            point: pPoint,
            parent: thisObject
        }
        thisObject.payload.uiObject.container.eventHandler.raiseEvent('onMouseClick', event)
    }

    function drawBackground() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.uiObject === undefined) { return }

        if (UI.projects.superalgos.spaces.floatingSpace.isItFar(thisObject.payload) && thisObject.payload.uiObject.isShowing === false) { return }
        if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) {
            if (thisObject.payload.uiObject.isShowing !== true) {
                return
            }
        }
        thisObject.payload.uiObject.drawBackground()
    }

    function drawMiddleground() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.uiObject === undefined) { return }

        if (UI.projects.superalgos.spaces.floatingSpace.isItFar(thisObject.payload) && thisObject.payload.uiObject.isShowing === false) { return }
        if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) {
            if (thisObject.payload.uiObject.isShowing !== true) {
                return
            }
        }
        thisObject.payload.uiObject.drawMiddleground()
    }

    function drawForeground() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.uiObject === undefined) { return }

        if (UI.projects.superalgos.spaces.floatingSpace.isItFar(thisObject.payload) && thisObject.payload.uiObject.isShowing === false) { return }
        if ((thisObject.isCollapsed === true && thisObject.collapsedManually === false) || thisObject.isParentCollapsed === true) {
            if (thisObject.payload.uiObject.isShowing !== true) {
                return
            }
        }
        thisObject.payload.uiObject.drawForeground()
    }

    function drawOnFocus() {
        if (thisObject.payload === undefined) { return }
        if (thisObject.payload.uiObject === undefined) { return }

        thisObject.payload.uiObject.drawOnFocus()
    }

    function initializeMass(suggestedValue) {
        let mass = suggestedValue
        if (mass < 0.1) {
            mass = 0.1
        }

        thisObject.rawMass = mass
        thisObject.currentMass = mass
    }

    function initializeRadius(suggestedValue) {
        let radius = suggestedValue
        if (radius < 2) {
            radius = 2
        }

        thisObject.rawRadius = radius
        thisObject.targetRadius = radius * UI.projects.superalgos.spaces.floatingSpace.settings.node.radiusPercentage / 100
        thisObject.container.frame.radius = radius

        thisObject.container.eventHandler.raiseEvent('Dimmensions Changed', event)
    }

    function initializeImageSize(suggestedValue) {
        let size = suggestedValue
        if (size < 2) {
            size = 2
        }

        thisObject.rawImageSize = size
        thisObject.targetImageSize = size
        thisObject.currentImageSize = size / 3
    }

    function initializeFontSize(suggestedValue) {
        let size = suggestedValue
        if (size < 3) {
            size = 3
        }

        thisObject.rawFontSize = size
        thisObject.targetFontSize = size
        thisObject.currentFontSize = size / 3
    }

    function initializeCurrentPosition(arroundPoint) {
        let position = {}

        if (thisObject.payload.position === undefined) {
            position = {
                x: Math.floor((Math.random() * (200) - 100)) + arroundPoint.x,
                y: Math.floor((Math.random() * (200) - 100)) + arroundPoint.y
            }
        } else {
            position = {
                x: thisObject.payload.position.x,
                y: thisObject.payload.position.y
            }
        }

        setPosition(position)
    }

    function setPosition(position) {
        thisObject.container.frame.position.x = position.x
        thisObject.container.frame.position.y = position.y

        thisObject.payload.position = {}
        thisObject.payload.position.x = position.x
        thisObject.payload.position.y = position.y
    }

    function radomizeCurrentSpeed() {
        var initialXDirection
        var randomX = Math.floor((Math.random() * 10) + 1)
        if (randomX > 5) {
            initialXDirection = 1
        } else {
            initialXDirection = -1
        }

        var initialYDirection
        var randomY = Math.floor((Math.random() * 10) + 1)
        if (randomY > 5) {
            initialYDirection = 1
        } else {
            initialYDirection = -1
        }

        var velocity = {
            x: initialXDirection * Math.floor((Math.random() * 300) + 1) / 100,
            y: initialYDirection * Math.floor((Math.random() * 300) + 1) / 100
        }

        thisObject.currentSpeed = velocity
    }

    function updateMass() {

    }

    function updateRadius() {
    }
}
