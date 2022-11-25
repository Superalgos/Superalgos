const {info} = require('./Logger').logger

exports.docsSearchEngine = function docsSearchEngine() {
    let thisObject = {
        setUpSearchEngine: setUpSearchEngine,
    }

    return thisObject

    function setUpSearchEngine() {
        const schemaTypes = ED.schemas.schemaTypes.filter(t => t.category !== 'App-Schema')

        const filePaths = []
        
        for (let j = 0; j < PROJECTS_SCHEMA.length; j++) {
            let docsIndex = []
            const project = PROJECTS_SCHEMA[j].name
            info('SearchEngine'.padEnd(20) + ' -> ' + project + ' -> indexing')
            
            for(let s = 0; s < schemaTypes.length; s++ ) {
                docsIndex = docsIndex.concat(searchSchema(schemaTypes[s]))
	        }
            
            function searchSchema(schemaType) {
                info('SearchEngine'.padEnd(20) + ' -> ' + project + ' -> ' + schemaType.category + ' -> indexing schema')
		        const schemaArray = SCHEMAS_BY_PROJECT.get(project).array[schemaType.key]
                return schemaArray.map((schema, i) => ({
                        id: schemaType.category + project + i, // since we don't have a real ID we concatenate some values to achieve a unique ID
                        docsSchemaDocument: schema,
                        category: schemaType.category,
                        project: project,
                        // We are creating a single field containing the definition and paragraphs concatenated, leveraging the search logic to the algorithm
                        text: extractTextContentFromSchemaDocs(schema),
                }))
            }

            info('SearchEngine'.padEnd(20) + ' -> ' + project + ' -> indexing completed')

            SA.projects.foundations.utilities.filesAndDirectories.createNewDir(global.env.PATH_TO_PAGES_DIR + '/' + project)
            SA.nodeModules.fs.writeFileSync(global.env.PATH_TO_PAGES_DIR + '/' + project + '/search.json', JSON.stringify(docsIndex))
            filePaths.push(global.env.REMOTE_DOCS_DIR + project + '/search.json')
            
            info('SearchEngine'.padEnd(20) + ' -> ' + project + ' -> indexing saved')

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

        updateSearchJsWithProjectFiles(filePaths)
    }

    /**
     * 
     * @param {string[]} files 
     */
    function updateSearchJsWithProjectFiles(files) {
        jsFileLocation = ED.searchJs.replace(global.env.EXPORT_DOCS_DIR, global.env.PATH_TO_PAGES_DIR)
        let searchJsFile = SA.nodeModules.fs.readFileSync(jsFileLocation, 'utf8')
        searchJsFile = searchJsFile.replace('__PROJECTS__', JSON.stringify(files))
            .replace('__BASE_URL__', '"' + global.env.REMOTE_DOCS_DIR.substring(0, global.env.REMOTE_DOCS_DIR.length-1) + '"')
            .replace('__LINK_EXT__', (ED.asShtml ? '".shtml"' : '".html"'))
        SA.nodeModules.fs.writeFileSync(jsFileLocation, searchJsFile)
    }
}
