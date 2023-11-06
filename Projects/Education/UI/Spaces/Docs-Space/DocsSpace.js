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
        navigationElements: undefined,
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
        browseHistoryIndex: undefined,
        browseHistoryArray: undefined, // Here we will store all visited documents
        sharePage: sharePage,
        changeLanguage: changeLanguage,
        changeCurrentBranch: changeCurrentBranch,
        changeContributionsBranch: changeContributionsBranch,
        enterEditMode: enterEditMode,
        exitEditMode: exitEditMode,
        openSpaceAreaAndNavigateTo: openSpaceAreaAndNavigateTo,
        navigateTo: navigateTo,
        navigateBack: navigateBack,
        navigateForward: navigateForward,
        onDocsScrolled: onDocsScrolled,
        searchPage: searchPage,
        scrollToElement: scrollToElement,
        toggleRightNavPanel: toggleRightNavPanel,
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

            thisObject.browseHistoryIndex = 0
            thisObject.browseHistoryArray = new Array(0)

            setupSidePanelTab()
            setUpMenuItemsMap()
            setupUserLanguage()

            thisObject.searchEngine = newFoundationsDocsSearchEngine()
            thisObject.mainSearchPage = newFoundationsDocsMainSearchPage()
            thisObject.searchResultsPage = newFoundationsDocsSearchResultsPage()
            thisObject.documentPage = newFoundationsDocsDocumentPage()
            thisObject.footer = newFoundationsDocsFooter()
            thisObject.navigationElements = newFoundationsDocsNavigationElements()
            thisObject.commandInterface = newFoundationsDocsCommmandInterface()
            thisObject.contextMenu = newFoundationsDocsContextMenu()

            thisObject.searchEngine.initialize()
            thisObject.mainSearchPage.initialize()
            thisObject.searchResultsPage.initialize()
            thisObject.documentPage.initialize()
            thisObject.footer.initialize()
            thisObject.commandInterface.initialize()
            thisObject.contextMenu.initialize()
            thisObject.navigationElements.initialize()

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
        thisObject.navigationElements.finalize()
        thisObject.commandInterface.finalize()
        thisObject.contextMenu.finalize()

        thisObject.searchEngine = undefined
        thisObject.mainSearchPage = undefined
        thisObject.searchResultsPage = undefined
        thisObject.documentPage = undefined
        thisObject.footer = undefined
        thisObject.navigationElements = undefined
        thisObject.commandInterface = undefined
        thisObject.contextMenu = undefined

        thisObject.currentDocumentBeingRendered = undefined
        thisObject.previousDocumentBeingRendered = undefined
        thisObject.paragraphMap = undefined
        thisObject.menuLabelsMap = undefined

        thisObject.browseHistoryIndex = undefined
        thisObject.historyOfVisitedDocuments = undefined

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
        
        i18next.changeLanguage(pLanguage.toLowerCase()).then(() => translate()) // calls the global function to trigger changing of the system translations
        
        UI.projects.education.spaces.docsSpace.navigateTo(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)

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
        DOCS_PAGE_ON_FOCUS = true
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
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.placeholder,
                /*updateHistory*/ false, // This avoids reset the history index so forward navigation is still possible after reopen the Docs
            )
        }
    }

    function onClosing() {
        DOCS_PAGE_ON_FOCUS = false
        thisObject.contextMenu.removeContextMenuFromScreen()

        try {
            document.getElementById("docs-navigation-elements-sidebar-div").style.display = "none"
        } catch (error) {
            // do nothing
            // this is just to prevent crash during startup when docs-navigation-elements-sidebar-div doesn't exist yet
        }

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

    function toggleRightNavPanel() {
        setNavigationPanel(!getNavigationPanelState())
    }

    function getNavigationPanelState() {
        let enabled = false
        try {
            let panel = document.getElementById("docs-navigation-elements-sidebar-div")
            if (panel.offsetWidth > 0) {
                enabled = true
            }
        } catch (error) {
            // do nothing
            // this is just to prevent crash during startup when docs-navigation-elements-sidebar-div doesn't exist yet
        }
        return enabled
    }

    function setNavigationPanel(enabled, animation = true) {
        let panel = document.getElementById("docs-navigation-elements-sidebar-div")
        let panelToggleBtn = document.getElementById("docs-navigation-elements-sidebar-circle-div")
        let panelToggleBtnWidth = panelToggleBtn.offsetWidth
        let leftNavArrow = document.getElementById("docs-navigation-elements-sidebar-circle-left")
        let rightNavArrow = document.getElementById("docs-navigation-elements-sidebar-circle-right")

        panel.style.transition = "all 0.0s"
        panelToggleBtn.style.transition =  "all 0.0s"

        if(animation) {
            panel.style.transition = "all 0.3s"
            panelToggleBtn.style.transition = "all 0.3s"
        }

        if (enabled) {
            panel.style.width = "60px";
            let targetWidth = 60 - 0.5 * panelToggleBtnWidth
            panelToggleBtn.style.right = targetWidth + "px"
            leftNavArrow.style.display = "none"
            rightNavArrow.style.display = "inline"
        } else {
            panel.style.width = "0px";
            panelToggleBtn.style.right = -0.3 * panelToggleBtnWidth + "px"
            leftNavArrow.style.display = "inline"
            rightNavArrow.style.display = "none"
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

    function navigateTo(project, category, type, anchor, nodeId, placeholder, updateHistory = true) {

        EDITOR_ON_FOCUS = false // forced exit
        UI.projects.education.spaces.docsSpace.paragraphMap = new Map()

        getReadyToNavigate(project, category, type, anchor, nodeId, placeholder)

        if(updateHistory === true) {
            addToBrowseHistory(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered)
        }

        let navigationPanelState = getNavigationPanelState()
        UI.projects.education.spaces.docsSpace.documentPage.render()
        setNavigationPanel(navigationPanelState, false)
        updateNavigationElements()

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

    function addToBrowseHistory(document) {
        thisObject.browseHistoryArray = thisObject.browseHistoryArray.slice(0, thisObject.browseHistoryIndex + 1)
        thisObject.browseHistoryArray.push(document)
        thisObject.browseHistoryIndex = thisObject.browseHistoryArray.length - 1
    }

    function navigateBack() {
        if(thisObject.browseHistoryIndex > 0) {
            thisObject.browseHistoryIndex = thisObject.browseHistoryIndex - 1
            let pageToBeLoaded = thisObject.browseHistoryArray.at(thisObject.browseHistoryIndex)
            thisObject.navigateTo(pageToBeLoaded.project, pageToBeLoaded.category, pageToBeLoaded.type, undefined, undefined, undefined, /*updateHistory*/ false)
        } else {
            // should not happen as Back button shall not be visible in that case
            thisObject.navigateTo(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type, undefined, undefined, undefined, true)
        }
    }

    function navigateForward() {
        if(thisObject.browseHistoryIndex < thisObject.browseHistoryArray.length - 1) {
            thisObject.browseHistoryIndex = thisObject.browseHistoryIndex + 1
            let pageToBeLoaded = thisObject.browseHistoryArray.at(thisObject.browseHistoryIndex)
            thisObject.navigateTo(pageToBeLoaded.project, pageToBeLoaded.category, pageToBeLoaded.type, undefined, undefined, undefined, /*updateHistory*/ false)
        } else {
            // should not happen as Forward button shall not be visible in that case
            thisObject.navigateTo(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type, undefined, undefined, undefined, true)
        }
    }

    function updateNavigationElements() {
        let goBackBtn = document.getElementById("docs-navigation-go-back-btn")
        let goForwardBtn = document.getElementById("docs-navigation-go-forward-btn")
        let shareBtn = document.getElementById("docs-navigation-share-btn")
        let goToBookBtn = document.getElementById("docs-navigation-to-book-btn")
        
        goBackBtn.disabled = true
        goForwardBtn.disabled = true
        shareBtn.disabled = true
        goToBookBtn.disabled = true

        if (thisObject.browseHistoryIndex > 0) {
            goBackBtn.disabled = false
        }

        if (thisObject.browseHistoryIndex < thisObject.browseHistoryArray.length - 1) {
            goForwardBtn.disabled = false
        }

        if (thisObject.currentDocumentBeingRendered !== undefined) {
            shareBtn.disabled = false
        }

        if (thisObject.currentBookBeingRendered !== undefined) {
            goToBookBtn.onclick = function() { thisObject.navigateTo(thisObject.currentBookBeingRendered.project, thisObject.currentBookBeingRendered.category, thisObject.currentBookBeingRendered.type) }
            goToBookBtn.disabled = false
        }
    }

    function onDocsScrolled(event) {
        let toBottomBtn = document.getElementById("docs-navigation-to-bottom-btn")
        let toTopBtn = document.getElementById("docs-navigation-to-top-btn")
        let content = document.getElementById("docs-space-div")

        // Update buttons state
        if (content.scrollTop > 20) {
            toTopBtn.disabled = false
        } else {
            toTopBtn.disabled = true
        }

        if ((window.innerHeight + content.scrollTop) >= content.scrollHeight) {
            toBottomBtn.disabled = true
        } else {
            toBottomBtn.disabled = false
        }
    }

    function resize() {
        thisObject.container.frame.width = UI.projects.education.globals.docs.DOCS_SPACE_WIDTH
        thisObject.container.frame.height = browserCanvas.height // - TOP_SPACE_HEIGHT
        thisObject.container.frame.position.x = browserCanvas.width
        thisObject.container.frame.position.y = 0 // TOP_SPACE_HEIGHT

        try {
            document.getElementById("docs-navigation-elements-sidebar-div").style.display = "none"
        } catch (error) {
            // do nothing
            // this is just to prevent crash during startup when docs-navigation-elements-sidebar-div doesn't exist yet
        }

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
