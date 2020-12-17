function newSuperalgosDocSpace() {
    const MODULE_NAME = 'Doc Space'
    let thisObject = {
        sidePanelTab: undefined,
        container: undefined,
        openSpaceAreaAndNavigateTo: openSpaceAreaAndNavigateTo,
        navigateTo: navigateTo,
        scrollToElement: scrollToElement,
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
    let openingEventSubscriptionId
    let closingEventSubscriptionId

    let textArea
    let selectedParagraph
    let selectedParagraphData = ''
    let selectedParagraphHeight = 0
    let objectBeingRendered
    let paragraphMap                    // Here we will store a map of paragraphs from the Docs Node, Concept or Topics Schema in order to find it when we need to update them.
    let nodeAppDefinition
    let nodeDocsDefinition
    let menuLabelsMap = new Map()
    let searchPhrase
    let docsIndex = []

    return thisObject

    function initialize() {
        thisObject.sidePanelTab = newSidePanelTab()
        thisObject.sidePanelTab.container.connectToParent(thisObject.container, false, false)
        thisObject.sidePanelTab.initialize('right')
        openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
        closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        setUpContextMenu()
        setUpMenuItemsMap()
        setUpSearchEngine()
        isInitialized = true

        function setUpContextMenu() {
            window.contextMenu = {
                editParagraph: editParagraph,
                toJavascript: toJavascript,
                toJson: toJson,
                toText: toText,
                toTitle: toTitle,
                toSubtitle: toSubtitle,
                toNote: toNote,
                toWarning: toWarning,
                toImportant: toImportant,
                toSuccess: toSuccess,
                toCallout: toCallout,
                toSummary: toSummary,
                toList: toList,
                toTable: toTable,
                toGif: toGif,
                toPng: toPng
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

            function toJavascript() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Javascript'
                contextMenuForceOutClick()
                renderPage()
            }

            function toJson() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Json'
                contextMenuForceOutClick()
                renderPage()
            }

            function toText() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Text'
                contextMenuForceOutClick()
                renderPage()
            }

            function toTitle() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Title'
                contextMenuForceOutClick()
                renderPage()
            }

            function toSubtitle() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Subtitle'
                contextMenuForceOutClick()
                renderPage()
            }

            function toNote() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Note'
                contextMenuForceOutClick()
                renderPage()
            }

            function toWarning() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Warning'
                contextMenuForceOutClick()
                renderPage()
            }

            function toImportant() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Important'
                contextMenuForceOutClick()
                renderPage()
            }

            function toSuccess() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Success'
                contextMenuForceOutClick()
                renderPage()
            }

            function toCallout() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Callout'
                contextMenuForceOutClick()
                renderPage()
            }

            function toSummary() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Summary'
                contextMenuForceOutClick()
                renderPage()
            }

            function toList() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'List'
                contextMenuForceOutClick()
                renderPage()
            }

            function toTable() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Table'
                contextMenuForceOutClick()
                renderPage()
            }

            function toGif() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Gif'
                contextMenuForceOutClick()
                renderPage()
            }

            function toPng() {
                let docSchemaParagraph = paragraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Png'
                contextMenuForceOutClick()
                renderPage()
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
                    let nodeDefinition = appSchemaArray[j]

                    if (nodeDefinition.menuItems === undefined) { continue }
                    for (let k = 0; k < nodeDefinition.menuItems.length; k++) {
                        let menuItem = nodeDefinition.menuItems[k]
                        menuLabelsMap.set(menuItem.label, true)
                    }
                }
            }
        }

        function setUpSearchEngine() {
            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]

                let documentIndex 

                /* Search in Nodes */
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.length; i++) {
                    documentIndex = {
                        phraseCount: {},                // here we have an object with properties matching it paragraph style, and each property is a map of phrases and their total count.
                        document: SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema[i],
                        documentType: 'Node'
                    }
                    indexDocument(documentIndex)
                    docsIndex.push(documentIndex)
                }
                /* Search in Concepts */
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.length; i++) {
                    documentIndex = {
                        phraseCount: {},                // here we have an object with properties matching it paragraph style, and each property is a map of phrases and their total count.
                        document: SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema[i],
                        documentType: 'Concept'
                    }
                    indexDocument(documentIndex)
                    docsIndex.push(documentIndex)
                }
                /* Search in Topics */
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.length; i++) {
                    documentIndex = {
                        phraseCount: {},                // here we have an object with properties matching it paragraph style, and each property is a map of phrases and their total count.
                        document: SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema[i],
                        documentType: 'Topics'
                    }
                    indexDocument(documentIndex)
                    docsIndex.push(documentIndex)
                }
            }

            function indexDocument(documentIndex) {

                if (documentIndex.document === undefined) {
                    return
                }

                if (documentIndex.document.definition !== undefined) {
                    let paragraph = {
                        style: 'Definition',
                        text: documentIndex.document.definition
                    }
                    indexParagraph(paragraph)
                }
                if (documentIndex.document.paragraphs !== undefined) {
                    for (let k = 0; k < documentIndex.document.paragraphs.length; k++) {
                        let paragraph = documentIndex.document.paragraphs[k]
                        indexParagraph(paragraph)
                    }
                }

                function indexParagraph(paragraph) {
                    if (paragraph.text === undefined) {
                        return
                    }
                    if (paragraph.style === undefined) {
                        return
                    }

                    let text = paragraph.text.toLowerCase()
                    let style = paragraph.style.toLowerCase()
                    let stylePhraseCount = documentIndex.phraseCount[style]

                    if (stylePhraseCount === undefined) {
                        stylePhraseCount = new Map()
                        documentIndex.phraseCount[style] = stylePhraseCount
                    }

                    text = text.replaceAll('.', ' ')
                    text = text.replaceAll(',', ' ')
                    text = text.replaceAll('-', ' ')
                    text = text.replaceAll('/', ' ')
                    text = text.replaceAll('_', ' ')
                    text = text.replaceAll(':', ' ')
                    text = text.replaceAll(';', ' ')
                    text = text.replaceAll('(', ' ')
                    text = text.replaceAll(')', ' ')
                    text = text.replaceAll('{', ' ')
                    text = text.replaceAll('}', ' ')
                    text = text.replaceAll('[', ' ')
                    text = text.replaceAll(']', ' ')
                    text = text.replaceAll('@', ' ')
                    text = text.replaceAll('    ', ' ')
                    text = text.replaceAll('   ', ' ')
                    text = text.replaceAll('  ', ' ')

                    let splittedText = text.split(' ')

                    for (n = 0; n < splittedText.length; n++) {
                        let phrase = ''
                        for (let m = 0; m < 10; m++) {
                            let word = splittedText[n + m]
                            if (word !== undefined) {
                                if (m === 0) {
                                    phrase = phrase + word
                                } else {
                                    phrase = phrase + ' ' + word
                                }
                                let thisPhraseCount = stylePhraseCount.get(phrase)
                                if (thisPhraseCount === undefined) { thisPhraseCount = 0 }
                                thisPhraseCount++
                                stylePhraseCount.set(phrase, thisPhraseCount)
                            }
                        }
                    }
                }
            }
        }
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)

        objectBeingRendered = undefined
        paragraphMap = undefined
        nodeAppDefinition = undefined
        nodeDocsDefinition = undefined
        menuLabelsMap = undefined
        docsIndex = undefined
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
                    let selectedParagraphIndex = Number(splittedSelectedParagraph[2])
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
                            docSchemaParagraph.text = paragraphs[0]
                        } else {
                            nodeDocsDefinition.paragraphs.splice(selectedParagraphIndex, 1)
                            if (nodeDocsDefinition.paragraphs.length === 0) {
                                let newParagraph = {
                                    style: 'Text',
                                    text: 'Please contribute to the docs by editing this content.'
                                }
                                nodeDocsDefinition.paragraphs.push(newParagraph)
                            }
                        }
                    } else {
                        /*
                        We will update the one paragraph we have and we will add the rest. 
                        */
                        docSchemaParagraph.text = paragraphs[0]

                        for (let i = 1; i < paragraphs.length; i++) {
                            let newParagraph = {
                                style: style,
                                text: paragraphs[i]
                            }
                            nodeDocsDefinition.paragraphs.splice(selectedParagraphIndex + i, 0, newParagraph)
                        }
                    }

                    break
                }
                case "Definition": {
                    /*
                    This means that the definition was being edited.
                    */
                    if (textArea.value !== '') {
                        nodeDocsDefinition.definition = textArea.value
                    }
                    break
                }
            }
            EDITOR_ON_FOCUS = false
            renderPage()
        }
    }

    function contextMenuActivateRightClick() {
        const contextMenuClickablDiv = document.getElementById('docs-context-menu-clickeable-div')
        const menu = document.getElementById('menu')
        const outClick = document.getElementById('docs-space-div')

        contextMenuClickablDiv.addEventListener('contextmenu', e => {
            e.preventDefault()
            if (EDITOR_ON_FOCUS === true) {
                exitEditMode()
                return
            }
            if (contextMenuGetSelection() === false) {
                /*
                The click was in a place where we can not recognize an editable piece.
                We will not open the menu in this circunstances.
                */
                return
            }

            menu.style.top = `${e.clientY}px`
            menu.style.left = `${e.clientX}px`
            menu.classList.add('show')

            outClick.style.display = "block"
        })

        outClick.addEventListener('click', () => {
            contextMenuForceOutClick()
        })
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
            if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
                paragraphNode = paragraphNode.parentNode
                if (paragraphNode === undefined) { return false }
            }
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            return false
        }

        /*
        We woont continue unless the paragraph the mouse is pointnig at was
        tagged as an editable paragraph.
        */
        if (paragraphNode.id.indexOf('editable-paragraph') < 0) {
            return false
        }
        /*
        Depending on the Style of Paragraph we will need to remove
        some info from the innerText. 
        */
        if (paragraphNode.id.indexOf('-definition') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('-text') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('-title') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('-subtitle') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('-note') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(6, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('-success') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(5, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('-important') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(11, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('-warning') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(10, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('-list') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('-table') >= 0) {
            selectedParagraphData = reverseParseTable(paragraphNode.innerHTML)
        }
        if (paragraphNode.id.indexOf('-gif') >= 0) {
            selectedParagraphData = reverseParseGIF(paragraphNode.innerHTML)
        }
        if (paragraphNode.id.indexOf('-png') >= 0) {
            selectedParagraphData = reverseParsePNG(paragraphNode.innerHTML)
        }
        if (paragraphNode.id.indexOf('-javascript') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(1, paragraphNode.innerText.length - 1)
        }
        if (paragraphNode.id.indexOf('-json') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(1, paragraphNode.innerText.length - 1)
        }
        if (paragraphNode.id.indexOf('-callout') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('-summary') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(9, paragraphNode.innerText.length)
        }

        selectedParagraph = paragraphNode
        selectedParagraphHeight = paragraphNode.getClientRects()[0].height
        if (selectedParagraphHeight < 30) { selectedParagraphHeight = 30 }
        return true
    }

    function onOpening() {
        if (objectBeingRendered === undefined) {
            renderSearchPage()
        }
    }

    function onClosing() {
        objectBeingRendered = undefined
    }

    function renderSearchPage() {
        let HTML = ''
        HTML = HTML + '<div id="docs-search-page-div">'
        HTML = HTML + '<center><img src="Images/superalgos-logo.png" class="docs-image-logo-search" width=400></center>'
        HTML = HTML + '<center><div class="docs-font-normal docs-search-box"><input class="docs-search-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input></div></center>'
        HTML = HTML + '</div>'
        let docsSpaceDiv = document.getElementById('docs-space-div')
        docsSpaceDiv.innerHTML = HTML + addFooter()
        detectEnterOnSearchBox()
    }

    function renderSearchResultsPage() {
        let HTML = ''

        // Logo & Search Box

        HTML = HTML + '<section id="docs-search-results-div" class="docs-node-html-page-container">'
        HTML = HTML + '<div class="docs-search-results-header">'
        HTML = HTML + '<div class="docs-image-logo-search-results"><img src="Images/superalgos-logo.png" width=200></div>'
        HTML = HTML + '<div class="docs-search-results-box">'
        HTML = HTML + '<input class="docs-search-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        // Tabs

        HTML = HTML + '<div class="docs-search-results-header-tabs-container">'
        HTML = HTML + '<input id="tab1" type="radio" name="tabs" checked=""><label for="tab1">All</label>'
        HTML = HTML + '<input id="tab2" type="radio" name="tabs"><label for="tab2">Nodes</label>'
        HTML = HTML + '<input id="tab3" type="radio" name="tabs"><label for="tab3">Concepts</label>'
        HTML = HTML + '<input id="tab4" type="radio" name="tabs"><label for="tab4">Topics</label>'
        HTML = HTML + '<input id="tab5" type="radio" name="tabs"><label for="tab5">Projects</label>'
        HTML = HTML + '<input id="tab6" type="radio" name="tabs"><label for="tab6">Code</label>'
        HTML = HTML + '<input id="tab7" type="radio" name="tabs"><label for="tab7">Configs</label>'

        // Results

        HTML = HTML + '<div class="docs-search-result-content">'

        // All Tab

        HTML = HTML + '<div id="content1">'

        HTML = HTML + '<div class="docs-search-result-content-record-container">'
        HTML = HTML + '<p class="docs-search-result-content-record-project-category">Superalgos > Node</p>'
        HTML = HTML + '<p><a class="docs-search-result-content-record-title" href="data-storage.html">Data Storage</a></p>'
        HTML = HTML + '<p class="docs-search-result-content-record-extract">The data storage node holds the definitions as to what data is stored in the corresponding network node.</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-search-result-content-record-container">'
        HTML = HTML + '<p class="docs-search-result-content-record-project-category">Superalgos > Node</p>'
        HTML = HTML + '<p><a class="docs-search-result-content-record-title" href="data-mines-data.html">Data Mines Data</a></p>'
        HTML = HTML + '<p class="docs-search-result-content-record-extract">Session independent data refers to data generated by sensors and indicators, not related to trading sessions.</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-search-result-content-record-container">'
        HTML = HTML + '<p class="docs-search-result-content-record-project-category">Superalgos > Node</p>'
        HTML = HTML + '<p><a class="docs-search-result-content-record-title" href="trading-mines-data.html">Trading Mines Data</a></p>'
        HTML = HTML + '<p class="docs-search-result-content-record-extract">Session-based data refers to data that is generated as a consequence of running a trading session, that is, data the trading bot instance generates while running backtesting, paper trading, forward testing, or live trading sessions.</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-search-result-content-record-container">'
        HTML = HTML + '<p class="docs-search-result-content-record-project-category">Ethereum > Topic</p>'
        HTML = HTML + '<p><a class="docs-search-result-content-record-title" href="blockchain-data-mining.html">Blockchain Data Mining</a></p>'
        HTML = HTML + '<p class="docs-search-result-content-record-extract">Mining data from the Ethereum blockchain requires running an Ethereum node. Superalgos interfaces with the Ethereum blockchaing via...</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'

        // Nodes Tab

        HTML = HTML + '<div id="content2">'

        HTML = HTML + '<div class="docs-search-result-content-record-container">'
        HTML = HTML + '<p class="docs-search-result-content-record-project-category">Superalgos > Node</p>'
        HTML = HTML + '<p><a class="docs-search-result-content-record-title" href="data-storage.html">Data Storage</a></p>'
        HTML = HTML + '<p class="docs-search-result-content-record-extract">The data storage node holds the definitions as to what data is stored in the corresponding network node.</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-search-result-content-record-container">'
        HTML = HTML + '<p class="docs-search-result-content-record-project-category">Superalgos > Node</p>'
        HTML = HTML + '<p><a class="docs-search-result-content-record-title" href="data-mines-data.html">Data Mines Data</a></p>'
        HTML = HTML + '<p class="docs-search-result-content-record-extract">Session independent data refers to data generated by sensors and indicators, not related to trading sessions.</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '<div class="docs-search-result-content-record-container">'
        HTML = HTML + '<p class="docs-search-result-content-record-project-category">Superalgos > Node</p>'
        HTML = HTML + '<p><a class="docs-search-result-content-record-title" href="trading-mines-data.html">Trading Mines Data</a></p>'
        HTML = HTML + '<p class="docs-search-result-content-record-extract">Session-based data refers to data that is generated as a consequence of running a trading session, that is, data the trading bot instance generates while running backtesting, paper trading, forward testing, or live trading sessions.</p>'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'

        // End Content

        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        // End Section

        HTML = HTML + '</section>'

        let docsSpaceDiv = document.getElementById('docs-space-div')
        docsSpaceDiv.innerHTML = HTML + addFooter()
        detectEnterOnSearchBox()
    }

    function detectEnterOnSearchBox() {
        const element = document.getElementsByClassName("docs-search-input")[0]
        element.addEventListener("keyup", function (event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                let searchPhrase = element.value
                renderSearchResultsPage()
            }
        });
    }

    function scrollToElement(htmlElementId) {
        let myElement = document.getElementById(htmlElementId)
        let topPos = myElement.offsetTop
        let scrollingDiv = document.getElementById('docs-space-div')
        scrollingDiv.scrollTop = topPos
    }

    function enableCollapsibleContent() {
        let collapsibleElementsArray = document.getElementsByClassName("docs-collapsible-element")

        for (let i = 0; i < collapsibleElementsArray.length; i++) {
            collapsibleElementsArray[i].addEventListener("click", function () {
                this.classList.toggle("docs-collapsible-active")
                let content = this.nextElementSibling
                if (content.style.display === "block") {
                    content.style.display = "none";
                } else {
                    content.style.display = "block";
                }
            })
        }
    }

    function disableCollapsibleContent() {
        let collapsibleElementsArray = document.getElementsByClassName("docs-collapsible-element")

        for (let i = 0; i < collapsibleElementsArray.length; i++) {
            collapsibleElementsArray[i].removeEventListener("click", function () { })
        }
    }

    function openSpaceAreaAndNavigateTo(category, type, project) {
        navigateTo(category, type, project)
        thisObject.sidePanelTab.open()
    }

    function navigateTo(category, type, project) {

        paragraphMap = new Map()
        objectBeingRendered = {
            category: category,
            type: type,
            project: project
        }

        renderPage()
        scrollToElement('docs-context-menu-clickeable-div')

    }

    function renderPage() {

        disableCollapsibleContent()

        nodeAppDefinition = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.appSchema.get(objectBeingRendered.type)
        nodeDocsDefinition = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docsNodeSchema.get(objectBeingRendered.type)

        if (nodeDocsDefinition === undefined) {
            // Use the New Node Template
            let template = {
                type: objectBeingRendered.type,
                definition: "Please contribute the definition of this node.",
                paragraphs: [
                    {
                        style: "Text",
                        text: "Be the first one to explain how this node works by editing this paragraph. Left click and Edit to enter edit mode and change this text."
                    }
                ]
            }
            SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).array.docsNodeSchema.push(template)
            SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docsNodeSchema.set(objectBeingRendered.type, template)
            nodeDocsDefinition = template
        }
        buildHtmlPage()
        contextMenuActivateRightClick()
        enableCollapsibleContent()


        function buildHtmlPage() {
            let HTML = ''

            HTML = HTML + '<div id="docs-context-menu-clickeable-div" class="docs-node-html-page-container">' // Clickeable Container Starts

            /* Title */
            HTML = HTML + '<div id="docs-main-title-div"><table class="docs-title-table"><tr><td width="50px"><div id="projectImageDiv" class="docs-image-container"/></td><td><h2 class="docs-h2" id="' + objectBeingRendered.type.toLowerCase().replace(' ', '-') + '" > ' + objectBeingRendered.project + ' / ' + objectBeingRendered.type + '</h2></td></tr></table></div>'

            /* We start with the Definition Table */
            if (nodeDocsDefinition.definition !== undefined) {
                HTML = HTML + '<table class="docs-definition-table">'
                HTML = HTML + '<tr>'
                HTML = HTML + '<td width=150px>'
                HTML = HTML + '<div id="definitionImageDiv" class="docs-image-container"/>'
                HTML = HTML + '</td>'
                HTML = HTML + '<td>'
                HTML = HTML + '<div id="definition-paragraph" class="docs-font-normal"><strong>' + addToolTips(nodeDocsDefinition.definition) + '</strong></div>'
                HTML = HTML + '</td>'
                HTML = HTML + '</tr>'
                HTML = HTML + '</table>'
            }

            HTML = HTML + '<div id="docs-content">'

            let paragraphIndex = 0
            if (nodeDocsDefinition.paragraphs !== undefined) {
                for (let i = 0; i < nodeDocsDefinition.paragraphs.length; i++) {
                    let key = 'editable-paragraph-' + paragraphIndex
                    let paragraph = nodeDocsDefinition.paragraphs[i]
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                }
            }

            autoGeneratedHtml()
            HTML = HTML + '</div>' // Content Ends
            HTML = HTML + '</div>' // Clickeable Container Ends

            /*
            Here we inject the HTML we built into the DOM at the Docs Space Div.
            */
            let docsSpaceDiv = document.getElementById('docs-space-div')
            docsSpaceDiv.innerHTML = HTML + addFooter()

            hightlightEmbeddedCode()

            /*
            After generating the html, we will add the images at all the points we know
            there are images to be added.
            */
            addImages()

            function addImages() {
                addProjectImage()
                if (nodeDocsDefinition.definition !== undefined) {
                    addDefinitionImage(objectBeingRendered.project)
                }
                addMenuItemsImages()
                addChildrenNodesPropertiesImages()
                addAttachingAndReferencingRulesImages()

                function addDefinitionImage(project) {
                    let imageElement
                    if (nodeAppDefinition.icon === undefined) {
                        let imageName = nodeAppDefinition.type.toLowerCase().replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-')
                        imageElement = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName(objectBeingRendered.project, imageName)
                    } else {
                        imageElement = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(objectBeingRendered.project, objectBeingRendered.type)
                    }

                    imageElement.width = "150"
                    imageElement.height = "150"

                    let definitionImageDiv = document.getElementById('definitionImageDiv')
                    definitionImageDiv.appendChild(imageElement)
                }

                function addProjectImage() {
                    let imageName = project.toLowerCase().replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-').replace(' ', '-')
                    let imageElement = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName(objectBeingRendered.project, imageName)
                    imageElement.width = "50"
                    imageElement.height = "50"

                    let projectImageDiv = document.getElementById('projectImageDiv')
                    projectImageDiv.appendChild(imageElement)
                }

                function addMenuItemsImages() {
                    if (nodeAppDefinition === undefined || nodeAppDefinition.menuItems === undefined) { return }
                    for (let i = 0; i < nodeAppDefinition.menuItems.length; i++) {
                        let menuItem = nodeAppDefinition.menuItems[i]
                        let collectionImage = getIcon()
                        let imageElement = collectionImage.cloneNode()

                        imageElement.className = "docs-collapsible-image"

                        let parentElement = document.getElementById('docs-menu-item-' + i + '')
                        let dummyImage = parentElement.childNodes[0]
                        parentElement.replaceChild(imageElement, dummyImage)

                        function getIcon() {
                            if (menuItem.relatedUiObject !== undefined) {
                                return UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(objectBeingRendered.project, menuItem.relatedUiObject)
                            } else {
                                if (menuItem.iconPathOn !== undefined) {
                                    return UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName(objectBeingRendered.project, menuItem.iconPathOn)
                                } else {
                                    return UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName('Superalgos', 'bitcoin')
                                }
                            }
                        }
                    }
                }

                function addChildrenNodesPropertiesImages() {
                    if (nodeAppDefinition === undefined || nodeAppDefinition.childrenNodesProperties === undefined) { return }
                    for (let i = 0; i < nodeAppDefinition.childrenNodesProperties.length; i++) {
                        let childrenNodesProperty = nodeAppDefinition.childrenNodesProperties[i]
                        let collectionImage = getIcon()
                        let imageElement = collectionImage.cloneNode()

                        imageElement.className = "docs-collapsible-image"

                        let parentElement = document.getElementById('docs-children-nodes-property-' + i + '')
                        let dummyImage = parentElement.childNodes[0]
                        parentElement.replaceChild(imageElement, dummyImage)

                        function getIcon() {
                            if (childrenNodesProperty.project !== undefined) {
                                return UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(childrenNodesProperty.project, childrenNodesProperty.childType)
                            } else {
                                return UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(objectBeingRendered.project, childrenNodesProperty.childType)
                            }
                        }
                    }
                }

                function addAttachingAndReferencingRulesImages() {
                    if (nodeAppDefinition === undefined) { return }

                    if (nodeAppDefinition.attachingRules !== undefined) {
                        if (nodeAppDefinition.attachingRules.compatibleTypes !== undefined) {
                            let splittedTypes = nodeAppDefinition.attachingRules.compatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'attaching-rules-compatible-types')
                        }
                        if (nodeAppDefinition.attachingRules.incompatibleTypes !== undefined) {
                            let splittedTypes = nodeAppDefinition.attachingRules.incompatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'attaching-rules-incompatible-types')
                        }
                    }
                    if (nodeAppDefinition.referencingRules !== undefined) {
                        if (nodeAppDefinition.referencingRules.compatibleTypes !== undefined) {
                            let splittedTypes = nodeAppDefinition.referencingRules.compatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'referencing-rules-compatible-types')
                        }
                        if (nodeAppDefinition.referencingRules.incompatibleTypes !== undefined) {
                            let splittedTypes = nodeAppDefinition.referencingRules.incompatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'referencing-rules-incompatible-types')
                        }
                    }

                    function imageForTheseNodes(nodeList, additionToKey) {
                        for (let i = 0; i < nodeList.length; i++) {
                            let listItem = nodeList[i]
                            if (listItem === "") { continue }

                            let collectionImage = getIcon()
                            if (collectionImage === undefined) { continue }
                            let imageElement = collectionImage.cloneNode()

                            imageElement.className = "docs-collapsible-image"

                            let parentElement = document.getElementById('docs-' + additionToKey + '-' + i + '')
                            let dummyImage = parentElement.childNodes[0]
                            parentElement.replaceChild(imageElement, dummyImage)

                            function getIcon() {
                                let splittedListItem = listItem.split('|')
                                if (splittedListItem.length === 1) {
                                    return UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(objectBeingRendered.project, listItem)
                                } else {
                                    let project = splittedListItem[0]
                                    let nodeType = splittedListItem[1]
                                    return UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(project, nodeType)
                                }
                            }
                        }
                    }
                }
            }

            function autoGeneratedHtml() {
                generateMenuItems()
                generateChildrenNodesProperties()
                generateAttachingRules()
                generateReferencingRules()
                generateConfiguration()
                generateCode()
                generateFormula()

                function generateMenuItems() {
                    /* 
                    Menu Items
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + paragraphIndex
                    if (nodeAppDefinition === undefined || nodeAppDefinition.menuItems === undefined) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + nodeAppDefinition.type + " Menu"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "Each type of node, might have a menu defines so that users can interact with the node. There is no fixed set of menu items. Instead each menu item is defined at each node's definition. Each menu item defined carries a set of properties that allow the system to execute some action when the menu item is clicked by users. The " + nodeAppDefinition.type + " node has the following menu items:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    for (let i = 0; i < nodeAppDefinition.menuItems.length; i++) {
                        let menuItem = nodeAppDefinition.menuItems[i]

                        HTML = HTML + '<button id="docs-menu-item-' + i + '" type="button" class="docs-collapsible-element"><img>' + menuItem.label + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-content">'

                        paragraph = {
                            style: "Text",
                            text: 'The ' + menuItem.label + ' menu item has the following properties:'
                        }
                        renderParagraph(paragraph, key)
                        paragraphIndex++

                        for (const property in menuItem) {
                            paragraph = {
                                style: "List",
                                text: property + ": " + menuItem[property]
                            }
                            renderParagraph(paragraph, key)
                            paragraphIndex++
                        }

                        HTML = HTML + '</div>'
                    }
                    paragraph = {
                        style: "Success",
                        text: "When any of the menu items is grayed out, it means that " + nodeAppDefinition.type + " already has the type of children that that menu item can add, and that only one children is possible in that case. "
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                }

                function generateChildrenNodesProperties() {
                    /* 
                    Children Nodes Properties
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + paragraphIndex

                    if (nodeAppDefinition === undefined || nodeAppDefinition.childrenNodesProperties === undefined) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + nodeAppDefinition.type + " Children"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "Each type of node might have children. If they do, a reference to the children will be present at runtime at one or more properties of the node object. There is no generic childrenNodes property with an array of children nodes. Instead what we can find is that each node definition defines which properties will hold those children references. The property names that will be used for that are the ones listed here. The " + nodeAppDefinition.type + " node has the following children nodes properties:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    for (let i = 0; i < nodeAppDefinition.childrenNodesProperties.length; i++) {
                        let childrenNodesProperty = nodeAppDefinition.childrenNodesProperties[i]

                        let name = UI.projects.superalgos.utilities.strings.fromCamelCaseToUpperWithSpaces(childrenNodesProperty.name)

                        HTML = HTML + '<button id="docs-children-nodes-property-' + i + '" type="button" class="docs-collapsible-element"><img>' + addToolTips(name) + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-content">'

                        paragraph = {
                            style: "Text",
                            text: 'The ' + name + ' children node property has in turn the following properties:'
                        }
                        renderParagraph(paragraph, key)
                        paragraphIndex++

                        for (const property in childrenNodesProperty) {
                            paragraph = {
                                style: "List",
                                text: property + ": " + childrenNodesProperty[property]
                            }
                            renderParagraph(paragraph, key)
                            paragraphIndex++
                        }

                        HTML = HTML + '</div>'
                    }
                }

                function generateAttachingRules() {
                    /* 
                    Attaching Rules
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + paragraphIndex
                    if (nodeAppDefinition === undefined || (nodeAppDefinition.attachingRules === undefined && nodeAppDefinition.referencingRules === undefined)) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + nodeAppDefinition.type + " Attaching Rules"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "Each type of node, might have a set of rules that defines to which nodes it can be attached to. Usually the nodes it can attach to have listed at their own definitions " + nodeAppDefinition.type + " as one of its potential children. That does not mean that " + nodeAppDefinition.type + " can be created at those parents; only if there is a menu item for adding it, then it will be possible, otherwise it might be created at some other node and later attached to one of the nodes defined in these rules. At runtime, the node that a node is attached to, we call it Parent Node. The following are the rules that govern the attacment of  " + nodeAppDefinition.type + " with other nodes:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    if (nodeAppDefinition.attachingRules !== undefined) {
                        if (nodeAppDefinition.attachingRules.compatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Compatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            paragraphIndex++

                            let splittedTypes = nodeAppDefinition.attachingRules.compatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'attaching-rules-compatible-types')
                        }
                        if (nodeAppDefinition.attachingRules.incompatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Incompatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            paragraphIndex++

                            let splittedTypes = nodeAppDefinition.attachingRules.incompatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'attaching-rules-incompatible-types')
                        }
                    }

                    function listAllTheseNodes(nodeList, additionToKey) {
                        for (let i = 0; i < nodeList.length; i++) {
                            let listItem = nodeList[i]
                            if (listItem === "") { continue }
                            HTML = HTML + '<button id="docs-' + additionToKey + '-' + i + '" type="button" class="docs-non-collapsible-element"><img>' + addToolTips(listItem) + '</button>'
                        }
                    }
                }

                function generateReferencingRules() {
                    /* 
                    Referencing Rules
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + paragraphIndex
                    if (nodeAppDefinition === undefined || (nodeAppDefinition.referencingRules === undefined && nodeAppDefinition.referencingRules === undefined)) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + nodeAppDefinition.type + " Referencing Rules"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "Each type of node, might have a set of rules that defines to which node it can stablish a reference to. At runtime once a reference is stablished, we call the referenced node the Reference Parent. The following are the rules that govern the referencing of  " + nodeAppDefinition.type + " with other nodes:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    if (nodeAppDefinition.referencingRules !== undefined) {
                        if (nodeAppDefinition.referencingRules.compatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Compatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            paragraphIndex++

                            let splittedTypes = nodeAppDefinition.referencingRules.compatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'referencing-rules-compatible-types')
                        }
                        if (nodeAppDefinition.referencingRules.incompatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Incompatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            paragraphIndex++

                            let splittedTypes = nodeAppDefinition.referencingRules.incompatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'referencing-rules-incompatible-types')
                        }
                    }

                    function listAllTheseNodes(nodeList, additionToKey) {
                        for (let i = 0; i < nodeList.length; i++) {
                            let listItem = nodeList[i]
                            if (listItem === "") { continue }
                            HTML = HTML + '<button id="docs-' + additionToKey + '-' + i + '" type="button" class="docs-non-collapsible-element"><img>' + addToolTips(listItem) + '</button>'
                        }
                    }
                }

                function generateConfiguration() {
                    /* 
                    Configuration
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + paragraphIndex
                    if (nodeAppDefinition === undefined || nodeAppDefinition.editors === undefined || nodeAppDefinition.editors.config !== true) { return }
                    paragraph = {
                        style: "Title",
                        text: "" + nodeAppDefinition.type + " Configuration"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "Each type of node, might have a configuration. The configuration can be accesed by users and changed at anytime. Whatever is at the configuration of a node is used by the processes in which the node is involved."
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Values:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    if (nodeAppDefinition.initialValues === undefined || nodeAppDefinition.initialValues.config === undefined) { return }

                    paragraph = {
                        style: "Text",
                        text: "Each type of node, might have a definition with the initial values for it's configuration. The Initial Values are set one the node is first created. The Initial Values for " + nodeAppDefinition.type + " are:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    let initialValues = JSON.parse(nodeAppDefinition.initialValues.config)
                    paragraph = {
                        style: "Json",
                        text: JSON.stringify(initialValues, undefined, 4)
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    paragraph = {
                        style: "Subtitle",
                        text: "Examples:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This is a list of properties used at the " + nodeAppDefinition.type + " configuration. Expanding a property shows you sample values for that property."
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    /*
                    Here we will scan the whole workspace, first looking for nodes of the same type,
                    and after that, analysing their configuration in order to extract all the properties
                    they are using and sample values for each one.
                    */
                    /* First Step: get an array of all the nodes in the workspace of this type */
                    let rootNodes = UI.projects.superalgos.spaces.designSpace.workspace.workspaceNode.rootNodes
                    let allNodesFound = []
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode !== null) {
                            let nodeArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(rootNode, nodeAppDefinition.type)
                            allNodesFound = allNodesFound.concat(nodeArray)
                        }
                    }
                    /* Second Step: create a map with all the properties used in configurations of this node type */
                    let propertyMap = new Map()
                    for (let i = 0; i < allNodesFound.length; i++) {
                        let node = allNodesFound[i]
                        let config = JSON.parse(node.config)
                        for (const property in config) {
                            let value = JSON.stringify(config[property], undefined, 4)
                            let valueArray = propertyMap.get(property)
                            if (valueArray === undefined) {
                                propertyMap.set(property, [value])
                            } else {
                                if (valueArray.includes(value) === false) {
                                    if (valueArray.length <= 10) {
                                        valueArray.push(value)
                                    }
                                }
                            }
                        }
                    }
                    /* Third Step: we will display the list of properties and the sample values */
                    propertyMap.forEach(displayProperty)
                    function displayProperty(valueArray, mapKey, map) {

                        let name = UI.projects.superalgos.utilities.strings.fromCamelCaseToUpperWithSpaces(mapKey)

                        HTML = HTML + '<button id="docs-config-property-' + mapKey.toLowerCase() + '" type="button" class="docs-collapsible-element">' + name + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-content">'

                        for (let i = 0; i < valueArray.length; i++) {
                            let value = valueArray[i]

                            paragraph = {
                                style: "Json",
                                text: value
                            }
                            renderParagraph(paragraph, key)
                            paragraphIndex++
                        }

                        HTML = HTML + '</div>'
                    }
                }

                function generateCode() {
                    /* 
                    Code
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + paragraphIndex
                    if (nodeAppDefinition === undefined || nodeAppDefinition.editors === undefined || nodeAppDefinition.editors.code !== true) { return }
                    paragraph = {
                        style: "Title",
                        text: "" + nodeAppDefinition.type + " Code"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "Some types of node, might have code that defines it's behaviour. The code can usually be accesed by users via the Edit menu item. "
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    if (nodeAppDefinition.initialValues === undefined || nodeAppDefinition.initialValues.code === undefined) { return }

                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Value:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "When first created, the code of a node is initialized with the initial value present at the node's definition. The Initial Value for " + nodeAppDefinition.type + " is:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    paragraph = {
                        style: "Javascript",
                        text: JSON.stringify(nodeAppDefinition.initialValues.code, undefined, 4)
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    paragraph = {
                        style: "Subtitle",
                        text: "Examples:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This is a list of examples used at the " + nodeAppDefinition.type + " code collected from this workspace."
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    /*
                    Here we will scan the whole workspace, first looking for nodes of the same type,
                    and after that, analysing their code in order to extract examples to show.
                    */
                    /* First Step: get an array of all the nodes in the workspace of this type */
                    let rootNodes = UI.projects.superalgos.spaces.designSpace.workspace.workspaceNode.rootNodes
                    let allNodesFound = []
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode !== null) {
                            let nodeArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(rootNode, nodeAppDefinition.type)
                            allNodesFound = allNodesFound.concat(nodeArray)
                        }
                    }
                    /* 
                    Second Step: create a map with all the code examples used at this node type,
                    without repeating them.
                    */
                    let codeMap = new Map()
                    for (let i = 0; i < allNodesFound.length; i++) {
                        let node = allNodesFound[i]
                        codeMap.set(node.code, node.code)
                    }
                    /* Third Step: we will display the list of properties and the sample values */
                    let exampleCounter = 1
                    codeMap.forEach(displayProperty)
                    function displayProperty(code, mapKey, map) {
                        if (exampleCounter > 10) { return }
                        HTML = HTML + '<button id="docs-code-example-' + exampleCounter + '" type="button" class="docs-collapsible-element">' + 'Example #' + exampleCounter + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-code-content">'
                        exampleCounter++
                        paragraph = {
                            style: "Javascript",
                            text: code
                        }
                        renderParagraph(paragraph, key)
                        paragraphIndex++

                        HTML = HTML + '</div>'
                    }
                }

                function generateFormula() {
                    /* 
                    Formula
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + paragraphIndex
                    if (nodeAppDefinition === undefined || nodeAppDefinition.editors === undefined || nodeAppDefinition.editors.formula !== true) { return }
                    paragraph = {
                        style: "Title",
                        text: "" + nodeAppDefinition.type + " Formula"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "Some types of node represents Formulas and they hold code that defines that formula. The code can usually be accesed by users via the Edit menu item. "
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    if (nodeAppDefinition.initialValues === undefined || nodeAppDefinition.initialValues.code === undefined) { return }

                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Value:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "When first created, the code of a node is initialized with the initial value present at the node's definition. The Initial Value for " + nodeAppDefinition.type + " is:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    paragraph = {
                        style: "Javascript",
                        text: JSON.stringify(nodeAppDefinition.initialValues.code, undefined, 4)
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++

                    paragraph = {
                        style: "Subtitle",
                        text: "Examples:"
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This is a list of examples used at the " + nodeAppDefinition.type + " code collected from this workspace."
                    }
                    renderParagraph(paragraph, key)
                    paragraphIndex++
                    /*
                    Here we will scan the whole workspace, first looking for nodes of the same type,
                    and after that, analysing their code in order to extract examples to show.
                    */
                    /* First Step: get an array of all the nodes in the workspace of this type */
                    let rootNodes = UI.projects.superalgos.spaces.designSpace.workspace.workspaceNode.rootNodes
                    let allNodesFound = []
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode !== null) {
                            let nodeArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(rootNode, nodeAppDefinition.type)
                            allNodesFound = allNodesFound.concat(nodeArray)
                        }
                    }
                    /* 
                    Second Step: create a map with all the code examples used at this node type,
                    without repeating them.
                    */
                    let codeMap = new Map()
                    for (let i = 0; i < allNodesFound.length; i++) {
                        let node = allNodesFound[i]
                        codeMap.set(node.code, node.code)
                    }
                    /* Third Step: we will display the list of properties and the sample values */
                    let exampleCounter = 1
                    codeMap.forEach(displayProperty)
                    function displayProperty(code, mapKey, map) {
                        if (exampleCounter > 10) { return }
                        HTML = HTML + '<button id="docs-code-example-' + exampleCounter + '" type="button" class="docs-collapsible-element">' + 'Example #' + exampleCounter + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-code-content">'
                        exampleCounter++
                        paragraph = {
                            style: "Javascript",
                            text: code
                        }
                        renderParagraph(paragraph, key)
                        paragraphIndex++

                        HTML = HTML + '</div>'
                    }
                }
            }

            function renderParagraph(paragraph, key) {
                let innerHTML
                let styleClass = ''
                let prefix = ''
                let sufix = ''
                let role = ''

                switch (paragraph.style) {
                    case 'Text': {
                        styleClass = ''
                        prefix = ''
                        role = ''
                        key = key + '-text'
                        innerHTML = addBold(paragraph.text)
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Title': {
                        styleClass = 'class="docs-h3"'
                        prefix = ''
                        role = ''
                        key = key + '-title'
                        innerHTML = paragraph.text
                        break
                    }
                    case 'Subtitle': {
                        styleClass = 'class="docs-h4"'
                        prefix = ''
                        role = ''
                        key = key + '-subtitle'
                        innerHTML = paragraph.text
                        break
                    }
                    case 'Note': {
                        styleClass = 'class="docs-font-small docs-alert-note"'
                        prefix = '<i class="docs-fa docs-note-circle"></i> <b>Note:</b>'
                        role = 'role="alert"'
                        key = key + '-note'
                        innerHTML = addItalics(paragraph.text)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Success': {
                        styleClass = 'class="docs-font-small docs-alert-success"'
                        prefix = '<i class="docs-fa docs-check-square-o"></i> <b>Tip:</b>'
                        role = 'role="alert"'
                        key = key + '-success'
                        innerHTML = addItalics(paragraph.text)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Important': {
                        styleClass = 'class="docs-font-small docs-alert-important"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Important:</b>'
                        role = 'role="alert"'
                        key = key + '-important'
                        innerHTML = addItalics(paragraph.text)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Warning': {
                        styleClass = 'class="docs-font-small docs-alert-warning"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Warning:</b>'
                        role = 'role="alert"'
                        key = key + '-warning'
                        innerHTML = addItalics(paragraph.text)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Callout': {
                        styleClass = 'class="docs-font-small docs-callout"'
                        prefix = ''
                        role = ''
                        key = key + '-callout'
                        innerHTML = addItalics(paragraph.text)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Summary': {
                        styleClass = 'class="docs-font-small docs-summary"'
                        prefix = '<b>Summary:</b>'
                        role = ''
                        key = key + '-summary'
                        innerHTML = addItalics(paragraph.text)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'List': {
                        styleClass = ''
                        prefix = '<li>'
                        sufix = '</li>'
                        role = ''
                        key = key + '-list'
                        innerHTML = addBold(paragraph.text)
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Table': {
                        styleClass = ''
                        prefix = '<table class="docs-info-table">'
                        sufix = '</table>'
                        role = ''
                        key = key + '-table'
                        innerHTML = parseTable(paragraph.text)
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Gif': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-gif'
                        innerHTML = parseGIF(paragraph.text)
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Png': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-png'
                        innerHTML = parsePNG(paragraph.text)
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Javascript': {
                        styleClass = ''
                        prefix = '<pre><code class="language-javascript">'
                        sufix = '</code></pre>'
                        role = ''
                        key = key + '-javascript'
                        innerHTML = paragraph.text
                        break
                    }
                    case 'Json': {
                        styleClass = ''
                        prefix = '<pre><code class="language-json">'
                        sufix = '</code></pre>'
                        role = ''
                        key = key + '-json'
                        innerHTML = paragraph.text
                        break
                    }
                }

                HTML = HTML + '<p><div id="' + key + '" ' + styleClass + ' ' + role + '>' + prefix + ' ' + innerHTML + sufix + '</div></p>'
                paragraphMap.set(key, paragraph)

            }

            function hightlightEmbeddedCode() {
                _self.Prism.highlightAllUnder(docsSpaceDiv, true, onHighlighted)
                function onHighlighted() {
                    // nothing to do here
                }
            }
        }
    }

    function addFooter() {
        let HTML = ''

        HTML = HTML + '<div class="docs-node-html-footer-container">' // Container Starts

        HTML = HTML + '<hr class="docs-shaded"></hr>'
        HTML = HTML + '<footer>'
        HTML = HTML + '<div class="docs-footer-row">'
        HTML = HTML + '<div class="docs-footer-body" style="text-align: left;">'

        HTML = HTML + '<div onClick="UI.projects.superalgos.spaces.docsSpace.scrollToElement(\'docs-main-title-div\')" class="docs-plain-link"><kbd class=docs-kbd>BACK TO TOP ↑</kbd></div>'

        HTML = HTML + '<ul>'
        HTML = HTML + '<li><a href="https://superalgos.org/" target="_blank" class="docs-footer-link">Superalgos Project</a> — Learn more about the project.</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgoscommunity" rel="nofollow" target="_blank" class="docs-footer-link">Community Group</a> — Lets talk Superalgos!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgossupport" rel="nofollow" target="_blank" class="docs-footer-link">Support Group</a> — Need help using the <code class="docs-code">master</code> branch?</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosdevelop" rel="nofollow" target="_blank" class="docs-footer-link">Develop Group</a> — Come test the <code class="docs-code">develop</code> branch!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgosuxui" rel="nofollow" target="_blank" class="docs-footer-link">UX/UI Design Group</a> — Help us improve the GIU!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgos_es" rel="nofollow" target="_blank" class="docs-footer-link">Grupo en Español</a> — Hablemos en español!</li>'
        HTML = HTML + '<li><a href="https://t.me/superalgos" rel="nofollow" target="_blank" class="docs-footer-link">Superalgos Announcements</a> — Be the first to know about new releases, hotfixes, and important issues.</li>'
        HTML = HTML + '</ul>'
        HTML = HTML + '<img src="Images/superalgos-logo.png" width="200 px">'

        HTML = HTML + '</div>'
        HTML = HTML + '</div>'
        HTML = HTML + '</footer>'

        HTML = HTML + '</div>' // Container Ends

        return HTML
    }

    function parseGIF(text) {
        return '<img class="docs-gif" src="' + text + '">'
    }

    function reverseParseGIF(HTML) {
        let result = HTML
        result = result.replace(' <img class="docs-gif" src="', '')
        result = result.replace('">  ', '')
        return result
    }

    function parsePNG(text) {
        return '<img class="docs-png" src="' + text + '">'
    }

    function reverseParsePNG(HTML) {
        let result = HTML
        result = result.replace(' <img class="docs-png" src="', '')
        result = result.replace('">  ', '')
        return result
    }

    function parseTable(text) {
        let HTML = ''
        let odd = false
        /* When the text is not formatted as a table, we auto format it as a single cell table */
        if (text.indexOf('|') < 0) {
            text = "|" + text + "|"
        }

        /* We process the text based table*/
        let rows = text.split(String.fromCharCode(10))
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            if (row === '') {
                if (i === rows.length - 1) {
                    HTML = HTML + '</tbody>'
                }
                continue
            }
            let colums = row.split('|')
            if (i === 0) {
                HTML = HTML + '<thead>'
            }
            if (i === 1) {
                HTML = HTML + '<tbody>'
            }
            if (odd === true) {
                HTML = HTML + '<tr class="docs-info-table-alt-bg">'
                odd = false
            } else {
                HTML = HTML + '<tr>'
                odd = true
            }
            if (colums.length < 2) {
                continue
            } else {
                /* We discard anything before the first | and after the last | */
                for (let j = 1; j < colums.length - 1; j++) {
                    let column = colums[j]
                    column = addRGB(column)

                    if (i === 0) {
                        HTML = HTML + '<th>' + column + '</th>'
                    } else {
                        HTML = HTML + '<td>' + column + '</td>'
                    }
                }
            }

            HTML = HTML + '</tr>'
            if (i === 0) {
                HTML = HTML + '</thead>'
            }
            if (i === rows.length - 1) {
                HTML = HTML + '</tbody>'
            }
        }
        return HTML

        function addRGB(text) {
            const RGB_HTML = '<div style=\"display: block; background: RGB; border: 1px solid black;\">&nbsp;&nbsp;&nbsp;</div>'
            let splittedText = text.split('RGB(')
            if (splittedText.length === 1) { return text }
            let remainderSplit = splittedText[1].split(')')
            if (remainderSplit.length === 1) { return text }
            let RGBFound = 'RGB(' + remainderSplit[0] + ')'
            let span = RGB_HTML.replace('RGB', RGBFound)
            let result = text.replace(RGBFound, span)
            return result
        }
    }

    function reverseParseTable(HTML) {
        text = removeRGB(HTML)

        /* Single occurrance replacements */
        text = text.replace('<table class="docs-info-table"> ', '')
        text = text.replace('  </table>', '')
        text = text.replace('<thead>', '')
        text = text.replace('</thead>', '')
        text = text.replace('<tbody>', '')
        text = text.replace('</tbody>', '')

        /* All instances replacements */
        text = text.replaceAll('<tr>', '')
        text = text.replaceAll('<tr class="docs-info-table-alt-bg">', '')
        text = text.replaceAll('</td><td>', '|')
        text = text.replaceAll('</th><th>', '|')
        text = text.replaceAll('<th>', '|')
        text = text.replaceAll('</th>', '|')
        text = text.replaceAll('<td>', '|')
        text = text.replaceAll('</td>', '|')
        text = text.replaceAll('</tr>', '')

        /* We break lines where needed */
        text = text.replaceAll('||', '|' + String.fromCharCode(10) + '|')
        return text

        function removeRGB(HTML) {
            let text = HTML
            text = text.replaceAll('<div style="display: block; background: ', '')
            text = text.replaceAll('; border: 1px solid black;">&nbsp;&nbsp;&nbsp;</div>', '')
            return text
        }
    }

    function addBold(text) {
        let splittedText = text.split(':')
        if (splittedText.length > 1 && splittedText[1].length > 0) {
            return '<b>' + splittedText[0] + ':' + '</b>' + splittedText[1]
        } else {
            return text
        }
    }

    function addItalics(text) {

        let words = text.split(' ')
        let changedText = ''
        for (let i = 0; i < words.length; i++) {
            let phrase1 = words[i]
            let phrase2 = words[i] + ' ' + words[i + 1]
            let phrase3 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
            let phrase4 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]

            let cleanPhrase1 = cleanPhrase(phrase1)
            let cleanPhrase2 = cleanPhrase(phrase2)
            let cleanPhrase3 = cleanPhrase(phrase3)
            let cleanPhrase4 = cleanPhrase(phrase4)

            let found = false

            if (found === false && menuLabelsMap.get(cleanPhrase4) === true) {
                changedText = changedText + phrase4.replace(cleanPhrase4, '<i>' + cleanPhrase4 + '</i>') + ' '
                i = i + 3
                found = true
            }

            if (found === false && menuLabelsMap.get(cleanPhrase3) === true) {
                changedText = changedText + phrase3.replace(cleanPhrase3, '<i>' + cleanPhrase3 + '</i>') + ' '
                i = i + 2
                found = true
            }

            if (found === false && menuLabelsMap.get(cleanPhrase2) === true) {
                changedText = changedText + phrase2.replace(cleanPhrase2, '<i>' + cleanPhrase2 + '</i>') + ' '
                i = i + 1
                found = true
            }

            if (found === false && menuLabelsMap.get(cleanPhrase1) === true) {
                changedText = changedText + phrase1.replace(cleanPhrase1, '<i>' + cleanPhrase1 + '</i>') + ' '
                i = i + 0
                found = true
            }

            if (found === false) {
                changedText = changedText + phrase1 + ' '
            }
        }
        return changedText
    }

    function addToolTips(text) {

        const TOOL_TIP_HTML = '<div onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'CATEGORY\', \'TYPE\', \'PROJECT\')" class="docs-tooltip">TYPE_LABEL<span class="docs-tooltiptext">DEFINITION</span></div>'
        const LINK_ONLY_HTML = '<div onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'CATEGORY\', \'TYPE\', \'PROJECT\')" class="docs-link">TYPE_LABEL<span class="docs-tooltiptext"></span></div>'

        let resultingText = ''
        text = tagDefinedTypes(text, objectBeingRendered.type)
        let splittedText = text.split('->')

        for (let i = 0; i < splittedText.length; i = i + 2) {
            let firstPart = splittedText[i]
            let taggedText = splittedText[i + 1]

            if (taggedText === undefined) {
                return resultingText + firstPart
            }

            let splittedTaggedText = taggedText.split('|')
            let category = splittedTaggedText[0]
            let type = splittedTaggedText[1]
            let project = splittedTaggedText[2]

            /*
            We will search across all DOC and CONCEPT SCHEMAS
            */
            let found = false
            let definitionNode

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
            }
            if (found === false) {
                return text
            }

            let definition = definitionNode.definition
            if (definition === undefined || definition === "") {
                let tooltip = LINK_ONLY_HTML
                    .replace('CATEGORY', category)
                    .replace('TYPE', type)
                    .replace('PROJECT', project)
                    .replace('TYPE_LABEL', type)

                resultingText = resultingText + firstPart + tooltip
            } else {
                let tooltip = TOOL_TIP_HTML
                    .replace('CATEGORY', category)
                    .replace('TYPE', type)
                    .replace('PROJECT', project)
                    .replace('TYPE_LABEL', type)
                    .replace('DEFINITION', definition)

                resultingText = resultingText + firstPart + tooltip
            }
        }
        return resultingText
    }

    function tagDefinedTypes(text, excludedType) {
        let words = text.split(' ')
        let taggedText = ''
        for (let i = 0; i < words.length; i++) {
            let phrase1 = words[i]
            let phrase2 = words[i] + ' ' + words[i + 1]
            let phrase3 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
            let phrase4 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]

            let cleanPhrase1 = cleanPhrase(phrase1)
            let cleanPhrase2 = cleanPhrase(phrase2)
            let cleanPhrase3 = cleanPhrase(phrase3)
            let cleanPhrase4 = cleanPhrase(phrase4)

            let found = false

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]

                /* Search in docsNodeSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludedType) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + 'Node' + '|' + cleanPhrase4 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludedType) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + 'Node' + '|' + cleanPhrase3 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludedType) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + 'Node' + '|' + cleanPhrase2 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludedType) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + 'Node' + '|' + cleanPhrase1 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase1 + ' '
                    }
                    found = true
                    break
                }

                /* Search in docsConceptSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludedType) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + 'Concept' + '|' + cleanPhrase4 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludedType) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + 'Concept' + '|' + cleanPhrase3 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludedType) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + 'Concept' + '|' + cleanPhrase2 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludedType) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + 'Concept' + '|' + cleanPhrase1 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase1 + ' '
                    }
                    found = true
                    break
                }

                /* Search in docsTopicSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludedType) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + 'Topic' + '|' + cleanPhrase4 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludedType) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + 'Topic' + '|' + cleanPhrase3 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludedType) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + 'Topic' + '|' + cleanPhrase2 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludedType) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + 'Topic' + '|' + cleanPhrase1 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase1 + ' '
                    }
                    found = true
                    break
                }
            }

            if (found === false) {
                taggedText = taggedText + phrase1 + ' '
            }
        }
        return taggedText
    }

    function cleanPhrase(phrase) {
        return phrase.replace(',', '')
            .replace(';', '')
            .replace('(', '')
            .replace(')', '')
            .replace('-', '')
            .replace('_', '')
            .replace('.', '')
            .replace('[', '')
            .replace(']', '')
            .replace('{', '')
            .replace('}', '')
            .replace('/', '')
            .replace('>', '')
            .replace('<', '')
    }

    function resize() {
        thisObject.container.frame.width = 1000
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
