function newSuperalgosDocsSearchResultsPage() {
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

    function render() {

        let resultsArary = []
        let initialTime = new Date()
        buildResultsArray()
        buildHTML()

        function buildResultsArray() {
            for (let i = 0; i < UI.projects.superalgos.spaces.docsSpace.searchEngine.docsIndex.length; i++) {
                let documentIndex = UI.projects.superalgos.spaces.docsSpace.searchEngine.docsIndex[i]
                let documentPoints = 0

                for (const style in documentIndex.phraseCount) {
                    let key = UI.projects.superalgos.utilities.strings.cleanTextOfCommonWordEndings(UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase())
                    let thisPhraseCount = documentIndex.phraseCount[style].get(key)
                    if (thisPhraseCount === undefined) {
                        thisPhraseCount = 0
                    }

                    if (documentIndex.docsSchemaDocument.type !== undefined) {
                        if (key === UI.projects.superalgos.utilities.strings.cleanTextOfCommonWordEndings(documentIndex.docsSchemaDocument.type.toLowerCase())) {
                            documentPoints = documentPoints + thisPhraseCount * 100
                        }
                    }
                    if (documentIndex.docsSchemaDocument.topic !== undefined) {
                        if (key === UI.projects.superalgos.utilities.strings.cleanTextOfCommonWordEndings(documentIndex.docsSchemaDocument.topic.toLowerCase())) {
                            documentPoints = documentPoints + thisPhraseCount * 200
                        }
                    }
                    if (documentIndex.docsSchemaDocument.tutorial !== undefined) {
                        if (key === UI.projects.superalgos.utilities.strings.cleanTextOfCommonWordEndings(documentIndex.docsSchemaDocument.tutorial.toLowerCase())) {
                            documentPoints = documentPoints + thisPhraseCount * 200
                        }
                    }
                    if (documentIndex.docsSchemaDocument.review !== undefined) {
                        if (key === UI.projects.superalgos.utilities.strings.cleanTextOfCommonWordEndings(documentIndex.docsSchemaDocument.review.toLowerCase())) {
                            documentPoints = documentPoints + thisPhraseCount * 200
                        }
                    }

                    switch (style) {
                        case 'topic': {
                            documentPoints = documentPoints + thisPhraseCount * 100
                            break
                        }
                        case 'tutorial': {
                            documentPoints = documentPoints + thisPhraseCount * 100
                            break
                        }
                        case 'review': {
                            documentPoints = documentPoints + thisPhraseCount * 100
                            break
                        }
                        case 'type': {
                            documentPoints = documentPoints + thisPhraseCount * 50
                            break
                        }
                        case 'definition': {
                            documentPoints = documentPoints + thisPhraseCount * 9
                            break
                        }
                        case 'title': {
                            documentPoints = documentPoints + thisPhraseCount * 10
                            break
                        }
                        case 'subtitle': {
                            documentPoints = documentPoints + thisPhraseCount * 8
                            break
                        }
                        case 'text': {
                            documentPoints = documentPoints + thisPhraseCount * 2
                            break
                        }
                        case 'list': {
                            documentPoints = documentPoints + thisPhraseCount * 2
                            break
                        }
                        case 'note': {
                            documentPoints = documentPoints + thisPhraseCount * 4
                            break
                        }
                        case 'warning': {
                            documentPoints = documentPoints + thisPhraseCount * 6
                            break
                        }
                        case 'error': {
                            documentPoints = documentPoints + thisPhraseCount * 6
                            break
                        }
                        case 'important': {
                            documentPoints = documentPoints + thisPhraseCount * 7
                            break
                        }
                        case 'success': {
                            documentPoints = documentPoints + thisPhraseCount * 5
                            break
                        }
                        case 'callout': {
                            documentPoints = documentPoints + thisPhraseCount * 5
                            break
                        }
                        case 'summary': {
                            documentPoints = documentPoints + thisPhraseCount * 6
                            break
                        }
                        case 'section': {
                            documentPoints = documentPoints + thisPhraseCount * 8
                            break
                        }
                        case 'table': {
                            documentPoints = documentPoints + thisPhraseCount * 3
                            break
                        }
                        case 'hierarchy': {
                            documentPoints = documentPoints + thisPhraseCount * 3
                            break
                        }
                        case 'json': {
                            documentPoints = documentPoints + thisPhraseCount * 2
                            break
                        }
                        case 'javascript': {
                            documentPoints = documentPoints + thisPhraseCount * 2
                            break
                        }
                        case 'gif': {
                            documentPoints = documentPoints + thisPhraseCount * 1
                            break
                        }
                        case 'png': {
                            documentPoints = documentPoints + thisPhraseCount * 1
                            break
                        }
                        case 'anchor': {
                            documentPoints = documentPoints + thisPhraseCount * 0
                            break
                        }
                        case 'block': {
                            documentPoints = documentPoints + thisPhraseCount * 0
                            break
                        }
                        case 'include': {
                            documentPoints = documentPoints + thisPhraseCount * 0
                            break
                        }
                        case 'placeholder': {
                            documentPoints = documentPoints + thisPhraseCount * 0
                            break
                        }
                        case 'link': {
                            documentPoints = documentPoints + thisPhraseCount * 1
                            break
                        }
                        case 'youtube': {
                            documentPoints = documentPoints + thisPhraseCount * 1
                            break
                        }
                        case 'chapter': {
                            documentPoints = documentPoints + thisPhraseCount * 8
                            break
                        }
                    }
                }

                if (documentPoints === 0) { continue } // No matches anywhere

                let result = {
                    documentIndex: documentIndex,
                    documentPoints: documentPoints
                }
                let added = false

                if (resultsArary.length === 0) {
                    resultsArary.push(result)
                    added = true
                } else {
                    for (let j = 0; j < resultsArary.length; j++) {
                        let thisResult = resultsArary[j]
                        if (result.documentPoints > thisResult.documentPoints) {
                            resultsArary.splice(j, 0, result)
                            added = true
                            break
                        }
                    }
                }
                if (added === false) {
                    resultsArary.push(result)
                }
            }
        }

        function buildHTML() {
            const tabs = ['All', 'Nodes', 'Concepts', 'Topics', 'Tutorials', 'Reviews', 'Books', 'Workspace']
            let HTML = ''
            HTML = HTML + '<section id="docs-search-results-div" class="docs-search-page-container">'
            HTML = HTML + UI.projects.superalgos.spaces.docsSpace.mainSearchPage.addSearchHeader()

            // Tabs
            HTML = HTML + '<div class="docs-search-results-header-tabs-container">'
            let checked = ' checked=""'
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i]
                HTML = HTML + '<input id="tab' + (i + 1) + '" type="radio" name="tabs"' + checked + '><label for="tab' + (i + 1) + '">' + tab + '</label>'
                checked = ''
            }

            // Results
            HTML = HTML + '<div class="docs-search-result-content">'

            let totalResults = new Map()
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i]
                HTML = HTML + '<div id="content' + (i + 1) + '">'
                HTML = HTML + '<p> ' + tab.toUpperCase() + '_TOTAL_RESULTS results (' + tab.toUpperCase() + '_TOTAL_SECONDS seconds)</p>'

                let resultCounter = 0
                for (let j = 0; j < resultsArary.length; j++) {
                    let result = resultsArary[j]

                    if (tab !== 'All') {
                        if (tab.indexOf(result.documentIndex.category) < 0) {
                            continue
                        }
                    }
                    resultCounter++

                    /* Lets see if we can show a path */
                    let path = ''
                    if (result.documentIndex.docsSchemaDocument.nodeNameTypePath !== undefined) {
                        let linkLabel
                        for (let i = 0; i < result.documentIndex.docsSchemaDocument.nodeNameTypePath.length; i++) {
                            let pathStep = result.documentIndex.docsSchemaDocument.nodeNameTypePath[i]
                            let nodeName = pathStep[0]
                            let nodeType = pathStep[1]
                            let nodeProject = pathStep[2]
                            let nodeId = pathStep[3]
                            let link = ' > <a onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'' + nodeProject + '\', \'' + result.documentIndex.category + '\', \'' + nodeType.replace(/'/g, 'AMPERSAND') + '\', ' + undefined + '  ,\'' + nodeId + '\')"  class="docs-search-result-content-record-project-category-link">'
                            if (nodeName === 'New ' + nodeType || nodeName === 'My ' + nodeType || nodeName === undefined) {
                                nodeName = ''
                            }
                            if (nodeName === '') {
                                linkLabel = nodeType
                            } else {
                                linkLabel = nodeType + ' (' + nodeName + ')'
                            }
                            path = path + link + linkLabel + '</a>'
                        }
                    }

                    HTML = HTML + '<div class="docs-search-result-content-record-container">'
                    HTML = HTML + '<p class="docs-search-result-content-record-project-category">' + result.documentIndex.project + ' > ' + result.documentIndex.category + path + '</p>'

                    let mainLink = ''

                    switch (result.documentIndex.category) {
                        case 'Topic': {
                            HTML = HTML + '<p class="docs-search-result-content-record-topic">' + result.documentIndex.docsSchemaDocument.topic + ' - Page ' + result.documentIndex.docsSchemaDocument.pageNumber + '</p>'
                            mainLink = result.documentIndex.docsSchemaDocument.type
                            break
                        }
                        case 'Tutorial': {
                            HTML = HTML + '<p class="docs-search-result-content-record-tutorial">' + result.documentIndex.docsSchemaDocument.tutorial + ' - Page ' + result.documentIndex.docsSchemaDocument.pageNumber + '</p>'
                            mainLink = result.documentIndex.docsSchemaDocument.type
                            break
                        }
                        case 'Review': {
                            HTML = HTML + '<p class="docs-search-result-content-record-review">' + result.documentIndex.docsSchemaDocument.review + ' - Page ' + result.documentIndex.docsSchemaDocument.pageNumber + '</p>'
                            mainLink = result.documentIndex.docsSchemaDocument.type
                            break
                        }
                        default: {
                            mainLink = result.documentIndex.docsSchemaDocument.type
                        }
                    }
                    HTML = HTML + '<p><a onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'' + result.documentIndex.project + '\', \'' + result.documentIndex.category + '\', \'' + result.documentIndex.docsSchemaDocument.type.replace(/'/g, 'AMPERSAND') + '\', ' + undefined + '  ,\'' + result.documentIndex.docsSchemaDocument.nodeId + '\')" class="docs-search-result-content-record-title">' + mainLink + '</a></p>'

                    if (result.documentIndex.docsSchemaDocument.definition !== undefined) {
                        HTML = HTML + '<p class="docs-search-result-content-record-extract">' + UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(result.documentIndex.docsSchemaDocument.definition) + '</p>'
                    } else {
                        HTML = HTML + '<p class="docs-search-result-content-record-extract">' + 'No definition available.' + '</p>'
                    }
                    HTML = HTML + '</div>'
                }
                HTML = HTML + '</div>'
                totalResults.set(tab, resultCounter)
            }

            // End Content
            HTML = HTML + '</div>'
            HTML = HTML + '</div>'

            // End Section
            HTML = HTML + '</section>'

            // Total Seconds Calculation
            let finalTime = new Date()
            let totalSeconds = ((finalTime.valueOf() - initialTime.valueOf()) / 1000).toFixed(3)
            for (let i = 0; i < tabs.length; i++) {
                let tab = tabs[i]
                HTML = HTML.replace(tab.toUpperCase() + '_TOTAL_SECONDS', totalSeconds)
                resultCounter = totalResults.get(tab)
                HTML = HTML.replace(tab.toUpperCase() + '_TOTAL_RESULTS', resultCounter)
            }

            let docsContentDiv = document.getElementById('docs-content-div')
            docsContentDiv.innerHTML = HTML + UI.projects.superalgos.spaces.docsSpace.footer.addFooter()

            UI.projects.superalgos.spaces.docsSpace.mainSearchPage.detectEnterOnSearchBox()
            UI.projects.superalgos.spaces.docsSpace.mainSearchPage.setFocusOnSearchBox()
        }
    }
}