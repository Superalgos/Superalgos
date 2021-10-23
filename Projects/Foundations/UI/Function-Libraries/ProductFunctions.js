function newFoundationsFunctionLibraryProductFunctions() {
    let thisObject = {
        installProduct: installProduct,

    }

    return thisObject

    function installProduct(
        node,
        rootNodes
    ) {

        let product = node
        let productIndicatorBot = product.payload.parentNode
        let productDataMineParent = productIndicatorBot.payload.parentNode



        for (let i = 0; i < rootNodes.length; i++) {
            let rootNode = rootNodes[i]
            if (rootNode.type === 'Trading Mine') {
                installInTradingMine(rootNode)
            }
        }

        function installInTradingMine(tradingMine) {

            for (let j = 0; j < tradingMine.tradingBots.length; j++) {
                let tradingBotNode = tradingMine.tradingBots[j]
                installInTradingBotNode(tradingBotNode)
            }

            function installInTradingBotNode(tradingBot) {

                for (let k = 0; k < tradingBot.processes.length; k++) {
                    let process = tradingBot.processes[k]
                    installInProcessDefinitionDependencies(process)
                }

                function installInProcessDefinitionDependencies(process) {

                    /**
                     * In case the data mine is not referenced at all, we must add it
                     */

                    let dataMineDependency = UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(process.processDependencies, 'Data Mine Data Dependencies', productDataMineParent)

                    let botDataDependencies = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(dataMineDependency, undefined, productIndicatorBot.name, true, true, false, false)

                    /**
                     * If Bot Data Dependency exists add Data Dependencies
                     * Otherwise create the Bot Data Dependency and add Data Dependencies to newly created Bot Data Dependency
                     */
                    if (botDataDependencies !== undefined) {
                        addAllDataDependencies(botDataDependencies)
                    } else {
                        dataMineDependency.payload.uiObject.menu.internalClick('Add UI Object')
                        /**
                         * Find newly created bot data dependency and change his name to match Indicat Bot name
                         */
                        let newBotDataDependencies = UI.projects.visualScripting.utilities.meshes.findNodeInNodeMesh(dataMineDependency, undefined, 'New Bot Data Dependencies', true, true, false, false)
                        newBotDataDependencies.name = productIndicatorBot.name
                        addAllDataDependencies(newBotDataDependencies)
                    }


                    function addAllDataDependencies(botDataDependencies) {
                        for (let l = 0; l < product.datasets.length; l++) {
                            let dataset = product.datasets[l]
                            UI.projects.visualScripting.utilities.nodeChildren.findOrCreateChildWithReference(botDataDependencies, 'Data Dependency', dataset)
                        }
                    }

                }
            }

        }

    }
}