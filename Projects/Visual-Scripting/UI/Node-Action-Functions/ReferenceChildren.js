// Modified 2026-10-05: select incoming references by exact type/project for Superalgos #3498.
function newVisualScriptingNodeActionFunctionReferenceChildren () {
    let thisObject = {
        toggleHighlightReferenceChildren: toggleHighlightReferenceChildren
    }

    return thisObject

    function toggleHighlightReferenceChildren(node, referenceType, referenceProject) {
        /* The generic menu supplies its action project even without a type filter. */
        if (referenceType === undefined) {
            referenceProject = undefined
        }

        let uiObject = node.payload.uiObject
        let referenceChildren = node.payload.referenceChildren === undefined
            ? []
            : Array.from(node.payload.referenceChildren, ([id, node]) => (node))
        let sameFilter = uiObject.highlightReferenceChildren === true
            && uiObject.highlightReferenceChildrenType === referenceType
            && uiObject.highlightReferenceChildrenProject === referenceProject

        if (uiObject.highlightReferenceChildren === true) {
            let previousUiObjects = uiObject.highlightedReferenceChildren
                || referenceChildren.filter(child => child.payload !== undefined && child.payload.uiObject !== undefined)
                    .map(child => child.payload.uiObject)
            for (let childUiObject of previousUiObjects) {
                /* Do not affect a replacement UI object or a finalized instance. */
                if (childUiObject.payload !== undefined) {
                    childUiObject.drawReferenceLine = false
                    childUiObject.highlight(0)
                }
            }
        }

        uiObject.highlightReferenceChildren = false
        uiObject.highlightReferenceChildrenType = undefined
        uiObject.highlightReferenceChildrenProject = undefined
        uiObject.highlightedReferenceChildren = undefined
        if (sameFilter) {
            return
        }

        referenceChildren = referenceChildren.filter(child =>
            child.payload !== undefined
            && child.payload.uiObject !== undefined
            && child.payload.floatingObject !== undefined
            && (referenceType === undefined || child.type === referenceType)
            && (referenceProject === undefined || child.project === referenceProject)
        )
        let numberOfChildren = referenceChildren.length
        if (numberOfChildren === 0) {
            uiObject.setInfoMessage(referenceType === undefined
                ? 'This node is not referenced by any other nodes'
                : `This node has no referencing ${referenceType} nodes`)
            return
        }

        uiObject.highlightReferenceChildren = true
        uiObject.highlightReferenceChildrenType = referenceType
        uiObject.highlightReferenceChildrenProject = referenceProject
        uiObject.highlightedReferenceChildren = referenceChildren.map(child => child.payload.uiObject)
        uiObject.setInfoMessage(referenceType === undefined
            ? `Highlighting ${numberOfChildren} referencing nodes`
            : `Highlighting ${numberOfChildren} referencing ${referenceType} nodes`)
        for (let child of referenceChildren) {
            child.payload.floatingObject.unCollapseParent()
            child.payload.uiObject.drawReferenceLine = true
            child.payload.uiObject.highlight(VERY_LARGE_NUMBER)
        }
    }
}
