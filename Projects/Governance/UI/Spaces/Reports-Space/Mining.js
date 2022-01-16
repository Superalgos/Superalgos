function newGovernanceReportsMining() {
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

    function addHTML(tabIndex, filters) {

        /*
        Setup Filters
        */
        let filtersObject
        if (filters !== undefined) {
            try {
                filtersObject = JSON.parse(filters)
            } catch (err) { }
        }
        /*
        Other Variables
        */
        let tableRecords = []
        let table = 'mining'
        let tableRecordDefinition = {
            "properties": [
                {
                    "name": "name",
                    "label": "User Profile",
                    "type": "string",
                    "order": "ascending",
                    "textAlign": "left"
                },
                {
                    "name": "blockchainAccount",
                    "label": "Blockchain Account",
                    "type": "string",
                    "order": "ascending",
                    "textAlign": "center"
                },
                {
                    "name": "tokensAwarded",
                    "label": "Tokens Awarded",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "integer"
                },
                {
                    "name": "tokensBonus",
                    "label": "Tokens Bonus",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "integer"
                },
                {
                    "name": "tokensMined",
                    "label": "Tokens Mined",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "integer"
                },
                {
                    "name": "minedInBTC",
                    "label": "Mined In BTC",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "text"
                }
            ]
        }
        /*
        Here we get from the workspace all User Profiles.
        */
        let userProfiles = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        /*
        Transform the result array into table records.
        */
        for (let j = 0; j < userProfiles.length; j++) {
            let userProfile = userProfiles[j]

            if (userProfile.payload === undefined) { continue }
            if (userProfile.tokensMined === undefined) { continue }
            if (userProfile.tokensMined.payload === undefined) { continue }
            if (userProfile.tokensMined.payload.tokensMined === undefined) { continue }

            let tableRecord = {
                "name": userProfile.name,
                "blockchainAccount": userProfile.payload.blockchainAccount,
                "tokensAwarded": userProfile.tokensMined.payload.tokensMined.awarded | 0,
                "tokensBonus": userProfile.tokensMined.payload.tokensMined.bonus | 0,
                "tokensMined": userProfile.tokensMined.payload.tokensMined.total | 0,
                "minedInBTC": UI.projects.governance.utilities.conversions.estimateSATokensInBTC(userProfile.tokensMined.payload.tokensMined.total | 0)
            }

            if (UI.projects.governance.utilities.filters.applyFilters(filters, filtersObject, tableRecord) === true) {
                tableRecords.push(tableRecord)
            }
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
                property: 'tokensMined',
                order: 'descending'
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