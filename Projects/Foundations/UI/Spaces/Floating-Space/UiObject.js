
function newUiObject() {
    const MODULE_NAME = 'UI Object'
    const ERROR_LOG = true

    const logger = newWebDebugLog()


    let thisObject = {
        fitFunction: undefined,
        isVisibleFunction: undefined,
        type: undefined,
        menu: undefined,
        isOnFocus: false,
        container: undefined,
        payload: undefined,
        conditionEditor: undefined,
        listSelector: undefined,
        uiObjectTitle: undefined,
        icon: undefined,
        uiObjectMessage: undefined,
        circularProgressBar: undefined,
        isLoading: undefined,
        isRunning: undefined,
        isPlaying: undefined,
        shortcutKey: undefined,
        isShowing: undefined,
        hasError: undefined,
        hasWarning: undefined,
        hasInfo: undefined,
        valueAtAngle: false,
        valueAngleOffset: 0,
        percentageAtAngle: false,
        percentageAngleOffset: 0,
        statusAtAngle: false,
        statusAngleOffset: 0,
        run: run,
        stop: stop,
        heartBeat: heartBeat,
        getReadyToChainAttach: getReadyToChainAttach,
        showAvailabilityToChainAttach: showAvailabilityToChainAttach,
        getReadyToReferenceAttach: getReadyToReferenceAttach,
        showAvailabilityToReferenceAttach: showAvailabilityToReferenceAttach,
        highlight: highlight,
        runningAtBackend: runningAtBackend,
        reset: reset,
        setErrorMessage: setErrorMessage,
        resetErrorMessage: resetErrorMessage,
        setWarningMessage: setWarningMessage,
        resetWarningMessage: resetWarningMessage,
        setInfoMessage: setInfoMessage,
        resetInfoMessage: resetInfoMessage,
        getValue: getValue,
        setValue: setValue,
        resetValue: resetValue,
        setPercentage: setPercentage,
        resetPercentage: resetPercentage,
        setStatus: setStatus,
        resetStatus: resetStatus,
        physics: physics,
        invisiblePhysics: invisiblePhysics,
        drawBackground: drawBackground,
        drawMiddleground: drawMiddleground,
        drawForeground: drawForeground,
        drawOnFocus: drawOnFocus,
        getContainer: getContainer,
        finalize: finalize,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize(MODULE_NAME, 'Circle')
    thisObject.container.isClickeable = false
    thisObject.container.isDraggeable = false
    thisObject.container.frame.radius = 0
    thisObject.container.frame.position.x = 0
    thisObject.container.frame.position.y = 0

    let icon
    let executingIcon

    let selfFocusEventSubscriptionId
    let selfNotFocusEventSubscriptionId
    let selfDisplaceEventSubscriptionId
    let selfDragStartedEventSubscriptionId
    let selfDragFinishedEventSubscriptionId

    let isHighlighted
    let highlightCounter = 0

    let isRunningAtBackend
    let runningAtBackendCounter = 0

    let errorMessageCounter = 0
    let warningMessageCounter = 0
    let infoMessageCounter = 0

    let hasValue
    let valueCounter = 0

    let hasPercentage
    let percentageCounter = 0

    let hasStatus
    let statusCounter = 0

    let previousDistanceToChainParent
    let readyToChainAttachDisplayCounter = 5
    let readyToChainAttachDisplayIncrement = 0.1
    let readyToChainAttachCounter = 0
    let isReadyToChainAttach
    let availableToChainAttachCounter = 0
    let isAvailableToChainAttach
    let isChainAttaching = false
    let chainAttachToNode

    let previousDistanceToReferenceParent
    let readyToReferenceAttachDisplayCounter = 5
    let readyToReferenceAttachDisplayIncrement = 0.1
    let readyToReferenceAttachCounter = 0
    let isReadyToReferenceAttach
    let availableToReferenceAttachCounter = 0
    let isAvailableToReferenceAttach
    let isReferenceAttaching = false
    let referenceAttachToNode

    let isDragging = false

    let errorMessage = ''
    let warningMessage = ''
    let infoMessage = ''

    let errorDocs = undefined
    let warningDocs = undefined
    let infoDocs = undefined

    let currentValue = 0
    let valueMinDecimals = undefined
    let currentPercentage = ''
    let currentStatus = ''
    let rightDragging = false

    let eventSubscriptionIdOnError
    let eventSubscriptionIdOnWarning
    let eventSubscriptionIdOnInfo
    let eventSubscriptionIdOnRunning
    let eventSubscriptionIdOnStopped

    let lastHeartBeat
    let onRunningCallBackFunction
    let onRunningCallBackFunctionWasCalled = false

    let newUiObjectCounter = 25
    let referenceLineCounter = 0
    let chainLineCounter = 0

    let eventsServerClient

    let errorRingAnimation = 0
    let warningRingAnimation = 0
    let infoRingAnimation = 0
    let errorRingDirectionAnimation = 1
    let warningRingDirectionAnimation = 1
    let infoRingDirectionAnimation = 1

    thisObject.isRunning = false

    return thisObject

    function finalize() {
        finalizeEventsServerClient()

        thisObject.container.eventHandler.stopListening(selfFocusEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfNotFocusEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfDisplaceEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfDragStartedEventSubscriptionId)
        thisObject.container.eventHandler.stopListening(selfDragFinishedEventSubscriptionId)

        thisObject.container.finalize()
        thisObject.container = undefined
        thisObject.payload = undefined
        thisObject.menu.finalize()
        thisObject.menu = undefined
        thisObject.uiObjectTitle.finalize()
        thisObject.uiObjectTitle = undefined
        thisObject.uiObjectMessage.finalize()
        thisObject.uiObjectMessage = undefined
        thisObject.fitFunction = undefined
        thisObject.isVisibleFunction = undefined



        if (thisObject.conditionEditor !== undefined) {
            thisObject.conditionEditor.finalize()
            thisObject.conditionEditor = undefined
        }


        if (thisObject.listSelector !== undefined) {
            thisObject.listSelector.finalize()
            thisObject.listSelector = undefined
        }

        icon = undefined
        chainAttachToNode = undefined
        referenceAttachToNode = undefined
        lastHeartBeat = undefined

        onRunningCallBackFunction = undefined

        errorDocs = undefined
        warningDocs = undefined
        infoDocs = undefined
    }

    function finalizeEventsServerClient() {
        if (eventsServerClient !== undefined) {
            let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id

            if (eventSubscriptionIdOnRunning !== undefined) {
                eventsServerClient.stopListening(key, eventSubscriptionIdOnRunning, 'UiObject')
            }
            if (eventSubscriptionIdOnStopped !== undefined) {
                eventsServerClient.stopListening(key, eventSubscriptionIdOnStopped, 'UiObject')
            }
            if (eventSubscriptionIdOnError !== undefined) {
                eventsServerClient.stopListening(key, eventSubscriptionIdOnError, 'UiObject')
            }
            if (eventSubscriptionIdOnWarning !== undefined) {
                eventsServerClient.stopListening(key, eventSubscriptionIdOnWarning, 'UiObject')
            }
            if (eventSubscriptionIdOnInfo !== undefined) {
                eventsServerClient.stopListening(key, eventSubscriptionIdOnInfo, 'UiObject')
            }
        }
    }

    function initialize(payload, menuItemsInitialValues) {
        thisObject.payload = payload

        /* Initialize the Menu */

        thisObject.menu = newCircularMenu()
        thisObject.menu.initialize(menuItemsInitialValues, thisObject.payload)
        thisObject.menu.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)

        /* Initialize UI Object Title */

        thisObject.uiObjectTitle = newUiObjectTitle()
        thisObject.uiObjectTitle.isVisibleFunction = thisObject.isVisibleFunction
        thisObject.uiObjectTitle.container.connectToParent(thisObject.container, false, false, true, true, false, false, true, true)
        thisObject.uiObjectTitle.fitFunction = thisObject.fitFunction
        thisObject.uiObjectTitle.initialize(thisObject.payload)

        /* Initialize UI Object Message */

        thisObject.uiObjectMessage = newUiObjectMessage()
        thisObject.uiObjectMessage.isVisibleFunction = thisObject.isVisibleFunction
        thisObject.uiObjectMessage.container.connectToParent(thisObject.container, false, false, true, true, false, false, false, true)
        thisObject.uiObjectMessage.fitFunction = thisObject.fitFunction
        thisObject.uiObjectMessage.initialize(thisObject.payload)

        /* Load UI Object Image */

        iconPhysics()

        if (thisObject.icon === undefined) {
            console.log('[ERROR] uiObject -> initialize -> err = Icon not found, Project: "' + thisObject.payload.node.project + '", Type: "' + thisObject.payload.node.type + '"')
        }

        selfFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onFocus', onFocus)
        selfNotFocusEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onNotFocus', onNotFocus)
        selfDisplaceEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDisplace', onDisplace)
        selfDragStartedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragStarted', onDragStarted)
        selfDragFinishedEventSubscriptionId = thisObject.container.eventHandler.listenToEvent('onDragFinished', onDragFinished)
    }

    function getContainer(point) {

        let container

        if (isDragging === false && thisObject.isOnFocus === true) {


            if (thisObject.conditionEditor !== undefined) {
                container = thisObject.conditionEditor.getContainer(point)
                if (container !== undefined) { return container }
            }

            if (thisObject.listSelector !== undefined) {
                container = thisObject.listSelector.getContainer(point)
                if (container !== undefined) { return container }
            }

            let getitle = true

            if (thisObject.conditionEditor !== undefined) {
                if (thisObject.conditionEditor.visible === true) {
                    getitle = false
                }
            }
            if (thisObject.listSelector !== undefined) {
                if (thisObject.listSelector.visible === true) {
                    getitle = false
                }
            }

            if (getitle === true) {
                container = thisObject.uiObjectTitle.getContainer(point)
                if (container !== undefined) { return container }
            }

            container = thisObject.uiObjectMessage.getContainer(point)
            if (container !== undefined) { return container }

            container = thisObject.menu.getContainer(point)
            if (container !== undefined) { return container }
        }

        if (thisObject.container.frame.isThisPointHere(point, true, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function invisiblePhysics() {
        thisObject.menu.invisiblePhysics()
        childrenRunningPhysics()
        thisObject.uiObjectTitle.physics()
        thisObject.uiObjectMessage.physics()
    }

    function physics() {
        thisObject.menu.physics()
        thisObject.uiObjectTitle.physics()

        thisObject.menu.physics()
        thisObject.uiObjectMessage.physics()


        if (thisObject.conditionEditor !== undefined) {
            thisObject.conditionEditor.physics()
        }


        if (thisObject.listSelector !== undefined) {
            thisObject.listSelector.physics()
        }

        if (thisObject.payload.chainParent === undefined || thisObject.payload.chainParent.payload === undefined) {
            thisObject.payload.targetPosition.x = thisObject.payload.position.x,
                thisObject.payload.targetPosition.y = thisObject.payload.position.y
        } else {
            if (thisObject.payload.chainParent.payload.position !== undefined) {
                thisObject.payload.targetPosition.x = thisObject.payload.chainParent.payload.position.x
                thisObject.payload.targetPosition.y = thisObject.payload.chainParent.payload.position.y
            }
        }

        if (thisObject.circularProgressBar !== undefined) {
            thisObject.circularProgressBar.physics()
        }

        iconPhysics()
        highlightPhisycs()
        runningAtBackendPhisycs()
        errorMessagePhisycs()
        warningMessagePhisycs()
        infoMessagePhisycs()
        valuePhisycs()
        percentagePhisycs()
        statusPhisycs()
        chainDetachingPhysics()
        chainAttachingPhysics()
        referenceDetachingPhysics()
        referenceAttachingPhysics()
        childrenRunningPhysics()
        newObjectPhysics()
        referenceLinePhysics()
        chainLinePhysics()
        ringsAnimationPhysics()

        function ringsAnimationPhysics() {
            errorRingAnimation = errorRingAnimation + errorRingDirectionAnimation
            warningRingAnimation = warningRingAnimation + warningRingDirectionAnimation
            infoRingAnimation = infoRingAnimation + infoRingDirectionAnimation

            if (errorRingAnimation === 10) { errorRingDirectionAnimation = -1 }
            if (warningRingAnimation === 10) { warningRingDirectionAnimation = -1 }
            if (infoRingAnimation === 10) { infoRingDirectionAnimation = -1 }

            if (errorRingAnimation === 0) { errorRingDirectionAnimation = 1 }
            if (warningRingAnimation === 0) { warningRingDirectionAnimation = 1 }
            if (infoRingAnimation === 0) { infoRingDirectionAnimation = 1 }
        }

        function referenceLinePhysics() {
            referenceLineCounter = referenceLineCounter + 2
            if (referenceLineCounter > 500) {
                referenceLineCounter = 0
            }
        }

        function chainLinePhysics() {
            chainLineCounter = chainLineCounter - 5
            if (chainLineCounter < 0) {
                chainLineCounter = 500
            }
        }

        function newObjectPhysics() {
            newUiObjectCounter--
            if (newUiObjectCounter < 0) {
                newUiObjectCounter = 0
            }
        }

        function chainAttachingPhysics() {
            chainAttacchingCounters()

            if (thisObject.isOnFocus !== true) { return }
            if (isDragging !== true) { return }
            if (rightDragging !== true) { return }
            if (thisObject.payload.chainParent !== undefined) { return }

            UI.projects.foundations.spaces.floatingSpace.floatingLayer.isProximityPhysicsNeeded = true

            let nearbyFloatingObjects = thisObject.payload.floatingObject.nearbyFloatingObjects
            let compatibleTypes

            let schemaDocument = getSchemaDocument(thisObject.payload.node)
            if (schemaDocument !== undefined) {
                if (schemaDocument.attachingRules !== undefined) {
                    compatibleTypes = schemaDocument.attachingRules.compatibleTypes
                } else {
                    return
                }
            } else {
                return
            }

            let foundCompatible = false
            chainAttachToNode = undefined
            isChainAttaching = false

            for (let i = 0; i < nearbyFloatingObjects.length; i++) {
                let nearby = nearbyFloatingObjects[i]
                let distance = nearby[0]
                let floatingObject = nearby[1]
                if (floatingObject.payload === undefined) { continue }
                let nearbyNode = floatingObject.payload.node
                if (compatibleTypes.indexOf('->' + nearbyNode.type + '->') >= 0) {
                    /* Discard App Schema defined objects with busy connection ports */
                    schemaDocument = getSchemaDocument(thisObject.payload.node)
                    if (schemaDocument !== undefined) {
                        let mustContinue = false
                        let parentSchemaDocument = getSchemaDocument(nearbyNode)
                        if (parentSchemaDocument !== undefined) {
                            if (parentSchemaDocument.childrenNodesProperties !== undefined) {
                                for (let j = 0; j < parentSchemaDocument.childrenNodesProperties.length; j++) {
                                    let property = parentSchemaDocument.childrenNodesProperties[j]
                                    if (schemaDocument.propertyNameAtParent === property.name) {
                                        switch (property.type) {
                                            case 'node': {
                                                if (nearbyNode[property.name] !== undefined) {
                                                    mustContinue = true
                                                }
                                            }
                                                break
                                            case 'array': {
                                                /* Nothing to worry about since an array can take more than one element. */
                                            }
                                                break
                                        }
                                    }
                                }
                            }
                        }
                        if (mustContinue === true) { continue }
                    }

                    /* Discard Phases without parent */
                    if (thisObject.payload.node.type === 'Phase' && nearbyNode.type === 'Phase' && nearbyNode.payload.parentNode === undefined) { continue }
                    /* Control maxPhases */
                    if (thisObject.payload.node.type === 'Phase') {
                        if (nearbyNode.maxPhases !== undefined) {
                            if (nearbyNode.phases.length >= nearbyNode.maxPhases) {
                                continue
                            }
                        }
                    }
                    if (thisObject.payload.node.type === 'Phase' && nearbyNode.type === 'Phase') {
                        if (nearbyNode.payload.parentNode.maxPhases !== undefined) {
                            if (nearbyNode.payload.parentNode.phases.length >= nearbyNode.payload.parentNode.maxPhases) {
                                continue
                            }
                        }
                    }
                    if (foundCompatible === false) {
                        if (distance < thisObject.payload.floatingObject.container.frame.radius * 1.5 + floatingObject.container.frame.radius * 1.5) {
                            nearbyNode.payload.uiObject.getReadyToChainAttach()
                            isChainAttaching = true
                            chainAttachToNode = nearbyNode
                            foundCompatible = true
                        }
                    }
                    nearbyNode.payload.uiObject.showAvailabilityToChainAttach()
                }
            }

            function chainAttacchingCounters() {
                if (readyToChainAttachDisplayCounter > 15) {
                    readyToChainAttachDisplayIncrement = -0.25
                }

                if (readyToChainAttachDisplayCounter < 5) {
                    readyToChainAttachDisplayIncrement = 0.25
                }

                readyToChainAttachDisplayCounter = readyToChainAttachDisplayCounter + readyToChainAttachDisplayIncrement

                readyToChainAttachCounter--
                if (readyToChainAttachCounter <= 0) {
                    readyToChainAttachCounter = 0
                    isReadyToChainAttach = false
                } else {
                    isReadyToChainAttach = true
                }

                availableToChainAttachCounter--
                if (availableToChainAttachCounter <= 0) {
                    availableToChainAttachCounter = 0
                    isAvailableToChainAttach = false
                } else {
                    isAvailableToChainAttach = true
                }
            }
        }

        function chainDetachingPhysics() {
            if (isDragging !== true) { return }
            if (rightDragging === false) { return }
            if (UI.projects.foundations.spaces.floatingSpace.settings.detachUsingMouse !== true) { return }

            let distanceToChainParent = Math.sqrt(Math.pow(thisObject.payload.position.x - thisObject.payload.targetPosition.x, 2) + Math.pow(thisObject.payload.position.y - thisObject.payload.targetPosition.y, 2))
            let ratio = distanceToChainParent / previousDistanceToChainParent
            if (previousDistanceToChainParent === 0) {
                previousDistanceToChainParent = distanceToChainParent
                return
            }
            previousDistanceToChainParent = distanceToChainParent

            if (thisObject.isOnFocus !== true) { return }
            if (thisObject.payload.chainParent === undefined) { return }
            if (thisObject.payload.parentNode === undefined) { return }

            let THRESHOLD = 1.15

            if (ratio > THRESHOLD) {
                UI.projects.foundations.spaces.designSpace.workspace.executeAction({ node: thisObject.payload.node, name: 'Parent Detach', project: 'Visual-Scripting' })
            }
        }

        function referenceAttachingPhysics() {
            referenceAttacchingCounters()

            if (thisObject.isOnFocus !== true) { return }
            if (isDragging !== true) { return }
            if (rightDragging !== true) { return }
            if (thisObject.payload.referenceParent !== undefined) { return }

            UI.projects.foundations.spaces.floatingSpace.floatingLayer.isProximityPhysicsNeeded = true

            let nearbyFloatingObjects = thisObject.payload.floatingObject.nearbyFloatingObjects
            let compatibleTypes

            let schemaDocument = getSchemaDocument(thisObject.payload.node)
            if (schemaDocument !== undefined) {
                if (schemaDocument.referencingRules !== undefined) {
                    compatibleTypes = schemaDocument.referencingRules.compatibleTypes
                } else {
                    return
                }
            } else {
                return
            }

            let foundCompatible = false
            referenceAttachToNode = undefined
            isReferenceAttaching = false

            for (let i = 0; i < nearbyFloatingObjects.length; i++) {
                let nearby = nearbyFloatingObjects[i]
                let distance = nearby[0]
                let floatingObject = nearby[1]
                if (floatingObject.payload === undefined) { continue }
                let nearbyNode = floatingObject.payload.node
                if (compatibleTypes.indexOf('->' + nearbyNode.type + '->') >= 0 || compatibleTypes === "->*Any Node*->") {
                    if (schemaDocument.referencingRules.incompatibleTypes !== undefined) {
                        if (schemaDocument.referencingRules.incompatibleTypes.indexOf('->' + nearbyNode.type + '->') >= 0) {
                            continue
                        }
                    }
                    if (foundCompatible === false) {
                        if (distance < thisObject.payload.floatingObject.container.frame.radius * 1.5 + floatingObject.container.frame.radius * 1.5) {
                            nearbyNode.payload.uiObject.getReadyToReferenceAttach()
                            isReferenceAttaching = true
                            referenceAttachToNode = nearbyNode
                            foundCompatible = true
                        }
                    }
                    nearbyNode.payload.uiObject.showAvailabilityToReferenceAttach()
                }
            }

            function referenceAttacchingCounters() {
                if (readyToReferenceAttachDisplayCounter > 15) {
                    readyToReferenceAttachDisplayIncrement = -0.25
                }

                if (readyToReferenceAttachDisplayCounter < 5) {
                    readyToReferenceAttachDisplayIncrement = 0.25
                }

                readyToReferenceAttachDisplayCounter = readyToReferenceAttachDisplayCounter + readyToReferenceAttachDisplayIncrement

                readyToReferenceAttachCounter--
                if (readyToReferenceAttachCounter <= 0) {
                    readyToReferenceAttachCounter = 0
                    isReadyToReferenceAttach = false
                } else {
                    isReadyToReferenceAttach = true
                }

                availableToReferenceAttachCounter--
                if (availableToReferenceAttachCounter <= 0) {
                    availableToReferenceAttachCounter = 0
                    isAvailableToReferenceAttach = false
                } else {
                    isAvailableToReferenceAttach = true
                }
            }
        }

        function referenceDetachingPhysics() {
            if (isDragging !== true) { return }
            if (thisObject.payload === undefined) { return }
            if (thisObject.payload.floatingObject.isFrozen === true) { return }
            if (rightDragging === false) { return }
            if (UI.projects.foundations.spaces.floatingSpace.settings.detachUsingMouse !== true) { return }

            if (thisObject.payload.referenceParent === undefined) { return }

            let distanceToReferenceParent = Math.sqrt(Math.pow(thisObject.payload.position.x - thisObject.payload.referenceParent.payload.position.x, 2) + Math.pow(thisObject.payload.position.y - thisObject.payload.referenceParent.payload.position.y, 2))
            let ratio = distanceToReferenceParent / previousDistanceToReferenceParent
            if (previousDistanceToReferenceParent === 0) {
                previousDistanceToReferenceParent = distanceToReferenceParent
                return
            }
            previousDistanceToReferenceParent = distanceToReferenceParent

            if (thisObject.isOnFocus !== true) { return }

            let THRESHOLD = 1.15

            if (ratio > THRESHOLD) {
                UI.projects.foundations.spaces.designSpace.workspace.executeAction({ node: thisObject.payload.node, name: 'Reference Detach', project: 'Visual-Scripting' })
            }
        }

        function highlightPhisycs() {
            highlightCounter--
            if (highlightCounter < 0) {
                highlightCounter = 0
                isHighlighted = false
            }
        }

        function runningAtBackendPhisycs() {
            runningAtBackendCounter--
            if (runningAtBackendCounter < 0) {
                runningAtBackendCounter = 0
                isRunningAtBackend = false
            }
        }

        function errorMessagePhisycs() {
            errorMessageCounter--
            if (errorMessageCounter < 0) {
                errorMessageCounter = 0
                thisObject.hasError = false

                if (thisObject.uiObjectMessage.type === 'Error') {
                    thisObject.uiObjectMessage.text = undefined
                    thisObject.uiObjectMessage.type = undefined
                }
            }
        }

        function warningMessagePhisycs() {
            warningMessageCounter--
            if (warningMessageCounter < 0) {
                warningMessageCounter = 0
                thisObject.hasWarning = false

                if (thisObject.uiObjectMessage.type === 'Warning') {
                    thisObject.uiObjectMessage.text = undefined
                    thisObject.uiObjectMessage.type = undefined
                }
            }
        }

        function infoMessagePhisycs() {
            infoMessageCounter--
            if (infoMessageCounter < 0) {
                infoMessageCounter = 0
                thisObject.hasInfo = false

                if (thisObject.uiObjectMessage.type === 'Info') {
                    thisObject.uiObjectMessage.text = undefined
                    thisObject.uiObjectMessage.type = undefined
                }
            }
        }

        function valuePhisycs() {
            valueCounter--
            if (valueCounter < 0) {
                valueCounter = 0
                hasValue = false
            }
        }

        function percentagePhisycs() {
            percentageCounter--
            if (percentageCounter < 0) {
                percentageCounter = 0
                hasPercentage = false
            }
        }

        function statusPhisycs() {
            statusCounter--
            if (statusCounter < 0) {
                statusCounter = 0
                hasStatus = false
            }
        }
    }

    function heartBeatPhysics() {
        if (lastHeartBeat !== undefined) {
            const ONE_MIN = 60000
            nowTimestamp = (new Date()).valueOf()
            if (nowTimestamp - lastHeartBeat.valueOf() > ONE_MIN) {
                lastHeartBeat = undefined
                thisObject.isRunning = false
                valueCounter = 0
            }
        } else {
            thisObject.isRunning = false
        }
    }

    function childrenRunningPhysics() {
        let schemaDocument = getSchemaDocument(thisObject.payload.node)
        if (schemaDocument.childrenNodesProperties === undefined) { return }
        let monitorChildrenRunning = false
        for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
            let property = schemaDocument.childrenNodesProperties[i]
            if (property.monitorChildrenRunning === true) {
                let children = thisObject.payload.node[property.name]
                if (children === undefined) { continue }
                let totalRunning = 0
                for (let j = 0; j < children.length; j++) {
                    let child = children[j]
                    if (child.payload !== undefined) {
                        if (child.payload.uiObject.isRunning === true) {
                            totalRunning++
                        }
                    }
                }
                if (totalRunning > 0) {
                    setStatus(totalRunning + ' / ' + children.length + ' Running')
                    thisObject.isRunning = true
                } else {
                    thisObject.isRunning = false
                    valueCounter = 0
                }
                monitorChildrenRunning = true
                return
            }
        }
        if (monitorChildrenRunning === false) {
            heartBeatPhysics()
        }
    }

    function getReadyToChainAttach() {
        readyToChainAttachCounter = 10
    }

    function showAvailabilityToChainAttach() {
        availableToChainAttachCounter = 10
    }

    function getReadyToReferenceAttach() {
        readyToReferenceAttachCounter = 10
    }

    function showAvailabilityToReferenceAttach() {
        availableToReferenceAttachCounter = 10
    }

    function highlight(counter) {
        isHighlighted = true
        if (counter !== undefined) {
            highlightCounter = counter
        } else {
            highlightCounter = 30
        }
    }

    function runningAtBackend() {
        isRunningAtBackend = true
        runningAtBackendCounter = 5
    }

    function setErrorMessage(message, duration, docs) {
        if (message !== undefined) {
            errorMessage = message
            errorDocs = docs
            thisObject.hasError = true
            if (duration === undefined) { duration = 2 }
            errorMessageCounter = 100 * duration

            /* 
            Next, we are going to try to inform the parent that this 
            node has an error, as a way to show the end user where the
            node with error is. This is useful to detect errors in nodes
            that are located at branches that are collapsed.
            */

            if (thisObject.payload !== undefined) {
                if (thisObject.payload.parentNode !== undefined) {
                    if (thisObject.payload.parentNode.payload !== undefined) {
                        if (thisObject.payload.parentNode.payload.floatingObject !== undefined) {
                            if (thisObject.payload.floatingObject.isCollapsed === true || thisObject.payload.floatingObject.isParentCollapsed === true) {
                                if (thisObject.payload.parentNode.payload.uiObject.hasError !== true) {
                                    thisObject.payload.parentNode.payload.uiObject.setErrorMessage('Error Inside this Branch')
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function resetErrorMessage() {
        errorMessage = undefined
        errorDocs = undefined
        thisObject.hasError = false

        if (thisObject.uiObjectMessage.type === 'Error') {
            thisObject.uiObjectMessage.text = undefined
            thisObject.uiObjectMessage.type = undefined
        }
    }

    function setWarningMessage(message, duration, docs) {
        if (message !== undefined) {
            warningMessage = message
            warningDocs = docs
            thisObject.hasWarning = true
            if (duration === undefined) { duration = 1 }
            warningMessageCounter = 100 * duration

            /* 
            Next, we are going to try to inform the parent that this 
            node has an warning, as a way to show the end user where the
            node with warning is. This is useful to detect warnings in nodes
            that are located at branches that are collapsed.
            */

            if (thisObject.payload !== undefined) {
                if (thisObject.payload.parentNode !== undefined) {
                    if (thisObject.payload.parentNode.payload !== undefined) {
                        if (thisObject.payload.parentNode.payload.floatingObject !== undefined) {
                            if (thisObject.payload.parentNode.payload.floatingObject.isCollapsed === true || thisObject.payload.parentNode.payload.floatingObject.isParentCollapsed === true) {
                                if (thisObject.payload.parentNode.payload.uiObject !== true) {
                                    thisObject.payload.parentNode.payload.uiObject.setWarningMessage('Warning Inside this Branch')
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function resetWarningMessage() {
        warningMessage = undefined
        warningDocs = undefined
        thisObject.hasWarning = false

        if (thisObject.uiObjectMessage.type === 'Warning') {
            thisObject.uiObjectMessage.text = undefined
            thisObject.uiObjectMessage.type = undefined
        }
    }

    function setInfoMessage(message, duration, docs) {
        if (message !== undefined) {
            infoMessage = message
            infoDocs = docs
            thisObject.hasInfo = true
            if (duration === undefined) { duration = 1 }
            infoMessageCounter = 100 * duration

            /* 
            Next, we are going to try to inform the parent that this 
            node has an info, as a way to show the end user where the
            node with info is. This is useful to detect infos in nodes
            that are located at branches that are collapsed.
            */

            if (thisObject.payload !== undefined) {
                if (thisObject.payload.parentNode !== undefined) {
                    if (thisObject.payload.parentNode.payload !== undefined) {
                        if (thisObject.payload.parentNode.payload.floatingObject !== undefined) {
                            if (thisObject.payload.parentNode.payload.floatingObject.isCollapsed === true || thisObject.payload.parentNode.payload.floatingObject.isParentCollapsed === true) {
                                if (thisObject.payload.parentNode.payload.uiObject !== true) {
                                    thisObject.payload.parentNode.payload.uiObject.setInfoMessage('Info Inside this Branch')
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    function resetInfoMessage() {
        infoMessage = undefined
        infoDocs = undefined
        thisObject.hasInfo = false

        if (thisObject.uiObjectMessage.type === 'Info') {
            thisObject.uiObjectMessage.text = undefined
            thisObject.uiObjectMessage.type = undefined
        }
    }

    function getValue() {
        return currentValue
    }

    function setValue(value, counter, minDecimals) {
        if (value !== undefined) {
            currentValue = value
            hasValue = true
            valueMinDecimals = minDecimals
            if (counter !== undefined) {
                valueCounter = counter
            } else {
                valueCounter = 100
            }
        }
    }

    function resetValue() {
        currentValue = undefined
        hasValue = false
        valueCounter = 0
    }

    function setPercentage(percentage, counter) {
        if (percentage !== undefined) {
            currentPercentage = percentage
            hasPercentage = true
            if (counter !== undefined) {
                percentageCounter = counter
            } else {
                percentageCounter = 100
            }
        }
    }

    function resetPercentage() {
        currentPercentage = undefined
        hasPercentage = false
        percentageCounter = 0
    }

    function setStatus(status, counter) {
        if (status !== undefined) {
            currentStatus = status
            hasStatus = true
            if (counter !== undefined) {
                statusCounter = counter
            } else {
                statusCounter = 100
            }
        }
    }

    function resetStatus() {
        currentStatus = undefined
        hasStatus = false
        statusCounter = 0
    }

    function heartBeat() {
        lastHeartBeat = new Date()
        thisObject.isRunning = true

        if (onRunningCallBackFunctionWasCalled === false) {
            onRunningCallBackFunctionWasCalled = true
            if (onRunningCallBackFunction !== undefined) {
                onRunningCallBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
            }
        }
    }

    function reset() {
        resetErrorMessage()
        resetWarningMessage()
        resetInfoMessage()
        resetPercentage()
        resetValue()
        resetStatus()
    }

    function run(pEventsServerClient, callBackFunction) {
        finalizeEventsServerClient()
        reset()
        eventsServerClient = pEventsServerClient

        /* We setup the circular progress bar. */
        if (thisObject.circularProgressBar !== undefined) {
            thisObject.circularProgressBar.finalize()
        }

        thisObject.circularProgressBar = newCircularProgressBar()
        thisObject.circularProgressBar.initialize(thisObject.payload, eventsServerClient)
        thisObject.circularProgressBar.fitFunction = thisObject.fitFunction
        thisObject.circularProgressBar.container = thisObject.container

        setupRunningEventListener(callBackFunction)
        setupErrorEventListener(callBackFunction)
        setupWarningEventListener()
        setupInfoEventListener()

        function setupRunningEventListener(callBackFunction) {
            /* We will wait to hear the Running event in order to confirm the execution was really started */
            let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
            eventsServerClient.listenToEvent(key, 'Running', undefined, 'UiObject', onResponse, onRunning)

            onRunningCallBackFunction = callBackFunction

            function onResponse(message) {
                eventSubscriptionIdOnRunning = message.eventSubscriptionId
            }

            function onRunning() {

                if (thisObject.payload === undefined) { return }

                let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
                eventsServerClient.stopListening(key, eventSubscriptionIdOnRunning, 'UiObject')

                thisObject.isRunning = true

                if (callBackFunction !== undefined) {
                    callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE)
                    onRunningCallBackFunctionWasCalled = true
                }
            }

            /*
            While it is running, it can happen that it naturally stops or is stopped not from the UI but from other means.
            In those cases, the stop function would never be called (from the UI). So what we will do is to call it from
            here with and event, and passing our own callBackFunction. In case there is an external source stopping this,
            this will produce an execution of the callback with our event, which will produce that the menu item is restored
            to its default value.
        
            If on the other side, it is executed from the UI, then we will be processing the Stopped event twice, which in
            both cases will reset the menu item to its default state.
            */

            let event = {
                type: 'Secondary Action Already Executed'
            }
            stop(callBackFunction, event)
        }

        function setupErrorEventListener(callBackFunction) {
            let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
            eventsServerClient.listenToEvent(key, 'Error', undefined, key, onResponse, onError)

            function onResponse(message) {
                eventSubscriptionIdOnError = message.eventSubscriptionId
            }

            async function onError(message) {

                let uiObject = await getTargetUiObject(message)
                uiObject.setErrorMessage(message.event.errorMessage, 10, message.event.docs)

                let event = {
                    type: 'Secondary Action Already Executed'
                }
                completeStop(callBackFunction, event)
            }
        }

        function setupWarningEventListener() {
            let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
            eventsServerClient.listenToEvent(key, 'Warning', undefined, key, onResponse, onWarning)

            function onResponse(message) {
                eventSubscriptionIdOnWarning = message.eventSubscriptionId
            }

            async function onWarning(message) {
                let uiObject = await getTargetUiObject(message)
                uiObject.setWarningMessage(message.event.warningMessage, 10, message.event.docs)
            }
        }

        function setupInfoEventListener() {
            let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
            eventsServerClient.listenToEvent(key, 'Info', undefined, key, onResponse, onInfo)

            function onResponse(message) {
                eventSubscriptionIdOnInfo = message.eventSubscriptionId
            }

            async function onInfo(message) {
                let uiObject = await getTargetUiObject(message)
                uiObject.setInfoMessage(message.event.infoMessage, 10, message.event.docs)
            }
        }
    }

    async function getTargetUiObject(message) {
        let uiObject = thisObject
        if (message.event.nodeId !== undefined) {
            let targetNode = await UI.projects.foundations.spaces.designSpace.workspace.getNodeById(message.event.nodeId)
            if (targetNode !== undefined) {
                if (targetNode.payload !== undefined) {
                    if (targetNode.payload.uiObject !== undefined) {
                        uiObject = targetNode.payload.uiObject
                    }
                }
            }
        }
        return uiObject
    }

    function stop(callBackFunction, event, requestFromUI) {
        let wasStopped = false
        /* We will wait for the event that the execution was terminated in order to call back the menu item */
        let key = thisObject.payload.node.name + '-' + thisObject.payload.node.type + '-' + thisObject.payload.node.id
        eventsServerClient.listenToEvent(key, 'Stopped', undefined, 'UiObject', onResponse, onStopped)

        function onResponse(message) {
            eventSubscriptionIdOnStopped = message.eventSubscriptionId
        }

        function onStopped() {
            completeStop(callBackFunction, event)
            wasStopped = true
        }

        /*
        When the request comes from the UI, we need to consider the possibility that the client is down or it 
        was restarted while this node was running.
        */
        if (requestFromUI === true) {
            /* 
            It can happen that the client is down, the task is down, session is down of for whatever reason there is no
            answer to the command to stop. In those cases, we will stop execute the onStopped function anyways so as to 
            return the UI to its default state.
            */
            setTimeout(returnToDefaultState, 15000)
            function returnToDefaultState() {
                if (wasStopped === false) {
                    completeStop(callBackFunction, event)
                }
            }
        }
    }

    function completeStop(callBackFunction, event) {
        if (thisObject.payload === undefined) { return }
        if (callBackFunction !== undefined) {
            callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE, event)
        }

        if (thisObject.circularProgressBar !== undefined) {
            thisObject.circularProgressBar.finalize()
            thisObject.circularProgressBar = undefined
        }
        thisObject.isRunning = false
        hasValue = false
        hasPercentage = false
        hasStatus = false
        lastHeartBeat = undefined

        finalizeEventsServerClient()
    }

    function iconPhysics() {
        icon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(thisObject.payload.node.project, thisObject.payload.node.type)
        let schemaDocument = getSchemaDocument(thisObject.payload.node)

        /*
        If we want this object to have an alternative icon (defined on a list of possible icons) but
        this definition does not belong to the current node but to a relative of it, then
        the property to use is alternativeIcons with a value of a string defining the nodePath to the
        node that actually has the icon list.

        On the other hand, if this icon has the icon list definition, then the value of alternativeIcons
        should be an array of the possible icons. Then to pick one icon from that list we will check
        the config.condeName of the node to see with which icon on the list matches.

        Finally, if the node we are pointing to does not have a config or does not have a list of 
        alternativeIcons, we will just use that node's icon for the current node.
        */
        if (schemaDocument.alternativeIcons !== undefined && schemaDocument.alternativeIcons !== 'Use External Github Icon') {

            let nodeToUse = thisObject.payload.node
            if (schemaDocument.alternativeIcons === 'Use Parent') {
                if (thisObject.payload.node.payload.parentNode !== undefined) {
                    nodeToUse = thisObject.payload.node.payload.parentNode
                }
            }
            if (schemaDocument.alternativeIcons === 'Use Reference Parent') {
                if (thisObject.payload.node.payload.referenceParent !== undefined) {
                    nodeToUse = thisObject.payload.node.payload.referenceParent
                }
            }
            if (schemaDocument.alternativeIcons === 'Use Reference Grandparent') {
                if (thisObject.payload.node.payload.referenceParent !== undefined) {
                    if (thisObject.payload.node.payload.referenceParent.payload !== undefined) {
                        if (thisObject.payload.node.payload.referenceParent.payload.referenceParent !== undefined) {
                            nodeToUse = thisObject.payload.node.payload.referenceParent.payload.referenceParent
                        }
                    }
                }
            }
            if (schemaDocument.alternativeIcons === 'Use Reference Parent Parent') {
                if (thisObject.payload.node.payload.referenceParent !== undefined) {
                    if (thisObject.payload.node.payload.referenceParent.payload !== undefined) {
                        if (thisObject.payload.node.payload.referenceParent.payload.parentNode !== undefined) {
                            nodeToUse = thisObject.payload.node.payload.referenceParent.payload.parentNode
                        }
                    }
                }
            }
            schemaDocument = getSchemaDocument(nodeToUse)
            let config = nodeToUse.config
            if (config !== undefined && (Array.isArray(schemaDocument.alternativeIcons) === true)) {
                try {
                    config = JSON.parse(config)
                    let alternativeIcon
                    let iconName
                    for (let i = 0; i < schemaDocument.alternativeIcons.length; i++) {
                        alternativeIcon = schemaDocument.alternativeIcons[i]
                        if (alternativeIcon.codeName === config.codeName) {
                            iconName = alternativeIcon.iconName
                        }
                    }
                    let newIcon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(nodeToUse.project, iconName)
                    if (newIcon !== undefined) {
                        icon = newIcon
                    }
                } catch (err) {
                    nodeToUse.payload.uiObject.setErrorMessage('The config is not well formatted as a JSON object.')
                }
            } else {
                if (schemaDocument.icon !== undefined) {
                    let newIcon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(nodeToUse.project, schemaDocument.icon)
                    if (newIcon !== undefined) {
                        icon = newIcon
                    }
                }
            }
        } else if (schemaDocument.alternativeIcons === 'Use External Github Icon' && icon !== undefined) {

            let config = JSON.parse(thisObject.payload.node.config)
            let url = 'https://www.github.com/' + config.codeName + '.png'
            let image = UI.projects.foundations.spaces.designSpace.getIconByExternalSource(thisObject.payload.node.project, url)

            if (image.canDrawIcon === true) {
                icon = image
            }
        }

        thisObject.icon = icon
        executingIcon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName('Foundations', 'bitcoin')
    }

    function onFocus() {
        thisObject.isOnFocus = true

        if (thisObject.payload !== undefined && thisObject.isOnFocus === true && thisObject.payload.referenceParent !== undefined) {
            if (thisObject.payload.referenceParent.payload !== undefined) {
                if (thisObject.payload.referenceParent.payload.uiObject !== undefined) {
                    thisObject.payload.referenceParent.payload.uiObject.isShowing = true
                }
            }
        }
    }

    function onNotFocus() {
        thisObject.isOnFocus = false

        if (thisObject.conditionEditor !== undefined) {
            thisObject.conditionEditor.deactivate()
        }

        if (thisObject.listSelector !== undefined) {
            thisObject.listSelector.deactivate()
        }

        if (thisObject.payload !== undefined &&
            thisObject.isOnFocus === false &&
            thisObject.payload.referenceParent !== undefined &&
            thisObject.payload.referenceParent.payload !== undefined &&
            thisObject.payload.referenceParent.payload.uiObject !== undefined) {
            thisObject.payload.referenceParent.payload.uiObject.isShowing = false
        }
    }

    function onDisplace(event) {
        thisObject.uiObjectTitle.exitEditMode()
    }

    function onDragStarted(event) {
        thisObject.uiObjectTitle.exitEditMode()

        if (thisObject.conditionEditor !== undefined) {
            thisObject.conditionEditor.deactivate()
        }
        if (thisObject.listSelector !== undefined) {
            thisObject.listSelector.deactivate()
        }
        isDragging = true
        if (event.button === 2) {
            rightDragging = true
        } else {
            rightDragging = false
        }

        previousDistanceToReferenceParent = undefined
        previousDistanceToChainParent = undefined
    }

    function onDragFinished(event) {
        if (isChainAttaching === true) {
            UI.projects.foundations.spaces.designSpace.workspace.executeAction({ node: thisObject.payload.node, name: 'Parent Attach', project: 'Visual-Scripting', relatedNode: chainAttachToNode })
            chainAttachToNode = undefined
            isChainAttaching = false
            /* We want to avoid the situation in which we are attaching a node to its parent and at the same time referencing another node. */
            isReferenceAttaching = false
        }
        if (isReferenceAttaching === true) {
            UI.projects.foundations.spaces.designSpace.workspace.executeAction({ node: thisObject.payload.node, name: 'Reference Attach', project: 'Visual-Scripting', relatedNode: referenceAttachToNode })
            referenceAttachToNode = undefined
            isReferenceAttaching = false
        }
        isDragging = false
    }

    function drawBackground() {
        if (thisObject.isOnFocus === false) {
            drawReferenceLine()
            drawChainLine()

            if (isDragging === false && thisObject.isOnFocus === true) {
                thisObject.menu.drawBackground()
            }
        }

        if (thisObject.circularProgressBar !== undefined) {
            thisObject.circularProgressBar.drawBackground()
        }
    }

    function drawMiddleground() {
        if (thisObject.isOnFocus === false) {
            drawErrorMessage()
            drawWarningMessage()
            drawInfoMessage()
            drawValue()
            drawPercentage()
            drawStatus()
            thisObject.uiObjectTitle.draw()
            thisObject.uiObjectMessage.draw()
            drawNodeType()
        }
    }

    function drawForeground() {
        if (thisObject.isOnFocus === false) {
            drawBodyAndPicture()
        }

        if (thisObject.circularProgressBar !== undefined) {
            thisObject.circularProgressBar.drawForeground()
        }
    }

    function drawOnFocus() {
        if (thisObject.isOnFocus === true) {
            drawReferenceLine()
            drawChainLine()



            if (thisObject.conditionEditor !== undefined) {
                thisObject.conditionEditor.drawBackground()
                thisObject.conditionEditor.drawForeground()
            }

            if (thisObject.listSelector !== undefined) {
                thisObject.listSelector.drawBackground()
                thisObject.listSelector.drawForeground()
            }

            let drawMenu = true
            let drawTitle = true


            if (thisObject.conditionEditor !== undefined) {
                if (thisObject.conditionEditor.visible === true) {
                    drawMenu = false
                    drawTitle = false
                }
            }

            if (thisObject.listSelector !== undefined) {
                if (thisObject.listSelector.visible === true) {
                    drawMenu = false
                    drawTitle = false
                }
            }

            if (drawMenu === true) {
                drawBodyAndPicture()
                if (isDragging === false) {
                    thisObject.menu.drawBackground()
                    thisObject.menu.drawForeground()
                }
            }

            drawErrorMessage()
            drawWarningMessage()
            drawInfoMessage()
            drawValue()
            drawPercentage()
            drawStatus()

            if (drawTitle === true) {
                thisObject.uiObjectTitle.draw()
                thisObject.uiObjectMessage.draw()
            }

            drawNodeType()
        }
    }

    function drawChainLine() {
        if (UI.projects.foundations.spaces.floatingSpace.drawChainLines === false) { return }
        if (thisObject.payload.chainParent === undefined) { return }
        if (thisObject.payload.chainParent.payload === undefined) { return }

        let targetPoint = {
            x: thisObject.payload.chainParent.payload.floatingObject.container.frame.position.x,
            y: thisObject.payload.chainParent.payload.floatingObject.container.frame.position.y
        }

        let position = {
            x: 0,
            y: 0
        }

        targetPoint = UI.projects.foundations.spaces.floatingSpace.container.frame.frameThisPoint(targetPoint)
        position = thisObject.container.frame.frameThisPoint(position)

        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            targetPoint = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(targetPoint)
            position = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(position)
        }

        if (thisObject.payload.floatingObject.container.frame.radius > 1) {
            let LINE_STYLE = UI_COLOR.TITANIUM_YELLOW
            if (thisObject.payload.floatingObject.angleToParent !== ANGLE_TO_PARENT.NOT_FIXED) {
                LINE_STYLE = UI_COLOR.GOLDEN_ORANGE
            }
            if (thisObject.payload.floatingObject.isFrozen === true) {
                LINE_STYLE = UI_COLOR.TURQUOISE
            }
            if (newUiObjectCounter > 0) {
                LINE_STYLE = UI_COLOR.GREY
            }

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(position.x, position.y)
            browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
            browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
            browserCanvasContext.setLineDash([0, chainLineCounter, 2, 3, 0, 500 - chainLineCounter])
            browserCanvasContext.lineWidth = 2
            browserCanvasContext.stroke()
            browserCanvasContext.setLineDash([]) // Resets Line Dash

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(position.x, position.y)
            browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
            browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
            browserCanvasContext.setLineDash([3, 47])
            browserCanvasContext.lineWidth = 3
            browserCanvasContext.stroke()
            browserCanvasContext.setLineDash([]) // Resets Line Dash

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(position.x, position.y)
            browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
            browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
            browserCanvasContext.setLineDash([1, 9])
            browserCanvasContext.lineWidth = 1
            browserCanvasContext.stroke()
            browserCanvasContext.setLineDash([]) // Resets Line Dash
        }

        if (thisObject.payload.floatingObject.container.frame.radius > 0.5) {
            let radius = 1

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
            browserCanvasContext.closePath()
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
            browserCanvasContext.fill()
        }
    }

    function drawReferenceLine() {
        if (UI.projects.foundations.spaces.floatingSpace.drawReferenceLines === false && thisObject.isOnFocus === false) { return }
        if (thisObject.payload.referenceParent === undefined) { return }
        if (thisObject.payload.referenceParent.payload === undefined) { return }
        if (thisObject.payload.referenceParent.payload.floatingObject === undefined) { return }
        if (thisObject.payload.referenceParent.payload.floatingObject.isParentCollapsed === true && thisObject.isOnFocus === false) { return }

        let targetPoint = {
            x: thisObject.payload.referenceParent.payload.position.x,
            y: thisObject.payload.referenceParent.payload.position.y
        }

        let position = {
            x: 0,
            y: 0
        }

        targetPoint = UI.projects.foundations.spaces.floatingSpace.container.frame.frameThisPoint(targetPoint)
        position = thisObject.container.frame.frameThisPoint(position)

        if (thisObject.isOnFocus === true) {
            targetPoint = thisObject.fitFunction(targetPoint)
        }

        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            position = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(position)
            targetPoint = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(targetPoint)
        }

        let LINE_STYLE = UI_COLOR.GREY

        if (thisObject.payload.floatingObject.container.frame.radius > 1) {
            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(position.x, position.y)
            browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
            browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
            browserCanvasContext.setLineDash([1, 9])
            browserCanvasContext.lineWidth = 0.75
            browserCanvasContext.stroke()
            browserCanvasContext.setLineDash([]) // Resets Line Dash

            browserCanvasContext.beginPath()
            browserCanvasContext.moveTo(position.x, position.y)
            browserCanvasContext.lineTo(targetPoint.x, targetPoint.y)
            browserCanvasContext.strokeStyle = 'rgba(' + LINE_STYLE + ', 1)'
            browserCanvasContext.setLineDash([0, referenceLineCounter, 1, 9, 2, 8, 3, 7, 4, 6, 0, 500 - referenceLineCounter])
            browserCanvasContext.lineWidth = 4
            browserCanvasContext.stroke()
            browserCanvasContext.setLineDash([]) // Resets Line Dash
        }

        if (thisObject.payload.floatingObject.container.frame.radius > 0.5) {
            let radius = 1

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(targetPoint.x, targetPoint.y, radius, 0, Math.PI * 2, true)
            browserCanvasContext.closePath()
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
            browserCanvasContext.fill()
        }
    }

    function isEditorVisible() {



        if (thisObject.conditionEditor !== undefined) {
            if (thisObject.conditionEditor.visible === true) { return true }
        }

        if (thisObject.listSelector !== undefined) {
            if (thisObject.listSelector.visible === true) { return true }
        }
    }

    function drawNodeType() {
        if (isEditorVisible() === true) { return }
        /* Text Follows */
        let position = {
            x: 0,
            y: 0
        }

        position = thisObject.container.frame.frameThisPoint(position)

        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            position = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(position)

            let schemaDocument = getSchemaDocument(thisObject.payload.node)
            if (schemaDocument.inMapMode !== undefined) {
                if (schemaDocument.inMapMode.showNodeType === false) {
                    return
                }
            }
        }

        let radius = thisObject.payload.floatingObject.container.frame.radius
        /* Label Text */
        let labelPoint
        let fontSize = thisObject.payload.floatingObject.currentFontSize
        let lineSeparator = thisObject.payload.floatingObject.currentFontSize * 1.2
        let label

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        if (radius > 6) {
            const MAX_LABEL_LENGTH = 30

            label = thisObject.payload.node.type
            label = addIndexNumber(label)

            if (label !== undefined) {

                if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                    let schemaDocument = getSchemaDocument(thisObject.payload.node)
                    if (schemaDocument !== undefined) {
                        if (schemaDocument.isHierarchyHead !== true && schemaDocument.isProjectHead !== true) {
                            return
                        }
                    }
                    if (label.length > MAX_LABEL_LENGTH) {
                        label = label.substring(0, MAX_LABEL_LENGTH) + '...'
                    }
                }



                if (thisObject.isOnFocus === true) {
                    if (label.length > MAX_LABEL_LENGTH) {
                        label = label.substring(0, MAX_LABEL_LENGTH) + '...'
                    }
                    labelPoint = {
                        x: position.x - getTextWidth(label) / 2,
                        y: position.y + radius * 2 / 3 + lineSeparator * 1 + 30
                    }
                } else {
                    /* Split the line into Phrases */
                    let phrases = splitTextIntoPhrases(label, 2)

                    for (let i = 0; i < phrases.length; i++) {
                        let phrase = phrases[i]
                        labelPoint = {
                            x: position.x - getTextWidth(phrase) / 2,
                            y: position.y + thisObject.payload.floatingObject.currentImageSize / 2 + lineSeparator * (1 + i)
                        }
                        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === false) {
                            printMessage(phrase)
                        }
                    }
                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === false) {
                        return
                    }
                }

                if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                    labelPoint.x = position.x - getTextWidth(label) / 2,
                        labelPoint.y = position.y + 50 / 2 + lineSeparator * 2
                }
                printMessage(label)

                function printMessage(text) {
                    browserCanvasContext.fillStyle = thisObject.payload.floatingObject.nameStrokeStyle
                    browserCanvasContext.fillText(text, labelPoint.x, labelPoint.y)
                }
            }
        }
    }

    function drawErrorMessage() {
        if (thisObject.hasError === false) { return }

        thisObject.uiObjectMessage.text = errorMessage
        thisObject.uiObjectMessage.type = 'Error'
        thisObject.uiObjectMessage.docs = errorDocs
    }

    function drawWarningMessage() {
        if (thisObject.hasError === true) { return }
        if (thisObject.hasWarning !== true) { return }

        thisObject.uiObjectMessage.text = warningMessage
        thisObject.uiObjectMessage.type = 'Warning'
        thisObject.uiObjectMessage.docs = warningDocs
    }

    function drawInfoMessage() {
        if (thisObject.hasError === true) { return }
        if (thisObject.hasWarning === true) { return }
        if (thisObject.hasInfo !== true) { return }

        thisObject.uiObjectMessage.text = infoMessage
        thisObject.uiObjectMessage.type = 'Info'
        thisObject.uiObjectMessage.docs = infoDocs
    }

    function drawValue() {
        if (currentValue === null) { return }
        if (hasValue === false) { return }
        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) { return }
        if (thisObject.payload === undefined) { return }
        if ((thisObject.payload.floatingObject.isCollapsed === true && thisObject.payload.floatingObject.collapsedManually === false) || thisObject.payload.floatingObject.isParentCollapsed === true) { return }

        // if (currentValue === undefined || currentValue === '') { return }

        /* Text Follows */
        let position = {
            x: 0,
            y: 0
        }

        position = thisObject.container.frame.frameThisPoint(position)

        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            position = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(position)
        }

        let radius = thisObject.payload.floatingObject.container.frame.radius
        /* Label Text */
        let labelPoint
        let fontSize = thisObject.payload.floatingObject.currentFontSize
        let lineSeparator = thisObject.payload.floatingObject.currentFontSize * 1.2
        let label

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        if (radius > 6) {
            const MAX_LABEL_LENGTH = 70

            label = currentValue
            if (!isNaN(currentValue)) {
                if (currentValue.toFixed !== undefined) {
                    label = dynamicDecimals(currentValue, valueMinDecimals)
                }
            }

            if (label !== undefined) {
                if (label.length > MAX_LABEL_LENGTH) {
                    label = label.substring(0, MAX_LABEL_LENGTH) + '...'
                }

                if (label.length > 30) {
                    fontSize = fontSize * 2 / 3
                }

                if (thisObject.valueAtAngle === true && thisObject.payload.angle !== undefined) {
                    labelPoint = {
                        x: position.x - getTextWidth(label) / 2,
                        y: position.y
                    }
                    labelPoint.x = labelPoint.x + radius * 7 / 3 * Math.cos(toRadians(thisObject.payload.angle + thisObject.valueAngleOffset))
                    labelPoint.y = labelPoint.y + radius * 7 / 3 * Math.sin(toRadians(thisObject.payload.angle + thisObject.valueAngleOffset))
                } else {
                    if (thisObject.isOnFocus === true) {
                        labelPoint = {
                            x: position.x - getTextWidth(label) / 2,
                            y: position.y + radius * 2 / 3 + lineSeparator * 5 + 30
                        }
                    } else {
                        labelPoint = {
                            x: position.x - getTextWidth(label) / 2,
                            y: position.y + thisObject.payload.floatingObject.currentImageSize / 2 + lineSeparator * 5
                        }
                    }
                }

                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', 1)'
                browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
            }
        }
    }

    function drawPercentage() {
        if (hasPercentage === false) { return }
        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) { return }
        if (thisObject.payload === undefined) { return }
        if ((thisObject.payload.floatingObject.isCollapsed === true && thisObject.payload.floatingObject.collapsedManually === false) || thisObject.payload.floatingObject.isParentCollapsed === true) { return }

        let position = {
            x: 0,
            y: 0
        }

        position = thisObject.container.frame.frameThisPoint(position)

        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            position = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(position)
        }

        let radius = thisObject.payload.floatingObject.container.frame.radius
        /* Label Text */
        let labelPoint
        let fontSize = thisObject.payload.floatingObject.currentFontSize
        let lineSeparator = thisObject.payload.floatingObject.currentFontSize * 1.2
        let label

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        if (radius > 6) {
            const MAX_LABEL_LENGTH = 65

            label = Number(currentPercentage) + '%'

            if (label.length > MAX_LABEL_LENGTH) {
                label = label.substring(0, MAX_LABEL_LENGTH) + '...'
            }

            if (thisObject.percentageAtAngle === true && thisObject.payload.angle !== undefined) {
                labelPoint = {
                    x: position.x - getTextWidth(label) / 2,
                    y: position.y
                }
                labelPoint.x = labelPoint.x + radius * 7 / 3 * Math.cos(toRadians(thisObject.payload.angle + thisObject.percentageAngleOffset))
                labelPoint.y = labelPoint.y + radius * 7 / 3 * Math.sin(toRadians(thisObject.payload.angle + thisObject.percentageAngleOffset)) + lineSeparator * 1
            } else {
                if (thisObject.isOnFocus === true) {
                    labelPoint = {
                        x: position.x - getTextWidth(label) / 2,
                        y: position.y + radius * 2 / 3 + lineSeparator * 6 + 30
                    }
                } else {
                    labelPoint = {
                        x: position.x - getTextWidth(label) / 2,
                        y: position.y + thisObject.payload.floatingObject.currentImageSize / 2 + lineSeparator * 6
                    }
                }
            }

            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', 1)'
            browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)

        }
    }

    function drawStatus() {
        if (hasStatus === false) { return }
        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) { return }

        let position = {
            x: 0,
            y: 0
        }

        position = thisObject.container.frame.frameThisPoint(position)

        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            position = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(position)
        }

        let radius = thisObject.payload.floatingObject.container.frame.radius
        /* Label Text */
        let labelPoint
        let fontSize = thisObject.payload.floatingObject.currentFontSize * 6 / 4 / 2
        let lineSeparator = thisObject.payload.floatingObject.currentFontSize * 1.2
        let label

        browserCanvasContext.font = fontSize + 'px ' + UI_FONT.PRIMARY

        if (radius > 6) {
            const MAX_LABEL_LENGTH = 120

            label = currentStatus

            if (label !== undefined) {
                if (label.length > MAX_LABEL_LENGTH) {
                    label = label.substring(0, MAX_LABEL_LENGTH) + '...'
                }

                if (thisObject.statusAtAngle === true && thisObject.payload.angle !== undefined) {
                    labelPoint = {
                        x: position.x - getTextWidth(label) / 2,
                        y: position.y
                    }
                    labelPoint.x = labelPoint.x + radius * 7 / 3 * Math.cos(toRadians(thisObject.payload.angle + thisObject.statusAngleOffset))
                    labelPoint.y = labelPoint.y + radius * 7 / 3 * Math.sin(toRadians(thisObject.payload.angle + thisObject.statusAngleOffset)) + lineSeparator * 2
                } else {

                    if (thisObject.isOnFocus === true) {
                        labelPoint = {
                            x: position.x - getTextWidth(label) / 2,
                            y: position.y + radius * 2 / 3 + lineSeparator * 4 + 30
                        }
                    } else {
                        labelPoint = {
                            x: position.x - getTextWidth(label) / 2,
                            y: position.y + thisObject.payload.floatingObject.currentImageSize / 2 + lineSeparator * 4
                        }
                    }
                }

                browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'
                browserCanvasContext.fillText(label, labelPoint.x, labelPoint.y)
            }
        }
    }

    function addIndexNumber(label) {
        switch (thisObject.payload.node.type) {
            case 'Phase': {
                let parent = thisObject.payload.parentNode
                if (parent !== undefined) {
                    let granParent = parent.payload.parentNode
                    if (granParent !== undefined) {
                        if (granParent.type === 'Initial Definition') {
                            return label + ' #' + 0
                        }
                    }
                    for (let i = 0; i < parent.phases.length; i++) {
                        let phase = parent.phases[i]
                        if (phase.id === thisObject.payload.node.id) {
                            label = label + ' #' + (i + 1)
                            return label
                        }
                    }
                } else {
                    return label
                }

                break
            }
            case 'Situation': {
                let parent = thisObject.payload.parentNode
                if (parent !== undefined) {
                    for (let i = 0; i < parent.situations.length; i++) {
                        let situation = parent.situations[i]
                        if (situation.id === thisObject.payload.node.id) {
                            label = label + ' #' + (i + 1)
                            return label
                        }
                    }
                } else {
                    return label
                }

                break
            }
            case 'Condition': {
                let parent = thisObject.payload.parentNode
                if (parent !== undefined) {
                    for (let i = 0; i < parent.conditions.length; i++) {
                        let condition = parent.conditions[i]
                        if (condition.id === thisObject.payload.node.id) {
                            label = label + ' #' + (i + 1)
                            return label
                        }
                    }
                } else {
                    return label
                }

                break
            }
            default: {
                return label
            }
        }
    }

    function drawBodyAndPicture() {
        let position = {
            x: thisObject.container.frame.position.x,
            y: thisObject.container.frame.position.y
        }

        position = thisObject.container.frame.frameThisPoint(position)

        if (thisObject.isShowing === true) {
            position = thisObject.fitFunction(position)
        }

        if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
            position = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(position)
        }

        let radius = thisObject.payload.floatingObject.container.frame.radius

        if (radius > 0.5) {
            let VISIBLE_RADIUS = 5

            let visiblePosition = {
                x: thisObject.container.frame.position.x,
                y: thisObject.container.frame.position.y
            }

            visiblePosition = thisObject.container.frame.frameThisPoint(visiblePosition)

            if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                visiblePosition = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(visiblePosition)
                radius = UI.projects.foundations.spaces.floatingSpace.transformRadiusToMap(radius)
                VISIBLE_RADIUS = UI.projects.foundations.spaces.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
            } else {
                visiblePosition = thisObject.fitFunction(visiblePosition)
            }

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
            browserCanvasContext.closePath()

            browserCanvasContext.fillStyle = thisObject.payload.floatingObject.fillStyle

            browserCanvasContext.fill()

            browserCanvasContext.beginPath()
            browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS - 2, 0, Math.PI * 2, true)
            browserCanvasContext.closePath()

            browserCanvasContext.fillStyle = 'rgba(' + UI.projects.foundations.spaces.floatingSpace.style.backgroundColor + ', 1)'

            browserCanvasContext.fill()

            let schemaDocument = getSchemaDocument(thisObject.payload.node)
            if (schemaDocument === undefined) {
                console.log('Node ' + thisObject.payload.node + ' without Schema Document at APP SCHEMA.')
                return
            }

            drawOnFocus()
            drawHierarchyHeadRing()
            drawProjectHeadRing()
            drawInfoRing()
            drawWarningRing() 
            drawErrorRing()
            drawHighlighted()
            drawReadyToChainAttach()
            drawAvailableToChainAttach()
            drawReadyToReferenceAttach()
            drawAvailableToReferenceAttach()

            function drawOnFocus() {
                if (thisObject.isOnFocus === true) {
                    /* Black Translucent Background when node is in focus */
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius
                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.fillStyle = 'rgba(' + UI.projects.foundations.spaces.floatingSpace.style.backgroundColor + ', 0.70)'
                    browserCanvasContext.fill()
                    /* Border when node is in focus */
                    if (
                        thisObject.hasError !== true &&
                        thisObject.WarningError !== true &&
                        thisObject.hasInfo !== true &&
                        schemaDocument.isHierarchyHead !== true &&
                        thisObject.circularProgressBar === undefined
                    ) {
                        browserCanvasContext.beginPath()
                        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                        browserCanvasContext.closePath()
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.WHITE + ', ' + 1 + ')'
                        browserCanvasContext.lineWidth = 3
                        browserCanvasContext.setLineDash([]) // Resets Line Dash
                        browserCanvasContext.stroke()

                        browserCanvasContext.beginPath()
                        browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS - 1, 0, Math.PI * 2, true)
                        browserCanvasContext.closePath()
                        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + 1 + ')'
                        browserCanvasContext.lineWidth = 2
                        browserCanvasContext.setLineDash([]) // Resets Line Dash
                        browserCanvasContext.stroke()

                    }
                }
            }

            function drawHierarchyHeadRing() {
                /* Hierarchy Head Ring */
                if (schemaDocument.isHierarchyHead === true) {

                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                        if (schemaDocument.inMapMode !== undefined) {
                            if (schemaDocument.inMapMode.showHierarchyHeadRing === false) {
                                return
                            }
                        }
                    }

                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius
                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                        VISIBLE_RADIUS = UI.projects.foundations.spaces.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
                    }
                    let OPACITY = 0.5

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 10
                    browserCanvasContext.setLineDash([1, 10])
                    browserCanvasContext.stroke()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 1
                    if (thisObject.payload.node.isPlugin === true) {
                        browserCanvasContext.setLineDash([]) // Resets Line Dash
                    } else {
                        browserCanvasContext.setLineDash([10, 20])
                    }
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawProjectHeadRing() {
                /* Project Head Ring */
                if (schemaDocument.isProjectHead === true) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius
                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                        VISIBLE_RADIUS = UI.projects.foundations.spaces.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
                    }
                    let OPACITY = 0.5

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'

                    if (thisObject.payload.floatingObject.isOnFocus === true) {
                        browserCanvasContext.lineWidth = 30
                        browserCanvasContext.setLineDash([]) // Resets Line Dash
                    } else {
                        browserCanvasContext.lineWidth = 30
                        browserCanvasContext.setLineDash([1, 3])

                    }
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawInfoRing() {
                /* Info Ring */
                if (thisObject.hasInfo === true) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius
                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                        VISIBLE_RADIUS = UI.projects.foundations.spaces.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
                    }
                    let OPACITY = infoMessageCounter / 30
                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.DARK_TURQUOISE + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 5
                    browserCanvasContext.setLineDash([2 + infoRingAnimation, 14 - infoRingAnimation])
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawWarningRing() {
                /* Warning Ring */
                if (thisObject.hasWarning === true) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius
                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                        VISIBLE_RADIUS = UI.projects.foundations.spaces.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
                    }
                    let OPACITY = warningMessageCounter / 30
                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 5
                    browserCanvasContext.setLineDash([2 + warningRingAnimation, 14 - warningRingAnimation])
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawErrorRing() {
                /* Error Ring */
                if (thisObject.hasError === true) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius
                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                        VISIBLE_RADIUS = UI.projects.foundations.spaces.floatingSpace.transformRadiusToMap(VISIBLE_RADIUS)
                    }
                    let OPACITY = errorMessageCounter / 30
                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.RED + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 5
                    browserCanvasContext.setLineDash([2 + errorRingAnimation, 14 - errorRingAnimation])
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawHighlighted() {
                if (isHighlighted === true) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius
                    let OPACITY = highlightCounter / 10

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()

                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'

                    browserCanvasContext.lineWidth = 10
                    browserCanvasContext.setLineDash([4, 20])
                    browserCanvasContext.stroke()
                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawReadyToChainAttach() {
                if (isReadyToChainAttach === true) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius * 2.5 + readyToChainAttachDisplayCounter - readyToChainAttachDisplayCounter / 2
                    let OPACITY = readyToChainAttachCounter / 10

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 10
                    browserCanvasContext.setLineDash([10, 90])
                    browserCanvasContext.stroke()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 5
                    browserCanvasContext.setLineDash([5, 45])
                    browserCanvasContext.stroke()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 1
                    browserCanvasContext.setLineDash([2, 8])
                    browserCanvasContext.stroke()

                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawAvailableToChainAttach() {
                if (isAvailableToChainAttach === true && isReadyToChainAttach === false) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius * 2.5
                    let OPACITY = availableToChainAttachCounter / 10

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 10
                    browserCanvasContext.setLineDash([8, 32])
                    browserCanvasContext.stroke()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.TURQUOISE + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 2
                    browserCanvasContext.setLineDash([3, 5])
                    browserCanvasContext.stroke()

                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawReadyToReferenceAttach() {
                if (isReadyToReferenceAttach === true) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius * 2.5 + readyToReferenceAttachDisplayCounter - readyToReferenceAttachDisplayCounter / 2
                    let OPACITY = readyToReferenceAttachCounter / 10

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 10
                    browserCanvasContext.setLineDash([10, 90])
                    browserCanvasContext.stroke()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 5
                    browserCanvasContext.setLineDash([5, 45])
                    browserCanvasContext.stroke()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GOLDEN_ORANGE + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 1
                    browserCanvasContext.setLineDash([2, 8])
                    browserCanvasContext.stroke()

                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }

            function drawAvailableToReferenceAttach() {
                if (isAvailableToReferenceAttach === true && isReadyToReferenceAttach === false) {
                    VISIBLE_RADIUS = thisObject.payload.floatingObject.container.frame.radius * 2.5
                    let OPACITY = availableToReferenceAttachCounter / 10

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 10
                    browserCanvasContext.setLineDash([8, 32])
                    browserCanvasContext.stroke()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, VISIBLE_RADIUS, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + OPACITY + ')'
                    browserCanvasContext.lineWidth = 2
                    browserCanvasContext.setLineDash([3, 5])
                    browserCanvasContext.stroke()

                    browserCanvasContext.setLineDash([]) // Resets Line Dash
                }
            }
        }

        /* Image */
        if (icon !== undefined) {
            if (icon.canDrawIcon === true) {

                let additionalImageSize = 0
                if (isRunningAtBackend === true || isReadyToReferenceAttach === true || isReadyToChainAttach === true) { additionalImageSize = 20 }
                let totalImageSize = additionalImageSize + thisObject.payload.floatingObject.currentImageSize

                let schemaDocument = getSchemaDocument(thisObject.payload.node)
                if (schemaDocument === undefined) { return }

                if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                    if (schemaDocument.isHierarchyHead === true || schemaDocument.isProjectHead === true) {
                        totalImageSize = 50
                    } else {
                        totalImageSize = 25
                        totalImageSize = UI.projects.foundations.spaces.floatingSpace.transformImagesizeToMap(totalImageSize)
                    }
                }

                if (thisObject.isShowing === true) {
                    totalImageSize = 50
                }

                if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                    if (schemaDocument.inMapMode !== undefined) {
                        if (schemaDocument.inMapMode.smallIcon === true) {
                            totalImageSize = totalImageSize * 0.75
                        }
                    }
                }

                // If this UiObject is using an External Icon, apply a Mask to keep it Circular
                if (schemaDocument.alternativeIcons === 'Use External Github Icon') {

                    let radius = totalImageSize / 2

                    let visiblePosition = {
                        x: thisObject.container.frame.position.x,
                        y: thisObject.container.frame.position.y
                    }

                    visiblePosition = thisObject.container.frame.frameThisPoint(visiblePosition)

                    if (UI.projects.foundations.spaces.floatingSpace.inMapMode === true) {
                        visiblePosition = UI.projects.foundations.spaces.floatingSpace.transformPointToMap(visiblePosition)
                    } else {
                        visiblePosition = thisObject.fitFunction(visiblePosition)
                    }

                    browserCanvasContext.save()

                    browserCanvasContext.beginPath()
                    browserCanvasContext.arc(visiblePosition.x, visiblePosition.y, radius, 0, Math.PI * 2, true)
                    browserCanvasContext.closePath()
                    browserCanvasContext.clip()
                }

                // If this UiObject is being loaded then display at half opacity
                if(thisObject.payload.isLoading === true) {
                    browserCanvasContext.globalAlpha = 0.5
                } else {
                    browserCanvasContext.globalAlpha = 1
                }

                browserCanvasContext.drawImage(
                    icon, position.x - totalImageSize / 2,
                    position.y - totalImageSize / 2,
                    totalImageSize,
                    totalImageSize)

                browserCanvasContext.globalAlpha = 1

                if (schemaDocument.alternativeIcons === 'Use External Github Icon') {
                    browserCanvasContext.restore()
                }
            }
        }

        if (executingIcon !== undefined) {
            if (executingIcon.canDrawIcon === true) {
                if (isRunningAtBackend === true) {
                    const DISTANCE_FROM_CENTER = thisObject.payload.floatingObject.container.frame.radius / 3 + 50
                    const EXECUTING_ICON_SIZE = 20 + thisObject.payload.floatingObject.container.frame.radius / 6

                    browserCanvasContext.drawImage(
                        executingIcon, position.x - EXECUTING_ICON_SIZE / 2,
                        position.y - EXECUTING_ICON_SIZE / 2 - DISTANCE_FROM_CENTER,
                        EXECUTING_ICON_SIZE,
                        EXECUTING_ICON_SIZE)
                }
            }
        }
    }
}
