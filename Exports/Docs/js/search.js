const projects = __PROJECTS__
const baseUrl = __BASE_URL__
const linkExt = __LINK_EXT__

let documentIndex = new FlexSearch.Document({
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

function renderSearchResults(command) {
    const spinner = document.getElementById('search-spinner')
    spinner.classList.remove('hidden')
    const currentLanguage = document.getElementById('body').getAttribute('lang')
    const initialTime = new Date()
    const resultsArray = []
    let searchByType = documentIndex.search(command.toLowerCase(), {
        pluck: 'docsSchemaDocument:type',
        enrich: true,
        limit: 10000
    });
    let searchByText = documentIndex.search(command.toLowerCase(), {
        pluck: 'text',
        enrich: true,
        limit: 10000
    })

    // Search in all fields and remove duplicates
    Promise.all([searchByType, searchByText]).then(
        function (values) {
            let flags = {}
            values.forEach(arrResult => {
                arrResult.forEach(result => {
                    if (!flags[result.id]) {
                        flags[result.id] = true;
                        resultsArray.push({documentIndex: result.doc});
                    }
                })
            })
            buildHTML()
            spinner.classList.add('hidden')
        }
    )

    function buildHTML() {
        const tabs = ['All', 'Nodes', 'Concepts', 'Topics', 'Tutorials', 'Reviews', 'Books', 'Workspace']
        let HTML = ''
        HTML = HTML + '<section id="docs-search-results-div" class="docs-search-page-container">'

        // Tabs
        HTML = HTML + '<div class="docs-search-results-header-tabs-container">'
        let checked = ' checked=""'
        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i]
            HTML = HTML + '<input id="docs-tab' + (i + 1) + '" type="radio" name="tabs"' + checked + '><label for="docs-tab' + (i + 1) + '">' + tab + '</label>'
            checked = ''
        }
        HTML = HTML + '<label id="close-search-results">Close</label>'

        // Results
        HTML = HTML + '<div class="docs-search-result-content">'

        let totalResults = new Map()
        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i]
            HTML = HTML + '<div id="content' + (i + 1) + '">'
            HTML = HTML + '<p> ' + tab.toUpperCase() + '_TOTAL_RESULTS results (' + tab.toUpperCase() + '_TOTAL_SECONDS seconds)</p>'

            let resultCounter = 0
            for (let j = 0; j < resultsArray.length; j++) {
                let result = resultsArray[j]

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
                        let link = ' > <a href="' + buildLink([baseUrl, nodeProject, result.documentIndex.category, nodeType]) + '"  class="docs-search-result-content-record-project-category-link">'
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
                HTML = HTML + '<p><a href="' + buildLink([baseUrl,  result.documentIndex.project, result.documentIndex.category, result.documentIndex.docsSchemaDocument.type]) + '" class="docs-search-result-content-record-title">' + mainLink + '</a></p>'

                if (result.documentIndex.docsSchemaDocument.definition !== undefined) {
                    HTML = HTML + addTranslations(result.documentIndex.docsSchemaDocument.definition)
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
        const finalTime = new Date()
        const totalSeconds = ((finalTime.valueOf() - initialTime.valueOf()) / 1000).toFixed(3)
        for (let i = 0; i < tabs.length; i++) {
            let tab = tabs[i]
            HTML = HTML.replace(tab.toUpperCase() + '_TOTAL_SECONDS', totalSeconds)
            HTML = HTML.replace(tab.toUpperCase() + '_TOTAL_RESULTS', totalResults.get(tab))
        }

        let searchContentDiv = document.getElementById('docs-search-content-div')
        searchContentDiv.innerHTML = HTML
        searchContentDiv.classList.remove('hidden')

        addClearCloseSearchListener()
        tippy('#close-search-results', {content: "Clear and close search results", theme: "superalgos"})

        function buildLink(routeParts) {
            const lastItem = routeParts.splice(routeParts.length-1, 1)
            return routeParts.join('/') + '/' + normaliseStringForLink(lastItem[0]) + linkExt
        }

        function normaliseStringForLink(value) {
            return value
                .replace(/'/g, '')
                .replace(/[^A-Za-z0-9_\/]/gi, '-')
                .replace(/-{2,}/g, '-')
                .replace(/^-/g, '')
                .replace(/-$/g, '')
                .toLowerCase()
        }

        function addTranslations(definition) {
            if(definition.translations === undefined || definition.translations.length === 0) {
                return '<p class="docs-search-result-content-record-extract">' + definition.text + '</p>'
            }
            let html = '<div class="translation-group">'
            const translations = ['EN'].concat(definition.translations.map(t => t.language))
            for(let i = 0; i < translations.length; i++) {
                const hidden = currentLanguage != translations[i]
                html += '<p class="docs-search-result-content-record-extract ' + (hidden?'hidden':'') + '" language="' + translations[i] + '">' + getTextBasedOnLanguage(definition, translations[i]) + '</p>'
            }
            return html + '</div>'

            function getTextBasedOnLanguage(definition, currentLanguageCode) {
                for (let i = 0; i < definition.translations.length; i++) {
                    let translation = definition.translations[i]
                    if (translation.language === currentLanguageCode) { return translation.text }
                }
                return definition.text
            }
        }
    }
}

function addIndexesToSearch(schemas) {
    for (let i = 0; i < schemas.length; i++) {
        documentIndex.add(schemas[i])
    }
}

function pullSearchIndexes(i) {
    fetch(projects[i])
        .then(response => response.json())
        .then(addIndexesToSearch)
        .then(nextProject(i + 1))
        .catch((err) => console.error(err))
}

function nextProject(i) {
    if (i < projects.length) {
        pullSearchIndexes(i)
    }
}

document.getElementById('enable-search').addEventListener('click', () => {
    nextProject(0)
    document.getElementById('enable-search').classList.toggle('hidden')
    document.getElementById('search-input').classList.toggle('hidden')
})

const element = document.getElementsByClassName("docs-search-input")[0]
element.addEventListener("keyup", function (event) {
    if (event.key === "Enter" || event.keyCode === 13) {
        const command = element.value.trim()
        if(command.length < 1) {
            // TODO: clear search results
            let searchContentDiv = document.getElementById('docs-search-content-div')
            searchContentDiv.innerHTML = ''
            searchContentDiv.classList.add('hidden')
        }
        else {
            renderSearchResults(command)
        }
    }
})

function addClearCloseSearchListener() {
    document.getElementById('close-search-results').addEventListener('click', () => {
        document.getElementsByClassName("docs-search-input")[0].value = ''
        let searchContentDiv = document.getElementById('docs-search-content-div')
        searchContentDiv.innerHTML = ''
        searchContentDiv.classList.add('hidden')
    })
}