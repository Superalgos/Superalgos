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
        language: undefined, 
        command: undefined,
        menuLabelsMap: undefined,
        changeLanguage: changeLanguage,
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
    const DEFAULT_LANGUAGE = 'EN'
    const DOCS_SPACE_WIDTH = 900
    const newParagraphText = "Left click and Edit to enter edit mode and change this text. ENTER to write new paragraphs. ESC to exit edit mode."

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

    let textArea
    let selectedParagraph
    let selectedParagraphData = ''
    let selectedParagraphIndex = ''
    let selectedParagraphHeight = 0
    let objectBeingRendered
    let paragraphMap                    // Here we will store a map of paragraphs from the Docs Node, Concept or Topics Schema in order to find it when we need to update them.
    let appSchemaDocument
    let docsSchemaDocument

    return thisObject

    function initialize() {
        thisObject.menuLabelsMap = new Map()

        setupSidePanelTab()
        setUpContextMenu()
        setUpMenuItemsMap()
        setupUserLanguage()

        thisObject.searchEngine = newSuperalgosDocsSearchEngine()
        thisObject.mainSearchPage = newSuperalgosDocsMainSearchPage()
        thisObject.searchResultsPage = newSuperalgosDocsSearchResultsPage()
        thisObject.documentPage = newSuperalgosDocsDocumentPage()
        thisObject.footer = newSuperalgosDocsFooter()
        thisObject.commandInterface = newSuperalgosDocsCommmandInterface()

        thisObject.searchEngine.initialize()
        thisObject.mainSearchPage.initialize()
        thisObject.searchResultsPage.initialize()
        thisObject.documentPage.initialize()
        thisObject.footer.initialize()
        thisObject.commandInterface.initialize()        

        isInitialized = true

        function setupUserLanguage() {
            /*
            Getting the used preferred languague
            */
            if (window.localStorage.getItem('Docs Language') !== null && window.localStorage.getItem('Docs Language') !== undefined && window.localStorage.getItem('Docs Language') !== 'undefined') {
                UI.projects.superalgos.spaces.docsSpace.language = window.localStorage.getItem('Docs Language')
            } else {
                window.localStorage.setItem('Docs Language', DEFAULT_LANGUAGE)
                UI.projects.superalgos.spaces.docsSpace.language = DEFAULT_LANGUAGE
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

        function setUpContextMenu() {
            window.contextMenu = {
                editParagraph: editParagraph,
                deleteParagraph: deleteParagraph,
                toJavascript: toJavascript,
                toJson: toJson,
                toText: toText,
                toTitle: toTitle,
                toSubtitle: toSubtitle,
                toNote: toNote,
                toWarning: toWarning,
                toError: toError,
                toImportant: toImportant,
                toSuccess: toSuccess,
                toCallout: toCallout,
                toSummary: toSummary,
                toList: toList,
                toTable: toTable,
                toHierarchy: toHierarchy,
                toGif: toGif,
                toPng: toPng,
                toAnchor: toAnchor,
                toBlock: toBlock,
                toInclude: toInclude,
                toSection: toSection,
                copyLink: copyLink,
                toWebPageLink: toWebPageLink,
                toYouTubeVideo: toYouTubeVideo
            }

            function editParagraph() {
                contextMenuForceOutClick()
                showHTMLTextArea()

                function showHTMLTextArea() {
                    if (selectedParagraph === undefined) { return }

                    /* 
                    When in editing mode, some type of paragraphs need to extend
                    the text area style so that while editing, it looks and feel
                    like the non editing style of the paragraph. For those we
                    add an extra style class.
                    */
                    let extraClassName = ''
                    if (selectedParagraph.id.indexOf('definition') >= 0) {
                        extraClassName = ' ' + ''
                    }
                    if (selectedParagraph.id.indexOf('title') >= 0) {
                        extraClassName = ' ' + 'docs-h3'
                    }
                    if (selectedParagraph.id.indexOf('subtitle') >= 0) {
                        extraClassName = ' ' + 'docs-h4'
                    }
                    if (selectedParagraph.id.indexOf('note') >= 0) {
                        extraClassName = ' ' + 'docs-alert-note'
                    }
                    if (selectedParagraph.id.indexOf('success') >= 0) {
                        extraClassName = ' ' + 'docs-alert-success'
                    }
                    if (selectedParagraph.id.indexOf('important') >= 0) {
                        extraClassName = ' ' + 'docs-alert-important'
                    }
                    if (selectedParagraph.id.indexOf('warning') >= 0) {
                        extraClassName = ' ' + 'docs-alert-warning'
                    }
                    if (selectedParagraph.id.indexOf('error') >= 0) {
                        extraClassName = ' ' + 'docs-alert-error'
                    }
                    if (selectedParagraph.id.indexOf('javascript') >= 0) {
                        extraClassName = ' ' + 'language-javascript'
                    }
                    if (selectedParagraph.id.indexOf('json') >= 0) {
                        extraClassName = ' ' + 'language-json'
                    }

                    textArea = document.createElement('textarea');
                    textArea.id = "textArea";
                    textArea.spellcheck = false;
                    textArea.className = "docs-text-area" + extraClassName
                    textArea.style.height = selectedParagraphHeight
                    textArea.value = selectedParagraphData
                    selectedParagraph.innerHTML = ""
                    selectedParagraph.appendChild(textArea)
                    textArea.style.display = 'block'
                    textArea.focus()
                    contextMenuForceOutClick()
                    enterEditMode()
                }
            }

            function deleteParagraph() {
                if (selectedParagraphIndex === undefined) { return }
                if (selectedParagraphIndex === 0) { return }
                docsSchemaDocument.paragraphs.splice(selectedParagraphIndex, 1)
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toJavascript() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Javascript'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toJson() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Json'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toText() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Text'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toTitle() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Title'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toSubtitle() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Subtitle'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toNote() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Note'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toWarning() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Warning'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toError() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Error'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toImportant() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Important'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toSuccess() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Success'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toCallout() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Callout'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toSummary() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Summary'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toSection() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Section'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toList() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'List'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toTable() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Table'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toHierarchy() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Hierarchy'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toGif() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Gif'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toPng() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Png'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toAnchor() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Anchor'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toBlock() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Block'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toInclude() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Include'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toWebPageLink() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Link'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function toYouTubeVideo() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Youtube'
                contextMenuForceOutClick()
                UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
            }

            function copyLink() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                let clipboard
                switch (docSchemaParagraph.style) {
                    case 'Anchor': {
                        clipboard = "docs.goto " + objectBeingRendered.project + '->' + objectBeingRendered.category + '->' + objectBeingRendered.type + '->' + docSchemaParagraph.text
                        break
                    }
                    case 'Block': {
                        clipboard = objectBeingRendered.project + '->' + objectBeingRendered.category + '->' + objectBeingRendered.type + '->' + docSchemaParagraph.text
                        break
                    }
                    default: {
                        clipboard = docSchemaParagraph.text
                        break
                    }
                }

                UI.projects.superalgos.utilities.clipboard.copyTextToClipboard(clipboard)
                contextMenuForceOutClick()
            }
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
        
        thisObject.searchEngine = undefined
        thisObject.mainSearchPage = undefined
        thisObject.searchResultsPage = undefined
        thisObject.documentPage = undefined
        thisObject.footer = undefined
        thisObject.commandInterface =  undefined

        objectBeingRendered = undefined
        paragraphMap = undefined
        appSchemaDocument = undefined
        docsSchemaDocument = undefined
        thisObject.menuLabelsMap = undefined
        isInitialized = false
    }

    function reset() {
        finalize()
        intialize()
    }

    function changeLanguage(pLanguage) {
        UI.projects.superalgos.spaces.docsSpace.language = pLanguage
        window.localStorage.setItem('Docs Language', UI.projects.superalgos.spaces.docsSpace.language)
        let languageLabel = UI.projects.superalgos.utilities.languages.getLaguageLabel(UI.projects.superalgos.spaces.docsSpace.language)
        navigateTo('Superalgos', 'Topic', 'Docs In ' + languageLabel)
    }

    function onKeyDown(event) {
        /* 
        When an editor is on focus we will only
        take care of a few combinations of key strokes
        so as to tell the editor container when the user
        would like to close the editor.
        */
        if (event.key === 'Escape') {
            exitEditMode()
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
            let editing
            if (selectedParagraph.id.indexOf('definition') >= 0) {
                editing = "Definition"
            } else {
                editing = "Paragraph"
            }
            switch (editing) {
                case "Paragraph": {
                    /*
                    In this case we are at a regular paragraph.
                    */
                    let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                    /*
                    We will detect if the user has created new paragraphs while editing.
                    For that we will inspect the value of the text area looking for a char
                    code representing carriedge return.
                    */
                    let paragraphs = []
                    let paragraph = ''
                    let splittedSelectedParagraph = selectedParagraph.id.split('-')
                    let selectededitableParagraphIndex = Number(splittedSelectedParagraph[2])
                    let selectedParagraphStyle = splittedSelectedParagraph[3]
                    let style = selectedParagraphStyle.charAt(0).toUpperCase() + selectedParagraphStyle.slice(1);

                    for (let i = 0; i < textArea.value.length; i++) {
                        if (textArea.value.charCodeAt(i) === 10 && style !== 'Javascript' && style !== 'Json' && style !== 'Table') {
                            if (paragraph !== '') {
                                paragraphs.push(paragraph)
                            }
                            paragraph = ''
                        } else {
                            paragraph = paragraph + textArea.value[i]
                        }
                    }
                    paragraphs.push(paragraph)

                    if (paragraphs.length === 1) {
                        /* There is no need to add new paragraphs, we just update the one we have. */
                        if (paragraphs[0] !== '') {
                            UI.projects.superalgos.utilities.docs.setTextBasedOnLanguage(docSchemaParagraph, paragraphs[0])
                        } else {
                            /*
                            Deleting paragarphs is only possible in the default language.
                            */
                            if (UI.projects.superalgos.spaces.docsSpace.language === DEFAULT_LANGUAGE) {
                                docsSchemaDocument.paragraphs.splice(selectededitableParagraphIndex, 1)
                                if (docsSchemaDocument.paragraphs.length === 0) {
                                    let newParagraph = {
                                        style: 'Text',
                                        text: 'Please contribute to the docs by editing this content.'
                                    }
                                    docsSchemaDocument.paragraphs.push(newParagraph)
                                }
                            }
                        }
                    } else {
                        /*
                        Adding paragarphs is only possible in the default language.
                        */
                        if (UI.projects.superalgos.spaces.docsSpace.language === DEFAULT_LANGUAGE) {
                            /*
                            We will update the one paragraph we have and we will add the rest. 
                            */
                            UI.projects.superalgos.utilities.docs.setTextBasedOnLanguage(docSchemaParagraph, paragraphs[0])

                            for (let i = 1; i < paragraphs.length; i++) {
                                let newParagraph = {
                                    style: style,
                                    text: paragraphs[i]
                                }
                                docsSchemaDocument.paragraphs.splice(selectededitableParagraphIndex + i, 0, newParagraph)
                            }
                        }
                    }

                    break
                }
                case "Definition": {
                    /*
                    This means that the definition was being edited.
                    */
                    if (textArea.value !== '') {
                        UI.projects.superalgos.utilities.docs.setTextBasedOnLanguage(docsSchemaDocument.definition, textArea.value)
                    }
                    break
                }
            }
            EDITOR_ON_FOCUS = false
            UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)
        }
    }

    function contextMenuForceOutClick() {
        const outClick = document.getElementById('docs-space-div')
        const menu = document.getElementById('menu')
        menu.classList.remove('show')
        outClick.style.display = "none"
    }

    function contextMenuGetSelection() {
        let selection = window.getSelection()

        /* 
        We need to locate the parent node that it is a Paragraph,
        otherwise we could end up in an inner html element.
        */
        let paragraphNode = selection.baseNode

        if (paragraphNode.id !== undefined && paragraphNode.parentNode.className === "docs-tooltip") {
            return false
        }


        for (let i = 1; i < 10; i++) {
            if (paragraphNode === undefined || paragraphNode === null) { return false }
            if (paragraphNode.id === undefined || paragraphNode.id.indexOf('editable-paragraph') < 0) {
                paragraphNode = paragraphNode.parentNode
                if (paragraphNode === undefined) { return false }
            }
        }
        if (paragraphNode === undefined || paragraphNode === null || paragraphNode.id === undefined || paragraphNode.id.indexOf('editable-paragraph') < 0) {
            return false
        }
        /*
        Get the dimenssions of the current paragraph to help us to define the dimenssions of the text area.
        */
        selectedParagraph = paragraphNode
        selectedParagraphHeight = paragraphNode.getClientRects()[0].height
        if (selectedParagraphHeight < 30) { selectedParagraphHeight = 30 }
        /*
        We need to clean the Tool Tips text that might be at the paragraph selected.
        To not destroy the DOM structure we will use a clone.
        */
        paragraphNode = paragraphNode.cloneNode(true)
        scanNodeChildren(paragraphNode)
        function scanNodeChildren(node) {
            if (node.childNodes === undefined) { return }
            for (let i = 0; i < node.childNodes.length; i++) {
                let childNode = node.childNodes[i]
                if (childNode.className === "docs-tooltip") {
                    childNode.innerText = childNode.childNodes[0].data
                } else {
                    scanNodeChildren(childNode)
                }
            }
        }

        /* Reset this */
        selectedParagraphIndex = undefined
        /*
        Depending on the Style of Paragraph we will need to remove
        some info from the innerText. 
        */
        if (paragraphNode.id.indexOf('definition-') >= 0) {
            if (paragraphNode.id.indexOf('-summary') >= 0) {
                selectedParagraphData = paragraphNode.innerText.trim().substring(9, paragraphNode.innerText.length)
            } else {
                selectedParagraphData = paragraphNode.innerText.trim()
            }
            return true
        }
        /*
        Remeber the Selected Paragraph Index
        */
        let splittedId = paragraphNode.id.split('-')
        selectedParagraphIndex = splittedId[splittedId.length - 2]
        /*
        Check the style of the Paragraph
        */
        if (paragraphNode.id.indexOf('-text') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-title') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-subtitle') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-note') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(6, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-success') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(5, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-important') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(11, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-warning') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(10, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-error') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(8, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-list') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-table') >= 0) {
            selectedParagraphData = UI.projects.superalgos.utilities.docs.reverseParseTable(paragraphNode.innerHTML)
            return true
        }
        if (paragraphNode.id.indexOf('-hierarchy') >= 0) {
            selectedParagraphData = UI.projects.superalgos.utilities.docs.reverseParseHierarchy(paragraphNode.innerHTML)
            return true
        }
        if (paragraphNode.id.indexOf('-gif') >= 0) {
            selectedParagraphData = UI.projects.superalgos.utilities.docs.reverseParseGIF(paragraphNode.innerHTML)
            return true
        }
        if (paragraphNode.id.indexOf('-png') >= 0) {
            selectedParagraphData = UI.projects.superalgos.utilities.docs.reverseParsePNG(paragraphNode.innerHTML)
            return true
        }
        if (paragraphNode.id.indexOf('-javascript') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(1, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-json') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(1, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-callout') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-summary') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim().substring(9, paragraphNode.innerText.length)
            return true
        }
        if (paragraphNode.id.indexOf('-anchor') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-section') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-block') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-include') >= 0) {
            selectedParagraphData = paragraphNode.innerText.trim()
            return true
        }
        if (paragraphNode.id.indexOf('-link') >= 0) {
            selectedParagraphData = UI.projects.superalgos.utilities.docs.reverseParseLink(paragraphNode.innerHTML)
            return true
        }
        if (paragraphNode.id.indexOf('-youtube') >= 0) {
            selectedParagraphData = UI.projects.superalgos.utilities.docs.reverseParseYoutube(paragraphNode.innerHTML)
            return true
        }
    }

    function onOpening() {
        thisObject.isVisible = true
        if (objectBeingRendered === undefined) {
            thisObject.mainSearchPage.render()
            UI.projects.superalgos.spaces.docsSpace.mainSearchPage.detectEnterOnSearchBox()
            UI.projects.superalgos.spaces.docsSpace.mainSearchPage.setFocusOnSearchBox()
        } else {
            navigateTo(objectBeingRendered.project, objectBeingRendered.category, objectBeingRendered.type)
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
        objectBeingRendered = undefined
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

        objectBeingRendered = {
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
        paragraphMap = new Map()

        /* Replace the current object with this */
        objectBeingRendered = {
            project: project,
            category: category,
            type: type.replace('AMPERSAND', '\''),
            anchor: anchor,
            nodeId: nodeId
        }

        UI.projects.superalgos.spaces.docsSpace.documentPage.render(objectBeingRendered, paragraphMap)

        /*
        Here we will check if we need to position the page at a particular anchor or at the top.
        */
        if (objectBeingRendered.anchor !== undefined) {
            scrollToElement('docs-anchor-' + objectBeingRendered.anchor.toLowerCase().replaceAll(' ', '-'))
            objectBeingRendered.anchor = undefined
        } else {
            scrollToElement('docs-space-div')
        }
    }

    function resize() {
        thisObject.container.frame.width = DOCS_SPACE_WIDTH
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

            if (thisObject.searchEngine.docsIndex && thisObject.searchEngine.docsIndex.length === 0) {
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
