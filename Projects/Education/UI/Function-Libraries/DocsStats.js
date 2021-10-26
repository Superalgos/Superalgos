function newEducationFunctionLibraryDocsStats() {
    let thisObject = {
        printDocsStats: printDocsStats
    }

    return thisObject

    function printDocsStats(
        node,
        rootNodes
    ) {
    console.log("this is our docs stats")
    }
}
