function newSuperalgosDocsSearchEngine() {
    let thisObject = {
        docsIndex: undefined,
        setUpSearchEngine: setUpSearchEngine,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {
        thisObject.docsIndex = []
    }

    function finalize() {
        thisObject.docsIndex = undefined
    }

    function setUpSearchEngine() {
        thisObject.docsIndex = []

        for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
            let project = PROJECTS_ARRAY[j]

            let documentIndex

            /* Search in Nodes */
            for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.length; i++) {
                documentIndex = {
                    phraseCount: {},                // here we have an object with properties matching it paragraph style, and each property is a map of phrases and their total count.
                    docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema[i],
                    category: 'Node',
                    project: project
                }
                indexDocument(documentIndex)
                thisObject.docsIndex.push(documentIndex)
            }
            /* Search in Concepts */
            for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.length; i++) {
                documentIndex = {
                    phraseCount: {},                // here we have an object with properties matching it paragraph style, and each property is a map of phrases and their total count.
                    docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema[i],
                    category: 'Concept',
                    project: project
                }
                indexDocument(documentIndex)
                thisObject.docsIndex.push(documentIndex)
            }
            /* Search in Topics */
            for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.length; i++) {
                documentIndex = {
                    phraseCount: {},                // here we have an object with properties matching it paragraph style, and each property is a map of phrases and their total count.
                    docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema[i],
                    category: 'Topic',
                    project: project
                }
                indexDocument(documentIndex)
                thisObject.docsIndex.push(documentIndex)
            }
            /* Search in Workspace */
            for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema.length; i++) {
                documentIndex = {
                    phraseCount: {},                // here we have an object with properties matching it paragraph style, and each property is a map of phrases and their total count.
                    docsSchemaDocument: SCHEMAS_BY_PROJECT.get(project).array.workspaceSchema[i],
                    category: 'Workspace',
                    project: project
                }
                indexDocument(documentIndex)
                thisObject.docsIndex.push(documentIndex)
            }
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
                if (paragraph.translations === undefined) { return }
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

                text = UI.projects.superalgos.utilities.strings.replaceSpecialCharactersForSpaces(text)

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
                            let key = UI.projects.superalgos.utilities.strings.cleanTextOfCommonWordEndings(phrase)

                            let thisPhraseCount = stylePhraseCount.get(key)
                            if (thisPhraseCount === undefined) { thisPhraseCount = 0 }
                            thisPhraseCount++

                            stylePhraseCount.set(key, thisPhraseCount)
                        }
                    }
                }
            }
        }
    }
}