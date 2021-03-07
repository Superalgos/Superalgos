function newNodesInfos() {
    const MODULE_NAME = 'Nodes Infos'
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
            going to report all infos to the nodes involved.
            */
            let array = currentRecord.infos
            if (array === undefined) { return }
            for (let i = 0; i < array.length; i++) {
                let arrayItem = array[i]
                let nodeId = arrayItem[0]
                let infoMessage = arrayItem[1]
                let docs = arrayItem[2]
                applyValue(nodeId, infoMessage, docs)
            }
        } else {
            /*
            The user is  pointing to a particular rate, so we are 
            going to report only that info and we will open the docs
            to show the info's page.
            */
            let array = currentRecord.infos
            if (array === undefined) { return }
            let arrayItem = array[currentRecord.rateIndex]

            let nodeId = arrayItem[0]
            let infoMessage = arrayItem[1]
            let docs = arrayItem[2]
            applyValue(nodeId, infoMessage, docs)

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

    async function applyValue(nodeId, infoMessage, docs) {
        if (UI.projects.superalgos.spaces.chartingSpace.visible !== true) { return }
        let node = await UI.projects.superalgos.spaces.designSpace.workspace.getNodeById(nodeId)
        if (node === undefined) { return }
        if (node.payload === undefined) { return }
        if (node.payload.uiObject === undefined) { return }
        if (infoMessage === '') {
            node.payload.uiObject.resetInfoMessage()
        } else {
            node.payload.uiObject.setInfoMessage(infoMessage, 3, docs)
        }
    }
}
