function newPluginsFunctions() {
    thisObject = {
        pluginMissingDataMines: pluginMissingDataMines,
        pluginMissingTradingMines: pluginMissingTradingMines,
        pluginMissingTradingSystems: pluginMissingTradingSystems,
        pluginMissingTradingEngines: pluginMissingTradingEngines,
        pluginMissingSuperScripts: pluginMissingSuperScripts,
        pluginMissingTutorials: pluginMissingTutorials
    }
    return thisObject

    function getPluginFileNames(pluginType, callBack) {
        callWebServer(undefined, 'PluginFileNames/' + pluginType, onResponse)

        function onResponse(err, data) {
            if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                console.log('Failed to Fetch Plugin ' + pluginType + ' from the Backend')
                return
            }

            let pluginFileNames = JSON.parse(data)
            callBack(pluginFileNames)
        }
    }

    function addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes) {
        for (let i = 0; i < fileNames.length; i++) {
            let fileName = fileNames[i]
            fileName = fileName.replace('.json', '')
            if (isMissingChildrenByName(node, fileName) === true) {
                let child = functionLibraryUiObjectsFromNodes.addUIObject(node, 'Plugin File')
                child.name = fileName
            }
        }
    }

    function pluginMissingDataMines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getPluginFileNames('Data-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTradingMines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getPluginFileNames('Trading-Mines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTradingSystems(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getPluginFileNames('Trading-Systems', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTradingEngines(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getPluginFileNames('Trading-Engines', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingSuperScripts(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getPluginFileNames('Super-Scripts', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }

    function pluginMissingTutorials(node, rootNodes, functionLibraryUiObjectsFromNodes) {
        getPluginFileNames('Tutorials', onNamesArrived)

        function onNamesArrived(fileNames) {
            addPluginFileIfNeeded(node, fileNames, functionLibraryUiObjectsFromNodes)
        }
    }
}
