function newVisualScriptingFunctionLibraryShortcutKeys() {
    let thisObject = {
        getNodeByShortcutKey: getNodeByShortcutKey
    }
    return thisObject

    function getNodeByShortcutKey(node, searchingKey) {
        if (node === undefined) { return }
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument !== undefined) {
            /* Check Self first */
            if (node.payload.uiObject.shortcutKey === searchingKey) {
                return node
            }

            /* Check all of its own children nodes. */
            if (node.payload.floatingObject.isCollapsed !== true) {
                if (schemaDocument.childrenNodesProperties !== undefined) {
                    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node': {
                                if (property.name !== previousPropertyName) {
                                    if (node[property.name] !== undefined) {
                                        let  child = getNodeByShortcutKey(node[property.name], searchingKey)
                                        if (child !== undefined) {
                                            return child
                                        }
                                    }
                                    previousPropertyName = property.name
                                }
                            }
                                break
                            case 'array': {
                                let nodePropertyArray = node[property.name]
                                if (nodePropertyArray !== undefined) {
                                    for (let m = 0; m < nodePropertyArray.length; m++) {
                                        let child = getNodeByShortcutKey(nodePropertyArray[m], searchingKey)
                                        if (child !== undefined) {
                                            return child
                                        }
                                    }
                                }
                            }
                                break
                        }
                    }
                }
            }
        }
    }
}
