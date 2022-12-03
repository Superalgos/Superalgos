function newEducationFunctionLibraryDocsStatisticsFunctions() {
    let thisObject = {
        printDocsStats: printDocsStats
    }

    return thisObject

    function printDocsStats(
        node,
        rootNodes
    ) {
        console.log("Docs Statistical Report:")
        let documentPage
        let pagesCount = 0
        let projectStats = {}

        // Create Stats for each project
        for (let j = 0; j < PROJECTS_SCHEMA.length; j++) {
            let project = PROJECTS_SCHEMA[j].name
            projectStats[project] = 0
        }
        
        for (let i = 0; i < UI.projects.education.spaces.docsSpace.searchEngine.docsIndex.length; i++) {
            documentPage = UI.projects.education.spaces.docsSpace.searchEngine.docsIndex[i]
            pagesCount += 1
            let lastValue
            if (projectStats[documentPage.project] !== undefined) {
                lastValue = projectStats[documentPage.project]
            }
            projectStats[documentPage.project] = lastValue + 1

            //will need to access documentPage.docsSchemaDocument.paragraphs then for each paragraph paragraph.translations
            
        }
        console.log("We have this many pages " + pagesCount + " total across all projects.")
        for (let project in projectStats) {
            console.log(`There are this many pages ${projectStats[project]} in the ${project} project`)
        }
    }
}
