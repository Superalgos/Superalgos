const projects = %%PROJECTS%%

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

function addIndexesToSearch(schemas) {
    for (let i = 0; i < schemas.length; i++) {
        documentIndex.add(schemas[i])
    }
}

function processResponse(response) {
    addIndexesToSearch(response.json())
}

function pullSearchIndexes(i) {
    fetch(projects[i])
        .then(processResponse)
        .then(nextProject(i + 1))
        .catch((err) => console.error(err))
}

function nextProject(i) {
    if (i < projects.length) {
        pullSearchIndexes(i)
    }
}

nextProject(0)