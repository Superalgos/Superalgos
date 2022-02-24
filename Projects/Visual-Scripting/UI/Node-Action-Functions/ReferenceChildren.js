function newVisualScriptingNodeActionFunctionReferenceChildren () {
    let thisObject = {
        toggleHighlightReferenceChildren: toggleHighlightReferenceChildren
    }

    return thisObject

    function toggleHighlightReferenceChildren(node) {
        if (node.payload.referenceChildren === undefined) {
            node.payload.uiObject.setInfoMessage('This node is not referenced by any other nodes')
            return
        }
        let referenceChildren = Array.from(node.payload.referenceChildren, ([id, node]) => (node))
        let numberOfChildren = referenceChildren.length
        if (numberOfChildren === 0) {
            node.payload.uiObject.setInfoMessage('This node is not referenced by any other nodes')
            return
        }
        if (node.payload.uiObject.highlightReferenceChildren === false) {
            node.payload.uiObject.highlightReferenceChildren = true
            node.payload.uiObject.setInfoMessage(`Highlighting ${numberOfChildren} referencing nodes`)
            for (let child of referenceChildren) {
                child.payload.floatingObject.unCollapseParent()
                child.payload.uiObject.drawReferenceLine = true
                child.payload.uiObject.highlight(VERY_LARGE_NUMBER)
            }
        } else {
            node.payload.uiObject.highlightReferenceChildren = false
            for (let child of referenceChildren) {
                child.payload.uiObject.drawReferenceLine = false
                child.payload.uiObject.highlight(0)
            }
        }
    }
}
