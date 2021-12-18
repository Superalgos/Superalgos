function newEducationTutorialSpace() {
    const MODULE_NAME = 'Tutorial Space'
    let thisObject = {
        stop: stop,
        skip: skip,
        previous: previous,
        next: next,
        playTutorial: playTutorial,
        resumeTutorial: resumeTutorial,
        playTutorialTopic: playTutorialTopic,
        resumeTutorialTopic: resumeTutorialTopic,
        playTutorialStep: playTutorialStep,
        resumeTutorialStep: resumeTutorialStep,
        resetTutorialProgress: resetTutorialProgress,
        sidePanelTab: undefined,
        container: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize,
        reset: reset
    }

    let TUTORIAL_NAME
    let PAGE_NUMBER

    let isInitialized = false

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

    let tutorialRootNode
    let currentNode
    let currentStatus = 'Stopped'
    let navigationStack

    let tutorialDiv = document.getElementById('tutorialDiv')
    let tutorialFormDiv = document.getElementById('tutorialFormDiv')
    let htmlGif = document.createElement("IMG")
    let htmlImage = document.createElement("IMG")
    //let htmlVid = document.createElement("iframe")

    let currentGifName
    let newGifName
    let currentImageName
    let newImageName
    let newImageProject
    let currentConfig
    let newConfig
    let currentDocument
    let newDocument
    let resumeModeActivated
    let lastExecutedAction
    let actionCounter
    let forcingFocus
    let currentZoomStep
    let viewportCentered
    let repositionAtTimeMachineCounter
    let positionAtNodeCounter
    let timeMachineKeyPressedCounter
    let keyPressedCounter
    let sliderCounter
    let changeNodeConfigCounter
    let changeNodeConfigCounterWithEval
    let documentationCounter
    let batchConfigChangesCounter
    let workspacesCounter

    return thisObject

    function initialize() {

        currentGifName = 'Never Set'
        newGifName = 'Never Set'
        currentImageName = 'Never Set'
        newImageName = 'Never Set'
        newImageProject = 'Never Set'
        currentConfig
        newConfig
        currentDocument
        newDocument
        resumeModeActivated // In this mode, we skip all the node which status is 'Done'
        lastExecutedAction = ''
        actionCounter = 0
        forcingFocus = false
        currentZoomStep = 0
        viewportCentered = false
        repositionAtTimeMachineCounter = 0
        positionAtNodeCounter = 0
        timeMachineKeyPressedCounter = 0
        keyPressedCounter = 0
        sliderCounter = 0
        changeNodeConfigCounter = 0
        changeNodeConfigCounterWithEval = 0
        documentationCounter = 0
        batchConfigChangesCounter = 0
        workspacesCounter = 0

        setupSidePanelTab()

        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        let workspace = UI.projects.foundations.spaces.designSpace.workspace
        workspace.executeAction({ name: 'Play Tutorials', project: 'Visual-Scripting' })
        isInitialized = true
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)

        tutorialRootNode = undefined
        currentNode = undefined
        navigationStack = undefined

    }

    async function reset() {
        finalize()
        initialize()
    }

    function resize() {
        thisObject.container.frame.width = 0
        thisObject.container.frame.height = 0
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

    function physics() {
        if (currentNode === undefined) { return }

        switch (currentStatus) {
            case 'Stopped': {
                makeInvisible()
                thisObject.sidePanelTab.close()
                currentNode = undefined
                break
            }
            case 'Playing Tutorial': {
                makeVsible()
                thisObject.sidePanelTab.open()
                break
            }
            case 'Playing Topic': {
                makeVsible()
                break
            }
            case 'Playing Step': {
                makeVsible()
                break
            }
        }

        keyPressed()
        toggleMapView()
        checkPressButton()
        checkGif()
        checkImage()
        checkDocumentation()
        checkWorkspaces()
        checkSlider()
        checkReference()
        checkViewportZoom()
        checkViewportZoomAtCenter()
        return

        function keyPressed() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            if (
                config.keyPressed !== undefined
            ) {
                keyPressedCounter++
                if (keyPressedCounter === 10) {
                    let event = {
                        metaKey: config.keyPressed.metaKey,
                        shiftKey: config.keyPressed.shiftKey,
                        ctrlKey: config.keyPressed.ctrlKey,
                        code: config.keyPressed.code,
                        key: config.keyPressed.key
                    }
                    canvas.onKeyDown(event, true)
                }
            }
        }

        function toggleMapView() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            if (
                config.toggleMapView !== undefined
            ) {
                if (config.toggleMapView.view === "On") {
                    UI.projects.foundations.spaces.floatingSpace.inMapMode = true
                } else
                    if (config.toggleMapView.view === "Off") {
                        UI.projects.foundations.spaces.floatingSpace.inMapMode = false
                    }
            }
        }
        function checkViewportZoom() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            if (config.viewportZoom !== undefined) {
                let totalZoomSteps = config.viewportZoom
                let delta
                if (totalZoomSteps > 0) {
                    delta = 1
                } else {
                    delta = -1
                }
                currentZoomStep = currentZoomStep + delta
                let event = {
                    delta: delta
                }
                if (totalZoomSteps > 0) {
                    if (currentZoomStep < totalZoomSteps) {
                        UI.projects.foundations.spaces.chartingSpace.viewport.onMouseWheel(event)
                    }
                } else {
                    if (currentZoomStep > totalZoomSteps) {
                        UI.projects.foundations.spaces.chartingSpace.viewport.onMouseWheel(event)
                    }
                }
            }
        }

        function checkViewportZoomAtCenter() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            if (config.viewportZoomAtCenter !== undefined) {
                UI.projects.foundations.spaces.chartingSpace.viewport.zoomAtCenter(config.viewportZoomAtCenter)
            }
        }

        function checkPressButton() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            if (config.pressButton === undefined || config.pressButton === "") {
                return
            }
            /* Remove this item from the navigation stack. */
            navigationStack.splice(navigationStack.length - 1)
            switch (config.pressButton) {
                case "Stop": {
                    stop()
                    return
                }
                case "Skip": {
                    skip()
                    return
                }
                case "Previous": {
                    previous()
                    return
                }
                case "Next": {
                    next()
                    return
                }
            }
        }

        function checkGif() {
            let tutorialGifDiv = document.getElementById('tutorialGifDiv')
            if (tutorialGifDiv !== null && tutorialGifDiv !== undefined) {
                tutorialGifDiv.appendChild(htmlGif)
            }

            if (currentGifName === newGifName) { return }
            currentGifName = newGifName
            htmlGif.src = currentGifName
            htmlGif.width = "400"
            htmlGif.height = "580"
        }

        function checkImage() {
            let tutorialImageDiv = document.getElementById('tutorialImageDiv')
            if (tutorialImageDiv !== null && tutorialImageDiv !== undefined) { 
                tutorialImageDiv.appendChild(htmlImage)
            }

            if (newImageName === undefined) { return }
            if (currentImageName === newImageName) { return }
            currentImageName = newImageName
            
            // If gathering Icon by Project and Name get it now 
            let icon = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(newImageProject, newImageName)
            if (icon !== undefined) {
                    htmlImage.src = icon.src
                    htmlImage.width = "100"
                    htmlImage.height = "100"
            } else if (icon === undefined) {
            // Legacy Code to handle icons being fetched by literal path
            // Note: This if statement should be removed once all tutorials have been refactored
                let webParam = 'Icons/' + newImageProject + '/' + newImageName + '.png'
                htmlImage.src = webParam
                htmlImage.width = "100"
                htmlImage.height = "100"
            }
        }

        function checkVid() {
            let tutorialGifDiv = document.getElementById('tutorialGifDiv')
            if (tutorialGifDiv !== null && tutorialGifDiv !== undefined) {
                tutorialGifDiv.appendChild(htmlGif)
            }

            if (currentGifName === newGifName) { return }
            currentGifName = newGifName
            htmlVid.src = currentGifName
        }

        function checkDocumentation() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)

            documentationCounter++
            if (documentationCounter === 10) {

                /* Deprecated Property Documentation URL */
                if (config.documentationURL !== undefined && config.documentationURL !== "") {
                    console.log('Trying to navigate to: ' + config.documentationURL + ' at ' + config.docs.type)
                }

                if (config.controlDocs === undefined) {
                    /*
                    The doc panel will remain as it is, and the user will be free to open or close it at will.
                    */
                    return
                }
                if (config.controlDocs.panel === "Open") {
                    /*
                    This forces the tutorial to open the documentation panel.
                    */
                    UI.projects.education.spaces.docsSpace.sidePanelTab.open()
                }
                if (config.controlDocs.panel === "Close") {
                    /*
                    This forces the tutorial to close the documentation panel.
                    */
                    UI.projects.education.spaces.docsSpace.sidePanelTab.close()
                }
                if (
                    config.controlDocs.page !== undefined &&
                    config.controlDocs.page.project !== undefined &&
                    config.controlDocs.page.category !== undefined &&
                    config.controlDocs.page.type !== undefined &&
                    config.controlDocs.page.project !== '' &&
                    config.controlDocs.page.category !== '' &&
                    config.controlDocs.page.type !== ''
                ) {
                    /*
                    This produces the Docs to load the specified page.
                    */
                    UI.projects.education.spaces.docsSpace.openSpaceAreaAndNavigateTo(config.controlDocs.page.project, config.controlDocs.page.category, config.controlDocs.page.type, config.controlDocs.page.anchor)
                }
            }
        }

        function checkWorkspaces() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            workspacesCounter++
            if (config.workspaces === undefined) {
                /*
                The workspaces panel will remain as it is, and the user will be free to open or close it at will.
                */
                return
            }
            if (config.workspaces === "" || config.workspaces === "Close") {
                /*
                This forces the tutorial to close the workspaces panel and to keep it closed.
                */
                if (workspacesCounter === 5) {
                    UI.projects.foundations.spaces.workspaceSpace.sidePanelTab.close()
                }
                return
            }
            if (config.workspaces === "Open") {
                /*
                This forces the tutorial to open the workspaces panel and to keep it closed.
                */
                if (workspacesCounter === 5) {
                    UI.projects.foundations.spaces.workspaceSpace.sidePanelTab.open()
                }
                return
            }
        }

        function checkSlider() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            if (config.slider === undefined) {
                /*
                The cockpit space will remain where it is. The user is free to move it.
                */
                return
            }
            sliderCounter++
            if (sliderCounter === 1 || sliderCounter === 100) {

                switch (config.slider) {
                    case "toTop": {
                        /*
                        This forces the tutorial to close the charting space and to keep it closed.
                        */
                        UI.projects.foundations.spaces.cockpitSpace.toTop()
                        return
                    }
                    case "toMiddle": {
                        /*
                        This forces the tutorial to share the screen half with the designer and half 
                        with the charting space and force it in that way.
                        */
                        UI.projects.foundations.spaces.cockpitSpace.toMiddle()
                        return
                    }
                    case "toBottom": {
                        /*
                        This forces the tutorial to fully open the charting space and to keep it open.
                        */
                        UI.projects.foundations.spaces.cockpitSpace.toBottom()
                        return
                    }
                }
            }
        }

        function checkReference() {
            /* 
            If there is a reference parent defined, we will highlight it 
            and move the designer so that that node be at the center of the screen.
            */
            if (currentNode !== undefined) {
                if (currentNode.payload !== undefined) {
                    if (currentNode.payload.referenceParent !== undefined) {
                        if (currentNode.payload.referenceParent.payload !== undefined) {
                            if (currentNode.payload.referenceParent.payload.uiObject !== undefined) {
                                let config = JSON.parse(currentNode.config)
                                if (
                                    config.positionAtReferenceParent === true
                                ) {
                                    /*
                                    This moves the Designs Space so that the referenced node is at the center of the screen.
                                    */
                                    positionAtNodeCounter++
                                    if (positionAtNodeCounter === 1) {
                                        currentNode.payload.referenceParent.payload.floatingObject.unCollapseParent()
                                    }
                                    if (positionAtNodeCounter < 100) {
                                        UI.projects.foundations.spaces.floatingSpace.positionAtNode(currentNode.payload.referenceParent)
                                    }
                                }
                                if (
                                    config.highlightReferenceParent === true
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.highlight()
                                }
                                if (
                                    config.highlightReferenceParent === true
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.highlight()
                                }
                                if (
                                    config.setErrorMessageReferenceParent !== undefined
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.setErrorMessage(config.setErrorMessageReferenceParent)
                                }
                                if (
                                    config.setWarningMessageReferenceParent !== undefined
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.setWarningMessage(config.setWarningMessageReferenceParent)
                                }
                                if (
                                    config.setInfoMessageReferenceParent !== undefined
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.setInfoMessage(config.setInfoMessageReferenceParent)
                                }
                                if (
                                    config.setValueReferenceParent !== undefined
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.setValue(config.setValueReferenceParent)
                                }
                                if (
                                    config.setPercentageReferenceParent !== undefined
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.setPercentage(config.setPercentageReferenceParent)
                                }
                                if (
                                    config.setStatusReferenceParent !== undefined
                                ) {
                                    currentNode.payload.referenceParent.payload.uiObject.setStatus(config.setStatusReferenceParent)
                                }
                                if (
                                    config.setFocusReferenceParent === true
                                ) {
                                    currentNode.payload.referenceParent.payload.floatingObject.forceFocus()
                                    forcingFocus = true
                                }
                                if (
                                    config.batchConfigChangesReferenceParent !== undefined
                                ) {
                                    batchConfigChangesCounter++
                                    if (batchConfigChangesCounter === 5 || batchConfigChangesCounter === 10) {
                                        /* 
                                        Here we are going to process an array of different changes to descendents
                                        of the reference parent. The end user needs to specify a nodePath to the 
                                        descendent and an object with the properties and new values that want to 
                                        change at each descendent. The nodePath route starts at the object
                                        referenceParent.
                                        */
                                        let referenceParent = currentNode.payload.referenceParent
                                        for (let i = 0; i < config.batchConfigChangesReferenceParent.length; i++) {
                                            let arrayItem = config.batchConfigChangesReferenceParent[i]
                                            let nodePath = arrayItem.nodePath
                                            let properties = arrayItem.properties

                                            let childNode
                                            try {
                                                childNode = eval(nodePath)
                                            } catch (err) {
                                                console.log(MODULE_NAME + ' -> The nodePath provided is not good. -> nodePath = ' + nodePath)
                                                let splittedPath = nodePath.split('.')
                                                let partialPath = ''
                                                let separator = ''
                                                for (let j = 0; j < splittedPath.length; j++) {
                                                    let part = splittedPath[j]
                                                    let partialNode
                                                    let splittedParts = part.split('[')
                                                    if (splittedParts.length > 1) {
                                                        partialNode = eval(partialPath + separator + splittedParts[0])
                                                        if (partialNode === undefined) {
                                                            console.log(MODULE_NAME + ' -> This part can not be undefined -> part = ' + splittedParts[0])
                                                            currentNode.payload.uiObject.setErrorMessage('Node Path is incorrect. See console log for details.')
                                                            break
                                                        }
                                                    }
                                                    partialPath = partialPath + separator + part
                                                    separator = '.'

                                                    partialNode = eval(partialPath)
                                                    if (partialNode === undefined) {
                                                        console.log(MODULE_NAME + ' -> This part can not be undefined -> part = ' + part)
                                                        currentNode.payload.uiObject.setErrorMessage('Node Path is incorrect. See console log for details.')
                                                        break
                                                    }
                                                }
                                                continue
                                            }
                                            let nodeConfig = JSON.parse(childNode.config)
                                            for (const property in properties) {
                                                nodeConfig[property] = properties[property]
                                            }
                                            childNode.config = JSON.stringify(nodeConfig, undefined, 5)
                                        }
                                    }
                                }
                                if (
                                    config.changeNodeConfigReferenceParent !== undefined
                                ) {
                                    changeNodeConfigCounter++
                                    if (changeNodeConfigCounter === 5) {
                                        let nodeConfig = JSON.parse(currentNode.payload.referenceParent.config)
                                        for (const property in config.changeNodeConfigReferenceParent) {
                                            nodeConfig[property] = config.changeNodeConfigReferenceParent[property]
                                        }
                                        currentNode.payload.referenceParent.config = JSON.stringify(nodeConfig)
                                    }
                                }
                                if (
                                    config.changeNodeConfigWithEvalReferenceParent !== undefined
                                ) {
                                    changeNodeConfigCounterWithEval++
                                    if (changeNodeConfigCounterWithEval === 5 || changeNodeConfigCounterWithEval === 10) {
                                        let nodeConfig = JSON.parse(currentNode.payload.referenceParent.config)
                                        for (const property in config.changeNodeConfigWithEvalReferenceParent) {
                                            nodeConfig[property] = eval(config.changeNodeConfigWithEvalReferenceParent[property])
                                        }
                                        currentNode.payload.referenceParent.config = JSON.stringify(nodeConfig)
                                    }
                                }
                                if (
                                    config.menuActionReferenceParent !== undefined
                                ) {
                                    /* 
                                    Some actions needs a little delay because they depend on animations to happen.
                                    For that reason, we will count until 10 before executing actions from tutorial.
                                    */
                                    actionCounter++
                                    if (actionCounter > 10) {
                                        if (config.menuActionReferenceParent + currentNode.id !== lastExecutedAction) {
                                            currentNode.payload.referenceParent.payload.uiObject.menu.internalClick(config.menuActionReferenceParent)
                                            lastExecutedAction = config.menuActionReferenceParent + currentNode.id
                                        }
                                    }
                                } else {
                                    lastExecutedAction = ""
                                }
                                if (
                                    config.keyPressedTimeMachineReferenceParent !== undefined
                                ) {
                                    if (currentNode.payload.referenceParent.type === 'Time Machine') {
                                        let timeMachine = UI.projects.foundations.spaces.chartingSpace.findTimeMachine(currentNode.payload.referenceParent)
                                        if (timeMachine !== undefined) {
                                            timeMachineKeyPressedCounter++
                                            if (timeMachineKeyPressedCounter === 10) {
                                                let event = {
                                                    metaKey: config.keyPressedTimeMachineReferenceParent.metaKey,
                                                    shiftKey: config.keyPressedTimeMachineReferenceParent.shiftKey,
                                                    ctrlKey: config.keyPressedTimeMachineReferenceParent.ctrlKey,
                                                    code: config.keyPressedTimeMachineReferenceParent.code,
                                                    key: config.keyPressedTimeMachineReferenceParent.key
                                                }
                                                timeMachine.edgeEditor.onKeyPressed(event, true)
                                            }
                                        }
                                    }
                                }
                                if (
                                    config.viewportCenterReferenceParent === true
                                ) {
                                    if (currentNode.payload.referenceParent.type === 'Time Machine') {
                                        let timeMachine = UI.projects.foundations.spaces.chartingSpace.findTimeMachine(currentNode.payload.referenceParent)
                                        if (timeMachine !== undefined && viewportCentered === false) {
                                            UI.projects.foundations.spaces.chartingSpace.viewport.displaceToContainer(timeMachine.container)
                                            viewportCentered = true
                                        }
                                    }
                                }
                                if (
                                    config.repositionAtTimeMachineReferenceParent === true
                                ) {
                                    if (currentNode.payload.referenceParent.type === 'Time Machine') {
                                        let timeMachine = UI.projects.foundations.spaces.chartingSpace.findTimeMachine(currentNode.payload.referenceParent)
                                        if (timeMachine !== undefined) {
                                            repositionAtTimeMachineCounter++
                                            switch (true) {
                                                case (repositionAtTimeMachineCounter > 1 && repositionAtTimeMachineCounter < 20): {
                                                    let event = {
                                                        delta: -1
                                                    }
                                                    for (let i = 0; i < 100; i++) {
                                                        UI.projects.foundations.spaces.chartingSpace.viewport.onMouseWheel(event)
                                                    }
                                                    break
                                                }
                                                case (repositionAtTimeMachineCounter === 30): {
                                                    UI.projects.foundations.spaces.chartingSpace.viewport.displaceToContainer(timeMachine.container)
                                                    break
                                                }
                                                case (repositionAtTimeMachineCounter === 60): {
                                                    let event = {
                                                        metaKey: true,
                                                        shiftKey: true,
                                                        ctrlKey: true,
                                                        code: undefined,
                                                        key: 'A'
                                                    }
                                                    timeMachine.edgeEditor.onKeyPressed(event, true)
                                                    break
                                                }
                                                case (repositionAtTimeMachineCounter === 90): {
                                                    UI.projects.foundations.spaces.chartingSpace.viewport.displaceToContainer(timeMachine.container)
                                                    break
                                                }
                                                case (repositionAtTimeMachineCounter === 120): {
                                                    UI.projects.foundations.spaces.chartingSpace.viewport.zoomAtCenter(8)
                                                    break
                                                }
                                            }
                                        }
                                    }
                                }
                                if (
                                    config.repositionAtTimeMachineNoZoomReferenceParent === true
                                ) {
                                    if (currentNode.payload.referenceParent.type === 'Time Machine') {
                                        let timeMachine = UI.projects.foundations.spaces.chartingSpace.findTimeMachine(currentNode.payload.referenceParent)
                                        if (timeMachine !== undefined) {
                                            repositionAtTimeMachineCounter++
                                            switch (true) {
                                                case (repositionAtTimeMachineCounter > 1 && repositionAtTimeMachineCounter < 30): {
                                                    for (let i = 0; i < 10; i++) {
                                                        let event = {
                                                            delta: -1
                                                        }
                                                        UI.projects.foundations.spaces.chartingSpace.viewport.onMouseWheel(event)
                                                    }
                                                    break
                                                }
                                                case (repositionAtTimeMachineCounter === 30): {
                                                    UI.projects.foundations.spaces.chartingSpace.viewport.displaceToContainer(timeMachine.container)
                                                    break
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        function makeInvisible() {
            const HEIGHT = 0
            const WIDTH = 0
            const FORM_HEIGHT = 0

            tutorialPosition = {
                x: 100000,
                y: 100000
            }

            tutorialDiv.style = '   ' +
                'position:fixed; top:' + tutorialPosition.y + 'px; ' +
                'left:' + tutorialPosition.x + 'px; ' +
                'width: ' + WIDTH + 'px;' +
                'height: ' + HEIGHT + 'px;' +
                'z-index:1;'

            tutorialFormDiv.style = '   ' +
                'position:fixed; top:' + (tutorialPosition.y) + 'px; ' +
                'left:' + tutorialPosition.x + 'px; ' +
                'width: ' + WIDTH + 'px;' +
                'height: ' + FORM_HEIGHT + 'px;' +
                'z-index:1;'
        }

        function makeVsible() {
            const HEIGHT = 675
            const WIDTH = 400
            const MARGIN = 100
            const FORM_HEIGHT = 40

            let nodeConfig
            try {
                nodeConfig = JSON.parse(currentNode.config)
            } catch (err) {
                return
            }
            let position = nodeConfig.position
            if (UI.projects.education.spaces.docsSpace.isVisible === true) {
                position = 'Left'
            }

            switch (position) {
                case 'Left': {
                    tutorialPosition = {
                        x: MARGIN,
                        y: (browserCanvas.height - HEIGHT) / 2
                    }
                    break
                }
                case 'Center': {
                    tutorialPosition = {
                        x: browserCanvas.width / 2 - WIDTH / 2,
                        y: (browserCanvas.height - HEIGHT) / 2
                    }
                    break
                }
                case 'Right': {
                    tutorialPosition = {
                        x: browserCanvas.width - WIDTH - MARGIN,
                        y: (browserCanvas.height - HEIGHT) / 2
                    }
                    break
                }
                default: {
                    tutorialPosition = {
                        x: browserCanvas.width / 2 - WIDTH / 2,
                        y: (browserCanvas.height - HEIGHT) / 2
                    }
                    break
                }
            }
            tutorialDiv.style = '   ' +
                'position:fixed; top:' + tutorialPosition.y + 'px; ' +
                'left:' + tutorialPosition.x + 'px; ' +
                'width: ' + WIDTH + 'px;' +
                'height: ' + HEIGHT + 'px;' +
                'z-index:1;'

            buildHTML()

            tutorialFormDiv.style = '   ' +
                'position:fixed; top:' + (tutorialPosition.y + HEIGHT - 30) + 'px; ' +
                'left:' + tutorialPosition.x + 'px; ' +
                'width: ' + (WIDTH + 20) + 'px;' +
                'height: ' + FORM_HEIGHT + 'px;' +
                'z-index:1;'
        }
    }

    function stop() {
        resumeModeActivated = false
        resetAfterButtonPressed()
        checkForceFocus()
        if (tutorialRootNode !== undefined) {
            tutorialRootNode.payload.uiObject.isPlaying = false
            tutorialRootNode = undefined
        }
        currentStatus = 'Stopped'
    }

    function skip() {
        resumeModeActivated = false
        resetAfterButtonPressed()
        checkForceFocus()
        let tutorial = {
            status: 'Skipped'
        }
        UI.projects.foundations.utilities.tutorial.saveTutorial(currentNode.payload, tutorial)
        advance(true)
    }

    function previous() {
        resumeModeActivated = false
        resetAfterButtonPressed()
        checkForceFocus()
        if (navigationStack.length > 1) {
            let tutorial = {
                status: undefined
            }
            let previousNode
            /* 
            Reset the Status of Current and Previous Node
            so that RESUME goes to the right node.
            */
            UI.projects.foundations.utilities.tutorial.saveTutorial(currentNode.payload, tutorial)
            previousNode = navigationStack[navigationStack.length - 3]
            if (previousNode !== undefined) {
                UI.projects.foundations.utilities.tutorial.saveTutorial(previousNode.payload, tutorial)
            }
            previousNode = navigationStack[navigationStack.length - 2]
            switch (previousNode.type) {
                case 'Tutorial': {
                    currentNode = previousNode
                    findTutorialNode(currentNode)
                    currentStatus = 'Playing Tutorial'
                    navigationStack.splice(navigationStack.length - 1)
                    break
                }
                case 'Tutorial Topic': {
                    currentNode = previousNode
                    findTutorialNode(currentNode)
                    currentStatus = 'Playing Topic'
                    navigationStack.splice(navigationStack.length - 1)
                    break
                }
                case 'Tutorial Step': {
                    currentNode = previousNode
                    findTutorialNode(currentNode)
                    currentStatus = 'Playing Step'
                    navigationStack.splice(navigationStack.length - 1)
                    break
                }
            }
        }
    }

    function next() {
        resumeModeActivated = false
        resetAfterButtonPressed()
        checkForceFocus()
        if (ckeckGoingToAnotherTutorial() === true) { return }
        let tutorial = {
            status: 'Done'
        }
        UI.projects.foundations.utilities.tutorial.saveTutorial(currentNode.payload, tutorial)
        advance()
    }

    function resetAfterButtonPressed() {
        resetViewport()
        resetActions()
        resetWorkspaces()
        resetDocumentation()
        resetRepositionAtTimeMachine()
        resetPositionAtNode()
        resetTimeMachineKeyPressed()
        resetKeyPressed()
        resetSlider()
        changeNodeConfig()
        batchConfigChanges()

        function resetActions() {
            lastExecutedAction = ""
            actionCounter = 0
        }

        function resetViewport() {
            currentZoomStep = 0
            viewportCentered = false
        }

        function resetWorkspaces() {
            workspacesCounter = 0
        }

        function resetDocumentation() {
            currentDocumentationPage = ''
            documentationCounter = 0
        }

        function resetRepositionAtTimeMachine() {
            repositionAtTimeMachineCounter = 0
        }

        function resetPositionAtNode() {
            positionAtNodeCounter = 0
        }

        function resetTimeMachineKeyPressed() {
            timeMachineKeyPressedCounter = 0
        }

        function resetKeyPressed() {
            keyPressedCounter = 0
        }

        function resetSlider() {
            sliderCounter = 0
        }

        function changeNodeConfig() {
            changeNodeConfigCounter = 0
            changeNodeConfigCounterWithEval = 0
        }

        function batchConfigChanges() {
            batchConfigChangesCounter = 0
        }
    }

    function checkForceFocus() {
        if (forcingFocus === true) {
            currentNode.payload.referenceParent.payload.floatingObject.removeForceFocus()
            forcingFocus = false
        }
    }

    function ckeckGoingToAnotherTutorial() {
        if (currentNode.payload !== undefined) {
            if (currentNode.payload.referenceParent !== undefined) {
                let config = JSON.parse(currentNode.config)
                if (config.startTutorialReferenceParent === true) {
                    if (currentNode.payload.referenceParent.type === 'Tutorial') {
                        tutorialRootNode = currentNode.payload.referenceParent
                        currentNode = currentNode.payload.referenceParent
                        currentStatus = 'Playing Tutorial'
                        resumeModeActivated = false
                        navigationStack.push(currentNode)
                        findTutorialNode(currentNode)
                        return true
                    }
                }
            }
        }
    }

    function playTutorial(node) {
        if (UI.projects.foundations.spaces.designSpace.workspace.isInitialized !== true) { return }

        PAGE_NUMBER = 0
        TUTORIAL_NAME = node.name

        navigationStack = []
        node.payload.uiObject.isPlaying = true
        tutorialRootNode = node
        currentNode = node
        currentStatus = 'Playing Tutorial'
        resumeModeActivated = false
        navigationStack.push(currentNode)
    }

    function resumeTutorial(node) {
        if (UI.projects.foundations.spaces.designSpace.workspace.isInitialized !== true) { return }
        //Testing if removing the navigationStack reset here fixes the tutorial resume issues
        //navigationStack = []
        node.payload.uiObject.isPlaying = true
        tutorialRootNode = node
        currentNode = node
        currentStatus = 'Playing Tutorial'
        resumeModeActivated = true
        navigationStack.push(currentNode)
        advance()
    }

    function playTutorialTopic(node) {
        navigationStack = []
        currentTopicNode = node
        currentNode = node
        currentStatus = 'Playing Topic'
        resumeModeActivated = false
        navigationStack.push(currentNode)
        findTutorialNode(node)
    }

    function resumeTutorialTopic(node) {
        //Testing if removing the navigationStack reset here fixes the tutorial resume issues
        //navigationStack = []
        currentTopicNode = node
        currentNode = node
        currentStatus = 'Playing Topic'
        resumeModeActivated = true
        navigationStack.push(currentNode)
        findTutorialNode(node)
    }

    function playTutorialStep(node) {
        navigationStack = []
        currentStepNode = node
        currentNode = node
        currentStatus = 'Playing Step'
        resumeModeActivated = false
        navigationStack.push(currentNode)
        findTutorialNode(node)
    }

    function resumeTutorialStep(node) {
        //Testing if removing the navigationStack reset here fixes the tutorial resume issues
        //navigationStack = []
        currentStepNode = node
        currentNode = node
        currentStatus = 'Playing Step'
        resumeModeActivated = true
        navigationStack.push(currentNode)
        findTutorialNode(node)
    }

    function resetTutorialProgress(node) {
        resetNextNode(node)

        function resetNextNode(node) {

            for (let i = 0; i < node.tutorialSteps.length; i++) {
                let tutorialStep = node.tutorialSteps[i]
                let tutorial = {
                    status: 'Reset'
                }
                UI.projects.foundations.utilities.tutorial.saveTutorial(tutorialStep.payload, tutorial)
            }

            for (let i = 0; i < node.tutorialTopics.length; i++) {
                let tutorialTopic = node.tutorialTopics[i]
                let tutorial = {
                    status: 'Reset'
                }
                UI.projects.foundations.utilities.tutorial.saveTutorial(tutorialTopic.payload, tutorial)
                resetNextNode(tutorialTopic)
            }
        }
    }

    function findTutorialNode(node) {
        /* 
        We will consider the tutorialRootNode the head of the hierarchy
        */
        tutorialRootNode = node

        if (node.payload !== undefined) {
            if (node.payload.parentNode !== undefined) {
                findTutorialNode(node.payload.parentNode)
            }
        }
    }

    function advance(isSkipping) {
        let found
        let advanced

        switch (currentStatus) {
            case 'Playing Tutorial': {
                found = true
                findNextNode(tutorialRootNode)
                break
            }
            case 'Playing Topic': {
                found = false
                if (isSkipping === true) {
                    findNextTopic(tutorialRootNode)
                } else {
                    findNextNode(tutorialRootNode)
                }
                break
            }
            case 'Playing Step': {
                found = false
                findNextNode(tutorialRootNode)
                break
            }
        }

        /* 
        If we can not find a next node, then we stop the tutorial.
        */
        if (advanced === undefined) {
            stop()
            return
        }

        function findNextNode(node) {
            if (node.tutorialSteps !== undefined) {
                for (let i = 0; i < node.tutorialSteps.length; i++) {

                    let tutorialStep = node.tutorialSteps[i]
                    if (found === true) {
                        if (resumeModeActivated !== true) {
                            currentNode = tutorialStep
                            currentStatus = 'Playing Step'
                            advanced = true
                            navigationStack.push(currentNode)
                            findTutorialNode(currentNode)
                            return
                        } else {
                            let tutorial = {
                                status: undefined
                            }
                            UI.projects.foundations.utilities.tutorial.loadTutorial(tutorialStep.payload, tutorial)
                            currentNode = tutorialStep
                            currentStatus = 'Playing Step'
                            navigationStack.push(currentNode)
                            if (tutorial.status !== 'Done') {
                                advanced = true
                                findTutorialNode(currentNode)
                                return
                            }
                        }
                    }
                    if (tutorialStep.id === currentNode.id) {
                        found = true
                    }
                }
            }

            for (let i = 0; i < node.tutorialTopics.length; i++) {

                if (advanced === true) {
                    return
                }

                let tutorialTopic = node.tutorialTopics[i]
                if (found === true) {
                    if (resumeModeActivated !== true) {
                        currentNode = tutorialTopic
                        currentStatus = 'Playing Topic'
                        advanced = true
                        navigationStack.push(currentNode)
                        findTutorialNode(currentNode)
                        return
                    } else {
                        let tutorial = {
                            status: undefined
                        }
                        UI.projects.foundations.utilities.tutorial.loadTutorial(tutorialTopic.payload, tutorial)
                        currentNode = tutorialTopic
                        currentStatus = 'Playing Topic'
                        navigationStack.push(currentNode)
                        if (tutorial.status !== 'Done') {
                            advanced = true
                            findTutorialNode(currentNode)
                            return
                        }
                    }
                }
                if (tutorialTopic.id === currentNode.id) {
                    found = true
                }

                findNextNode(tutorialTopic, found)
            }
        }

        function findNextTopic(node) {
            for (let i = 0; i < node.tutorialTopics.length; i++) {

                if (advanced === true) {
                    return
                }

                let tutorialTopic = node.tutorialTopics[i]
                if (found === true) {
                    if (resumeModeActivated !== true) {
                        currentNode = tutorialTopic
                        currentStatus = 'Playing Topic'
                        advanced = true
                        navigationStack.push(currentNode)
                        findTutorialNode(currentNode)
                        return
                    } else {
                        let tutorial = {
                            status: undefined
                        }
                        UI.projects.foundations.utilities.tutorial.loadTutorial(tutorialTopic.payload, tutorial)
                        currentNode = tutorialTopic
                        currentStatus = 'Playing Topic'
                        navigationStack.push(currentNode)
                        if (tutorial.status !== 'Done') {
                            advanced = true
                            findTutorialNode(currentNode)
                            return
                        }
                    }
                }
                if (tutorialTopic.id === currentNode.id) {
                    found = true
                } else {
                    findNextTopic(tutorialTopic, found)
                }
            }
        }
    }

    function buildHTML() {
        let nodeConfig = JSON.parse(currentNode.config)

        if (nodeConfig.docs === undefined) {
            /* The current node is not referencing any page at the Docs */
            return
        }

        let schemaDocument = SCHEMAS_BY_PROJECT.get(nodeConfig.docs.project).map.docsTutorialSchema.get(nodeConfig.docs.type)

        if (schemaDocument === undefined) {
            schemaDocument = {
                type: 'Tutorial',
                definition: {
                    text: "If you are a new user then please refresh the UI with F5."
                },
                icon: {
                    project: "Foundations",
                    name: "warning"
                },
                paragraphs: [
                    {
                        style: "Title",
                        text: "Reference Missing"
                    },
                    {
                        style: "Json",
                        text: ' \"docs\": { \n' +
                            '\"project\": \"Foundations\",\n' +
                            '\"category\": \"Tutorial\",\n' +
                            '\"type\": \"Tutorial Step - Bla Bla\"\n' +
                            '}'
                    },
                    {
                        style: "Note",
                        text: "Add at the config a reference to a Tutorial Page."
                    }
                ]
            }
        }

        newConfig = currentNode.config
        newDocument = JSON.stringify(schemaDocument) + ' - ' + UI.projects.education.spaces.docsSpace.language

        if (newConfig === currentConfig && newDocument === currentDocument) { return }
        currentConfig = newConfig
        currentDocument = newDocument

        let title

        syncConfigIconWithDocumentIcon()
        transformDocsInfoIntoTutorialInfo()
        createTheHTML()

        if (nodeConfig.controlDocs !== undefined) {
            if (nodeConfig.controlDocs.closeTutorialEditor !== true) {
                UI.projects.education.spaces.docsSpace.navigateTo(nodeConfig.docs.project, 'Tutorial', nodeConfig.docs.type)
            }
            if (nodeConfig.controlDocs.searchPage === true) {
                UI.projects.education.spaces.docsSpace.searchPage()
            }
        } else {
            UI.projects.education.spaces.docsSpace.navigateTo(nodeConfig.docs.project, 'Tutorial', nodeConfig.docs.type)
        }

        function syncConfigIconWithDocumentIcon() {
            /* 
            We update here the image of the document with whatever we find at the config, since
            we need to mechanism to keep this synchronized.
            */
            if (nodeConfig.icon === undefined) {
                nodeConfig.icon = {
                    name: nodeConfig.image, // This property comes from the migration 
                    project: 'Foundations'
                }

                nodeConfig.image = undefined // Removing this legacy property.
                currentNode.config = JSON.stringify(nodeConfig)
            }
            if (nodeConfig.icon.name !== undefined) {
                if (schemaDocument.definition.icon !== undefined) {
                    if (nodeConfig.icon.name + '-' + nodeConfig.icon.project !== schemaDocument.definition.icon.name + '-' + schemaDocument.definition.icon.project) {
                        schemaDocument.definition.icon = {
                            name: nodeConfig.icon.name,
                            project: nodeConfig.icon.project
                        }
                        schemaDocument.updated = true
                    }
                } else {
                    schemaDocument.definition.icon = {
                        name: nodeConfig.icon.name,
                        project: nodeConfig.icon.project
                    }
                    schemaDocument.updated = true
                }
            } else {
                if (schemaDocument.definition.icon !== undefined) {
                    schemaDocument.definition.icon = undefined
                    schemaDocument.updated = true
                }
            }
        }

        function transformDocsInfoIntoTutorialInfo() {
            if (schemaDocument === undefined) {
                title = "Configuration Error"
                schemaDocument = {
                    paragraphs: [
                        {
                            style: "Warning",
                            text: "The configured Docs reference does not point to any page. Correct that to see here the page contents."
                        }
                    ]
                }
                return
            }

            let splittedType = nodeConfig.docs.type.split(' - ')
            title = splittedType[1]
        }

        function createTheHTML() {
            let fullscreenMode = false
            let html = ''

            /* Check for Full Screen Mode */
            for (let i = 0; i < schemaDocument.paragraphs.length; i++) {
                let paragraph = schemaDocument.paragraphs[i]
                if (paragraph.style === 'Gif') {
                    fullscreenMode = true
                }
            }
            if (schemaDocument.definition !== undefined && schemaDocument.definition.text !== '') {
                if (schemaDocument.definition.text.indexOf('full screen mode') >= 0) {
                    fullscreenMode = true
                }
            }

            let divHeight
            if (fullscreenMode === false) {
                html = html + '<h2 class="tutorial-font-medium">' + title + '</h2>'

                divHeight = "78%"
            } else {
                divHeight = "91%"
            }

            html = html + '<div class="tutorial-content-div" style="height: ' + divHeight + '">'

            if (schemaDocument.definition !== undefined && schemaDocument.definition.text !== '') {
                if (fullscreenMode === false) {
                    if (schemaDocument.definition.icon === undefined || schemaDocument.definition.icon.name === '') {
                        /* When there is no image, we will render a Summary instead of a Table */
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(schemaDocument.definition)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-small tutorial-summary">' + text + '</div>'
                    } else {
                        html = html + '<table class="tutorial-definitionTable">'
                        html = html + '<tr>'
                        html = html + '<td>'
                        if (schemaDocument.definition.icon !== undefined && schemaDocument.definition.icon.name !== '') {
                            html = html + '<div id="tutorialImageDiv" class="tutorial-image-container"/>'
                            newImageName = schemaDocument.definition.icon.name
                            newImageProject = schemaDocument.definition.icon.project
                        }
                        html = html + '</td>'
                        html = html + '<td>'

                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(schemaDocument.definition)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)

                        html = html + '<strong class="tutorial-font-bold-small">' + text + '</strong>'
                        html = html + '</td>'
                        html = html + '</tr>'
                        html = html + '</table>'
                    }
                }
            }

            for (let i = 0; i < schemaDocument.paragraphs.length; i++) {
                let paragraph = schemaDocument.paragraphs[i]
                switch (paragraph.style) {
                    case 'Summary': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-small tutorial-summary">' + text + '</div>'
                        break
                    }
                    case 'Title': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        html = html + '<h2 class="tutorial-font-medium">' + text + '</h2>'
                        break
                    }
                    case 'Gif': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        html = html + '<div id="tutorialGifDiv" width="200" width="290"/>'
                        newGifName = text
                        break
                    }
                    case 'Youtube': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        let src = UI.projects.education.utilities.docs.parseYoutube(text)
                        console.log('text', src)
                        html = html + '<iframe width="400" height="215" src="https://www.youtube.com/embed/' + text + '" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
                        break
                    }
                    case 'Text': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-small">' + text + '</div>'
                        break
                    }
                    case 'Json': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        html = html + '<pre><code class="language-json">' + text + '</code></pre>'
                        break
                    }
                    case 'Javascript': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        html = html + '<pre><code class="language-javascript">' + text + '</code></pre>'
                        break
                    }
                    case 'List': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addBold(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-list"><ul><li>' + text + '</li></ul></div>'
                        break
                    }
                    case 'Callout': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-bold-small tutorial-callout" > ' + text + '</div>'
                        break
                    }
                    case 'Link': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        let splittedText = text.split('->')
                        html = html + '<a class="tutorial-font-small tutorial-external-link" href="' + 'https://' + splittedText[1] + '" target="_blank">' + splittedText[0] + '</a>'
                        break
                    }
                    case 'Note': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-small tutorial-alert-info" role="alert"><i class="tutorial-fa tutorial-info-circle"></i> <b>Note:</b> ' + text + '</div>'
                        break
                    }
                    case 'Success': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-small tutorial-alert-success" role="alert"><i class="tutorial-fa tutorial-check-square-o"></i> <b>Tip:</b> ' + text + '</div>'
                        break
                    }
                    case 'Important': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-small tutorial-alert-important" role="alert"><i class="tutorial-fa tutorial-warning"></i> <b>Important:</b> ' + text + '</div>'
                        break
                    }
                    case 'Warning': {
                        let text = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        text = UI.projects.education.utilities.docs.addKeyboard(text)
                        text = UI.projects.education.utilities.docs.addCodeToCamelCase(text)
                        text = UI.projects.education.utilities.docs.addCodeToWhiteList(text)
                        text = UI.projects.education.utilities.docs.addToolTips(text)
                        html = html + '<div class="tutorial-font-small tutorial-alert-warning" role="alert"><i class="tutorial-fa tutorial-warning"></i> <b>Warning:</b> ' + text + '</div>'
                        break
                    }
                }
            }

            html = html + '</div>'

            tutorialDiv.innerHTML = html
            _self.Prism.highlightAllUnder(tutorialDiv, true)
            // Create tooltip objects for all the elements
            tippy('#tooltip-container', {
                theme: "superalgos"
            });
        }
    }

    function draw() {
        if (isInitialized === false) { return }
    }

    function setupSidePanelTab() {
        thisObject.sidePanelTab = UI.projects.foundations.spaces.sideSpace.createSidePanelTab(thisObject.container, 'Education', 'tutorial', 'Tutorial', 'left')

        openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
        closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)
    }

    function onOpening() {
        //console.log('onOpening');
        if (currentStatus !== "Stopped"){return}

        let nodeResume = navigationStack.pop()
        switch (nodeResume.type) {
            case 'Tutorial': {
                resumeTutorial(nodeResume)
                break
            }
            case 'Tutorial Topic': {
                resumeTutorialTopic(nodeResume)
                break
            }
            case 'Tutorial Step': {
                resumeTutorialStep(nodeResume)
                break
            }
        }
    }

    function onClosing() {
        //console.log('onClosing');
        stop()
    }
}
