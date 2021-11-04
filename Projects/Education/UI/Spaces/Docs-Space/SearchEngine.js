function newFoundationsDocsSearchEngine() {
    let thisObject = {
        docsIndex: undefined,
        documentIndex: undefined,
        setUpSearchEngine: setUpSearchEngine,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
        thisObject.docsIndex = []
        thisObject.documentIndex = new FlexSearch.Document({
            preset: "performance",
            worker: true,
            encoder: "advanced",
            tokenize: "forward",
            document: {
                index: [
                    "docsSchemaDocument:type",
                    "text",
                ],
                store: true
            },
        })
    }


    function finalize() {
        thisObject.docsIndex = undefined
    }

    function setUpSearchEngine(callbackFunction) {
        /*
        This is a way to avoid indexing the docs, if the user does not want to.
        */
        let docsSpaceNode = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadByNodeType('Docs Space')
        if (docsSpaceNode !== undefined) {
            if (docsSpaceNode.docsSpaceSettings !== undefined) {
                let indexContent = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(docsSpaceNode.docsSpaceSettings.payload, 'indexContent')
                if (indexContent === false) {
                    callbackFunction()
                    return
                }
            }
        }

        let totalAsyncCallsMade = 0
        let totalAsyncCallsFinished = 0

        setUpWorkspaceSchemas()
        thisObject.docsIndex = []

        for (let j = 0; j < PROJECTS_SCHEMA.length; j++) {
            let project = PROJECTS_SCHEMA[j].name

            let documentIndex

            totalAsyncCallsMade++
            totalAsyncCallsMade++
            totalAsyncCallsMade++
            totalAsyncCallsMade++
            totalAsyncCallsMade++
            totalAsyncCallsMade++
            totalAsyncCallsMade++

            setTimeout(searchInNodes, 10)
            setTimeout(searchInConcepts, 20)
            setTimeout(searchInNTopics, 30)
            setTimeout(searchInTutorials, 40)
            setTimeout(searchInReviews, 50)
            setTimeout(searchInBooks, 60)
            setTimeout(searchInWorkspaces, 70)

            function searchInNodes() {
                /* Search in Nodes */
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.length; i++) {
                    documentIndex = {
                        id: 'Node' + project + i,                     // since we don't have a real ID we concatenate some values to achieve an unique ID
                        docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema[i],
                        category: 'Node',
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema[i]),
                    }

                    thisObject.documentIndex.add(documentIndex)

                }
                asyncCallFinished()
            }

            function searchInConcepts() {
                //!* Search in Concepts *!/
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.length; i++) {
                    documentIndex = {
                        id: 'Concept' + project + i,
                        docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema[i],
                        category: 'Concept',
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema[i])
                    }

                    thisObject.documentIndex.add(documentIndex)
                }
                asyncCallFinished()
            }

            function searchInNTopics() {
                //!* Search in Topics *!/
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.length; i++) {
                    documentIndex = {
                        id: 'Topic' + project + i,
                        docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema[i],
                        category: 'Topic',
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema[i])
                    }
                    thisObject.documentIndex.add(documentIndex)
                }
                asyncCallFinished()
            }

            function searchInTutorials() {
                //!* Search in Tutorials *!/
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema.length; i++) {
                    documentIndex = {
                        id: 'Tutorial' + project + i,
                        docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema[i],
                        category: 'Tutorial',
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema[i])
                    }
                    thisObject.documentIndex.add(documentIndex)
                }
                asyncCallFinished()
            }

            function searchInReviews() {
                //!* Search in Reviews *!/
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema.length; i++) {
                    documentIndex = {
                        id: 'Review' + project + i,
                        docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema[i],
                        category: 'Review',
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema[i])
                    }
                    thisObject.documentIndex.add(documentIndex)
                }
                asyncCallFinished()
            }

            function searchInBooks() {
                //!* Search in Books *!/
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema.length; i++) {
                    documentIndex = {
                        id: 'Book' + project + i,
                        docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema[i],
                        category: 'Book',
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema[i])
                    }
                    thisObject.documentIndex.add(documentIndex)

                }
                asyncCallFinished()
            }

            function searchInWorkspaces() {
                //!* Search in Workspace *!/
                for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema.length; i++) {
                    documentIndex = {
                        id: 'Workspace' + project + i,
                        docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema[i],
                        category: 'Workspace',
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema[i])
                    }
                    thisObject.documentIndex.add(documentIndex)

                }
                asyncCallFinished()
            }

            function asyncCallFinished() {
                totalAsyncCallsFinished++
                if (totalAsyncCallsMade === totalAsyncCallsFinished) {

                    callbackFunction()
                }
            }
        }


        function extractTextContentFromSchemaDocs(docsSchemaDocument) {
            if (docsSchemaDocument === undefined) {
                return
            }

            let textField = ''

            if (docsSchemaDocument.topic !== undefined) {
                let paragraph = {text: docsSchemaDocument.topic}
                appendToTextField(paragraph.text)
            }
            if (docsSchemaDocument.tutorial !== undefined) {
                let paragraph = {text: docsSchemaDocument.tutorial}
                appendToTextField(paragraph.text)
            }
            if (docsSchemaDocument.review !== undefined) {
                let paragraph = {text: docsSchemaDocument.review}
                appendToTextField(paragraph.text)
            }
            if (docsSchemaDocument.type !== undefined) {
                let paragraph = {text: docsSchemaDocument.type}
                appendToTextField(paragraph.text)
            }
            if (docsSchemaDocument.definition !== undefined) {
                let paragraph = {
                    text: docsSchemaDocument.definition.text,
                    translations: docsSchemaDocument.definition.translations
                }
                appendToTextField(' ')
                appendToTextField(paragraph.text)
                indexAllTranslations(paragraph)
            }

            if (docsSchemaDocument.paragraphs !== undefined) {
                for (let k = 0; k < docsSchemaDocument.paragraphs.length; k++) {
                    let paragraph = docsSchemaDocument.paragraphs[k]

                    appendToTextField(' ')
                    appendToTextField(paragraph.text)
                    indexAllTranslations(paragraph)
                }
            }


            function indexAllTranslations(paragraph) {
                if (paragraph.translations === undefined) {
                    return
                }
                for (let j = 0; j < paragraph.translations.length; j++) {
                    let translation = paragraph.translations[j]
                    appendToTextField(' ')
                    appendToTextField(translation.text)
                }
            }

            function appendToTextField(textToAppend) {
                textField += textToAppend
            }

            return textField
        }


    }

    function setUpWorkspaceSchemas() {
        /*
        We will scan the whole workspace and create an array with all of its nodes.
        */
        let workspaceNode = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode
        let rootNodes = workspaceNode.rootNodes
        let allNodesFound = []
        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode !== null) {
                let nodeArray = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(rootNode)
                allNodesFound = allNodesFound.concat(nodeArray)
            }
        }

        /*
        We will create a document for each node, so that can later be indexed into the search engine.
        */
        for (let j = 0; j < PROJECTS_SCHEMA.length; j++) {
            let project = PROJECTS_SCHEMA[j].name
            SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema = []
            SCHEMAS_BY_PROJECT.get(project).map.workspaceSchema = new Map()

            for (let i = 0; i < allNodesFound.length; i++) {
                let node = allNodesFound[i]

                if (node.project === project) {
                    let docsSchemaDocument = createDocsSchemaDocument(node)
                    SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema.push(docsSchemaDocument)
                    SCHEMAS_BY_PROJECT.get(project).map.workspaceSchema.set(node.id, docsSchemaDocument)
                }

            }
            //Ugly hack to insert also the workspace node itself into the list to be indexed later on
            if (project === 'Foundations') {
                let docsSchemaDocument =  createDocsSchemaDocument(workspaceNode)
                SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema.push(docsSchemaDocument)
                SCHEMAS_BY_PROJECT.get(project).map.workspaceSchema.set(workspaceNode.id, docsSchemaDocument)
            }
        }

        function createDocsSchemaDocument(node) {
            let nodeNameTypePath = UI.projects.visualScripting.utilities.hierarchy.getNodeNameTypePath(node)

            let docsSchemaDocument = {
                nodeId: node.id,
                nodeNameTypePath: nodeNameTypePath,
                type: node.type,
                definition: {text: node.name},
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

            return docsSchemaDocument
        }
    }
}