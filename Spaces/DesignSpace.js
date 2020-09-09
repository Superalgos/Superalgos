
function newDesignSpace() {
    const MODULE_NAME = 'Designe Space'
    let thisObject = {
        container: undefined,
        iconCollection: undefined,
        iconByUiObjectType: undefined,
        workspace: undefined,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        makeVisible: makeVisible,
        makeInvisible: makeInvisible,
        initialize: initialize
    }

    let container = newContainer()
    container.initialize()
    thisObject.container = container

    container.isDraggeable = false

    thisObject.iconCollection = new Map()
    thisObject.iconByUiObjectType = new Map()

    return thisObject

    function initialize() {
        loadIconCollection(onIconsReady)

        function onIconsReady() {
            buildIconByUiObjectTypeMap()
            thisObject.workspace = newWorkspace()
            thisObject.workspace.initialize()
        }

        function buildIconByUiObjectTypeMap() {
            /* Take types-icons relationships defined at the schema */
            for (let i = 0; i < APP_SCHEMA_ARRAY.length; i++) {
                let nodeDefinition = APP_SCHEMA_ARRAY[i]
                let iconName = nodeDefinition.icon
                if (iconName !== undefined) {
                    let icon = thisObject.iconCollection.get(iconName)
                    thisObject.iconByUiObjectType.set(nodeDefinition.type, icon)
                }
            }
        }
    }

    function loadIconCollection(callBack) {

        callServer(undefined, 'ImagesNames', onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to Fetch Image Names from the Backend')
                return
            }

            let imageNames = JSON.parse(data)
            let imageLoadedCounter = 0

            for (let i = 0; i < imageNames.length; i++) {
                let name = imageNames[i]
                loadImage(name)
            }

            function loadImage(name) {
                imageLoadedCounter++
                const PATH = 'Images/Icons/style-01/'
                let image = new Image()
                image.onload = onImageLoad
                image.fileName = name

                function onImageLoad() {
                    image.canDrawIcon = true
                }
                image.src = PATH + name
                let key = name.substring(0, name.length - 4)
                thisObject.iconCollection.set(key, image)

                if (imageLoadedCounter === imageNames.length) {
                    callBack()
                }
            }
        }
    }

    function physics() {
        if (thisObject.workspace === undefined) { return }
        thisObject.workspace.physics()
    }

    function makeVisible() {
        visible = true
    }

    function makeInvisible() {
        visible = false
    }

    function getContainer(point) {

    }

    function draw() {
        if (thisObject.workspace === undefined) { return }
        if (canWeDraw === false) { return }
        thisObject.workspace.draw()
    }
}
