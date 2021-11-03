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
            encoder: "extra",
            tokenize: "full",
            // boost: function (words, term, index) {
            //     let factor = 0;
            //     for (let i = 0; i < words.length; i++) {
            //         if (words[i] === term) factor++;
            //     }
            //     return factor || 1;
            // },
            document: {
                index: [
                    "docsSchemaDocument:type",
                    "text",
                ],
                store: true
            },
        })
    }

    function boostFunction() {
        console.log('boooost')
        return 1
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

            let text = undefined

            if (docsSchemaDocument.topic !== undefined) {
                text = docsSchemaDocument.topic
            }
            if (docsSchemaDocument.tutorial !== undefined) {
                text = docsSchemaDocument.tutorial

            }
            if (docsSchemaDocument.review !== undefined) {
                text = docsSchemaDocument.review
            }
            if (docsSchemaDocument.type !== undefined) {
                text = docsSchemaDocument.type

            }
            if (docsSchemaDocument.definition !== undefined) {
                text = docsSchemaDocument.definition.text
                //TODO: index translations of the definitions as well, export as a Paragraph as in the original impl
            }

            // Appending everything to text field, no need to index it separately for this implementation


            if (docsSchemaDocument.paragraphs !== undefined) {
                for (let k = 0; k < docsSchemaDocument.paragraphs.length; k++) {
                    let paragraph = docsSchemaDocument.paragraphs[k]
                    text += ' '
                    text += paragraph.text
                    indexAllTranslations(paragraph)
                }
            }


            function indexAllTranslations(paragraph) {
                if (paragraph.translations === undefined) {
                    return
                }
                for (let j = 0; j < paragraph.translations.length; j++) {
                    let translation = paragraph.translations[j]
                    text += ' '
                    text += translation.text
                }
            }

            function appendToText(textToAppend) {
                text += textToAppend
            }

            return text
        }


        function indexDocument(documentIndex) {

            if (documentIndex.docsSchemaDocument === undefined) {
                return
            }

            if (documentIndex.docsSchemaDocument.topic !== undefined) {
                let paragraph = {
                    style: 'Topic',
                    text: documentIndex.docsSchemaDocument.topic
                }
                indexParagraph(paragraph)
            }
            if (documentIndex.docsSchemaDocument.tutorial !== undefined) {
                let paragraph = {
                    style: 'Tutorial',
                    text: documentIndex.docsSchemaDocument.tutorial
                }
                indexParagraph(paragraph)
            }
            if (documentIndex.docsSchemaDocument.review !== undefined) {
                let paragraph = {
                    style: 'Review',
                    text: documentIndex.docsSchemaDocument.review
                }
                indexParagraph(paragraph)
            }
            if (documentIndex.docsSchemaDocument.type !== undefined) {
                let paragraph = {
                    style: 'Type',
                    text: documentIndex.docsSchemaDocument.type
                }
                indexParagraph(paragraph)
            }
            if (documentIndex.docsSchemaDocument.definition !== undefined) {
                let paragraph = {
                    style: 'Definition',
                    text: documentIndex.docsSchemaDocument.definition.text,
                    translations: documentIndex.docsSchemaDocument.definition.translations
                }
                indexParagraph(paragraph)
                indexAllTranslations(paragraph)
            }
            if (documentIndex.docsSchemaDocument.paragraphs !== undefined) {
                for (let k = 0; k < documentIndex.docsSchemaDocument.paragraphs.length; k++) {
                    let paragraph = documentIndex.docsSchemaDocument.paragraphs[k]
                    indexParagraph(paragraph)
                    indexAllTranslations(paragraph)
                }
            }

            function indexAllTranslations(paragraph) {
                if (paragraph.translations === undefined) {
                    return
                }
                for (i = 0; i < paragraph.translations.length; i++) {
                    let translation = paragraph.translations[i]
                    translation.style = paragraph.style
                    indexParagraph(translation)
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

                text = UI.projects.foundations.utilities.strings.replaceSpecialCharactersForSpaces(text)

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
                            let key = UI.projects.foundations.utilities.strings.cleanTextOfCommonWordEndings(phrase)

                            let thisPhraseCount = stylePhraseCount.get(key)
                            if (thisPhraseCount === undefined) {
                                thisPhraseCount = 0
                            }
                            thisPhraseCount++

                            stylePhraseCount.set(key, thisPhraseCount)
                        }
                    }
                }
            }
        }
    }

    function setUpWorkspaceSchemas() {
        /*
        We will scan the whole workspace and create an array with all of its nodes.
        */
        let rootNodes = UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes
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
                    SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema.push(docsSchemaDocument)
                    SCHEMAS_BY_PROJECT.get(project).map.workspaceSchema.set(node.id, docsSchemaDocument)
                }
            }
        }
    }
}