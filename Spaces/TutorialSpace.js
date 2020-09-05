function newTutorialSpace() {
    const MODULE_NAME = 'Tutorial Space'
    let thisObject = {
        playTutorial: playTutorial,
        resumeTutorial: resumeTutorial,
        stopTutorial: stopTutorial,
        playTutorialTopic: playTutorialTopic,
        resumeTutorialTopic: resumeTutorialTopic,
        stopTutorialTopic: stopTutorialTopic,
        playTutorialStep: playTutorialStep,
        resumeTutorialStep: resumeTutorialStep,
        stopTutorialStep: stopTutorialStep,
        skipTutorialTopic: skipTutorialTopic,
        skipTutorialStep: skipTutorialStep,
        tutorialDone: tutorialDone,
        tutorialTopicDone: tutorialTopicDone,
        tutorialStepDone: tutorialStepDone,
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

    let currentTutorialNode
    let currentTutorialTopicNode
    let currentTutorialStepNode
    let currentStatus = 'Stopped'

    let docAppDiv = document.getElementById('tutorialStepDiv')

    return thisObject

    function initialize() {
        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        isInitialized = true
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)

        currentTutorialNode = undefined
        currentTutorialTopicNode = undefined
        currentTutorialStepNode = undefined

        docAppDiv = undefined
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

        switch (currentStatus) {
            case 'Stopped': {
                makeInvisible()
                break
            }
            case 'Playing Tutorial': {
                makeVsible()
                break
            }
        }

        function makeInvisible() {
            const HEIGHT = 0
            const WIDTH = 0

            tutorialPosition = {
                x: 100000,
                y: 100000
            }

            docAppDiv.style = '   ' +
                'position:fixed; top:' + tutorialPosition.y + 'px; ' +
                'left:' + tutorialPosition.x + 'px; ' +
                'width: ' + WIDTH + 'px;' +
                'height: ' + HEIGHT + 'px;' +
                'z-index:1;'
        }

        function makeVsible() {
            const HEIGHT = 800
            const WIDTH = 500
            const MARGIN = 300

            tutorialPosition = {
                x: MARGIN,
                y: (browserCanvas.height - HEIGHT) / 2
            }

            docAppDiv.style = '   ' +
                'position:fixed; top:' + tutorialPosition.y + 'px; ' +
                'left:' + tutorialPosition.x + 'px; ' +
                'width: ' + WIDTH + 'px;' +
                'height: ' + HEIGHT + 'px;' +
                'z-index:1;'
        }
    }

    function playTutorial(node) {
        currentTutorialNode = node
        currentStatus = 'Playing Tutorial'
    }

    function resumeTutorial(node) {

    }

    function stopTutorial() {
        currentTutorialNode = undefined
        currentTutorialTopicNode = undefined
        currentTutorialStepNode = undefined
        currentStatus = 'Stopped'
    }

    function playTutorialTopic(node) {

    }

    function resumeTutorialTopic(node) {

    }

    function stopTutorialTopic() {

    }

    function playTutorialStep(node) {

    }

    function resumeTutorialStep(node) {

    }

    function stopTutorialStep() {

    }

    function skipTutorialTopic() {

    }

    function skipTutorialStep() {

    }

    function tutorialDone() {

    }

    function tutorialTopicDone() {

    }

    function tutorialStepDone() {

    }

    function resetTutorialProgress() {

    }

    function draw() {
        if (isInitialized === false) { return }
    }
}
