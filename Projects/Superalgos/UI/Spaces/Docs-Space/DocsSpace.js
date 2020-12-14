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
    let docSchemaParagraphMap
    let nodeAppDefinition
    let nodeDocsDefinition
    let menuLabelsMap = new Map()

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
                toList: toList
            }

            function editParagraph() {
                contextMenuForceOutClick()
                showHTMLTextArea()

                function showHTMLTextArea() {
                    if (selectedParagraph === undefined) { return }

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
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Javascript'
                renderPage()
            }

            function toJson() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Json'
                renderPage()
            }

            function toText() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Text'
                renderPage()
            }

            function toTitle() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Title'
                renderPage()
            }

            function toSubtitle() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Subtitle'
                renderPage()
            }

            function toNote() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Note'
                renderPage()
            }

            function toWarning() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Warning'
                renderPage()
            }

            function toImportant() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Important'
                renderPage()
            }

            function toSuccess() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'Success'
                renderPage()
            }

            function toList() {
                let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                docSchemaParagraph.style = 'List'
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
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)

        objectBeingRendered = undefined
        docSchemaParagraphMap = undefined
        nodeAppDefinition = undefined
        nodeDocsDefinition = undefined
        menuLabelsMap = undefined
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
                    let docSchemaParagraph = docSchemaParagraphMap.get(selectedParagraph.id)
                    /*
                    We will detect if the user has created new paragraphs while editing.
                    For that we will inspect the value of the text area looking for a char
                    code representing carriedge return.
                    */
                    let paragraphs = []
                    let paragraph = ''
                    let splittedSelectedParagraph = selectedParagraph.id.split('-')
                    let selectedParagraphIndex = Number(splittedSelectedParagraph[1])
                    let selectedParagraphStyle = splittedSelectedParagraph[2]
                    let style = selectedParagraphStyle.charAt(0).toUpperCase() + selectedParagraphStyle.slice(1);

                    for (let i = 0; i < textArea.value.length; i++) {
                        if (textArea.value.charCodeAt(i) === 10 && style !== 'Javascript' && style !== 'Json') {
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

        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            paragraphNode = paragraphNode.parentNode
        }
        if (paragraphNode.id === undefined || paragraphNode.id.indexOf('paragraph') < 0) {
            return false
        }

        /*
        Depending on the Style of Paragraph we will need to remove
        some info from the innerText. 
        */
        if (paragraphNode.id.indexOf('definition') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('text') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('title') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('subtitle') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('note') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(6, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('success') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(5, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('important') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(11, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('warning') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(10, paragraphNode.innerText.length)
        }
        if (paragraphNode.id.indexOf('list') >= 0) {
            selectedParagraphData = paragraphNode.innerText
        }
        if (paragraphNode.id.indexOf('javascript') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(1, paragraphNode.innerText.length - 1)
        }
        if (paragraphNode.id.indexOf('json') >= 0) {
            selectedParagraphData = paragraphNode.innerText.substring(1, paragraphNode.innerText.length - 1)
        }

        selectedParagraph = paragraphNode
        selectedParagraphHeight = paragraphNode.getClientRects()[0].height
        return true
    }

    function onOpening() {

    }

    function onClosing() {

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

        disableCollapsibleContent()

        docSchemaParagraphMap = new Map()
        objectBeingRendered = {
            category: category,
            type: type,
            project: project
        }

        renderPage()
        enableCollapsibleContent()
        scrollToElement('docs-context-menu-clickeable-div')

    }

    function renderPage() {

        nodeAppDefinition = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.appSchema.get(objectBeingRendered.type)
        nodeDocsDefinition = SCHEMAS_BY_PROJECT.get(objectBeingRendered.project).map.docSchema.get(objectBeingRendered.type)

        if (nodeDocsDefinition === undefined) {
            // Use the New Node Template
            return
        }
        buildHtmlPage()
        contextMenuActivateRightClick()

        function buildHtmlPage() {
            let HTML = ''

            HTML = HTML + '<div id="docs-context-menu-clickeable-div" class="docs-node-html-page-container">' // Container Starts

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
                HTML = HTML + '<div id="definition-paragraph" class="docs-normal-font"><strong>' + addToolTips(nodeDocsDefinition.definition) + '</strong></div>'
                HTML = HTML + '</td>'
                HTML = HTML + '</tr>'
                HTML = HTML + '</table>'
            }


            HTML = HTML + '<table class="docs-info-table">'
            HTML = HTML + '<thead>'
            HTML = HTML + '<tr>'
            HTML = HTML + '<th>Support Properties</th>'
            HTML = HTML + '<th>Possible Values of (i)</th>'
            HTML = HTML + '<th>Comments</th>'
            HTML = HTML + '</tr>'
            HTML = HTML + '</thead>'
            HTML = HTML + '<tbody>'
            HTML = HTML + '<tr>'
            HTML = HTML + '<td>support(i)Rate</td>'
            HTML = HTML + '<td>1 to 5</td>'
            HTML = HTML + '<td>The reference rate of the level.</td>'
            HTML = HTML + '</tr>'
            HTML = HTML + '<tr class="docs-info-table-alt-bg">'
            HTML = HTML + '<td>support(i)Period</td>'
            HTML = HTML + '<td>1 to 5</td>'
            HTML = HTML + '<td>The number of periods the level has been in existence.</td>'
            HTML = HTML + '</tr>'
            HTML = HTML + '<tr>'
            HTML = HTML + '<td>support(i)Bounce1</td>'
            HTML = HTML + '<td>1 to 5</td>'
            HTML = HTML + '<td>The number of bounces for zone 1, the one rendered on-screen.</td>'
            HTML = HTML + '</tr>'
            HTML = HTML + '<tr class="docs-info-table-alt-bg">'
            HTML = HTML + '<td>support(i)Bounce2</td>'
            HTML = HTML + '<td>1 to 3</td>'
            HTML = HTML + '<td>The number of bounces for zone 2, only available for the first three levels. Zone 2 is two times bigger than zone 1.</td>'
            HTML = HTML + '</tr>'
            HTML = HTML + '</tbody>'
            HTML = HTML + '</table>'

            HTML = HTML + '<div id="docs-content">'

            let paragraphIndex = 0
            if (nodeDocsDefinition.paragraphs !== undefined) {
                for (let i = 0; i < nodeDocsDefinition.paragraphs.length; i++) {
                    let key = 'editable-paragraph-' + paragraphIndex
                    let paragraph = nodeDocsDefinition.paragraphs[i]
                    renderParagraph(paragraph, key)
                    docSchemaParagraphMap.set(key, paragraph)
                    paragraphIndex++
                }
            }

            autoGeneratedHtml()
            HTML = HTML + '</div>' // Content Ends
            HTML = HTML + '</div>' // Container Ends

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
                        text: "Some types of node, might have code that defines it's behaviour. The code is can usually be accesed by users via the Edit menu item. "
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
                        text: "Some types of node represents Formulas and they hold code that defines that formula. The code is can usually be accesed by users via the Edit menu item. "
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
                let innerHTML = addToolTips(paragraph.text)
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
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Success': {
                        styleClass = 'class="docs-font-small docs-alert-success"'
                        prefix = '<i class="docs-fa docs-check-square-o"></i> <b>Tip:</b>'
                        role = 'role="alert"'
                        key = key + '-success'
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Important': {
                        styleClass = 'class="docs-font-small docs-alert-important"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Important:</b>'
                        role = 'role="alert"'
                        key = key + '-important'
                        innerHTML = addItalics(innerHTML)
                        innerHTML = addToolTips(innerHTML)
                        break
                    }
                    case 'Warning': {
                        styleClass = 'class="docs-font-small docs-alert-warning"'
                        prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Warning:</b>'
                        role = 'role="alert"'
                        key = key + '-warning'
                        innerHTML = addItalics(innerHTML)
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
            }

            function hightlightEmbeddedCode() {
                _self.Prism.highlightAllUnder(docsSpaceDiv, true, onHighlighted)
                function onHighlighted() {
                    // nothing to do here
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
        text = tagNodesAndConceptTypes(text, objectBeingRendered.type)
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
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(type)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(type)
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

    function tagNodesAndConceptTypes(text, excludeNodesAndConceptTypes) {
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

                /* Search in docSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + 'Node' + '|' + cleanPhrase4 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + 'Node' + '|' + cleanPhrase3 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + 'Node' + '|' + cleanPhrase2 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + 'Node' + '|' + cleanPhrase1 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase1 + ' '
                    }
                    found = true
                    break
                }

                /* Search in conceptSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + 'Concept' + '|' + cleanPhrase4 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + 'Concept' + '|' + cleanPhrase3 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + 'Concept' + '|' + cleanPhrase2 + '|' + project + '->') + ' '
                    } else {
                        taggedText = taggedText + cleanPhrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludeNodesAndConceptTypes) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + 'Concept' + '|' + cleanPhrase1 + '|' + project + '->') + ' '
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
        thisObject.container.frame.width = 800
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
