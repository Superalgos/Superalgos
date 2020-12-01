function newNodesHighlights() {
    const MODULE_NAME = 'Nodes Highlights'
    const logger = newWebDebugLog()
    

    let thisObject = {
        onRecordChange: onRecordChange,
        initialize: initialize,
        finalize: finalize
    }

    let hiriarchyMap
    return thisObject

    function finalize() {
        hiriarchyMap = undefined
    }

    function initialize(pRootNode) {
        let rootNode = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsById(pRootNode.id)
        hiriarchyMap = UI.projects.superalgos.utilities.hierarchy.getHiriarchyMap(rootNode)
    }

    function onRecordChange(currentRecord) {
        if (currentRecord === undefined) { return }
        let array = currentRecord.highlights
        if (array === undefined) { return }
        for (let i = 0; i < array.length; i++) {
            let nodeId = array[i]
            highlight(nodeId)
        }
    }

    function highlight(nodeId) {
        if (UI.projects.superalgos.spaces.chartingSpace.visible !== true) { return }
        let node = hiriarchyMap.get(nodeId)
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        node.payload.uiObject.highlight(10)
    }
}
