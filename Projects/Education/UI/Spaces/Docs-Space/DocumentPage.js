function newFoundationsDocsDocumentPage() {
    let thisObject = {
        docsSchemaDocument: undefined,
        exitEditMode: exitEditMode,
        render: render,
        initialize: initialize,
        finalize: finalize
    }

    let appSchemaDocument

    return thisObject

    function initialize() {

    }

    function finalize() {
        appSchemaDocument = undefined
        thisObject.docsSchemaDocument = undefined
    }

    function render() {

        appSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.appSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)

        disableCollapsibleContent()
        getSchemaDocument()
        repositionWorkspace()
        buildHtmlPage()
        contextMenuActivateRightClick()
        enableCollapsibleContent()

        function getSchemaDocument() {
            switch (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category) {
                case 'Node': {
                    thisObject.docsSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsNodeSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                    break
                }
                case 'Concept': {
                    thisObject.docsSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsConceptSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                    break
                }
                case 'Topic': {
                    thisObject.docsSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsTopicSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                    break
                }
                case 'Tutorial': {
                    thisObject.docsSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsTutorialSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                    break
                }
                case 'Review': {
                    thisObject.docsSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsReviewSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                    break
                }
                case 'Workspace': {
                    thisObject.docsSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.workspaceSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.nodeId)
                    break
                }
                case 'Book': {
                    thisObject.docsSchemaDocument = SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsBookSchema.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                    break
                }
            }

            if (thisObject.docsSchemaDocument === undefined) {
                // Use the New Node Template
                let template = {
                    updated: true,
                    type: UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type,
                    definition: {text: "Write the definition for this " + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category + "."},
                    paragraphs: [
                        {
                            style: "Text",
                            text: "Right click and select the pencil button to enter edit mode."
                        }
                    ]
                }

                switch (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category) {
                    case 'Node': {
                        SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).array.docsNodeSchema.push(template)
                        SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsNodeSchema.set(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type, template)
                        break
                    }
                    case 'Concept': {
                        SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).array.docsConceptSchema.push(template)
                        SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsConceptSchema.set(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type, template)
                        break
                    }
                    case 'Book': {
                        SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).array.docsBookSchema.push(template)
                        SCHEMAS_BY_PROJECT.get(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project).map.docsBookSchema.set(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type, template)
                        break
                    }
                }

                thisObject.docsSchemaDocument = template
            }
            /* When for any reason the schema document does not have a paragraphs array */
            if (thisObject.docsSchemaDocument.paragraphs === undefined) {
                thisObject.docsSchemaDocument.paragraphs = []
            }
            /* When the paragraph array is empty. */
            if (thisObject.docsSchemaDocument.paragraphs.length === 0) {
                let paragraph = {
                    style: 'Text',
                    text: UI.projects.education.globals.docs.NEW_PARAGRAPH_TEXT
                }
                thisObject.docsSchemaDocument.paragraphs.push(paragraph)
            }
        }

        async function repositionWorkspace() {
            let node
            if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category === 'Workspace') {
                node = await UI.projects.foundations.spaces.designSpace.workspace.getNodeById(thisObject.docsSchemaDocument.nodeId)
            }
            if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.nodeId !== undefined) {
                node = await UI.projects.foundations.spaces.designSpace.workspace.getNodeById(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.nodeId)
            }
            if (node === undefined) {
                return
            }

            node.payload.floatingObject.unCollapseParent()
            setTimeout(positionAtNode, 0000, node)
            setTimeout(positionAtNode, 1000, node) // In case the branch which contains the node is collapsed.
            function positionAtNode(node) {
                let xOffset = -UI.projects.education.globals.docs.DOCS_SPACE_WIDTH / 2
                UI.projects.foundations.spaces.floatingSpace.positionAtNode(node, xOffset)
            }
        }

        function buildHtmlPage() {
            let definitionImagesArray = []
            let hierarchyImagesArray = []
            let orderedTopicPageIndexArray = []
            let orderedTutorialPageIndexArray = []
            let orderedReviewPageIndexArray = []
            let HTML = ''

            HTML = HTML + '<section id="docs-search-results-div" class="docs-search-page-container">'
            HTML = HTML + UI.projects.education.spaces.docsSpace.mainSearchPage.addSearchHeader()
            HTML = HTML + '</section>'

            HTML = HTML + '<div id="docs-common-style-container-div" class="docs-common-style-container">' // Common Style Container Starts
            HTML = HTML + '<div id="docs-context-menu-clickeable-div" class="docs-context-menu-clickeable-container">' // Clickeable Container Starts

            /* Title */
            let titleLabel = thisObject.docsSchemaDocument.type
            HTML = HTML + '<div id="docs-main-title-div" class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2" id="' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type.toLowerCase().replace(' ', '-') + '" > ' + titleLabel + '</h2></div><div id="projectImageDiv" class="docs-image-container"/></div></div>'

            if (thisObject.docsSchemaDocument.deleted === true) {
                let key = 'auto-generated-flag-paragraph'
                let paragraph = {
                    style: "Warning",
                    text: "This page is flagged to be deleted. Next time you run the Docs Save Command, the content will be deleted from the Client's disk. If you refresh the page or close the browser before running the Docs Save Command, the flag will be lost and the page will not be deleted. Changes will be applied to the Docs Search Engine Index only after you run the Docs Reindex Command."
                }
                renderParagraph(paragraph, key)
            } else {
                if (thisObject.docsSchemaDocument.created === true || thisObject.docsSchemaDocument.updated === true) {
                    let key = 'auto-generated-flag-paragraph'
                    let paragraph = {
                        style: "Important",
                        text: "This page is flagged to be created / updated. Next time you run the Docs Save Command the content will be saved on the Client's disk. If you refresh the page or close the browser before running the Docs Save Command, changes will be lost. Changes will be applied to the Docs Search Engine Index only after you run the Docs Reindex Command."
                    }
                    renderParagraph(paragraph, key)
                }
            }

            addDefinitionTable(thisObject.docsSchemaDocument, 'definition-editable-', UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)

            let editableParagraphIndex = 0
            let autoGeneratedParagraphIndex = 0

            addContent()

            HTML = HTML + '</div>' // Clickeable Container Ends

            generateNavigationAndTableOfContents()

            HTML = HTML + '</div>' // Common Style Container Ends

            /*
            Here we inject the HTML we built into the DOM at the Docs Space Div.
            */
            let docsContentDiv = document.getElementById('docs-content-div')
            docsContentDiv.innerHTML = HTML + UI.projects.education.spaces.docsSpace.footer.addFooter()
            // Create tooltip objects for all the elements
            tippy('#tooltip-container', {
                theme: "superalgos"
            });

            hightlightEmbeddedCode()
            UI.projects.education.spaces.docsSpace.mainSearchPage.detectEnterOnSearchBox()

            /*
            After generating the html, we will add the images at all the points we know
            there are images to be added.
            */
            addImages()

            function generateNavigationAndTableOfContents() {
                if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category === 'Topic') {

                    orderedTopicPageIndexArray = UI.projects.education.utilities.docs.buildOrderedPageIndex(
                        UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project,
                        'Topic',
                        thisObject.docsSchemaDocument.topic
                    )

                    /* Topic Title 
    
                    titleLabel = thisObject.docsSchemaDocument.topic + ' Topic Navigation'
                    HTML = HTML + '<div id="docs-main-title-div" class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2" id="' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type.toLowerCase().replace(' ', '-') + '" > ' + titleLabel + '</h2></div><div id="projectImageDiv" class="docs-image-container"/></div></div>'
    
                    */
                    generateTopicPreviousAndNextPageNavigation()

                    HTML = HTML + '<div class="docs-topic-index">' // Container for Topic Navigation including buttons, title and index

                    HTML = HTML + '<h3 class="docs-h3">' + thisObject.docsSchemaDocument.topic + ' &mdash; TOC</h3>'

                    HTML = HTML + '<p style="margin-bottom: 15px;">You just read page <strong>' + thisObject.docsSchemaDocument.pageNumber + '</strong> in the topic.</p>'

                    generateTopicMultiPageIndex()

                    HTML = HTML + '</div>'  // END Container for Topic Navigation
                }

                if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category === 'Tutorial') {

                    orderedTutorialPageIndexArray = UI.projects.education.utilities.docs.buildOrderedPageIndex(
                        UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project,
                        'Tutorial',
                        thisObject.docsSchemaDocument.tutorial
                    )

                    /* Tutorial Title 
                    titleLabel = thisObject.docsSchemaDocument.tutorial + ' Tutorial Navigation'
                    HTML = HTML + '<div id="docs-main-title-div" class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2" id="' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type.toLowerCase().replace(' ', '-') + '" > ' + titleLabel + '</h2></div><div id="projectImageDiv" class="docs-image-container"/></div></div>'
                    */

                    generateTutorialPreviousAndNextPageNavigation()

                    HTML = HTML + '<div class="docs-topic-index">' // Container for Tutorial Navigation including buttons, title and index

                    HTML = HTML + '<h3 class="docs-h3">' + thisObject.docsSchemaDocument.tutorial + ' &mdash; TOC</h3>'

                    HTML = HTML + '<p style="margin-bottom: 15px;">You just did step <strong>' + thisObject.docsSchemaDocument.pageNumber + '</strong> in the tutorial.</p>'

                    generateTutorialMultiPageIndex()

                    HTML = HTML + '</div>'  // END Container for Tutorial Navigation
                }

                if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category === 'Review') {

                    orderedReviewPageIndexArray = UI.projects.education.utilities.docs.buildOrderedPageIndex(
                        UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project,
                        'Review',
                        thisObject.docsSchemaDocument.review
                    )

                    /* Review Title 
                    titleLabel = thisObject.docsSchemaDocument.review + ' Review Navigation'
                    HTML = HTML + '<div id="docs-main-title-div" class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2" id="' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type.toLowerCase().replace(' ', '-') + '" > ' + titleLabel + '</h2></div><div id="projectImageDiv" class="docs-image-container"/></div></div>'
                    */

                    generateReviewPreviousAndNextPageNavigation()

                    HTML = HTML + '<div class="docs-topic-index">' // Container for Review Navigation including buttons, title and index

                    HTML = HTML + '<h3 class="docs-h3">' + thisObject.docsSchemaDocument.review + ' &mdash; TOC</h3>'

                    HTML = HTML + '<p style="margin-bottom: 15px;">You just read page <strong>' + thisObject.docsSchemaDocument.pageNumber + '</strong> of this review collection.</p>'

                    generateReviewMultiPageIndex()

                    HTML = HTML + '</div>'  // END Container for Review Navigation
                }
            }

            function addDefinitionTable(docsSchemaDocument, idPrefix, category, project, type) {
                if (docsSchemaDocument.definition === undefined) {
                    docsSchemaDocument.definition = {
                        text: "Right click and select the pencil button to edit this tex. Replace it with a definition / summary. Hit ESC to exit edit mode."
                    }
                }

                let definitionText = UI.projects.education.utilities.docs.getTextBasedOnLanguage(docsSchemaDocument.definition)
                definitionText = definitionText + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(docsSchemaDocument.definition)

                /* We will test if we can draw an image here or not*/
                let testElement
                if (docsSchemaDocument.definition.icon !== undefined) {
                    testElement = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(docsSchemaDocument.definition.icon.project, docsSchemaDocument.definition.icon.name)
                } else {
                    testElement = UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(project, type)
                }

                /* 
                For nodes we always render a Definition Table, since we assume 
                each node will have an icon. For the rest only if we could load an 
                image we use a table, otherwise we will render the definitaion as a Summary.
                */
                if ((category === 'Topic' || category === 'Tutorial' || category === 'Review' || category === 'Concept' || category === 'Book') && testElement === undefined) {
                    HTML = HTML + '<div id="definition-summary-editable-paragraph" class="docs-summary"><b>Summary:</b> ' + UI.projects.education.utilities.docs.addToolTips(definitionText, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type) + '</div>'
                } else {
                    HTML = HTML + '<div class="docs-definition-table">'

                    let imageItem = {
                        div: 'definition-image-div-' + definitionImagesArray.length,
                        project: project,
                        category: category,
                        type: type,
                        icon: docsSchemaDocument.definition.icon // if exists, this will override the default that is taking the image from the doc project / type.
                    }
                    definitionImagesArray.push(imageItem)

                    HTML = HTML + '<div id="' + imageItem.div + '" class="docs-image-container"></div>'
                    HTML = HTML + '<div id="' + idPrefix + 'paragraph" class="docs-definition-text"><strong>' + UI.projects.education.utilities.docs.addToolTips(definitionText, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type) + '</strong></div>'
                    HTML = HTML + '</div>'
                }

            }

            function generateTopicPreviousAndNextPageNavigation() {
                let previousPage
                let nextPage

                for (let i = 0; i < orderedTopicPageIndexArray.length; i++) {
                    let arrayItem = orderedTopicPageIndexArray[i]

                    if (thisObject.docsSchemaDocument.type === arrayItem.type) {
                        previousPage = orderedTopicPageIndexArray[i - 1]
                        nextPage = orderedTopicPageIndexArray[i + 1]

                        HTML = HTML + '<div class="docs-topic-navigation"><div>'
                        if (previousPage !== undefined) {
                            HTML = HTML + '<span" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Topic' + '\', \'' + previousPage.type.replace(/'/g, 'AMPERSAND') + '\')"><button> Previous </button></span><br/>' + previousPage.type
                        }
                        HTML = HTML + '</div><div>'
                        if (nextPage !== undefined) {
                            HTML = HTML + '<span" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Topic' + '\', \'' + nextPage.type.replace(/'/g, 'AMPERSAND') + '\')"><button> Next </button></span><br/>' + nextPage.type
                        }
                        HTML = HTML + '</div></div>'
                        return
                    }
                }
            }

            function generateTopicMultiPageIndex() {
                /* 
                We will go through all the schema documents array for the current project and pick
                the documents that share the same key that the document we are rendering now.
                With the info on those picked document we will build the index.
                */
                let paragraph

                for (let i = 0; i < orderedTopicPageIndexArray.length; i++) {
                    let arrayItem = orderedTopicPageIndexArray[i]
                    let key = 'auto-generated-index-paragraph-' + autoGeneratedParagraphIndex
                    paragraph = {
                        style: "Title",
                        text: "" + arrayItem.type + ""
                    }
                    autoGeneratedParagraphIndex++
                    HTML = HTML + '<p>' + arrayItem.pageNumber + '. ' + '<a onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Topic' + '\', \'' + arrayItem.type.replace(/'/g, 'AMPERSAND') + '\')">' + paragraph.text + '</a></p>'
                }

            }

            function generateTutorialPreviousAndNextPageNavigation() {
                let previousPage
                let nextPage

                for (let i = 0; i < orderedTutorialPageIndexArray.length; i++) {
                    let arrayItem = orderedTutorialPageIndexArray[i]

                    if (thisObject.docsSchemaDocument.type === arrayItem.type) {
                        previousPage = orderedTutorialPageIndexArray[i - 1]
                        nextPage = orderedTutorialPageIndexArray[i + 1]

                        HTML = HTML + '<div class="docs-topic-navigation"><div>'
                        if (previousPage !== undefined) {
                            HTML = HTML + '<span" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Tutorial' + '\', \'' + previousPage.type.replace(/'/g, 'AMPERSAND') + '\')"><button> Previous </button></span><br/>' + previousPage.type
                        }
                        HTML = HTML + '</div><div>'
                        if (nextPage !== undefined) {
                            HTML = HTML + '<span" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Tutorial' + '\', \'' + nextPage.type.replace(/'/g, 'AMPERSAND') + '\')"><button> Next </button></span><br/>' + nextPage.type
                        }
                        HTML = HTML + '</div></div>'
                        return
                    }
                }
            }

            function generateTutorialMultiPageIndex() {
                /* 
                We will go through all the schema documents array for the current project and pick
                the documents that share the same key thatn the document we are rendering now. 
                With the info on those picked document we will build the index.
                */
                let paragraph

                for (let i = 0; i < orderedTutorialPageIndexArray.length; i++) {
                    let arrayItem = orderedTutorialPageIndexArray[i]
                    let key = 'auto-generated-index-paragraph-' + autoGeneratedParagraphIndex
                    paragraph = {
                        style: "Title",
                        text: "" + arrayItem.type + ""
                    }
                    autoGeneratedParagraphIndex++
                    HTML = HTML + '<p>' + arrayItem.pageNumber + '. ' + '<a onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Tutorial' + '\', \'' + arrayItem.type.replace(/'/g, 'AMPERSAND') + '\')">' + paragraph.text + '</a></p>'
                }
            }

            function generateReviewPreviousAndNextPageNavigation() {
                let previousPage
                let nextPage

                for (let i = 0; i < orderedReviewPageIndexArray.length; i++) {
                    let arrayItem = orderedReviewPageIndexArray[i]

                    if (thisObject.docsSchemaDocument.type === arrayItem.type) {
                        previousPage = orderedReviewPageIndexArray[i - 1]
                        nextPage = orderedReviewPageIndexArray[i + 1]

                        HTML = HTML + '<div class="docs-topic-navigation"><div>'
                        if (previousPage !== undefined) {
                            HTML = HTML + '<span" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Review' + '\', \'' + previousPage.type.replace(/'/g, 'AMPERSAND') + '\')"><button> Previous </button></span><br/>' + previousPage.type
                        }
                        HTML = HTML + '</div><div>'
                        if (nextPage !== undefined) {
                            HTML = HTML + '<span" onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Review' + '\', \'' + nextPage.type.replace(/'/g, 'AMPERSAND') + '\')"><button> Next </button></span><br/>' + nextPage.type
                        }
                        HTML = HTML + '</div></div>'
                        return
                    }
                }
            }

            function generateReviewMultiPageIndex() {
                /* 
                We will go through all the schema documents array for the current project and pick
                the documents that share the same key that the document we are rendering now.
                With the info on those picked document we will build the index.
                */
                let paragraph

                for (let i = 0; i < orderedReviewPageIndexArray.length; i++) {
                    let arrayItem = orderedReviewPageIndexArray[i]
                    let key = 'auto-generated-index-paragraph-' + autoGeneratedParagraphIndex
                    paragraph = {
                        style: "Title",
                        text: "" + arrayItem.type + ""
                    }
                    autoGeneratedParagraphIndex++
                    HTML = HTML + '<p>' + arrayItem.pageNumber + '. ' + '<a onClick="UI.projects.education.spaces.docsSpace.navigateTo(\'' + UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project + '\', \'' + 'Review' + '\', \'' + arrayItem.type.replace(/'/g, 'AMPERSAND') + '\')">' + paragraph.text + '</a></p>'
                }
            }

            function addContent() {
                HTML = HTML + '<div id="docs-content">'
                if (thisObject.docsSchemaDocument.paragraphs !== undefined) {
                    for (let i = 0; i < thisObject.docsSchemaDocument.paragraphs.length; i++) {
                        let key = 'editable-paragraph-' + editableParagraphIndex
                        let paragraph = thisObject.docsSchemaDocument.paragraphs[i]

                        switch (paragraph.style) {
                            case "Include": {
                                renderParagraph(paragraph, key)
                                editableParagraphIndex++
                                let error = addIncludedParagraphs(paragraph.text)
                                if (error !== undefined) {
                                    paragraph = {
                                        style: "Error",
                                        text: error
                                    }
                                    key = 'error-paragraph-' + autoGeneratedParagraphIndex
                                    renderParagraph(paragraph, key)
                                    autoGeneratedParagraphIndex++
                                }
                                break
                            }
                            case "Placeholder": {
                                renderParagraph(paragraph, key)
                                editableParagraphIndex++
                                let result = addPlaceholdedParagraph(paragraph.text)
                                if (result !== undefined) {
                                    paragraph = {
                                        style: "Note",
                                        text: result
                                    }
                                    key = 'note-paragraph-' + autoGeneratedParagraphIndex
                                    renderParagraph(paragraph, key)
                                    autoGeneratedParagraphIndex++
                                }
                                break
                            }
                            case "Chapter": {
                                renderParagraph(paragraph, key)
                                editableParagraphIndex++
                                let error = addChapterIndex(paragraph.text)
                                if (error !== undefined) {
                                    paragraph = {
                                        style: "Error",
                                        text: error
                                    }
                                    key = 'error-paragraph-' + autoGeneratedParagraphIndex
                                    renderParagraph(paragraph, key)
                                    autoGeneratedParagraphIndex++
                                }
                                break
                            }
                            default: {
                                renderParagraph(paragraph, key)
                                editableParagraphIndex++
                            }
                        }
                    }
                }
                if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category === 'Node') {
                    autoGeneratedHtml()
                }
                HTML = HTML + '</div>' // Content Ends

                function addIncludedParagraphs(includeText) {
                    let splittedIncludeText = includeText.split('->')
                    let project = splittedIncludeText[0]
                    let category = splittedIncludeText[1]
                    let type = splittedIncludeText[2]
                    let block
                    let definition = false
                    if (splittedIncludeText[3] === 'Definition') {
                        definition = true
                    } else {
                        block = splittedIncludeText[3]
                    }
                    let includedSchemaDocument

                    if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                        return 'Include paragraph style Syntax Error. The Project <i>' + project + '</i> could not be found. Check the Docs Include Style Syntax to learn how to include blocks from a page. This error message will disappear as soon as you fix the problem.'
                    }
                    switch (category) {
                        case 'Node': {
                            includedSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
                            break
                        }
                        case 'Concept': {
                            includedSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
                            break
                        }
                        case 'Topic': {
                            includedSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
                            break
                        }
                        case 'Tutorial': {
                            includedSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.get(type)
                            break
                        }
                        case 'Review': {
                            includedSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.get(type)
                            break
                        }
                        case 'Book': {
                            includedSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.get(type)
                            break
                        }
                        default:
                            return 'Category (' + category + ') is not valid. Use Node, Concept, Topic, Review or Book instead.'
                    }
                    if (includedSchemaDocument === undefined) {
                        return category + ' document ' + type + ' not found at project ' + project
                    }
                    if (includedSchemaDocument.paragraphs === undefined) {
                        return 'Schema Document found, but without paragraphs.'
                    }

                    if (definition === true) {
                        addDefinitionTable(includedSchemaDocument, 'definition-included-', category, project, type)
                    } else {
                        let blockFound = false
                        for (let i = 0; i < includedSchemaDocument.paragraphs.length; i++) {

                            let key = 'included-paragraph-' + autoGeneratedParagraphIndex
                            let paragraph = includedSchemaDocument.paragraphs[i]

                            if (blockFound === false) {
                                if (paragraph.style === "Block" && paragraph.text === block) {
                                    blockFound = true
                                }
                            } else {
                                if (paragraph.style === "Block") {
                                    return // Expected return without errors
                                }
                                if (paragraph.style === "Include") {
                                    renderParagraph(paragraph, key)
                                    autoGeneratedParagraphIndex++
                                    let error = addIncludedParagraphs(paragraph.text)
                                    if (error !== undefined) {
                                        paragraph = {
                                            style: "Error",
                                            text: error
                                        }
                                        key = 'error-paragraph-' + autoGeneratedParagraphIndex
                                        renderParagraph(paragraph, key)
                                        autoGeneratedParagraphIndex++
                                    }
                                } else {
                                    renderParagraph(paragraph, key)
                                    autoGeneratedParagraphIndex++
                                }
                            }
                        }
                        if (blockFound === false) {
                            return 'Block <i>' + block + '</i> not found.'
                        }
                    }
                }

                function addPlaceholdedParagraph(propertyName) {
                    if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.placeholder !== undefined) {
                        let placeholder = UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.placeholder[propertyName]

                        if (placeholder !== undefined) {
                            let paragraph = {
                                style: placeholder.style,
                                text: placeholder.text
                            }
                            let key = 'placeholded-paragraph-' + autoGeneratedParagraphIndex
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++
                            return
                        } else {
                            return 'Property ' + propertyName + ' not found at the placeholder object. This means that within the info received, this information is not available.'
                        }
                    }
                }

                function addChapterIndex(chapterText) {
                    let splittedChapterText = chapterText.split('->')
                    let chapterNumber = splittedChapterText[0]
                    let project = splittedChapterText[1]
                    let category = splittedChapterText[2]
                    let chapterName = splittedChapterText[3]
                    let introText = splittedChapterText[4]


                    if (project === undefined || category === undefined || chapterNumber === undefined || chapterName === undefined) {
                        return 'Chapter paragraph style Syntax Error. Some of the required parameters are undefined. Check the Docs Chapter Style Syntax. This error message will disappear as soon as you fix the problem.'
                    }

                    if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                        return 'Chapter paragraph style Syntax Error. The Project <i>' + project + '</i> could not be found. Check the Docs Chapter Style Syntax. This error message will disappear as soon as you fix the problem.'
                    }

                    if (category !== 'Topic' && category !== 'Tutorial' && category !== 'Review') {
                        return 'Category must be either Topic, Tutorial or Review. Found: <i>' + category + '</i>'
                    }

                    switch (category) {
                        case 'Topic': {
                            orderedTopicPageIndexArray = UI.projects.education.utilities.docs.buildOrderedPageIndex(
                                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project,
                                'Topic',
                                chapterName
                            )

                            if (orderedTopicPageIndexArray.length === 0) {
                                return 'Chapter paragraph style Syntax Error. The Topic <i>' + chapterName + '</i> could not be found. Check the Docs Chapter Style Syntax. This error message will disappear as soon as you fix the problem.'
                            }
                            break
                        }
                        case 'Tutorial': {
                            orderedTutorialPageIndexArray = UI.projects.education.utilities.docs.buildOrderedPageIndex(
                                project,
                                'Tutorial',
                                chapterName
                            )

                            if (orderedTutorialPageIndexArray.length === 0) {
                                return 'Chapter paragraph style Syntax Error. The Tutorial <i>' + chapterName + '</i> could not be found. Check the Docs Chapter Style Syntax. This error message will disappear as soon as you fix the problem.'
                            }
                            break
                        }
                        case 'Review': {
                            orderedReviewPageIndexArray = UI.projects.education.utilities.docs.buildOrderedPageIndex(
                                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project,
                                'Review',
                                chapterName
                            )

                            if (orderedReviewPageIndexArray.length === 0) {
                                return 'Chapter paragraph style Syntax Error. The Review <i>' + chapterName + '</i> could not be found. Check the Docs Chapter Style Syntax. This error message will disappear as soon as you fix the problem.'
                            }
                            break
                        }
                    }

                    HTML = HTML + '<div class="docs-topic-index">' // Container for Topic Index 

                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    paragraph = {
                        style: "Title",
                        text: 'Chapter ' + chapterNumber + ' - ' + chapterName
                    }

                    HTML = HTML + '<h2>'
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    HTML = HTML + '</h2>'

                    if (introText !== undefined) {
                        let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                        paragraph = {
                            style: "Text",
                            text: introText
                        }
                        HTML = HTML + '<p><strong>'
                        renderParagraph(paragraph, key)
                        autoGeneratedParagraphIndex++
                        HTML = HTML + '</strong></p>'
                    }

                    HTML = HTML + '<h3>Table of Contents</h3>'

                    switch (category) {
                        case 'Topic': {
                            generateTopicMultiPageIndex()
                            break
                        }
                        case 'Tutorial': {
                            generateTutorialMultiPageIndex()
                            break
                        }
                        case 'Review': {
                            generateReviewMultiPageIndex()
                            break
                        }
                    }

                    HTML = HTML + '</div>'  // Container for Topic Index 
                }
            }

            function addImages() {
                addProjectImage()
                addDefinitionImage()
                addHierarchyImages()

                if (UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.category === 'Node') {
                    addMenuItemsImages()
                    addChildrenNodesPropertiesImages()
                    addAttachingAndReferencingRulesImages()
                    addConfigurationImages()
                }

                function addDefinitionImage() {

                    for (let i = 0; i < definitionImagesArray.length; i++) {
                        let imageItem = definitionImagesArray[i]
                        let appSchemaDocument = SCHEMAS_BY_PROJECT.get(imageItem.project).map.appSchema.get(imageItem.type)
                        let imageElement
                        if (appSchemaDocument !== undefined && appSchemaDocument.icon === undefined) {
                            /* 
                            We are checking this because there is a possibility that a different icon is specified
                            for this Node Type, in that case we would override the default that is that the icon name is
                            equal to the Node Type.
                            */
                            let imageName = appSchemaDocument.type.toLowerCase().replaceAll(' ', '-')
                            imageElement = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(imageItem.project, imageName)
                            if (imageElement === undefined) {
                                console.log('[WARN] Image for project (' + imageItem.project + ') with name (' + imageName + ') not found. As a consequence, the Docs Page will be rendered without the icon. ')
                                continue
                            }
                        } else {
                            if (imageItem.icon === undefined) {
                                /* This is the default behaviours */
                                imageElement = UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(imageItem.project, imageItem.type)
                                if (imageElement === undefined) {
                                    console.log('[WARN] Image for project (' + imageItem.project + ') with name (' + imageItem.type + ') not found. As a consequence, the Docs Page will be rendered without the icon. ')
                                    continue
                                }
                            } else {
                                /* Here we take the image from the icon specification */
                                imageElement = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(imageItem.icon.project, imageItem.icon.name)
                                if (imageElement === undefined) {
                                    console.log('[WARN] Image for project (' + imageItem.icon.project + ') with name (' + imageItem.icon.name + ') not found. As a consequence, the Docs Page will be rendered without the icon. ')
                                    continue
                                }
                            }
                        }

                        imageElement.width = "150"
                        imageElement.height = "150"

                        let definitionImageDiv = document.getElementById(imageItem.div)
                        definitionImageDiv.appendChild(imageElement)
                    }
                }

                function addHierarchyImages() {
                    for (let i = 0; i < hierarchyImagesArray.length; i++) {
                        let imageItem = hierarchyImagesArray[i]
                        let collectionImage

                        if (imageItem.name === undefined) {
                            let appSchemaDocument = SCHEMAS_BY_PROJECT.get(imageItem.project).map.appSchema.get(imageItem.type)
                            if (appSchemaDocument.icon === undefined) {
                                let imageName = appSchemaDocument.type.toLowerCase().replaceAll(' ', '-')
                                collectionImage = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(imageItem.project, imageName)
                                if (collectionImage === undefined) {
                                    console.log('[WARN] Image for project (' + imageItem.project + ') with name (' + imageName + ') not found. As a consequence, the hierarchy will be rendered without the icon. ')
                                    continue
                                }
                            } else {
                                collectionImage = UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(imageItem.project, imageItem.type)
                                if (collectionImage === undefined) {
                                    console.log('[WARN] Image for project (' + imageItem.project + ') with type (' + imageItem.type + ') not found. As a consequence, the hierarchy will be rendered without the icon. ')
                                    continue
                                }
                            }
                        } else {
                            collectionImage = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(imageItem.project, imageItem.name)
                            if (collectionImage === undefined) {
                                console.log('[WARN] Image for project (' + imageItem.project + ') with name (' + imageItem.name + ') not found. As a consequence, the hierarchy will be rendered without the icon. ')
                                continue
                            }
                        }

                        let imageElement = collectionImage.cloneNode()

                        if (imageItem.size !== undefined) {
                            imageElement.width = imageItem.size
                            imageElement.height = imageItem.size
                        }

                        let hierarchyImageDiv = document.getElementById(imageItem.div)
                        if (hierarchyImageDiv) { // The lower part of the table is filled with spaces that were added to the array but not to the HTML, we can ignore them.
                            hierarchyImageDiv.appendChild(imageElement)

                        }
                    }
                }

                function addProjectImage() {
                    let imageName = UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project.toLowerCase().replaceAll(' ', '-')
                    let imageElement = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project, imageName)
                    if (imageElement !== undefined) {
                        imageElement.width = "50"
                        imageElement.height = "50"


                        let projectImageDiv = document.getElementById('projectImageDiv')
                        projectImageDiv.appendChild(imageElement)
                    }
                }

                function addMenuItemsImages() {
                    if (appSchemaDocument === undefined || appSchemaDocument.menuItems === undefined) {
                        return
                    }
                    for (let i = 0; i < appSchemaDocument.menuItems.length; i++) {
                        let menuItem = appSchemaDocument.menuItems[i]
                        let collectionImage = getIcon(appSchemaDocument.menuItems[i].relatedUiObjectProject, appSchemaDocument.menuItems[i].actionProject)
                        if (collectionImage === undefined) {
                            continue
                        }
                        let imageElement = collectionImage.cloneNode()

                        imageElement.className = "docs-collapsible-image"

                        let parentElement = document.getElementById('docs-menu-item-' + i + '')
                        let dummyImage = parentElement.childNodes[0]
                        parentElement.replaceChild(imageElement, dummyImage)

                        function getIcon(relatedUiObjectProject, actionProject) {
                            let project
                            if (menuItem.relatedUiObject !== undefined) {
                                if (relatedUiObjectProject !== undefined) {
                                    project = relatedUiObjectProject
                                } else {
                                    project = UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project
                                }
                                return UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(project, menuItem.relatedUiObject)
                            } else {
                                if (actionProject !== undefined) {
                                    project = actionProject
                                } else {
                                    project = UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project
                                }
                                if (menuItem.iconPathOn !== undefined) {
                                    return UI.projects.foundations.spaces.designSpace.getIconByProjectAndName(project, menuItem.iconPathOn)
                                } else {
                                    return UI.projects.foundations.spaces.designSpace.getIconByProjectAndName('Foundations', 'bitcoin')
                                }
                            }
                        }
                    }
                }

                function addChildrenNodesPropertiesImages() {
                    if (appSchemaDocument === undefined || appSchemaDocument.childrenNodesProperties === undefined) {
                        return
                    }
                    for (let i = 0; i < appSchemaDocument.childrenNodesProperties.length; i++) {
                        let childrenNodesProperty = appSchemaDocument.childrenNodesProperties[i]
                        let collectionImage = getIcon()
                        if (collectionImage === undefined) {
                            continue
                        }
                        let imageElement = collectionImage.cloneNode()

                        imageElement.className = "docs-collapsible-image"

                        let parentElement = document.getElementById('docs-children-nodes-property-' + i + '')
                        let dummyImage = parentElement.childNodes[0]
                        parentElement.replaceChild(imageElement, dummyImage)

                        function getIcon() {
                            if (childrenNodesProperty.project !== undefined) {
                                return UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(childrenNodesProperty.project, childrenNodesProperty.childType)
                            } else {
                                return UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project, childrenNodesProperty.childType)
                            }
                        }
                    }
                }

                function addAttachingAndReferencingRulesImages() {
                    if (appSchemaDocument === undefined) {
                        return
                    }

                    if (appSchemaDocument.attachingRules !== undefined) {
                        if (appSchemaDocument.attachingRules.compatibleTypes !== undefined) {
                            let splittedTypes = appSchemaDocument.attachingRules.compatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'attaching-rules-compatible-types')
                        }
                        if (appSchemaDocument.attachingRules.incompatibleTypes !== undefined) {
                            let splittedTypes = appSchemaDocument.attachingRules.incompatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'attaching-rules-incompatible-types')
                        }
                    }
                    if (appSchemaDocument.referencingRules !== undefined) {
                        if (appSchemaDocument.referencingRules.compatibleTypes !== undefined) {
                            let splittedTypes = appSchemaDocument.referencingRules.compatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'referencing-rules-compatible-types')
                        }
                        if (appSchemaDocument.referencingRules.incompatibleTypes !== undefined) {
                            let splittedTypes = appSchemaDocument.referencingRules.incompatibleTypes.split('->')
                            imageForTheseNodes(splittedTypes, 'referencing-rules-incompatible-types')
                        }
                    }

                    function imageForTheseNodes(nodeList, additionToKey) {
                        for (let i = 0; i < nodeList.length; i++) {
                            let listItem = nodeList[i]
                            if (listItem === "") {
                                continue
                            }

                            let collectionImage = getIcon()
                            if (collectionImage === undefined) {
                                continue
                            }
                            let imageElement = collectionImage.cloneNode()

                            imageElement.className = "docs-collapsible-image"

                            let parentElement = document.getElementById('docs-' + additionToKey + '-' + i + '')
                            let dummyImage = parentElement.childNodes[0]
                            parentElement.replaceChild(imageElement, dummyImage)

                            function getIcon() {
                                let splittedListItem = listItem.split('|')
                                if (splittedListItem.length === 1) {
                                    return UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.project, listItem)
                                } else {
                                    let project = splittedListItem[0]
                                    let nodeType = splittedListItem[1]
                                    return UI.projects.foundations.spaces.designSpace.getIconByProjectAndType(project, nodeType)
                                }
                            }
                        }
                    }
                }

                function addConfigurationImages() {
                    if (appSchemaDocument === undefined) {
                        return
                    }
                    let configImageElementArray = document.getElementsByClassName('docs-configuration-property-image')
                    if (configImageElementArray === undefined) {
                        return
                    }

                    /* 
                    We need to create our own array otherwise while replacing the childElement
                    we will be shrinking the array.
                    */
                    let imageArray = []
                    for (let i = 0; i < configImageElementArray.length; i++) {
                        let dummyImage = configImageElementArray[i]
                        imageArray.push(dummyImage)
                    }
                    for (let i = 0; i < imageArray.length; i++) {
                        let dummyImage = imageArray[i]
                        let parentElement = dummyImage.parentNode
                        let collectionImage = UI.projects.foundations.spaces.designSpace.getIconByProjectAndName('Foundations', 'configuration')
                        if (collectionImage === undefined) {
                            continue
                        }
                        let imageElement = collectionImage.cloneNode()

                        imageElement.className = "docs-collapsible-image"
                        parentElement.replaceChild(imageElement, dummyImage)
                    }
                }
            }

            function autoGeneratedHtml() {
                generateConfiguration()
                generateMenuItems()
                generateChildrenNodesProperties()
                generateAttachingRules()
                generateReferencingRules()
                generateCode()
                generateFormula()

                function generateMenuItems() {
                    /* 
                    Menu Items
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || appSchemaDocument.menuItems === undefined || appSchemaDocument.menuItems.length === 0) {
                        return
                    }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Menu"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The " + appSchemaDocument.type + " node has the following Node Menu items:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    for (let i = 0; i < appSchemaDocument.menuItems.length; i++) {
                        let menuItem = appSchemaDocument.menuItems[i]

                        HTML = HTML + '<button id="docs-menu-item-' + i + '" type="button" class="docs-collapsible-element"><img>' + menuItem.label + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-content">'

                        paragraph = {
                            style: "Text",
                            text: 'The ' + menuItem.label + ' menu item has the following properties:'
                        }
                        renderParagraph(paragraph, key)
                        autoGeneratedParagraphIndex++

                        for (const property in menuItem) {
                            paragraph = {
                                style: "List",
                                text: property + ": " + menuItem[property]
                            }
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++
                        }

                        HTML = HTML + '</div>'
                    }
                    paragraph = {
                        style: "Success",
                        text: "When a menu item is grayed out, it means that " + appSchemaDocument.type + " already has the required child type that the menu item may add, and only that child is allowed for that case. "
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                }

                function generateChildrenNodesProperties() {
                    /* 
                    Children Nodes Properties
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex

                    if (appSchemaDocument === undefined || appSchemaDocument.childrenNodesProperties === undefined || appSchemaDocument.childrenNodesProperties.length === 0) {
                        return
                    }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Children"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The " + appSchemaDocument.type + " node has the following childrenNodesProperties:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    for (let i = 0; i < appSchemaDocument.childrenNodesProperties.length; i++) {
                        let childrenNodesProperty = appSchemaDocument.childrenNodesProperties[i]

                        let name = UI.projects.foundations.utilities.strings.fromCamelCaseToUpperWithSpaces(childrenNodesProperty.name)

                        HTML = HTML + '<button id="docs-children-nodes-property-' + i + '" type="button" class="docs-collapsible-element"><img>' + UI.projects.education.utilities.docs.addToolTips(name, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type) + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-content">'

                        paragraph = {
                            style: "Text",
                            text: 'The ' + name + ' node property features the following properties:'
                        }
                        renderParagraph(paragraph, key)
                        autoGeneratedParagraphIndex++

                        for (const property in childrenNodesProperty) {
                            paragraph = {
                                style: "List",
                                text: property + ": " + childrenNodesProperty[property]
                            }
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++
                        }

                        HTML = HTML + '</div>'
                    }
                }

                function generateAttachingRules() {
                    /* 
                    Attaching Rules
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || (appSchemaDocument.attachingRules === undefined && appSchemaDocument.referencingRules === undefined)) {
                        return
                    }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Attaching Rules"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The following are the Node Attaching Rules that govern the attachment of  " + appSchemaDocument.type + " with other nodes:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.attachingRules !== undefined) {
                        if (appSchemaDocument.attachingRules.compatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Compatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++

                            let splittedTypes = appSchemaDocument.attachingRules.compatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'attaching-rules-compatible-types')
                        }
                        if (appSchemaDocument.attachingRules.incompatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Incompatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++

                            let splittedTypes = appSchemaDocument.attachingRules.incompatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'attaching-rules-incompatible-types')
                        }
                    }

                    function listAllTheseNodes(nodeList, additionToKey) {
                        for (let i = 0; i < nodeList.length; i++) {
                            let listItem = nodeList[i]
                            if (listItem === "") {
                                continue
                            }
                            HTML = HTML + '<button id="docs-' + additionToKey + '-' + i + '" type="button" class="docs-non-collapsible-element"><img>' + UI.projects.education.utilities.docs.addToolTips(listItem, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type) + '</button>'
                        }
                    }
                }

                function generateReferencingRules() {
                    /* 
                    Referencing Rules
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || (appSchemaDocument.referencingRules === undefined && appSchemaDocument.referencingRules === undefined)) {
                        return
                    }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Referencing Rules"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The following are the Node Referencing Rules that determine which nodes " + appSchemaDocument.type + " may establish a reference to:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.referencingRules !== undefined) {
                        if (appSchemaDocument.referencingRules.compatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Compatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++

                            let splittedTypes = appSchemaDocument.referencingRules.compatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'referencing-rules-compatible-types')
                        }
                        if (appSchemaDocument.referencingRules.incompatibleTypes !== undefined) {
                            paragraph = {
                                style: "Subtitle",
                                text: "Incompatible Types:"
                            }
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++

                            let splittedTypes = appSchemaDocument.referencingRules.incompatibleTypes.split('->')
                            listAllTheseNodes(splittedTypes, 'referencing-rules-incompatible-types')
                        }
                    }

                    function listAllTheseNodes(nodeList, additionToKey) {
                        for (let i = 0; i < nodeList.length; i++) {
                            let listItem = nodeList[i]
                            if (listItem === "") {
                                continue
                            }
                            HTML = HTML + '<button id="docs-' + additionToKey + '-' + i + '" type="button" class="docs-non-collapsible-element"><img>' + UI.projects.education.utilities.docs.addToolTips(listItem, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type) + '</button>'
                        }
                    }
                }

                function generateConfiguration() {
                    /* 
                    Configuration
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || appSchemaDocument.editors === undefined || appSchemaDocument.editors.config !== true) {
                        return
                    }
                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Values"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.initialValues === undefined || appSchemaDocument.initialValues.config === undefined) {
                        return
                    }

                    paragraph = {
                        style: "Text",
                        text: "These are the Initial Values for " + appSchemaDocument.type + " configuration:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    let initialValues = JSON.parse(appSchemaDocument.initialValues.config)
                    paragraph = {
                        style: "Json",
                        text: JSON.stringify(initialValues, undefined, 4)
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    paragraph = {
                        style: "Subtitle",
                        text: "Examples"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This is a list of properties featured by the " + appSchemaDocument.type + " configuration. Expanding a property shows sample values for the property extracted from the current Workspace."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    /*
                    Here we will scan the whole workspace, first looking for nodes of the same type,
                    and after that, analysing their configuration in order to extract all the properties
                    they are using and sample values for each one.
                    */
                    /* First Step: get an array of all the nodes in the workspace of this type */
                    let rootNodes = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
                    let allNodesFound = []
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode !== null) {
                            let nodeArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(rootNode, appSchemaDocument.type)
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

                        let name = UI.projects.foundations.utilities.strings.fromCamelCaseToUpperWithSpaces(mapKey)

                        HTML = HTML + '<button id="docs-config-property-' + mapKey.toLowerCase() + '" type="button" class="docs-collapsible-element"><img class="docs-configuration-property-image">' + name + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-content">'

                        for (let i = 0; i < valueArray.length; i++) {
                            let value = valueArray[i]

                            paragraph = {
                                style: "Json",
                                text: value
                            }
                            renderParagraph(paragraph, key)
                            autoGeneratedParagraphIndex++
                        }

                        HTML = HTML + '</div>'
                    }
                }

                function generateCode() {
                    /* 
                    Code
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || appSchemaDocument.editors === undefined || appSchemaDocument.editors.code !== true) {
                        return
                    }
                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Code"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This section explores " + appSchemaDocument.type + " Node Code."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.initialValues === undefined || appSchemaDocument.initialValues.code === undefined) {
                        return
                    }

                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Value"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The initial value for " + appSchemaDocument.type + " Code is:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    paragraph = {
                        style: "Javascript",
                        text: JSON.stringify(appSchemaDocument.initialValues.code, undefined, 4)
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    paragraph = {
                        style: "Subtitle",
                        text: "Examples"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This is a list of examples used on the " + appSchemaDocument.type + " code, collected from this workspace."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    /*
                    Here we will scan the whole workspace, first looking for nodes of the same type,
                    and after that, analysing their code in order to extract examples to show.
                    */
                    /* First Step: get an array of all the nodes in the workspace of this type */
                    let rootNodes = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
                    let allNodesFound = []
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode !== null) {
                            let nodeArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(rootNode, appSchemaDocument.type)
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
                        if (exampleCounter > 10) {
                            return
                        }
                        HTML = HTML + '<button id="docs-code-example-' + exampleCounter + '" type="button" class="docs-collapsible-element">' + 'Example #' + exampleCounter + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-code-content">'
                        exampleCounter++
                        paragraph = {
                            style: "Javascript",
                            text: code
                        }
                        renderParagraph(paragraph, key)
                        autoGeneratedParagraphIndex++

                        HTML = HTML + '</div>'
                    }
                }

                function generateFormula() {
                    /* 
                    Formula
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || appSchemaDocument.editors === undefined || appSchemaDocument.editors.formula !== true) {
                        return
                    }
                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Formula"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This section explores " + appSchemaDocument.type + " Node Code."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.initialValues === undefined || appSchemaDocument.initialValues.code === undefined) {
                        return
                    }

                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Value"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The initial value for " + appSchemaDocument.type + " is:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    paragraph = {
                        style: "Javascript",
                        text: JSON.stringify(appSchemaDocument.initialValues.code, undefined, 4)
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    paragraph = {
                        style: "Subtitle",
                        text: "Examples"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "This is a list of examples used on the " + appSchemaDocument.type + " code, collected from this workspace."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    /*
                    Here we will scan the whole workspace, first looking for nodes of the same type,
                    and after that, analysing their code in order to extract examples to show.
                    */
                    /* First Step: get an array of all the nodes in the workspace of this type */
                    let rootNodes = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
                    let allNodesFound = []
                    for (let i = 0; i < rootNodes.length; i++) {
                        let rootNode = rootNodes[i]
                        if (rootNode !== null) {
                            let nodeArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(rootNode, appSchemaDocument.type)
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
                        if (exampleCounter > 10) {
                            return
                        }
                        HTML = HTML + '<button id="docs-code-example-' + exampleCounter + '" type="button" class="docs-collapsible-element">' + 'Example #' + exampleCounter + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-code-content">'
                        exampleCounter++
                        paragraph = {
                            style: "Javascript",
                            text: code
                        }
                        renderParagraph(paragraph, key)
                        autoGeneratedParagraphIndex++

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
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addCodeToCamelCase(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addCodeToWhiteList(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Title': {
                        styleClass = 'class="docs-h3"'
                        prefix = ''
                        role = ''
                        key = key + '-title'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Subtitle': {
                        styleClass = 'class="docs-h4"'
                        prefix = ''
                        role = ''
                        key = key + '-subtitle'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Note': {
                        styleClass = 'class="docs-font-small docs-alert-note"'
                        prefix = '<i class="docs-fa docs-note-circle"></i> <b>Note:</b>'
                        role = 'role="alert"'
                        key = key + '-note'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Success': {
                        styleClass = 'class="docs-font-small docs-alert-success"'
                        prefix = '<i class="docs-fa docs-check-square-o"></i> <b>Tip:</b>'
                        role = 'role="alert"'
                        key = key + '-success'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Important': {
                        styleClass = 'class="docs-font-small docs-alert-important"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Important:</b>'
                        role = 'role="alert"'
                        key = key + '-important'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Warning': {
                        styleClass = 'class="docs-font-small docs-alert-warning"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Warning:</b>'
                        role = 'role="alert"'
                        key = key + '-warning'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Error': {
                        styleClass = 'class="docs-font-small docs-alert-error"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Error:</b>'
                        role = 'role="alert"'
                        key = key + '-error'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Callout': {
                        styleClass = 'class="docs-font-small docs-callout"'
                        prefix = ''
                        role = ''
                        key = key + '-callout'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Summary': {
                        styleClass = 'class="docs-font-small docs-summary"'
                        prefix = '<b>Summary:</b>'
                        role = ''
                        key = key + '-summary'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Section': {
                        styleClass = 'class="docs-section"'
                        prefix = ''
                        role = ''
                        key = key + '-section'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'List': {
                        styleClass = ''
                        prefix = '<ul><li>'
                        sufix = '</li></ul>'
                        role = ''
                        key = key + '-list'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addCodeToCamelCase(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addBold(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addKeyboard(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Table': {
                        styleClass = ''
                        prefix = '<table class="docs-info-table">'
                        sufix = '</table>' + UI.projects.education.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        role = ''
                        key = key + '-table'
                        innerHTML = UI.projects.education.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.education.utilities.docs.addToolTips(innerHTML, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type)
                        innerHTML = UI.projects.education.utilities.docs.parseTable(innerHTML)
                        innerHTML = UI.projects.education.utilities.docs.addItalics(innerHTML)
                        break
                    }
                    case 'Hierarchy': {
                        styleClass = ''
                        prefix = '<table class="docs-hierarchy-table" params="' + paragraph.text + '">'
                        sufix = '</table>'
                        role = ''
                        key = key + '-hierarchy'
                        innerHTML = parseHierarchy(paragraph.text)
                        break
                    }
                    case 'Link': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-link'
                        innerHTML = UI.projects.education.utilities.docs.parseLink(paragraph.text)
                        break
                    }
                    case 'Youtube': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-youtube'
                        innerHTML = UI.projects.education.utilities.docs.parseYoutube(paragraph.text)
                        break
                    }
                    case 'Gif': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-gif'
                        innerHTML = UI.projects.education.utilities.docs.parseGIF(paragraph.text)
                        break
                    }
                    case 'Png': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-png'
                        innerHTML = UI.projects.education.utilities.docs.parsePNG(paragraph.text)
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
                    case 'Anchor': {
                        styleClass = 'class="docs-hidden-anchor"'
                        prefix = '<div id="' + 'docs-anchor-' + paragraph.text.toLowerCase().replaceAll(' ', '-') + '">'
                        sufix = '</div>'
                        role = ''
                        key = key + '-anchor'
                        innerHTML = paragraph.text
                        break
                    }
                    case 'Block': {
                        styleClass = 'class="docs-hidden-block"'
                        prefix = ''
                        role = ''
                        key = key + '-block'
                        innerHTML = paragraph.text
                        break
                    }
                    case 'Include': {
                        styleClass = 'class="docs-hidden-include"'
                        prefix = ''
                        role = ''
                        key = key + '-include'
                        innerHTML = paragraph.text
                        break
                    }
                    case 'Placeholder': {
                        styleClass = 'class="docs-hidden-placeholder"'
                        prefix = ''
                        role = ''
                        key = key + '-placeholder'
                        innerHTML = paragraph.text
                        break
                    }
                    case 'Chapter': {
                        styleClass = 'class="docs-chapter"'
                        prefix = ''
                        role = ''
                        key = key + '-chapter'
                        innerHTML = paragraph.text
                        break
                    }
                }

                HTML = HTML + '<p><div id="' + key + '" ' + styleClass + ' ' + role + '>' + prefix + ' ' + innerHTML + sufix + '</div></p>'
                UI.projects.education.spaces.docsSpace.paragraphMap.set(key, paragraph)
            }

            function hightlightEmbeddedCode() {
                _self.Prism.highlightAllUnder(docsContentDiv, true)
            }

            function parseHierarchy(params) {

                const MAX_COLUMNS = 8
                const MAX_ROWS = 100

                const ELBOW = 'elbow'
                const FORK = 'fork'
                const LINE = 'line'
                const SPACE = 'space'

                let splittedParams = params.split('->')
                let project = splittedParams[0]
                let type = splittedParams[1]
                let levels = splittedParams[2]

                appSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.appSchema.get(type)
                if (appSchemaDocument === undefined) {
                    return
                }
                if (isNaN(levels) === true) {
                    return
                }
                if (levels > MAX_COLUMNS) {
                    return
                }

                let contentMatrix = []

                for (let i = 0; i < MAX_ROWS; i++) {
                    contentMatrix.push(['', '', '', '', '', '', '', ''])
                }

                let currentColumn = 0
                let currentRow = -1

                scanHierarchy(appSchemaDocument, project, currentColumn)
                fillEmptySpaces()
                putTheLines()
                addImageContainers()

                let HTML = ''
                addHTML()
                return HTML

                function scanHierarchy(schemaDocument, project, currentColumn, lastChild) {

                    if (schemaDocument === undefined) {
                        return
                    }

                    currentRow++

                    let imageItem = {
                        div: 'hierarchy-image-div-' + hierarchyImagesArray.length,
                        project: project,
                        type: schemaDocument.type,
                        size: 50
                    }
                    let imageContainer = '<div id="' + imageItem.div + '" class="docs-hierarchy-image-container"/>'
                    hierarchyImagesArray.push(imageItem)

                    let matrixValue = '<table><tr><td class="docs-hierarchy-table-cell">' + imageContainer + '</td></tr><tr><td  class="docs-hierarchy-table-cell">' + UI.projects.education.utilities.docs.addToolTips(schemaDocument.type, UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered.type) + '</td></tr></table>'
                    let matrixRow = contentMatrix[currentRow]
                    matrixRow[currentColumn] = matrixValue

                    if (lastChild === true) {
                        matrixRow[currentColumn - 1] = ELBOW
                    }
                    if (lastChild === false) {
                        matrixRow[currentColumn - 1] = FORK
                    }

                    if (schemaDocument.childrenNodesProperties === undefined) {
                        return
                    }

                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]
                        let childProject = project
                        if (property.project !== undefined) {
                            childProject = property.project
                        }
                        let childType = property.childType
                        let childSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.appSchema.get(childType)

                        if (i === schemaDocument.childrenNodesProperties.length - 1) {
                            lastChild = true
                        } else {
                            lastChild = false
                        }

                        if (currentColumn + 1 < levels) {
                            scanHierarchy(childSchemaDocument, childProject, currentColumn + 1, lastChild)
                        }
                    }
                }

                function fillEmptySpaces() {
                    /*
                    Fill the empty spaces
                    */
                    for (let i = 0; i < contentMatrix.length; i++) {
                        let matrixRow = contentMatrix[i]
                        for (let j = 0; j < matrixRow.length; j++) {
                            if (matrixRow[j] === '') {
                                matrixRow[j] = SPACE
                            }
                        }
                    }
                }

                function putTheLines() {
                    /*
                    Now we will scan the Matrix to put the lines of the hierarchy.
                    */
                    for (let i = 0; i < contentMatrix.length; i++) {
                        let matrixRow = contentMatrix[i]
                        let previousRow = contentMatrix[i - 1]
                        for (let j = 0; j < matrixRow.length; j++) {
                            if (previousRow && matrixRow[j] === SPACE) {
                                if (previousRow[j] === FORK || previousRow[j] === LINE) {
                                    matrixRow[j] = LINE
                                }
                            }
                        }
                    }
                }

                function addImageContainers() {
                    /*
                    Add Image Containers
                    */
                    for (let i = 0; i < contentMatrix.length; i++) {
                        let matrixRow = contentMatrix[i]
                        for (let j = 0; j < matrixRow.length; j++) {

                            let imageItem = {
                                div: 'hierarchy-image-div-' + hierarchyImagesArray.length,
                                project: 'Foundations'
                            }

                            switch (matrixRow[j]) {
                                case LINE: {
                                    imageItem.name = 'tree-connector-line'
                                    matrixRow[j] = '<div id="' + imageItem.div + '" class="docs-hierarchy-image-container"/>'
                                    hierarchyImagesArray.push(imageItem)
                                    break
                                }
                                case SPACE: {
                                    imageItem.name = 'tree-spacer'
                                    matrixRow[j] = '<div id="' + imageItem.div + '" class="docs-hierarchy-image-container"/>'
                                    hierarchyImagesArray.push(imageItem)
                                    break
                                }
                                case FORK: {
                                    imageItem.name = 'tree-connector-fork'
                                    matrixRow[j] = '<div id="' + imageItem.div + '" class="docs-hierarchy-image-container"/>'
                                    hierarchyImagesArray.push(imageItem)
                                    break
                                }
                                case ELBOW: {
                                    imageItem.name = 'tree-connector-elbow'
                                    matrixRow[j] = '<div id="' + imageItem.div + '" class="docs-hierarchy-image-container"/>'
                                    hierarchyImagesArray.push(imageItem)
                                    break
                                }
                            }

                        }
                    }
                }

                function addHTML() {
                    /*
                    Add HTML
                    */
                    let oddRow = false
                    for (let i = 0; i < currentRow + 1; i++) {
                        let matrixRow = contentMatrix[i]

                        let rowClass
                        if (oddRow === false) {
                            oddRow = true
                            rowClass = ''
                        } else {
                            oddRow = false
                            rowClass = 'class="docs-hierarchy-table-row"'
                        }

                        HTML = HTML + '<tr ' + rowClass + '>'
                        for (let j = 0; j < matrixRow.length; j++) {
                            HTML = HTML + '<td class="docs-hierarchy-table-cell"><center>'
                            HTML = HTML + matrixRow[j]
                            HTML = HTML + '</center></td>'
                        }
                        HTML = HTML + '</tr>'
                    }
                }
            }
        }
    }

    function contextMenuActivateRightClick() {
        const contextMenuClickablDiv = document.getElementById('docs-context-menu-clickeable-div')
        const menu = document.getElementById('menu')
        const outClick = document.getElementById('docs-context-menu-clickeable-div')

        contextMenuClickablDiv.addEventListener('contextmenu', e => {
            e.preventDefault()
            if (EDITOR_ON_FOCUS === true) {
                UI.projects.education.spaces.docsSpace.exitEditMode()
                return
            }
            if (UI.projects.education.spaces.docsSpace.contextMenu.getSelection() === false) {
                /*
                The click was in a place where we can not recognize an editable piece.
                We will not open the menu in this circumstances.
                */
                return
            }

            menu.style.top = `${e.clientY}px`
            menu.style.left = `${e.clientX}px`
            menu.classList.add('show')

            outClick.style.display = "block"
        })

        outClick.addEventListener('click', () => {
            if (EDITOR_ON_FOCUS !== true) {
                UI.projects.education.spaces.docsSpace.contextMenu.removeContextMenuFromScreen()
            }
        })
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
            collapsibleElementsArray[i].removeEventListener("click", function () {
            })
        }
    }

    function exitEditMode() {

        /* We will update the paragraph that was being edited*/
        let editing
        if (UI.projects.education.spaces.docsSpace.contextMenu.selectedParagraph.id.indexOf('definition') >= 0) {
            editing = "Definition"
        } else {
            editing = "Paragraph"
        }
        switch (editing) {
            case "Paragraph": {
                /*
                In this case we are at a regular paragraph.
                */
                let docSchemaParagraph = UI.projects.education.spaces.docsSpace.paragraphMap.get(UI.projects.education.spaces.docsSpace.contextMenu.selectedParagraph.id)
                /*
                We will detect if the user has created new paragraphs while editing.
                For that we will inspect the value of the text area looking for a char
                code representing carriage return.
                */
                let paragraphs = []
                let paragraph = ''
                let splittedSelectedParagraph = UI.projects.education.spaces.docsSpace.contextMenu.selectedParagraph.id.split('-')
                let selectededitableParagraphIndex = Number(splittedSelectedParagraph[2])
                let selectedParagraphStyle = splittedSelectedParagraph[3]
                let style = selectedParagraphStyle.charAt(0).toUpperCase() + selectedParagraphStyle.slice(1);

                for (let i = 0; i < UI.projects.education.spaces.docsSpace.textArea.value.length; i++) {
                    if (UI.projects.education.spaces.docsSpace.textArea.value.charCodeAt(i) === 10 && style !== 'Javascript' && style !== 'Json' && style !== 'Table') {
                        if (paragraph !== '') {
                            paragraphs.push(paragraph)
                        }
                        paragraph = ''
                    } else {
                        paragraph = paragraph + UI.projects.education.spaces.docsSpace.textArea.value[i]
                    }
                }
                paragraphs.push(paragraph)

                if (paragraphs.length === 1) {
                    /* There is no need to add new paragraphs, we just update the one we have. */
                    if (paragraphs[0] !== '') {
                        UI.projects.education.utilities.docs.setTextBasedOnLanguage(docSchemaParagraph, paragraphs[0])
                    } else {
                        /*
                        Deleting paragraphs is only possible in the default language.
                        */
                        if (UI.projects.education.spaces.docsSpace.language === UI.projects.education.globals.docs.DEFAULT_LANGUAGE) {
                            UI.projects.education.spaces.docsSpace.documentPage.docsSchemaDocument.updated = true
                            thisObject.docsSchemaDocument.paragraphs.splice(selectededitableParagraphIndex, 1)
                            if (thisObject.docsSchemaDocument.paragraphs.length === 0) {
                                let newParagraph = {
                                    style: 'Text',
                                    text: 'Please contribute to the Docs by editing this content!'
                                }
                                thisObject.docsSchemaDocument.paragraphs.push(newParagraph)
                            }
                        }
                    }
                } else {
                    /*
                    Adding paragraphs is only possible in the default language.
                    */
                    if (UI.projects.education.spaces.docsSpace.language === UI.projects.education.globals.docs.DEFAULT_LANGUAGE) {
                        /*
                        We will update the one paragraph we have and we will add the rest. 
                        */
                        UI.projects.education.utilities.docs.setTextBasedOnLanguage(docSchemaParagraph, paragraphs[0])

                        for (let i = 1; i < paragraphs.length; i++) {
                            let newParagraph = {
                                style: style,
                                text: paragraphs[i]
                            }
                            thisObject.docsSchemaDocument.paragraphs.splice(selectededitableParagraphIndex + i, 0, newParagraph)
                            UI.projects.education.spaces.docsSpace.documentPage.docsSchemaDocument.updated = true
                        }
                    }
                }

                break
            }
            case "Definition": {
                /*
                This means that the definition was being edited.
                */
                if (UI.projects.education.spaces.docsSpace.textArea.value !== '') {
                    UI.projects.education.utilities.docs.setTextBasedOnLanguage(thisObject.docsSchemaDocument.definition, UI.projects.education.spaces.docsSpace.textArea.value)
                }
                break
            }
        }
    }
}