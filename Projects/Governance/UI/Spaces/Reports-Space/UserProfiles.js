function newGovernanceReportsUserProfiles() {
    let thisObject = {
        resultCounter: undefined,
        addHTML: addHTML,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function addHTML() {

        thisObject.resultCounter = 0
        let tableRecords = []
        let table = 'userProfiles'
        let tableRecordDefinition = {
            "properties": [
                {
                    "name": "name",
                    "label": "Name",
                    "type": "string",
                    "order": "ascending"
                },
                {
                    "name": "blockchainPower",
                    "label": "Blockchain Power",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "delegatedPower",
                    "label": "Delegated Power",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "tokenPower",
                    "label": "Token Power",
                    "type": "number",
                    "order": "descending"
                }
            ]
        }
        /*
        Here we get from the workspace all the nodes representing User Profiles.
        */
        let resultsArary = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        /*
        Transform the result array into table records.
        */
        for (let j = 0; j < resultsArary.length; j++) {
            let node = resultsArary[j]

            let tableRecord = {
                "name": node.name,
                "blockchainPower": node.payload.blockchainTokens | 0,
                "delegatedPower": node.payload.tokenPower - node.payload.blockchainTokens | 0,
                "tokenPower": node.payload.tokenPower | 0
            }

            tableRecords.push(tableRecord)
        }
        return UI.projects.governance.utilities.tables.addHTML(table, tableRecords, tableRecordDefinition)
    }
}