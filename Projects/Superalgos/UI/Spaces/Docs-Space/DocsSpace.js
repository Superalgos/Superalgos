function newSuperalgosDocSpace() {
    const MODULE_NAME = 'Doc Space'
    let thisObject = {
        sidePanelTab: undefined,
        container: undefined,
        navigateTo: navigateTo,
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
    let renderingNode
    let docSchemaParagraphMap
    let nodeAppDefinition
    let nodeDocsDefinition

    return thisObject

    function initialize() {
        thisObject.sidePanelTab = newSidePanelTab()
        thisObject.sidePanelTab.container.connectToParent(thisObject.container, false, false)
        thisObject.sidePanelTab.initialize('right')
        openingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('opening', onOpening)
        closingEventSubscriptionId = thisObject.sidePanelTab.container.eventHandler.listenToEvent('closing', onClosing)

        browserResizedEventSubscriptionId = canvas.eventHandler.listenToEvent('Browser Resized', resize)
        setUpContextMenu()
        isInitialized = true

        function setUpContextMenu() {
            window.contextMenu = {
                editParagraph: editParagraph,
                addParagraph: addParagraph,
                toJsCode: toJsCode,
                toJsonCode: toJsonCode,
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

            function addParagraph() {
                contextMenuForceOutClick()
            }

            function toJsCode() {

            }

            function toJsonCode() {

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
    }

    function finalize() {
        canvas.eventHandler.stopListening(browserResizedEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(openingEventSubscriptionId)
        thisObject.sidePanelTab.container.eventHandler.stopListening(closingEventSubscriptionId)

        renderingNode = undefined
        docSchemaParagraphMap = undefined
        nodeAppDefinition = undefined
        nodeDocsDefinition = undefined
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
                    docSchemaParagraph.text = textArea.value
                    break
                }
                case "Definition": {
                    /*
                    This means that the definition was being edited.
                    */
                    nodeDocsDefinition.definition = textArea.value
                    break
                }
            }
            EDITOR_ON_FOCUS = false
            renderPage()
        }
    }

    function contextMenuActivateRightClick() {
        const contextMenuClickablDiv = document.getElementById('context-menu-clickable-div')
        const menu = document.getElementById('menu')
        const outClick = document.getElementById('docsDiv')

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
        const outClick = document.getElementById('docsDiv')
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

        selectedParagraph = paragraphNode
        selectedParagraphHeight = paragraphNode.getClientRects()[0].height
        return true
    }


    function onOpening() {

    }

    function onClosing() {

    }

    function navigateTo(node) {

        docSchemaParagraphMap = new Map()
        renderingNode = {
            type: node.type,
            project: node.project
        }

        renderPage()
    }

    function renderPage() {

        nodeAppDefinition = SCHEMAS_BY_PROJECT.get(renderingNode.project).map.appSchema.get(renderingNode.type)
        nodeDocsDefinition = SCHEMAS_BY_PROJECT.get(renderingNode.project).map.docSchema.get(renderingNode.type)

        if (nodeDocsDefinition === undefined) {
            // Use the New Node Template
            return
        }
        buildNodeHtmlPage()
        contextMenuActivateRightClick()

        function buildNodeHtmlPage() {
            let HTML = ''

            HTML = HTML + '<div id="context-menu-clickable-div" class="docs-node-html-page-container">' // Container Starts

            /* Title */
            HTML = HTML + '<div><h2 class="docs-h2" id="' + renderingNode.type.toLowerCase().replace(' ', '-') + '" > ' + renderingNode.project + ' / ' + renderingNode.type + '</h2></div>'

            /* We start with the Definition Table */
            if (nodeDocsDefinition.definition !== undefined) {
                HTML = HTML + '<table class="docs-definitionTable">'
                HTML = HTML + '<tr>'
                HTML = HTML + '<td width=150px>'
                HTML = HTML + '<div id="definitionImageDiv" class="docs-image-container"/>'
                HTML = HTML + '</td>'
                HTML = HTML + '<td>'
                HTML = HTML + '<div id="definition-paragraph" class="docs-normal-font"><strong>' + addToolTips(renderingNode, nodeDocsDefinition.definition) + '</strong></div>'
                HTML = HTML + '</td>'
                HTML = HTML + '</tr>'
                HTML = HTML + '</table>'
            }

            HTML = HTML + '<div id="docs-content">'

            if (nodeDocsDefinition.paragraphs !== undefined) {
                for (let i = 0; i < nodeDocsDefinition.paragraphs.length; i++) {
                    let paragraph = nodeDocsDefinition.paragraphs[i]
                    let innerHTML = addToolTips(renderingNode, paragraph.text)
                    let styleClass = ''
                    let prefix = ''
                    let sufix = ''
                    let role = ''
                    let key = 'paragraph-' + i

                    switch (paragraph.style) {
                        case 'Text': {
                            styleClass = ''
                            prefix = ''
                            role = ''
                            key = key + '-text'
                            innerHTML = addToolTips(renderingNode, paragraph.text)
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
                            styleClass = ''
                            prefix = 'class="docs-h4"'
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
                            innerHTML = addToolTips(renderingNode, paragraph.text)
                            break
                        }
                        case 'Success': {
                            styleClass = 'class="docs-font-small docs-alert-success"'
                            prefix = '<i class="docs-fa docs-check-square-o"></i> <b>Tip:</b>'
                            role = 'role="alert"'
                            key = key + '-success'
                            innerHTML = addToolTips(renderingNode, paragraph.text)
                            break
                        }
                        case 'Important': {
                            styleClass = 'class="docs-font-small docs-alert-important"'
                            prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Important:</b>'
                            role = 'role="alert"'
                            key = key + '-important'
                            innerHTML = addToolTips(renderingNode, paragraph.text)
                            break
                        }
                        case 'Warning': {
                            styleClass = 'class="docs-font-small docs-alert-warning"'
                            prefix = '<i class="docs-fa docs-warning-sign"></i> <b>Warning:</b>'
                            role = 'role="alert"'
                            key = key + '-warning'
                            innerHTML = addToolTips(renderingNode, paragraph.text)
                            break
                        }
                        case 'List': {
                            styleClass = ''
                            prefix = '<li>'
                            sufix = '</li>'
                            role = ''
                            key = key + '-list'
                            innerHTML = addToolTips(renderingNode, paragraph.text)
                            break
                        }
                    }

                    HTML = HTML + '<p><div id="' + key + '" ' + styleClass + ' ' + role + '">' + prefix + ' ' + innerHTML + sufix + '</div></p>'
                    docSchemaParagraphMap.set(key, paragraph)
                }
            }

            HTML = HTML + '</div>' // Content Ends

            HTML = HTML + '</div>' // Container Ends

            let docsAppDiv = document.getElementById('docsDiv')
            docsAppDiv.innerHTML = HTML + addFooter()

            if (nodeDocsDefinition.definition !== undefined) {
                addDefinitionImage(nodeAppDefinition, renderingNode.project)
            }

            function addFooter() {
                let HTML = ''
                HTML = HTML + '<hr class="docs-shaded"></hr>'
                HTML = HTML + '<footer>'
                HTML = HTML + '<div class="docs-footer-row">'
                HTML = HTML + '<div class="docs-footer-body" style="text-align: left;">'
                HTML = HTML + '<p><a href="#"><kbd>BACK TO TOP ↑</kbd></a></p>'

                HTML = HTML + '<ul>'
                HTML = HTML + '<li><a href="https://superalgos.org/" target="_blank">Superalgos Project</a> — Learn more about the project.</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgoscommunity" rel="nofollow" target="_blank">Community Group</a> — Lets talk Superalgos!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgossupport" rel="nofollow" target="_blank">Support Group</a> — Need help using the <code>master</code> branch?</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgosdevelop" rel="nofollow" target="_blank">Develop Group</a> — Come test the <code>develop</code> branch!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgosuxui" rel="nofollow" target="_blank">UX/UI Design Group</a> — Help us improve the GIU!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgos_es" rel="nofollow" target="_blank">Grupo en Español</a> — Hablemos en español!</li>'
                HTML = HTML + '<li><a href="https://t.me/superalgos" rel="nofollow" target="_blank">Superalgos Announcements</a> — Be the first to know about new releases, hotfixes, and important issues.</li>'
                HTML = HTML + '</ul>'
                HTML = HTML + '<img src="Images/superalgos-logo.png" width="200 px">'

                HTML = HTML + '</div>'
                HTML = HTML + '</div>'
                HTML = HTML + '</footer>'
                return HTML
            }
        }

        thisObject.sidePanelTab.open()
    }

    function addDefinitionImage(nodeAppDefinition, project) {
        if (nodeAppDefinition.icon === undefined) {
            imageName = nodeAppDefinition.type.toLowerCase().replace(' ', '-')
        }
        let htmlImage = document.createElement("IMG")
        let webParam = 'Icons/' + project + '/' + imageName + '.png'

        htmlImage.src = webParam
        htmlImage.width = "150"
        htmlImage.height = "150"

        let definitionImageDiv = document.getElementById('definitionImageDiv')
        definitionImageDiv.appendChild(htmlImage)
    }

    function addToolTips(node, text) {

        const TOOL_TIP_HTML = '<div class="docs-tooltip">NODE_TYPE<span class="docs-tooltiptext">NODE_DEFINITION</span></div>'
        let resultingText = ''
        text = tagNodeTypes(text, node.type)
        let splittedText = text.split('->')

        for (let i = 0; i < splittedText.length; i = i + 2) {
            let firstPart = splittedText[i]
            let nodeType = splittedText[i + 1]
            if (nodeType === undefined) {
                return resultingText + firstPart
            }
            /*
            We will search across all DOC and CONCEPT SCHEMAS
            */
            let found = false
            let definitionNode

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(nodeType)
                if (definitionNode !== undefined) {
                    found = true
                    break
                }
                definitionNode = SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(nodeType)
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
                resultingText = resultingText + firstPart + nodeType
            } else {
                let tooltip = TOOL_TIP_HTML.replace('NODE_TYPE', nodeType).replace('NODE_DEFINITION', definition)
                resultingText = resultingText + firstPart + tooltip
            }
        }
        return resultingText
    }

    function tagNodeTypes(text, excludeNodeType) {
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
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase4) !== undefined && cleanPhrase4 !== excludeNodeType) {
                    taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + cleanPhrase4 + '->') + ' '
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase3) !== undefined && cleanPhrase3 !== excludeNodeType) {
                    taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + cleanPhrase3 + '->') + ' '
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase2) !== undefined && cleanPhrase2 !== excludeNodeType) {
                    taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + cleanPhrase2 + '->') + ' '
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docSchema.get(cleanPhrase1) !== undefined && cleanPhrase1 !== excludeNodeType) {
                    taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + cleanPhrase1 + '->') + ' '
                    found = true
                    break
                }

                /* Search in conceptSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase4) !== undefined && cleanPhrase4 !== excludeNodeType) {
                    taggedText = taggedText + phrase4.replace(cleanPhrase4, '->' + cleanPhrase4 + '->') + ' '
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase3) !== undefined && cleanPhrase3 !== excludeNodeType) {
                    taggedText = taggedText + phrase3.replace(cleanPhrase3, '->' + cleanPhrase3 + '->') + ' '
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase2) !== undefined && cleanPhrase2 !== excludeNodeType) {
                    taggedText = taggedText + phrase2.replace(cleanPhrase2, '->' + cleanPhrase2 + '->') + ' '
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.conceptSchema.get(cleanPhrase1) !== undefined && cleanPhrase1 !== excludeNodeType) {
                    taggedText = taggedText + phrase1.replace(cleanPhrase1, '->' + cleanPhrase1 + '->') + ' '
                    found = true
                    break
                }
            }

            if (found === false) {
                taggedText = taggedText + phrase1 + ' '
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
        }
        return taggedText
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
            let docsAppDiv = document.getElementById('docsDiv')
            docsAppDivPosition = {
                x: 0,
                y: 0
            }
            docsAppDivPosition = thisObject.container.frame.frameThisPoint(docsAppDivPosition)
            docsAppDiv.style = '   ' +
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
