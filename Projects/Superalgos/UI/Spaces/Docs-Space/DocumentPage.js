function newSuperalgosDocsDocumentPage() {
    let thisObject = {
        render: render, 
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function render(objectBeingRendered, paragraphMap) {

        appSchemaDocument = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.appSchema.get(objectBeingRendered.type)

        disableCollapsibleContent()
        getSchemaDocument()
        repositionWorkspace()
        buildHtmlPage()
        contextMenuActivateRightClick()
        enableCollapsibleContent()

        function getSchemaDocument() {
            switch (objectBeingRendered.category) {
                case 'Node': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docsNodeSchema.get(objectBeingRendered.type)
                    break
                }
                case 'Concept': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docsConceptSchema.get(objectBeingRendered.type)
                    break
                }
                case 'Topic': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docsTopicSchema.get(objectBeingRendered.type)
                    break
                }
                case 'Workspace': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.workspaceSchema.get(objectBeingRendered.nodeId)
                    break
                }
            }

            if (docsSchemaDocument === undefined) {
                // Use the New Node Template
                let template = {
                    type: objectBeingRendered.type,
                    definition: { text: "Write here the definition of this " + objectBeingRendered.category + "." },
                    paragraphs: [
                        {
                            style: "Text",
                            text: "Left click and Edit to enter edit mode and change this text."
                        }
                    ]
                }

                switch (objectBeingRendered.category) {
                    case 'Node': {
                        SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).array.docsNodeSchema.push(template)
                        SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docsNodeSchema.set(objectBeingRendered.type, template)
                        break
                    }
                    case 'Concept': {
                        SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).array.docsConceptSchema.push(template)
                        SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docsConceptSchema.set(objectBeingRendered.type, template)
                        break
                    }
                }

                docsSchemaDocument = template
            }
            /* When for any reason the schema document does not have a paragraphs array */
            if (docsSchemaDocument.paragraphs === undefined) {
                docsSchemaDocument.paragraphs = []
            }
            /* When the paragraph array is empty. */
            if (docsSchemaDocument.paragraphs.length === 0) {
                let paragraph = {
                    style: 'Text',
                    text: newParagraphText
                }
                docsSchemaDocument.paragraphs.push(paragraph)
            }
        }

        async function repositionWorkspace() {
            if (objectBeingRendered.category !== 'Workspace') { return }

            let node = await UI.projects.superalgos.spaces.designSpace.workspace.getNodeById(docsSchemaDocument.nodeId)
            node.payload.floatingObject.unCollapseParent()
            setTimeout(positionAtNode, 3000, node)
            setTimeout(positionAtNode, 5000, node)
            function positionAtNode(node) {
                let xOffset = -DOCS_SPACE_WIDTH / 2
                UI.projects.superalgos.spaces.floatingSpace.positionAtNode(node, xOffset)
            }
        }

        function buildHtmlPage() {
            let definitionImagesArray = []
            let hierarchyImagesArray = []
            let HTML = ''

            HTML = HTML + '<section id="docs-search-results-div" class="docs-search-page-container">'
            HTML = HTML + UI.projects.superalgos.spaces.docsSpace.mainSearchPage.addSearchHeader()
            HTML = HTML + '</section>'

            HTML = HTML + '<div id="docs-common-style-container-div" class="docs-common-style-container">' // Common Style Container Starts
            HTML = HTML + '<div id="docs-context-menu-clickeable-div" class="docs-context-menu-clickeable-container">' // Clickeable Container Starts

            /* Title */
            let titleLabel = ''
            if (docsSchemaDocument.topic !== undefined) {
                titleLabel = docsSchemaDocument.topic + ' - Page ' + docsSchemaDocument.pageNumber + '<br>' + docsSchemaDocument.type
            } else {
                titleLabel = docsSchemaDocument.type
            }

            HTML = HTML + '<div id="docs-main-title-div" class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2" id="' + objectBeingRendered.type.toLowerCase().replace(' ', '-') + '" > ' + titleLabel + '</h2></div><div id="projectImageDiv" class="docs-image-container"/></div></div>'

            addDefinitionTable(docsSchemaDocument, 'definition-editable-', objectBeingRendered.category, objectBeingRendered.project, objectBeingRendered.type)

            let editableParagraphIndex = 0
            let autoGeneratedParagraphIndex = 0

            if (objectBeingRendered.category === 'Topic') {
                generateMultiPageIndex()
            }

            addContent()

            HTML = HTML + '</div>' // Clickeable Container Ends
            HTML = HTML + '</div>' // Common Style Container Ends

            /*
            Here we inject the HTML we built into the DOM at the Docs Space Div.
            */
            let docsContentDiv = document.getElementById('docs-content-div')
            docsContentDiv.innerHTML = HTML + UI.projects.superalgos.spaces.docsSpace.footer.addFooter()

            hightlightEmbeddedCode()
            UI.projects.superalgos.spaces.docsSpace.mainSearchPage.detectEnterOnSearchBox()

            /*
            After generating the html, we will add the images at all the points we know
            there are images to be added.
            */
            addImages()

            function addDefinitionTable(docsSchemaDocument, idPrefix, category, project, type) {
                if (docsSchemaDocument.definition !== undefined) {

                    let definitionText = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(docsSchemaDocument.definition)
                    definitionText = definitionText + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(docsSchemaDocument.definition)

                    /* We will test if we can draw an image here or not*/
                    let testElement = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(project, type)

                    if ((category === 'Topic' || category === 'Concept') && testElement === undefined) {
                        HTML = HTML + '<div id="definition-summary-editable-paragraph" class="docs-summary"><b>Summary:</b> ' + UI.projects.superalgos.utilities.docs.addToolTips(definitionText, objectBeingRendered.type) + '</div>'
                    } else {
                        HTML = HTML + '<div class="docs-definition-table">'

                        let imageItem = {
                            div: 'definition-image-div-' + definitionImagesArray.length,
                            project: project,
                            category: category,
                            type: type
                        }
                        definitionImagesArray.push(imageItem)

                        HTML = HTML + '<div id="' + imageItem.div + '" class="docs-image-container"></div>'
                        HTML = HTML + '<div id="' + idPrefix + 'paragraph" class="docs-font-normal"><strong>' + UI.projects.superalgos.utilities.docs.addToolTips(definitionText, objectBeingRendered.type) + '</strong></div>'
                        HTML = HTML + '</div>'
                    }
                }
            }

            function generateMultiPageIndex() {
                /* 
                We will go through all the schema docuents array for the current project and pick 
                the documents that share the same key thatn the document we are rendering now. 
                With the info on those picked document we will build the index.
                */
                let key = 'auto-generated-index-paragraph-' + autoGeneratedParagraphIndex
                let paragraph = {
                    style: "Title",
                    text: "" + docsSchemaDocument.topic + " Topic Index"
                }
                renderParagraph(paragraph, key)
                autoGeneratedParagraphIndex++

                let orderedIndexArray = []
                let schemaArray = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).array.docsTopicSchema
                for (let i = 0; i < schemaArray.length; i++) {
                    let arrayItem = schemaArray[i]

                    if (arrayItem.topic === docsSchemaDocument.topic) {
                        let itemAdded = false
                        if (orderedIndexArray.length === 0) {
                            orderedIndexArray.push(arrayItem)
                            itemAdded = true
                        } else {
                            for (let j = 0; j < orderedIndexArray.length; j++) {
                                let orderedArrayItem = orderedIndexArray[j]
                                if (Number(arrayItem.pageNumber) < Number(orderedArrayItem.pageNumber)) {
                                    orderedIndexArray.splice(j, 0, arrayItem)
                                    itemAdded = true
                                    break
                                }
                            }
                        }
                        if (itemAdded === false) {
                            orderedIndexArray.push(arrayItem)
                        }

                    }
                }

                for (let i = 0; i < orderedIndexArray.length; i++) {
                    let arrayItem = orderedIndexArray[i]
                    paragraph
                    key = 'auto-generated-index-paragraph-' + autoGeneratedParagraphIndex
                    paragraph = {
                        style: "Title",
                        text: "" + arrayItem.pageNumber + '. ' + arrayItem.type + ""
                    }
                    autoGeneratedParagraphIndex++
                    HTML = HTML + '<p><a onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'' + objectBeingRendered.project + '\', \'' + 'Topic' + '\', \'' + arrayItem.type.replace(/'/g, 'AMPERSAND') + '\')" class="docs-topic-index-link">' + paragraph.text + '</a></p>'
                }
            }

            function addContent() {
                HTML = HTML + '<div id="docs-content">'
                if (docsSchemaDocument.paragraphs !== undefined) {
                    for (let i = 0; i < docsSchemaDocument.paragraphs.length; i++) {
                        let key = 'editable-paragraph-' + editableParagraphIndex
                        let paragraph = docsSchemaDocument.paragraphs[i]

                        if (paragraph.style === "Include") {
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
                        } else {
                            renderParagraph(paragraph, key)
                            editableParagraphIndex++
                        }
                    }
                }
                if (objectBeingRendered.category === 'Node') {
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
                        return 'Include paragraph style Syntax Error. The Project <i>' + project + '</i> could not be found. Check the Docs Include Style Syntax to learn how to include paragraphs from a different page. This error message will dissapear as soon as you fix the problem.'
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
                        default: return 'Category provided (' + category + ') not valid. Use Node, Concept or Topic instead.'
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
            }

            function addImages() {
                addProjectImage()
                addDefinitionImage()
                addhHerarchyImages()

                if (objectBeingRendered.category === 'Node') {
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
                            imageElement = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName(imageItem.project, imageName)
                        } else {
                            imageElement = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(imageItem.project, imageItem.type)
                        }

                        imageElement.width = "150"
                        imageElement.height = "150"

                        let definitionImageDiv = document.getElementById(imageItem.div)
                        definitionImageDiv.appendChild(imageElement)
                    }
                }

                function addhHerarchyImages() {
                    for (let i = 0; i < hierarchyImagesArray.length; i++) {
                        let imageItem = hierarchyImagesArray[i]
                        let collectionImage

                        if (imageItem.name === undefined) {
                            let appSchemaDocument = SCHEMAS_BY_PROJECT.get(imageItem.project).map.appSchema.get(imageItem.type)
                            if (appSchemaDocument.icon === undefined) {
                                let imageName = appSchemaDocument.type.toLowerCase().replaceAll(' ', '-')
                                collectionImage = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName(imageItem.project, imageName)
                            } else {
                                collectionImage = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndType(imageItem.project, imageItem.type)
                            }
                        } else {
                            collectionImage = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName(imageItem.project, imageItem.name)
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
                    let imageName = objectBeingRendered.project.toLowerCase().replaceAll(' ', '-')
                    let imageElement = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName(objectBeingRendered.project, imageName)
                    imageElement.width = "50"
                    imageElement.height = "50"

                    let projectImageDiv = document.getElementById('projectImageDiv')
                    projectImageDiv.appendChild(imageElement)
                }

                function addMenuItemsImages() {
                    if (appSchemaDocument === undefined || appSchemaDocument.menuItems === undefined) { return }
                    for (let i = 0; i < appSchemaDocument.menuItems.length; i++) {
                        let menuItem = appSchemaDocument.menuItems[i]
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
                    if (appSchemaDocument === undefined || appSchemaDocument.childrenNodesProperties === undefined) { return }
                    for (let i = 0; i < appSchemaDocument.childrenNodesProperties.length; i++) {
                        let childrenNodesProperty = appSchemaDocument.childrenNodesProperties[i]
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
                    if (appSchemaDocument === undefined) { return }

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

                function addConfigurationImages() {
                    if (appSchemaDocument === undefined) { return }
                    let configImageElementArray = document.getElementsByClassName('docs-configuration-property-image')
                    if (configImageElementArray === undefined) { return }

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
                        let collectionImage = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName('Superalgos', 'configuration')
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
                    if (appSchemaDocument === undefined || appSchemaDocument.menuItems === undefined) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Menu"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The " + appSchemaDocument.type + " Node has the following Node Menu items:"
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
                        text: "When any of the menu items is grayed out, it means that " + appSchemaDocument.type + " already has the type of children that that menu item can add, and that only one children is possible in that case. "
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

                    if (appSchemaDocument === undefined || appSchemaDocument.childrenNodesProperties === undefined) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Children"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The " + appSchemaDocument.type + " Node has the following childrenNodesProperties which hold the Node Children at runtime:"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    for (let i = 0; i < appSchemaDocument.childrenNodesProperties.length; i++) {
                        let childrenNodesProperty = appSchemaDocument.childrenNodesProperties[i]

                        let name = UI.projects.superalgos.utilities.strings.fromCamelCaseToUpperWithSpaces(childrenNodesProperty.name)

                        HTML = HTML + '<button id="docs-children-nodes-property-' + i + '" type="button" class="docs-collapsible-element"><img>' + UI.projects.superalgos.utilities.docs.addToolTips(name, objectBeingRendered.type) + '</button>'
                        HTML = HTML + '<div class="docs-collapsible-content">'

                        paragraph = {
                            style: "Text",
                            text: 'The ' + name + ' children node property has in turn the following properties:'
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
                    if (appSchemaDocument === undefined || (appSchemaDocument.attachingRules === undefined && appSchemaDocument.referencingRules === undefined)) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Attaching Rules"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The following are Node Attaching Rules that govern the attacment of  " + appSchemaDocument.type + " with other nodes:"
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
                            if (listItem === "") { continue }
                            HTML = HTML + '<button id="docs-' + additionToKey + '-' + i + '" type="button" class="docs-non-collapsible-element"><img>' + UI.projects.superalgos.utilities.docs.addToolTips(listItem, objectBeingRendered.type) + '</button>'
                        }
                    }
                }

                function generateReferencingRules() {
                    /* 
                    Referencing Rules
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || (appSchemaDocument.referencingRules === undefined && appSchemaDocument.referencingRules === undefined)) { return }

                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Referencing Rules"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The following are Node Referencing Rules that govern to which nodes " + appSchemaDocument.type + " can stablish a reference:"
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
                            if (listItem === "") { continue }
                            HTML = HTML + '<button id="docs-' + additionToKey + '-' + i + '" type="button" class="docs-non-collapsible-element"><img>' + UI.projects.superalgos.utilities.docs.addToolTips(listItem, objectBeingRendered.type) + '</button>'
                        }
                    }
                }

                function generateConfiguration() {
                    /* 
                    Configuration
                    */
                    let paragraph
                    let key = 'auto-generated-paragraph-' + autoGeneratedParagraphIndex
                    if (appSchemaDocument === undefined || appSchemaDocument.editors === undefined || appSchemaDocument.editors.config !== true) { return }
                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Values"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.initialValues === undefined || appSchemaDocument.initialValues.config === undefined) { return }

                    paragraph = {
                        style: "Text",
                        text: "The Initial Values for " + appSchemaDocument.type + "'s Config are:"
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
                        text: "This is a list of properties used at the " + appSchemaDocument.type + " configuration. Expanding a property shows you sample values for that property taken from the current Workspace."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
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
                            let nodeArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(rootNode, appSchemaDocument.type)
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
                    if (appSchemaDocument === undefined || appSchemaDocument.editors === undefined || appSchemaDocument.editors.code !== true) { return }
                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Code"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "In this section we will explore " + appSchemaDocument.type + " Node Code."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.initialValues === undefined || appSchemaDocument.initialValues.code === undefined) { return }

                    paragraph = {
                        style: "Subtitle",
                        text: "Initial Value"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "The initial value for " + appSchemaDocument.type + "'s Code is:"
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
                        text: "This is a list of examples used at the " + appSchemaDocument.type + " code collected from this workspace."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
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
                            let nodeArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(rootNode, appSchemaDocument.type)
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
                    if (appSchemaDocument === undefined || appSchemaDocument.editors === undefined || appSchemaDocument.editors.formula !== true) { return }
                    paragraph = {
                        style: "Title",
                        text: "" + appSchemaDocument.type + " Formula"
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
                    paragraph = {
                        style: "Text",
                        text: "In this section we will explore " + appSchemaDocument.type + " Node Code."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++

                    if (appSchemaDocument.initialValues === undefined || appSchemaDocument.initialValues.code === undefined) { return }

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
                        text: "This is a list of examples used at the " + appSchemaDocument.type + " code collected from this workspace."
                    }
                    renderParagraph(paragraph, key)
                    autoGeneratedParagraphIndex++
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
                            let nodeArray = UI.projects.superalgos.utilities.branches.nodeBranchToArray(rootNode, appSchemaDocument.type)
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
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addCodeToCamelCase(innerHTML)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Title': {
                        styleClass = 'class="docs-h3"'
                        prefix = ''
                        role = ''
                        key = key + '-title'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Subtitle': {
                        styleClass = 'class="docs-h4"'
                        prefix = ''
                        role = ''
                        key = key + '-subtitle'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Note': {
                        styleClass = 'class="docs-font-small docs-alert-note"'
                        prefix = '<i class="docs-fa docs-note-circle"></i> <b>Note:</b>'
                        role = 'role="alert"'
                        key = key + '-note'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Success': {
                        styleClass = 'class="docs-font-small docs-alert-success"'
                        prefix = '<i class="docs-fa docs-check-square-o"></i> <b>Tip:</b>'
                        role = 'role="alert"'
                        key = key + '-success'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Important': {
                        styleClass = 'class="docs-font-small docs-alert-important"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Important:</b>'
                        role = 'role="alert"'
                        key = key + '-important'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Warning': {
                        styleClass = 'class="docs-font-small docs-alert-warning"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Warning:</b>'
                        role = 'role="alert"'
                        key = key + '-warning'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Error': {
                        styleClass = 'class="docs-font-small docs-alert-error"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Error:</b>'
                        role = 'role="alert"'
                        key = key + '-error'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Callout': {
                        styleClass = 'class="docs-font-small docs-callout"'
                        prefix = ''
                        role = ''
                        key = key + '-callout'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Summary': {
                        styleClass = 'class="docs-font-small docs-summary"'
                        prefix = '<b>Summary:</b>'
                        role = ''
                        key = key + '-summary'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Section': {
                        styleClass = 'class="docs-section"'
                        prefix = ''
                        role = ''
                        key = key + '-section'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'List': {
                        styleClass = ''
                        prefix = '<li>'
                        sufix = '</li>'
                        role = ''
                        key = key + '-list'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addCodeToCamelCase(innerHTML)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.addBold(innerHTML)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
                        innerHTML = innerHTML + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        break
                    }
                    case 'Table': {
                        styleClass = ''
                        prefix = '<table class="docs-info-table">'
                        sufix = '</table>' + UI.projects.superalgos.utilities.docs.addWarningIfTranslationIsOutdated(paragraph)
                        role = ''
                        key = key + '-table'
                        innerHTML = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(paragraph)
                        innerHTML = UI.projects.superalgos.utilities.docs.addToolTips(innerHTML, objectBeingRendered.type)
                        innerHTML = UI.projects.superalgos.utilities.docs.parseTable(innerHTML)
                        innerHTML = UI.projects.superalgos.utilities.docs.addItalics(innerHTML)
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
                        innerHTML = UI.projects.superalgos.utilities.docs.parseLink(paragraph.text)
                        break
                    }
                    case 'Youtube': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-youtube'
                        innerHTML = UI.projects.superalgos.utilities.docs.UI.projects.superalgos.utilities.docs.parseYoutube(paragraph.text)
                        break
                    }
                    case 'Gif': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-gif'
                        innerHTML = UI.projects.superalgos.utilities.docs.parseGIF(paragraph.text)
                        break
                    }
                    case 'Png': {
                        styleClass = ''
                        prefix = ''
                        sufix = ''
                        role = ''
                        key = key + '-png'
                        innerHTML = UI.projects.superalgos.utilities.docs.parsePNG(paragraph.text)
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
                }

                HTML = HTML + '<p><div id="' + key + '" ' + styleClass + ' ' + role + '>' + prefix + ' ' + innerHTML + sufix + '</div></p>'
                paragraphMap.set(key, paragraph)
            }

            function hightlightEmbeddedCode() {
                _self.Prism.highlightAllUnder(docsContentDiv, true, onHighlighted)
                function onHighlighted() {
                    // nothing to do here
                }
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
                if (appSchemaDocument === undefined) { return }
                if (isNaN(levels) === true) { return }
                if (levels > MAX_COLUMNS) { return }

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

                    if (schemaDocument === undefined) { return }

                    currentRow++

                    let imageItem = {
                        div: 'hierarchy-image-div-' + hierarchyImagesArray.length,
                        project: project,
                        type: schemaDocument.type,
                        size: 50
                    }
                    let imageContainer = '<div id="' + imageItem.div + '" class="docs-hierarchy-image-container"/>'
                    hierarchyImagesArray.push(imageItem)

                    let matrixValue = '<table><tr><td class="docs-hierarchy-table-cell">' + imageContainer + '</td></tr><tr><td  class="docs-hierarchy-table-cell">' + UI.projects.superalgos.utilities.docs.addToolTips(schemaDocument.type, objectBeingRendered.type) + '</td></tr></table>'
                    let matrixRow = contentMatrix[currentRow]
                    matrixRow[currentColumn] = matrixValue

                    if (lastChild === true) {
                        matrixRow[currentColumn - 1] = ELBOW
                    }
                    if (lastChild === false) {
                        matrixRow[currentColumn - 1] = FORK
                    }

                    if (schemaDocument.childrenNodesProperties === undefined) { return }

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
                    Now we will scan the Matrix to put the lines of the hirierchy.
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
                    Add Image Conatiners
                    */
                    for (let i = 0; i < contentMatrix.length; i++) {
                        let matrixRow = contentMatrix[i]
                        for (let j = 0; j < matrixRow.length; j++) {

                            let imageItem = {
                                div: 'hierarchy-image-div-' + hierarchyImagesArray.length,
                                project: 'Superalgos'
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
            if (EDITOR_ON_FOCUS !== true) {
                contextMenuForceOutClick()
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
            collapsibleElementsArray[i].removeEventListener("click", function () { })
        }
    }
}