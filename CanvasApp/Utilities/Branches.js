function nodeBranchToArray(node, nodeType) {
    /*
    This function scans a node branch for a certain node type and 
    return an array of with all the nodes of that type found. 
    */
    if (node === undefined) { return }
    if (nodeType === undefined) { return }
    let resultArray = []
    scanNodeBranch(node, nodeType)
    return resultArray

    function scanNodeBranch(startingNode) {
        if (startingNode === undefined) {return}
        
        let nodeDefinition = APP_SCHEMA_MAP.get(startingNode.type)
        if (nodeDefinition === undefined) { return }

        if (startingNode.type === nodeType) {
            resultArray.push(startingNode)
            return
        }

        if (nodeDefinition.properties === undefined) { return }
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
            let property = nodeDefinition.properties[i]

            switch (property.type) {
                case 'node': {
                    scanNodeBranch(startingNode[property.name])
                }
                    break
                case 'array': {
                    let startingNodePropertyArray = startingNode[property.name]
                    for (let m = 0; m < startingNodePropertyArray.length; m++) {
                        scanNodeBranch(startingNodePropertyArray[m])
                    }
                    break
                }
            }
        }
    }
}
