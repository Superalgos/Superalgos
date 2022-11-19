const {info} = require('./Logger').logger

exports.docsSearchEngine = function docsSearchEngine() {
    let thisObject = {
        setUpSearchEngine: setUpSearchEngine,
    }

    return thisObject

    function initialize() {
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

    function setUpSearchEngine() {
        const schemaTypes = ED.schemas.schemaTypes

        let docsIndex = []

        for (let j = 0; j < PROJECTS_SCHEMA.length; j++) {
            const project = PROJECTS_SCHEMA[j].name
            info('SearchEngine'.padEnd(20) + ' -> ' + project + ' -> indexing')
            
            for(let s = 0; s < schemaTypes.length; s++ ) {
                docsIndex = docsIndex.concat(searchSchema(schemaTypes[s]))
	        }
            
            function searchSchema(schemaType) {
                info('SearchEngine'.padEnd(20) + ' -> ' + project + ' -> ' + schemaType.category + ' -> indexing schema')
		        const schemaArray = SCHEMAS_BY_PROJECT.get(project).array[schemaType.key]
                return schemaArray.map((schema, i) => ({
                        id: schema.category + project + i, // since we don't have a real ID we concatenate some values to achieve an unique ID
                        docsSchemaDocument: schema,
                        category: schema.category,
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(schema),
                }))
            }

            info('SearchEngine'.padEnd(20) + ' -> ' + project + ' -> indexing completed')


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

        SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_PAGES_DIR + '/search.json', JSON.stringify(docsIndex))
    }
}
