function newNodesWarnings() {
    const MODULE_NAME = 'Nodes Warnings'
    const logger = newWebDebugLog()


    let thisObject = {
        onRecordChange: onRecordChange,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {

    }

    function onRecordChange(currentRecord) {
        if (currentRecord === undefined) { return }
        if (currentRecord.rateIndex === undefined) {
            /*
            The user is not pointing to any rate in particular, so we are 
            going to report all warnings to the nodes involved.
            */
            let array = currentRecord.warnings
            if (array === undefined) { return }
            for (let i = 0; i < array.length; i++) {
                let arrayItem = array[i]
                let docs = arrayItem[2]
                let nodeIdArray = arrayItem[0]
                /* We migth receive here and array of node Ids. If we dont, we receive at least one node id*/
                if (Array.isArray(nodeIdArray) === true) {
                    for (let j = 0; j < nodeIdArray.length; j++) {
                        let nodeId = nodeIdArray[j]
                        let value = arrayItem[1]
                        applyValue(nodeId, value, docs)
                    }
                } else {
                    let nodeId = arrayItem[0]
                    let value = arrayItem[1]
                    applyValue(nodeId, value, docs)
                }
            }
        } else {
            /*
            The user is  pointing to a particular rate, so we are 
            going to report only that warning and we will open the docs
            to show the warning's page.
            */
            let array = currentRecord.warnings
            if (array === undefined) { return }
            let arrayItem = array[currentRecord.rateIndex]

            let docs = arrayItem[2]
            let nodeId
            let nodeIdArray = arrayItem[0]
            /* We migth receive here and array of node Ids. If we dont, we receive at least one node id*/
            if (Array.isArray(nodeIdArray) === true) {
                /* For repositioning the design space we will pick the first Id at the Node Id Array */
                nodeId = nodeIdArray[0]
            } else {
                nodeId = arrayItem[0]
                let value = arrayItem[1]
                applyValue(nodeId, value, docs)
            }

            if (UI.projects.superalgos.spaces.docsSpace.sidePanelTab.isOpen === true) {
                if (
                    UI.projects.superalgos.spaces.docsSpace.currentDocumentBeingRendered.project !== docs.project ||
                    UI.projects.superalgos.spaces.docsSpace.currentDocumentBeingRendered.category !== docs.category ||
                    UI.projects.superalgos.spaces.docsSpace.currentDocumentBeingRendered.type !== docs.type ||
                    UI.projects.superalgos.spaces.docsSpace.currentDocumentBeingRendered.nodeId !== nodeId
                ) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo(
                        docs.project,
                        docs.category,
                        docs.type,
                        docs.anchor,
                        nodeId,
                        docs.placeholder
                    )
                }

            } else {
                UI.projects.superalgos.spaces.docsSpace.openSpaceAreaAndNavigateTo(
                    docs.project,
                    docs.category,
                    docs.type,
                    docs.anchor,
                    nodeId,
                    docs.placeholder
                )
            }
        }
    }

    async function applyValue(nodeId, value, docs) {
        if (UI.projects.superalgos.spaces.chartingSpace.visible !== true) { return }
        let node = await UI.projects.superalgos.spaces.designSpace.workspace.getNodeById(nodeId)
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (value === '') {
            node.payload.uiObject.resetWarningMessage()
        } else {
            node.payload.uiObject.setWarningMessage(value, 3, docs)
        }
    }
}
