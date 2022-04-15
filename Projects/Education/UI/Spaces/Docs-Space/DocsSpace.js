function newEducationDocSpace() {
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
        currentBranch: undefined,
        contributionsBranch: undefined,
        menuLabelsMap: undefined,
        currentDocumentBeingRendered: undefined,
        previousDocumentBeingRendered: undefined,
        currentBookBeingRendered: undefined,
        paragraphMap: undefined,  // Here we will store a map of paragraphs from the Docs Node, Concept, Topics, Tutorials, Reviews or Books Schema in order to find it when we need to update them.
        textArea: undefined,
        sharePage: sharePage,
        changeLanguage: changeLanguage,
        changeCurrentBranch: changeCurrentBranch,
        changeContributionsBranch: changeContributionsBranch,
        enterEditMode: enterEditMode,
        exitEditMode: exitEditMode,
        openSpaceAreaAndNavigateTo: openSpaceAreaAndNavigateTo,
        navigateTo: navigateTo,
        searchPage: searchPage,
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

    async function initialize() {
        let promise = new Promise((resolve, reject) => {

            thisObject.menuLabelsMap = new Map()

            setupSidePanelTab()
            setUpMenuItemsMap()
            setupUserLanguage()

            thisObject.searchEngine = newFoundationsDocsSearchEngine()
            thisObject.mainSearchPage = newFoundationsDocsMainSearchPage()
            thisObject.searchResultsPage = newFoundationsDocsSearchResultsPage()
            thisObject.documentPage = newFoundationsDocsDocumentPage()
            thisObject.footer = newFoundationsDocsFooter()
            thisObject.commandInterface = newFoundationsDocsCommmandInterface()
            thisObject.contextMenu = newFoundationsDocsContextMenu()

            thisObject.searchEngine.initialize()
            thisObject.mainSearchPage.initialize()
            thisObject.searchResultsPage.initialize()
            thisObject.documentPage.initialize()
            thisObject.footer.initialize()
            thisObject.commandInterface.initialize()
            thisObject.contextMenu.initialize()

            setupCurrentBranch()
            setupContributionsBranch()

            isInitialized = true

            UI.projects.foundations.utilities.statusBar.changeStatus("Setting up Docs Search Engine...")
            setTimeout(setUpSearchEngine, 100)

            function setUpSearchEngine() {
                thisObject.searchEngine.setUpSearchEngine(whenFinished)
                function whenFinished() {
                    resolve()
                }
            }

            function setupCurrentBranch() {
                /*
                Getting the currentBranch
                */
                let workspace = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode

                httpRequest(undefined, 'App/Branch', onResponse)
                /*
                Deleting what was is here because is not longer used...
                */
                window.localStorage.removeItem('Current Branch')
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(workspace.payload, 'currentBranch', undefined)

                function onResponse(err, data) {
                    /* Lets check the result of the call through the http interface */
                    data = JSON.parse(data)
                    if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.CUSTOM_OK_RESPONSE.result) {
                        let currentBranch = data.message.current
                        UI.projects.education.spaces.docsSpace.currentBranch = currentBranch
                    } else {
                        UI.projects.education.spaces.docsSpace.navigateTo(
                            data.docs.project,
                            data.docs.category,
                            data.docs.type,
                            data.docs.anchor,
                            undefined,
                            data.docs.placeholder
                        )
                    }
                }
            }

            function setupContributionsBranch() {
                /*
                Getting the contributionsBranch
                */
                let workspace = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode
                let contributionsBranch = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(workspace.payload, 'contributionsBranch')

                if (contributionsBranch === undefined) {
                    UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(workspace.payload, 'contributionsBranch', UI.projects.education.globals.docs.DEFAULT_CONTRIBUTIONS_BRANCH)
                    UI.projects.education.spaces.docsSpace.contributionsBranch = UI.projects.education.globals.docs.DEFAULT_CONTRIBUTIONS_BRANCH
                } else {
                    UI.projects.education.spaces.docsSpace.contributionsBranch = contributionsBranch
                }
                /*
                Every time this setup occurs, we will automatically change to the contributionsBranch of the workspace.
                */
                changeContributionsBranch(UI.projects.education.spaces.docsSpace.contributionsBranch, true)
                /*
                Deleting what was is here because is not longer used...
                */
                window.localStorage.removeItem('Contributions Branch')
            }

            function setupUserLanguage() {
                /*
                Getting the used preferred language
                */
                let workspace = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode
                let docsLanguage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(workspace.payload, 'docsLanguage')

                if (docsLanguage === undefined) {
                    UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(workspace.payload, 'docsLanguage', UI.projects.education.globals.docs.DEFAULT_LANGUAGE)
                    UI.projects.education.spaces.docsSpace.language = UI.projects.education.globals.docs.DEFAULT_LANGUAGE
                } else {
                    UI.projects.education.spaces.docsSpace.language = docsLanguage
                }
                /*
                Deleting what was is here because is not longer used...
                */
                window.localStorage.removeItem('Docs Language')
            }

            function setupSidePanelTab() {
                thisObject.sidePanelTab = UI.projects.foundations.spaces.sideSpace.createSidePanelTab(thisObject.container, 'Education', 'docs-tab', 'Docs', 'right')

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
                for (let i = 0; i < PROJECTS_SCHEMA.length; i++) {
                    let project = PROJECTS_SCHEMA[i].name
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
        })

        return promise
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
        thisObject.commandInterface = undefined
        thisObject.contextMenu = undefined

        thisObject.currentDocumentBeingRendered = undefined
        thisObject.previousDocumentBeingRendered = undefined
        thisObject.paragraphMap = undefined
        thisObject.menuLabelsMap = undefined
        isInitialized = false
    }

    async function reset() {
        finalize()
        await initialize()
    }

    function changeCurrentBranch(branch, doNotNavigate) {
        httpRequest(undefined, 'App/Checkout/' + branch, onResponse)
        if (doNotNavigate !== true) {
            UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'Switching Branches - Changing Current Branch')
        }

        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                UI.projects.education.spaces.docsSpace.currentBranch = branch
                let workspace = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode
                UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(workspace.payload, 'currentBranch', branch)

                if (doNotNavigate === true) { return }

                UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'Switching Branches - Current Branch Changed')

            } else {
                UI.projects.education.spaces.docsSpace.navigateTo(
                    data.docs.project,
                    data.docs.category,
                    data.docs.type,
                    data.docs.anchor,
                    undefined,
                    data.docs.placeholder
                )
            }
        }
    }

    function changeContributionsBranch(branch, doNotNavigate) {
        UI.projects.education.spaces.docsSpace.contributionsBranch = branch
        let workspace = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode
        UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(workspace.payload, 'contributionsBranch', branch)

        if (doNotNavigate !== true) {
            UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'Switching Branches - Contributions Branch Changed')
        }
    }

    function changeLanguage(pLanguage) {
        UI.projects.education.spaces.docsSpace.language = pLanguage
        let languageLabel = UI.projects.education.utilities.languages.getLaguageLabel(UI.projects.education.spaces.docsSpace.language)
        UI.projects.education.spaces.docsSpace.navigateTo('Foundations', 'Topic', 'Docs In ' + languageLabel)

        let workspace = UI.projects.workspaces.spaces.designSpace.workspace.workspaceNode
        UI.projects.visualScripting.utilities.nodeConfig.saveConfigProperty(workspace.payload, 'docsLanguage', UI.projects.education.spaces.docsSpace.language)
    }

    function sharePage() {
        let clipboard = "docs.goto " + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '->' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category + '->' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type
        UI.projects.foundations.utilities.clipboard.copyTextToClipboard(clipboard)
    }

    function onKeyDown(event) {
        /* 
        When an editor is on focus we will only
        take care of a few combinations of key strokes
        so as to tell the editor container when the user
        would like to close the editor. ESC key exits edit mode.    
        */
        if (event.key === 'Escape') {
            UI.projects.education.spaces.docsSpace.exitEditMode()
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
            UI.projects.education.spaces.docsSpace.documentPage.render()
            EDITOR_ON_FOCUS = false
        }
    }

    function onOpening() {
        thisObject.isVisible = true
        if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered === undefined) {
            thisObject.mainSearchPage.render()

        } else {
            UI.projects.education.spaces.docsSpace.navigateTo(
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project,
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category,
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type,
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.anchor,
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.nodeId,
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.placeholder
            )
        }
    }

    function onClosing() {
        thisObject.contextMenu.removeContextMenuFromScreen()
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

    function openSpaceAreaAndNavigateTo(project, category, type, anchor, nodeId, placeholder) {

        getReadyToNavigate(project, category, type, anchor, nodeId, placeholder)

        thisObject.sidePanelTab.open()
    }

    function searchPage() {
        UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered = undefined
        thisObject.mainSearchPage.render()
    }

    function navigateTo(project, category, type, anchor, nodeId, placeholder) {

        EDITOR_ON_FOCUS = false // forced exit
        UI.projects.education.spaces.docsSpace.paragraphMap = new Map()

        getReadyToNavigate(project, category, type, anchor, nodeId, placeholder)

        UI.projects.education.spaces.docsSpace.documentPage.render()

        /*
        Here we will check if we need to position the page at a particular anchor or at the top.
        */
        if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.anchor !== undefined) {
            scrollToElement('docs-anchor-' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.anchor.toLowerCase().replaceAll(' ', '-'))
            UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.anchor = undefined
        } else {
            scrollToElement('docs-space-div')
        }
    }

    function getReadyToNavigate(project, category, type, anchor, nodeId, placeholder) {
        /* Replace the current object with this */
        if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered !== undefined) {
            UI.projects.education.spaces.docsSpace.previousDocumentBeingRendered = JSON.parse(JSON.stringify(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered))
        }

        if (category === 'Book') {
            UI.projects.education.spaces.docsSpace.currentBookBeingRendered = {
                project: project,
                category: category,
                type: type.replaceAll('AMPERSAND', '\''),
                anchor: anchor,
                nodeId: nodeId,
                placeholder: placeholder
            }
        }

        UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered = {
            project: project,
            category: category,
            type: type.replaceAll('AMPERSAND', '\''),
            anchor: anchor,
            nodeId: nodeId,
            placeholder: placeholder
        }
    }

    function resize() {
        thisObject.container.frame.width = UI.projects.education.globals.docs.DOCS_SPACE_WIDTH
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        if (thisObject.sidePanelTab !== undefined) {
            thisObject.sidePanelTab.resize()
        }
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
        docsAppDivPhysics()

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
    }

    function draw() {
        if (CAN_SPACES_DRAW === false) { return }
        if (isInitialized === false) { return }
        borders()
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

        browserCanvasContext.setLineDash([]) // Resets Line Dash
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

                browserCanvasContext.setLineDash([]) // Resets Line Dash
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
