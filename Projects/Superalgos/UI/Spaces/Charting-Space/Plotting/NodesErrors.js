function newNodesErrors() {
    const MODULE_NAME = 'Nodes Errors'
    const logger = newWebDebugLog()


    let thisObject = {
        onRecordChange: onRecordChange,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize(pRootNode) {

    }

    function onRecordChange(currentRecord) {
        if (currentRecord === undefined) { return }
        if (currentRecord.rateIndex === undefined) {
            /*
            The user is not pointing to any rate in particular, so we are 
            going to report all errors to the nodes involved.
            */
            let array = currentRecord.errors
            if (array === undefined) { return }
            for (let i = 0; i < array.length; i++) {
                let arrayItem = array[i]
                let nodeId = arrayItem[0]
                let errorMessage = arrayItem[1]
                let docs = arrayItem[2]
                applyValue(nodeId, errorMessage, docs)
            }
        } else {
            /*
            The user is  pointing to a particular rate, so we are 
            going to report only that error and we will open the docs
            to show the error's page.
            */
            let array = currentRecord.errors
            if (array === undefined) { return }
            let arrayItem = array[currentRecord.rateIndex]

            let nodeId = arrayItem[0]
            let errorMessage = arrayItem[1]
            let docs = arrayItem[2]
            applyValue(nodeId, errorMessage, docs)

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

    async function applyValue(nodeId, errorMessage, docs) {
        if (UI.projects.superalgos.spaces.chartingSpace.visible !== true) { return }
        let node = await UI.projects.superalgos.spaces.designSpace.workspace.getNodeById(nodeId)
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (errorMessage === '') {
            node.payload.uiObject.resetErrorMessage()
        } else {
            node.payload.uiObject.setErrorMessage(errorMessage, 3, docs)
        }
    }
}
