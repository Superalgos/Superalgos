function newVisualScriptingFunctionLibraryOnFocus() {
    let thisObject = {
        getNodeThatIsOnFocus: getNodeThatIsOnFocus
    }
    return thisObject

    function getNodeThatIsOnFocus(node) {
        if (node === undefined || node === null) { return }
        if (node.payload === undefined) { return }
        let schemaDocument = getSchemaDocument(node)
        if (schemaDocument !== undefined) {
            /* First we ask the question to ourself */
            if (node.payload.uiObject.isOnFocus === true) {
                return node
            }

            /* Then we check all of its own children nodes. */
            if (node.payload.floatingObject.isCollapsed !== true) {
                if (schemaDocument.childrenNodesProperties !== undefined) {
                    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoid counting each property of those as individual children.
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]

                        switch (property.type) {
                            case 'node': {
                                if (property.name !== previousPropertyName) {
                                    if (node[property.name] !== undefined) {
                                        let child = getNodeThatIsOnFocus(node[property.name])
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
                                        let child = getNodeThatIsOnFocus(nodePropertyArray[m])
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
