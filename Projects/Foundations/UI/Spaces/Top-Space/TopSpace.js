
function newFoundationsTopSpace() {
    let thisObject = {
        container: undefined,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize
    }

    thisObject.container = newContainer()
    thisObject.container.initialize()

    resize()

    thisObject.container.isDraggeable = false
    thisObject.container.isClickeable = true
    let backgroundImage
    let logoImage
    return thisObject

    function initialize() {
        canvas.eventHandler.listenToEvent('Browser Resized', resize)
        thisObject.container.eventHandler.listenToEvent('onMouseClick', () => {})

        backgroundImage = new Image()
        logoImage = new Image()

        loadImage('superalgos-header-background', backgroundImage)
        loadImage('superalgos-header-logo', logoImage)

        function loadImage(name, image) {
            const PATH = 'Images/'

            image.onload = onImageLoad
            image.fileName = name

            function onImageLoad() {
                image.canDraw = true
            }
            image.src = PATH + name + '.png'
        }
    }

    function resize() {
        thisObject.container.frame.width = browserCanvas.width
        thisObject.container.frame.height = TOP_SPACE_HEIGHT

        thisObject.container.frame.position.x = 0
        try {
            thisObject.container.frame.position.y = UI.projects.foundations.spaces.chartingSpace.viewport.visibleArea.bottomLeft.y
        } catch (e) { }
    }

    function getContainer(point) {
        if (thisObject.container.frame.isThisPointHere(point, true) === true) {
            return thisObject.container
        } else {
            return undefined
        }
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        thisObject.container.frame.draw(false, false)

        drawBackground()
        return
    }

    function drawBackground() {
        /* Solid Color */
        let opacity = 1
        browserCanvasContext.beginPath()
        browserCanvasContext.rect(0, 0, thisObject.container.frame.width, thisObject.container.frame.height)
        if (ARE_WE_RECORDING_A_VIDEO === true) {
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.PATINATED_TURQUOISE + ', ' + opacity + ')'
        } else {
            browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', ' + opacity + ')'
        }
        browserCanvasContext.closePath()
        browserCanvasContext.fill()

        /* Background Image */
        if (backgroundImage !== undefined) {
            if (backgroundImage.canDraw === true) {
                let imagePosition = {
                    x: 0,
                    y: 0
                }

                browserCanvasContext.drawImage(
                    backgroundImage, imagePosition.x,
                    imagePosition.y,
                    browserCanvas.width,
                    TOP_SPACE_HEIGHT - 2)
            }
        }

        /* Logo Image */
        if (logoImage !== undefined) {
            if (logoImage.canDraw === true) {
                let imagePosition = {
                    x: 10,
                    y: 0
                }

                browserCanvasContext.drawImage(
                    logoImage, imagePosition.x,
                    imagePosition.y,
                    215,
                    TOP_SPACE_HEIGHT - 2)
            }
        }
    }
}
