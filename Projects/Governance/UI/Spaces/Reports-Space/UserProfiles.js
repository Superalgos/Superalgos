function newGovernanceReportsUserProfiles() {
    let thisObject = {
        addHTML: addHTML,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function addHTML(tabIndex) {

        let tableRecords = []
        let table = 'userProfiles'
        let tableRecordDefinition = {
            "properties": [
                {
                    "name": "name",
                    "label": "User Profile",
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
        Here we get from the workspace all User Profiles.
        */
        let userProfiles = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        /*
        Transform the result array into table records.
        */
        for (let j = 0; j < userProfiles.length; j++) {
            let userProfile = userProfiles[j]

            let tableRecord = {
                "name": userProfile.name,
                "blockchainPower": userProfile.payload.blockchainTokens | 0,
                "delegatedPower": userProfile.payload.tokenPower - userProfile.payload.blockchainTokens | 0,
                "tokenPower": userProfile.payload.tokenPower | 0
            }

            tableRecords.push(tableRecord)
        }
        /*
        Get the sorting order for this table.
        */
        let sortingOrder = UI.projects.governance.spaces.reportsSpace.tablesSortingOrders[table]
        /*
        Set the default sorting order for this table.
        */
        if (sortingOrder === undefined) {
            UI.projects.governance.spaces.reportsSpace.tablesSortingOrders[table] = {
                property: 'name',
                order: 'ascending'
            }
            sortingOrder = UI.projects.governance.spaces.reportsSpace.tablesSortingOrders[table]
        }
        return UI.projects.governance.utilities.tables.addHTML(
            table,
            tableRecords,
            tableRecordDefinition,
            sortingOrder,
            tabIndex
        )
    }
}