function newIncludesFunctions() {
    thisObject = {
        includeMissingDataMines: includeMissingDataMines,
        includeMissingTradingMines: includeMissingTradingMines,
        includeMissingTradingSystems: includeMissingTradingSystems,
        includeMissingTradingEngines: includeMissingTradingEngines,
        includeMissingSuperScripts: includeMissingSuperScripts,
        includeMissingTutorials: includeMissingTutorials
    }
    return thisObject

    function getIncludedFileNames(includeType, callBack) {
        callServer(undefined, 'IncludedFileNames/' + includeType, onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to Fetch Included ' + includeType + ' from the Backend')
                return
            }

            let includedFileNames = JSON.parse(data)
            callBack(includedFileNames)
        }
    }

    function addIncludedFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes) {
        for (let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i]
            fileName = fileName.replace('.json', '')
            if (isMissingChildrenByName(node, fileName) === true) {
                let child = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Included File')
                child.name = fileName
            }
        }
    }

    function includeMissingDataMines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getIncludedFileNames('Data-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addIncludedFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function includeMissingTradingMines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getIncludedFileNames('Trading-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addIncludedFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function includeMissingTradingSystems(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getIncludedFileNames('Trading-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            addIncludedFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function includeMissingTradingEngines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getIncludedFileNames('Trading-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addIncludedFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function includeMissingSuperScripts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getIncludedFileNames('Super-Scripts', onNamesArrived)

        function onNamesArrived(fileNames) {
            addIncludedFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function includeMissingTutorials(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getIncludedFileNames('Tutorials', onNamesArrived)

        function onNamesArrived(fileNames) {
            addIncludedFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }
}
