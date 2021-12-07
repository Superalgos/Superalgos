exports.newFoundationsUtilitiesMiscellaneousFunctions = function () {

    let thisObject = {
        truncateToThisPrecision: truncateToThisPrecision,
        asyncGetDatasetFile: asyncGetDatasetFile,
        getManagedSessions: getManagedSessions
    }

    return thisObject

    function truncateToThisPrecision(floatNumber, precision) {
        return parseFloat(floatNumber.toFixed(precision))
    }

    async function asyncGetDatasetFile(datasetModule, filePath, fileName) {
        /*
        This function helps a caller to use await syntax while the called
        function uses callbacks, specifically for retrieving files.
        */
        let promise = new Promise((resolve, reject) => {

            datasetModule.getTextFile(filePath, fileName, onFileReceived)
            function onFileReceived(err, text) {

                let response = {
                    err: err,
                    text: text
                }
                resolve(response)
            }
        })

        return promise
    }

    /* findManagedSessions(startingNode) :
     *  recursively searches startingNode branches to documents managed sessions at ~/taskConstants.MANAGED_SESSIONS_MAP
     *  Session Key naming convention: name + type + id
     */
    function getManagedSessions(startingNode) {
        if (startingNode == undefined) { return; }
        let schemaDocument = SA.projects.foundations.globals.schemas.APP_SCHEMA_MAP.get(startingNode.project + '-' + startingNode.type);

        // Base Cases:
        if (schemaDocument == undefined) { return; }
        if (startingNode.type === 'Session Reference' &&
            startingNode.referenceParent != undefined) {
            let key = startingNode.referenceParent.name + '-' +
                startingNode.referenceParent.type + '-' + startingNode.referenceParent.id;
            TS.projects.foundations.globals.taskConstants.MANAGED_SESSIONS_MAP.set(key, key);
            return;
        }

        if (schemaDocument.childrenNodesProperties == undefined) { return; }
        for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
            let child = schemaDocument.childrenNodesProperties[i];

            switch (child.type) {
                case 'node':
                    getManagedSessions(startingNode[child.name]);
                    break;
                case 'array':
                    let startingNodePropertyArray = startingNode[child.name];
                    if (startingNodePropertyArray != undefined) {
                        for (let j = 0; j < startingNodePropertyArray.length; j++) {
                            getManagedSessions(startingNodePropertyArray[j]);
                        }
                    }
                    break;
                default:
                    return;
            }
        }
    }

}