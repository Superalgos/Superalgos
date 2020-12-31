function newSuperalgosDesignSpace() {
    let thisObject = {
        container: undefined,
        iconsByProjectAndName: undefined,
        iconsByProjectAndType: undefined,
        workspace: undefined,
        getIconByProjectAndName: getIconByProjectAndName,
        getIconByProjectAndType: getIconByProjectAndType,
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

    thisObject.iconsByProjectAndName = new Map()
    thisObject.iconsByProjectAndType = new Map()

    return thisObject

    function initialize() {
        loadIconCollection(onIconsReady)

        function onIconsReady() {
            buildIconByProjectAndTypeMap()
            thisObject.workspace = newWorkspace()
            thisObject.workspace.initialize()
        }

        function buildIconByProjectAndTypeMap() {
            /* Take types-icons relationships defined at the schema */
            for (let i = 0; i < PROJECTS_ARRAY.length; i++) {
                let project = PROJECTS_ARRAY[i]
                
                addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.appSchema)
                addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema)
                addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema)
                addSchemaTypes(SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema)

                function addSchemaTypes(schema) {
                    for (let j = 0; j < schema.length; j++) {
                        let schemaDocument = schema[j]
                        let iconName = schemaDocument.icon
                        if (iconName === undefined) {
                            iconName = schemaDocument.type.toLowerCase()
                            iconName = iconName.split(" ").join("-")
                        }
                        let icon = thisObject.getIconByProjectAndName(project, iconName)
                        if (icon !== undefined) {
                            let key = project + '-' + schemaDocument.type
                            thisObject.iconsByProjectAndType.set(key, icon)
                        }
                    }
                }
            }
        }
    }

    function loadIconCollection(callBack) {

        httpRequest(undefined, 'IconNames', onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to Fetch Image Names from the Client')
                return
            }

            let iconsArray = JSON.parse(data)
            let imageLoadedCounter = 0

            for (let i = 0; i < iconsArray.length; i++) {
                let project = iconsArray[i][0]
                let name = iconsArray[i][1]
                loadImage(project, name)
            }

            function loadImage(project, name) {
                imageLoadedCounter++
                const PATH = 'Icons/' + project + '/'
                let image = new Image()
                image.onload = onImageLoad
                image.fileName = name

                function onImageLoad() {
                    image.canDrawIcon = true
                }
                image.src = PATH + name
                let key = project + '-' + name.substring(0, name.length - 4)
                thisObject.iconsByProjectAndName.set(key, image)

                if (imageLoadedCounter === iconsArray.length) {
                    callBack()
                }
            }
        }
    }

    function getIconByProjectAndName(project, name) {
        return thisObject.iconsByProjectAndName.get(project + '-' + name)
    }

    function getIconByProjectAndType(project, type) {
        return thisObject.iconsByProjectAndType.get(project + '-' + type)
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
        if (CAN_SPACES_DRAW === false) { return }
        thisObject.workspace.draw()
    }
}
