function newTutorialSpace() {
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
        container: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize
    }

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

    let tutorialRootNode
    let currentNode
    let currentStatus = 'Stopped'
    let navigationStack

    let tutorialDiv = document.getElementById('tutorialDiv')
    let tutorialFormDiv = document.getElementById('tutorialFormDiv')
    let htmlGif = document.createElement("IMG")
    let currentGifName = 'Never Set'
    let newGifName = 'Never Set'
    let htmlImage = document.createElement("IMG")
    let currentImageName = 'Never Set'
    let newImageName = 'Never Set'
    let currentConfig
    let newConfig
    let newDocumentationURL
    let currentDocumentationURL
    let resumeModeActivated // In this mode, we skip all the node which status is 'Done'

    return thisObject

    function initialize() {
        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        isInitialized = true
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)

        tutorialRootNode = undefined
        currentNode = undefined
        navigationStack = undefined

        tutorialDiv = undefined
        tutorialFormDiv = undefined
        image = undefined
        gif = undefined
    }

    function resize() {
        thisObject.container.frame.width = 0
        thisObject.container.frame.height = 0
    }

    function getContainer(point, purpose) {
        let container

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
                currentNode = undefined
                break
            }
            case 'Playing Tutorial': {
                makeVsible()
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

        checkGif()
        checkImage()
        checkDocumentation()
        checkSlider()
        checkReference()
        return

        function checkGif() {
            let tutorialGifDiv = document.getElementById('tutorialGifDiv')
            if (tutorialGifDiv !== null && tutorialGifDiv !== undefined) {
                tutorialGifDiv.appendChild(htmlGif)
            }

            if (currentGifName === newGifName) { return }
            currentGifName = newGifName
            htmlGif.src = 'Images/Tutorial/Gifs/' + currentGifName + '.gif'
            htmlGif.width = "400"
            //htmlGif.height = "100"
        }

        function checkImage() {
            let tutorialImageDiv = document.getElementById('tutorialImageDiv')
            if (tutorialImageDiv !== null && tutorialImageDiv !== undefined) {
                tutorialImageDiv.appendChild(htmlImage)
            }

            if (currentImageName === newImageName) { return }
            currentImageName = newImageName
            htmlImage.src = 'Images/Icons/style-01/' + currentImageName + '.png'
            htmlImage.width = "100"
            htmlImage.height = "100"
        }

        function checkDocumentation() {
            if (currentNode === undefined) { return }
            let config = JSON.parse(currentNode.config)
            let newDocumentationURL = config.documentationURL
            if (newDocumentationURL === undefined) {
                /*
                The doc panel will remain as it is, and the user will be free to open or close it at will.
                */
                return
            }
            if (newDocumentationURL === "") {
                /*
                This forces the tutorial to close the documentation panel and to keep it closed.
                */
                canvas.docSpace.sidePanelTab.close()
                return
            }
            if (newDocumentationURL === currentDocumentationURL) { return }

            currentDocumentationURL = newDocumentationURL
            canvas.docSpace.navigateTo(currentDocumentationURL)
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
            switch (config.slider) {
                case "toTop": {
                    /*
                    This forces the tutorial to close the charting space and to keep it closed.
                    */
                    canvas.cockpitSpace.toTop()
                    return
                }
                case "toMiddle": {
                    /*
                    This forces the tutorial to share the screen half with the designer and half 
                    with the charting space and force it in that way.
                    */
                    canvas.cockpitSpace.toMiddle()
                    return
                }
                case "toBottom": {
                    /*
                    This forces the tutorial to fully open the charting space and to keep it open.
                    */
                    canvas.cockpitSpace.toBottom()
                    return
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
                                canvas.floatingSpace.positionAtNode(currentNode.payload.referenceParent)
                                currentNode.payload.referenceParent.payload.uiObject.highlight()
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
            const HEIGHT = 650
            const WIDTH = 400
            const MARGIN = 300
            const FORM_HEIGHT = 40

            let nodeConfig = JSON.parse(currentNode.config)
            switch (nodeConfig.position) {
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
        tutorialRootNode.payload.uiObject.isPlaying = false
        tutorialRootNode = undefined
        currentStatus = 'Stopped'
    }

    function skip() {
        let tutorial = {
            status: 'Skipped'
        }
        saveTutorial(currentNode.payload, tutorial)
        advance()
    }

    function previous() {
        if (navigationStack.length > 1) {
            let previousNode = navigationStack[navigationStack.length - 2]
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
        if (ckeckGoingToAnotherTutorial() === true) { return }
        let tutorial = {
            status: 'Done'
        }
        saveTutorial(currentNode.payload, tutorial)
        advance()
    }

    function ckeckGoingToAnotherTutorial() {
        if (currentNode.payload !== undefined) {
            if (currentNode.payload.referenceParent !== undefined) {
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

    function playTutorial(node) {
        navigationStack = []
        node.payload.uiObject.isPlaying = true
        tutorialRootNode = node
        currentNode = node
        currentStatus = 'Playing Tutorial'
        resumeModeActivated = false
        navigationStack.push(currentNode)
    }

    function resumeTutorial(node) {
        navigationStack = []
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
        navigationStack = []
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
        navigationStack = []
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
                saveTutorial(tutorialStep.payload, tutorial)
            }

            for (let i = 0; i < node.tutorialTopics.length; i++) {
                let tutorialTopic = node.tutorialTopics[i]
                let tutorial = {
                    status: 'Reset'
                }
                saveTutorial(tutorialTopic.payload, tutorial)
                resetNextNode(tutorialTopic)
            }
        }
    }

    function findTutorialNode(node) {
        /* 
        We will consider the tutorialRootNode the head of the hirierchy
        */
        tutorialRootNode = node

        if (node.payload !== undefined) {
            if (node.payload.parentNode !== undefined) {
                findTutorialNode(node.payload.parentNode)
            }
        }
    }

    function advance() {
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
                findNextNode(tutorialRootNode)
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

        /* 
        If there is a reference parent defined, we will uncollape the brach where it belongs.
        */
        if (currentNode.payload.referenceParent !== undefined) {
            if (currentNode.payload.referenceParent.payload !== undefined) {
                if (currentNode.payload.referenceParent.payload.floatingObject !== undefined) {
                    currentNode.payload.referenceParent.payload.floatingObject.unCollapseParent()
                }
            }
        }

        function findNextNode(node) {
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
                        loadTutorial(tutorialStep.payload, tutorial)
                        if (tutorial.status !== 'Done') {
                            currentNode = tutorialStep
                            currentStatus = 'Playing Step'
                            advanced = true
                            navigationStack.push(currentNode)
                            findTutorialNode(currentNode)
                            return
                        }
                    }
                }
                if (tutorialStep.id === currentNode.id) {
                    found = true
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
                        loadTutorial(tutorialTopic.payload, tutorial)
                        if (tutorial.status !== 'Done') {
                            currentNode = tutorialTopic
                            currentStatus = 'Playing Topic'
                            advanced = true
                            navigationStack.push(currentNode)
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
    }

    function buildHTML() {

        newConfig = currentNode.config
        if (newConfig === currentConfig) { return }
        currentConfig = newConfig

        let nodeConfig = JSON.parse(currentNode.config)
        let html = ''
        if (nodeConfig.title !== undefined && nodeConfig.title !== '') {
            html = html + '<div><h1 class="tutorial-font-large">' + nodeConfig.title + '</h1></div>'
        } else {
            if (currentNode.name !== 'New ' + currentNode.type) {
                html = html + '<div><h1 class="tutorial-font-large">' + currentNode.name + '</h1></div>'
            }
        }
        html = html + '<div>'
        if (nodeConfig.summary !== undefined && nodeConfig.summary !== '') {
            html = html + '<div class="tutorial-font-small tutorial-summary">' + nodeConfig.summary + '</div>'
        }
        if (nodeConfig.subTitle !== undefined && nodeConfig.subTitle !== '') {
            html = html + '<h2 class="tutorial-font-medium">' + nodeConfig.subTitle + '</h2>'
        }
        if (nodeConfig.gif !== undefined && nodeConfig.gif !== '') {
            html = html + '<div id="tutorialGifDiv" width="400"/>'
            newGifName = nodeConfig.gif
        }
        if (nodeConfig.definition !== undefined && nodeConfig.definition !== '') {
            html = html + '<table class="tutorial-definitionTable">'
            html = html + '<tr>'
            html = html + '<td>'
            if (nodeConfig.image !== undefined && nodeConfig.image !== '') {
                html = html + '<div id="tutorialImageDiv" width="100" height="100"/>'
                newImageName = nodeConfig.image
            }
            html = html + '</td>'
            html = html + '<td>'
            html = html + '<strong class="tutorial-font-bold-small">' + nodeConfig.definition + '</strong>'
            html = html + '</td>'
            html = html + '</tr>'
            html = html + '</table>'
        }
        if (nodeConfig.bulletListIntro !== undefined && nodeConfig.bulletListIntro !== '') {
            html = html + '<p class="tutorial-font-small">' + nodeConfig.bulletListIntro + '</p>'
        }
        if (nodeConfig.bulletArray !== undefined) {
            html = html + '<ul>'
            for (let i = 0; i < nodeConfig.bulletArray.length; i++) {
                let bullet = nodeConfig.bulletArray[i]
                html = html + '<li>'
                html = html + '<p class="tutorial-font-small"><strong class="tutorial-font-bold-small">' + bullet[0] + '</strong> ' + bullet[1] + '</p>'
                html = html + '</li>'
            }
            html = html + '</ul>'
        }
        if (nodeConfig.paragraph1 !== undefined && nodeConfig.paragraph1 !== '') {
            html = html + '<p class="tutorial-font-small">' + nodeConfig.paragraph1 + '</p>'
        }
        if (nodeConfig.callOut !== undefined && nodeConfig.callOut !== '') {
            html = html + '<div class="tutorial-font-bold-small tutorial-callout" > ' + nodeConfig.callOut + ''
            if (nodeConfig.externalLink !== undefined) {
                html = html + '<a href="' + nodeConfig.externalLink[1] + '" target="_blank">' + nodeConfig.externalLink[0] + '</a>'
            }
            html = html + '</div>'
        }
        if (nodeConfig.paragraph2 !== undefined && nodeConfig.paragraph2 !== '') {
            html = html + '<p class="tutorial-font-small">' + nodeConfig.paragraph2 + '</p>'
        }
        if (nodeConfig.paragraph2 !== undefined && nodeConfig.paragraph2 !== '') {
            html = html + '<p class="tutorial-font-small">' + nodeConfig.paragraph2 + '</p>'
        }
        if (nodeConfig.note !== undefined && nodeConfig.note !== '') {
            html = html + '<div class="tutorial-font-small tutorial-alert-info" role="alert"><i class="tutorial-fa tutorial-info-circle"></i> <b>Note:</b> ' + nodeConfig.note + '</div>'
        }
        if (nodeConfig.tip !== undefined && nodeConfig.tip !== '') {
            html = html + '<div class="tutorial-font-small tutorial-alert-success" role="alert"><i class="tutorial-fa tutorial-check-square-o"></i> <b>Tip:</b> ' + nodeConfig.tip + '</div>'
        }
        if (nodeConfig.important !== undefined && nodeConfig.important !== '') {
            html = html + '<div class="tutorial-font-small tutorial-alert-warning" role="alert"><i class="tutorial-fa tutorial-warning"></i> <b>Important:</b> ' + nodeConfig.important + '</div>'
        }
        if (nodeConfig.warning !== undefined && nodeConfig.warning !== '') {
            html = html + '<div class="tutorial-font-small tutorial-alert-warning" role="alert"><i class="tutorial-fa tutorial-warning"></i> <b>Important:</b> ' + nodeConfig.warning + '</div>'
        }
        html = html + '</div>'

        tutorialDiv.innerHTML = html
    }

    function draw() {
        if (isInitialized === false) { return }
    }
}
