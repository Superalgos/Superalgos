exports.newSuperalgosUtilitiesDocsFunctions = function () {

    let thisObject = {
        buildPlaceholder: buildPlaceholder
    }

    return thisObject

    function buildPlaceholder(docs, error, nodeName, nodeCode, nodeConfig, nodeValue, contextInfo) {
        if (error !== undefined) {
            if (error.message !== undefined) {
                docs.placeholder.errorMessage = {
                    style: 'Error',
                    text: error.message
                }
            }
            if (error.stack !== undefined) {
                docs.placeholder.errorStack = {
                    style: 'Javascript',
                    text: error.stack
                }
            }
            if (error.nodeCode !== undefined) {
                docs.placeholder.errorCode = {
                    style: 'Json',
                    text: error.nodeCode
                }
            }
            docs.placeholder.errorDetails = {
                style: 'Json',
                text: JSON.stringify(error, undefined, 4)
            }
        }

        if (nodeName !== undefined) {
            docs.placeholder.nodeName = {
                style: 'Json',
                text: JSON.stringify(nodeName, undefined, 4)
            }
        }
        if (nodeCode !== undefined) {
            docs.placeholder.nodeCode = {
                style: 'Javascript',
                text: nodeCode
            }
        }
        if (nodeConfig !== undefined) {
            docs.placeholder.nodeConfig = {
                style: 'Json',
                text: JSON.stringify(nodeConfig, undefined, 4)
            }
        }
        if (nodeValue !== undefined) {
            docs.placeholder.nodeValue = {
                style: 'Json',
                text: nodeValue
            }
        }
        if (contextInfo !== undefined) {
            docs.placeholder.contextInfo = {
                style: 'Json',
                text: JSON.stringify(contextInfo, undefined, 4)
            }
        }
    }
}