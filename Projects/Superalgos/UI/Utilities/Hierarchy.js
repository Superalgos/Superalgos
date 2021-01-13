function newSuperalgosUtilitiesHierarchy() {
    thisObject = {
        getHiriarchyMap: getHiriarchyMap,
        getHiriarchyHead: getHiriarchyHead,
        getNodeNameTypePath: getNodeNameTypePath
    }

    return thisObject

    function getHiriarchyMap(rootNode) {
        /*
        This function scans a node hiriatchy recursively and creates a Map by Id of all the nodes of it.
        */
        let hiriatchyMap = new Map()
        evalNode(rootNode)
        return hiriatchyMap

        function evalNode(node) {
            if (node === undefined) { return }

            hiriatchyMap.set(node.id, node)

            /* Now we go down through all this node children */
            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {
                            if (property.name !== previousPropertyName) {
                                if (node[property.name] !== undefined) {
                                    evalNode(node[property.name])
                                }
                                previousPropertyName = property.name
                            }
                            break
                        }
                        case 'array': {
                            if (node[property.name] !== undefined) {
                                let nodePropertyArray = node[property.name]
                                for (let m = 0; m < nodePropertyArray.length; m++) {
                                    evalNode(nodePropertyArray[m])
                                }
                            }
                            break
                        }
                    }
                }
            }
        }
    }

    function getHiriarchyHead(initialNode) {
        let headNode
        stepBackwards(initialNode)
        return headNode

        function stepBackwards(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            if (node.payload.parentNode === undefined) {
                headNode = node
            } else {
                stepBackwards(node.payload.parentNode)
            }
        }
    }

    function getNodeNameTypePath(initialNode) {
        let pathArray = []
        stepBackwards(initialNode)
        return pathArray

        function stepBackwards(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            pathArray.unshift([node.name, node.type, node.project, node.id])
            if (node.payload.parentNode === undefined) {
                return
            } else {
                stepBackwards(node.payload.parentNode)
            }
        }
    }
}
