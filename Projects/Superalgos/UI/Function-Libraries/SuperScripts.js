function newSuperalgosFunctionLibrarySuperScriptsFunctions() {
    thisObject = {
        runSuperScript: runSuperScript
    }

    return thisObject

    function runSuperScript(node, rootNodes) {
        try {
            let clone = UI.projects.superalgos.functionLibraries.nodeCloning.getNodeClone
            let executionResult = true
            let superAction = node

            function setup(templateClone, target, exchange, exchangeNodeType, arrayPropertyName) {
                spawnPosition.x = target.payload.position.x
                spawnPosition.y = target.payload.position.y

                if (exchange === undefined) {
                    UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.createUiObjectFromNode(templateClone, target, target)
                } else {
                    let definition = getSchemaDocument(target)
                    for (let i = 0; i < definition.childrenNodesProperties.length; i++) {
                        let property = definition.childrenNodesProperties[i]
                        if (property.childType === exchangeNodeType) {
                            let exchanges = target[property.name]
                            if (exchanges === undefined) {
                                exchanges = []
                            }
                            let targetExchange
                            for (let j = 0; j < exchanges.length; j++) {
                                let thisExchange = exchanges[j]
                                if (thisExchange.payload.referenceParent !== undefined) {
                                    if (thisExchange.payload.referenceParent.id === exchange.id) {
                                        targetExchange = thisExchange
                                    }
                                }
                            }
                            if (targetExchange === undefined) {
                                targetExchange = UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.addUIObject(target, exchangeNodeType)
                                targetExchange.payload.referenceParent = exchange
                            }
                            let nodesArray = targetExchange[arrayPropertyName]
                            nodesArray.push(templateClone)
                            UI.projects.superalgos.functionLibraries.uiObjectsFromNodes.createUiObjectFromNode(templateClone, targetExchange, targetExchange)
                        }
                    }
                }
            }

            function deleteNode(node) {
                UI.projects.superalgos.functionLibraries.nodeDeleter.deleteUIObject(node, rootNodes)
            }

            /* Validations */
            if (executionResult === true && node.payload.parentNode === undefined) {
                node.payload.uiObject.setErrorMessage('Super Action node needs a Parent Node.')
                executionResult = false
            }
            if (executionResult === true && node.payload.referenceParent === undefined) {
                node.payload.uiObject.setErrorMessage('Super Action node needs to reference a Master Script Node.')
                executionResult = false
            }
            if (executionResult === true && node.payload.referenceParent.javascriptCode === undefined) {
                node.payload.uiObject.setErrorMessage('Master Script Node needs to have a child Javascript Code Node.')
                executionResult = false
            }

            let masterScript = node.payload.referenceParent

            eval(masterScript.javascriptCode.code)

            let masterScriptInstance = newNewMasterScriptInstance()

            if (executionResult === true) {
                executionResult = masterScriptInstance.runValidations(superAction, masterScript)
            }
            if (executionResult === true) {
                executionResult = masterScriptInstance.runScript(superAction, masterScript)
            }
            if (executionResult === true) {
                superAction.payload.uiObject.setValue('Execution Completed Successfully')
            } else {
                superAction.payload.uiObject.setValue('Execution Failed')
            }
        } catch (err) {
            superAction.payload.uiObject.setErrorMessage(err.message)
            superAction.payload.uiObject.setValue('Execution Failed')
        }
    }
}
