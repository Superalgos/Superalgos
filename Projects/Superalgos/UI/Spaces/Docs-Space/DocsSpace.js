function newSuperalgosDocSpace() {
    const MODULE_NAME = 'Doc Space'
    let thisObject = {
        isVisible: undefined,
        sidePanelTab: undefined,
        container: undefined,
        searchEngine: undefined,
        mainSearchPage: undefined,
        searchResultsPage: undefined,
        footer: undefined,
        documentPage: undefined,
        commandInterface: undefined,
        contextMenu: undefined,
        language: undefined, 
        menuLabelsMap: undefined,
        objectBeingRendered: undefined, 
        paragraphMap: undefined,  // Here we will store a map of paragraphs from the Docs Node, Concept or Topics Schema in order to find it when we need to update them.
        textArea: undefined,
        changeLanguage: changeLanguage,
        enterEditMode: enterEditMode, 
        exitEditMode: exitEditMode, 
        openSpaceAreaAndNavigateTo: openSpaceAreaAndNavigateTo,
        navigateTo: navigateTo,
        scrollToElement: scrollToElement,
        physics: physics,
        draw: draw,
        getContainer: getContainer,
        initialize: initialize,
        finalize: finalize,
        reset: reset
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
    let openingEventSubscriptionId
    let closingEventSubscriptionId
                
    return thisObject

    function initialize() {
        thisObject.menuLabelsMap = new Map()

        setupSidePanelTab()
        setUpMenuItemsMap()
        setupUserLanguage()

        thisObject.searchEngine = newSuperalgosDocsSearchEngine()
        thisObject.mainSearchPage = newSuperalgosDocsMainSearchPage()
        thisObject.searchResultsPage = newSuperalgosDocsSearchResultsPage()
        thisObject.documentPage = newSuperalgosDocsDocumentPage()
        thisObject.footer = newSuperalgosDocsFooter()
        thisObject.commandInterface = newSuperalgosDocsCommmandInterface()
        thisObject.contextMenu = newSuperalgosDocsContextMenu()

        thisObject.searchEngine.initialize()
        thisObject.mainSearchPage.initialize()
        thisObject.searchResultsPage.initialize()
        thisObject.documentPage.initialize()
        thisObject.footer.initialize()
        thisObject.commandInterface.initialize()        
        thisObject.contextMenu.initialize()

        isInitialized = true

        function setupUserLanguage() {
            /*
            Getting the used preferred languague
            */
            if (window.localStorage.getItem('Docs Language') !== null && window.localStorage.getItem('Docs Language') !== undefined && window.localStorage.getItem('Docs Language') !== 'undefined') {
                UI.projects.superalgos.spaces.docsSpace.language = window.localStorage.getItem('Docs Language')
            } else {
                window.localStorage.setItem('Docs Language', UI.projects.superalgos.globals.docs.DEFAULT_LANGUAGE)
                UI.projects.superalgos.spaces.docsSpace.language = UI.projects.superalgos.globals.docs.DEFAULT_LANGUAGE
            }

        }

        function setupSidePanelTab() {
            thisObject.sidePanelTab = newSidePanelTab()
            thisObject.sidePanelTab.container.connectToParent(thisObject.container, false, false)
            thisObject.sidePanelTab.initialize('right')
            openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
            closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

            browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        }

        function setUpMenuItemsMap() {
            /*
            Here we will put put all the menu item labels of all nodes at all
            app schemas into a single map, that will allow us to know when a phrase
            is a label of a menu and then change its style.
            */
            for (let i = 0; i < PROJECTS_ARRAY.length; i++) {
                let project = PROJECTS_ARRAY[i]
                let appSchemaArray = SCHEMAS_BY_PROJECT.get(project).array.appSchema

                for (let j = 0; j < appSchemaArray.length; j++) {
                    let docsSchemaDocument = appSchemaArray[j]

                    if (docsSchemaDocument.menuItems === undefined) { continue }
                    for (let k = 0; k < docsSchemaDocument.menuItems.length; k++) {
                        let menuItem = docsSchemaDocument.menuItems[k]
                        thisObject.menuLabelsMap.set(menuItem.label, true)
                    }
                }
            }
        }
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)

        thisObject.searchEngine.finalize()
        thisObject.mainSearchPage.finalize()
        thisObject.searchResultsPage.finalize()
        thisObject.documentPage.finalize()
        thisObject.footer.finalize()
        thisObject.commandInterface.finalize()
        thisObject.contextMenu.finalize()
        
        thisObject.searchEngine = undefined
        thisObject.mainSearchPage = undefined
        thisObject.searchResultsPage = undefined
        thisObject.documentPage = undefined
        thisObject.footer = undefined
        thisObject.commandInterface =  undefined
        thisObject.contextMenu = undefined

        thisObject.objectBeingRendered = undefined
        thisObject.paragraphMap = undefined
        thisObject.menuLabelsMap = undefined
        isInitialized = false
    }

    function reset() {
        finalize()
        initialize()
    }

    function changeLanguage(pLanguage) {
        UI.projects.superalgos.spaces.docsSpace.language = pLanguage
        window.localStorage.setItem('Docs Language', UI.projects.superalgos.spaces.docsSpace.language)
        let languageLabel = UI.projects.superalgos.utilities.languages.getLaguageLabel(UI.projects.superalgos.spaces.docsSpace.language)
        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs In ' + languageLabel)
    }

    function onKeyDown(event) {
        /* 
        When an editor is on focus we will only
        take care of a few combinations of key strokes
        so as to tell the editor container when the user
        would like to close the editor.
        */
        if (event.key === 'Escape') {
            UI.projects.superalgos.spaces.docsSpace.exitEditMode()
        }
    }

    function enterEditMode() {
        EDITOR_ON_FOCUS = true
        window.editorController = {
            onKeyDown: onKeyDown
        }
    }

    function exitEditMode() {
        if (EDITOR_ON_FOCUS === true) {
            thisObject.documentPage.exitEditMode()
            EDITOR_ON_FOCUS = false
            UI.projects.superalgos.spaces.docsSpace.documentPage.render()
        }
    }

    function onOpening() {
        thisObject.isVisible = true
        if (UI.projects.superalgos.spaces.docsSpace.objectBeingRendered === undefined) {
            thisObject.mainSearchPage.render()

        } else {
            UI.projects.superalgos.spaces.docsSpace.navigateTo(UI.projects.superalgos.spaces.docsSpace.objectBeingRendered.project, UI.projects.superalgos.spaces.docsSpace.objectBeingRendered.category, UI.projects.superalgos.spaces.docsSpace.objectBeingRendered.type)
        }
    }

    function setUpWorkspaceSchemas() {
        /*
        We will scan the whole workspace and create an array with all of its nodes.
        */
        let rootNodes = UI.projects.superalgos.spaces.designSpace.workspace.workspaceNode.rootNodes
        let allNodesFound = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode !== null) {
                let nodeArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(rootNode)
                allNodesFound = allNodesFound.concat(nodeArray)
            }
        }
        /*
        We will create a document for each node, so that can later be indexed into the search engine.
        */
        for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
            let project = PROJECTS_ARRAY[j]
            SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema = []
            SCHEMAS_BY_PROJECT.get(project).map.workspaceSchema = new Map()

            for (let i = 0; i < allNodesFound.length; i++) {
                let node = allNodesFound[i]

                if (node.project === project) {
                    let nodeNameTypePath = UI.projects.superalgos.utilities.hierarchy.getNodeNameTypePath(node)

                    let docsSchemaDocument = {
                        nodeId: node.id,
                        nodeNameTypePath: nodeNameTypePath,
                        type: node.type,
                        definition: { text: node.name },
                        paragraphs: []
                    }
                    if (node.config !== undefined) {
                        let paragraph
                        paragraph = {
                            style: "Title",
                            text: "Config"
                        }
                        docsSchemaDocument.paragraphs.push(paragraph)
                        paragraph = {
                            style: "Json",
                            text: node.config
                        }
                        docsSchemaDocument.paragraphs.push(paragraph)
                    }
                    if (node.code !== undefined) {
                        let paragraph
                        paragraph = {
                            style: "Title",
                            text: "Code"
                        }
                        docsSchemaDocument.paragraphs.push(paragraph)
                        paragraph = {
                            style: "Javascript",
                            text: node.code
                        }
                        docsSchemaDocument.paragraphs.push(paragraph)
                    }
                    SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema.push(docsSchemaDocument)
                    SCHEMAS_BY_PROJECT.get(project).map.workspaceSchema.set(node.id, docsSchemaDocument)
                }
            }
        }
    }

    function onClosing() {
        UI.projects.superalgos.spaces.docsSpace.objectBeingRendered = undefined
        thisObject.isVisible = false
    }

    function scrollToElement(htmlElementId) {
        let myElement = document.getElementById(htmlElementId)
        if (myElement) {
            let topPos = myElement.offsetTop
            let scrollingDiv = document.getElementById('docs-space-div')
            scrollingDiv.scrollTop = topPos
        }
    }

    function openSpaceAreaAndNavigateTo(project, category, type, anchor, nodeId) {

        UI.projects.superalgos.spaces.docsSpace.objectBeingRendered = {
            project: project,
            category: category,
            type: type.replace('AMPERSAND', '\''),
            anchor: anchor,
            nodeId: nodeId
        }

        thisObject.sidePanelTab.open()
    }

    function navigateTo(project, category, type, anchor, nodeId) {

        EDITOR_ON_FOCUS = false // forced exit
        UI.projects.superalgos.spaces.docsSpace.paragraphMap = new Map()

        /* Replace the current object with this */
        UI.projects.superalgos.spaces.docsSpace.objectBeingRendered = {
            project: project,
            category: category,
            type: type.replace('AMPERSAND', '\''),
            anchor: anchor,
            nodeId: nodeId
        }

        UI.projects.superalgos.spaces.docsSpace.documentPage.render()

        /*
        Here we will check if we need to position the page at a particular anchor or at the top.
        */
        if (UI.projects.superalgos.spaces.docsSpace.objectBeingRendered.anchor !== undefined) {
            scrollToElement('docs-anchor-' + UI.projects.superalgos.spaces.docsSpace.objectBeingRendered.anchor.toLowerCase().replaceAll(' ', '-'))
            UI.projects.superalgos.spaces.docsSpace.objectBeingRendered.anchor = undefined
        } else {
            scrollToElement('docs-space-div')
        }
    }

    function resize() {
        thisObject.container.frame.width = UI.projects.superalgos.globals.docs.DOCS_SPACE_WIDTH
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
    }

    function getContainer(point, purpose) {
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
        thisObject.sidePanelTab.physics()
        docsAppDivPhysics()
        finishInitializePhysics()

        function docsAppDivPhysics() {
            let docsSpaceDiv = document.getElementById('docs-space-div')
            docsAppDivPosition = {
                x: 0,
                y: 0
            }
            docsAppDivPosition = thisObject.container.frame.frameThisPoint(docsAppDivPosition)
            docsSpaceDiv.style = '   ' +
                'overflow-y: scroll;' +
                'overflow-x: hidden;' +
                'position:fixed; top:' + docsAppDivPosition.y + 'px; ' +
                'left:' + docsAppDivPosition.x + 'px; z-index:1; ' +
                'width: ' + thisObject.container.frame.width + 'px;' +
                'height: ' + thisObject.container.frame.height + 'px'
        }

        function finishInitializePhysics() {
            if (UI.projects.superalgos.spaces.designSpace.workspace === undefined) { return }
            if (UI.projects.superalgos.spaces.designSpace.workspace.isInitialized === false) { return }

            if (thisObject.searchEngine && thisObject.searchEngine.docsIndex && thisObject.searchEngine.docsIndex.length === 0) {
                setUpWorkspaceSchemas()
                thisObject.searchEngine.setUpSearchEngine()
            }
        }
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        if (isInitialized === false) { return }
        borders()
        thisObject.sidePanelTab.draw()
    }

    function borders() {
        let point1
        let point2
        let point3
        let point4

        point1 = {
            x: 0,
            y: 0
        }

        point2 = {
            x: thisObject.container.frame.width,
            y: 0
        }

        point3 = {
            x: thisObject.container.frame.width,
            y: thisObject.container.frame.height
        }

        point4 = {
            x: 0,
            y: thisObject.container.frame.height
        }

        point1 = thisObject.container.frame.frameThisPoint(point1)
        point2 = thisObject.container.frame.frameThisPoint(point2)
        point3 = thisObject.container.frame.frameThisPoint(point3)
        point4 = thisObject.container.frame.frameThisPoint(point4)

        browserCanvasContext.setLineDash([0, 0])
        browserCanvasContext.beginPath()
        browserCanvasContext.moveTo(point1.x, point1.y)
        browserCanvasContext.lineTo(point2.x, point2.y)
        browserCanvasContext.lineTo(point3.x, point3.y)
        browserCanvasContext.lineTo(point4.x, point4.y)
        browserCanvasContext.lineTo(point1.x, point1.y)
        browserCanvasContext.closePath()

        let opacity = 1

        browserCanvasContext.fillStyle = 'rgba(' + UI_COLOR.LIGHT_GREY + ', ' + opacity + ''
        browserCanvasContext.fill()

        browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.GREY + ', ' + opacity + ''
        browserCanvasContext.lineWidth = 0.3
        browserCanvasContext.stroke()

        /* Shadow */

        if (thisObject.container.status !== 'hidden') {
            for (let i = 0; i <= 30; i++) {
                opacity = 1 - (i / 300) - 0.95

                browserCanvasContext.setLineDash([0, 0])
                browserCanvasContext.beginPath()
                browserCanvasContext.moveTo(point2.x + i, point2.y)
                browserCanvasContext.lineTo(point3.x + i, point3.y)
                browserCanvasContext.closePath()

                browserCanvasContext.strokeStyle = 'rgba(' + UI_COLOR.BLACK + ', ' + opacity + ''
                browserCanvasContext.lineWidth = 1
                browserCanvasContext.stroke()
            }
        }
    }
}
