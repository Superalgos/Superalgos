function newGovernanceUtilitiesCommonTables() {
    let thisObject = {
        addHTML: addHTML
    }

    return thisObject

    function addHTML(
        table,
        nodeType,
        hierarchyHeadsType,
        tabIndex,
        filters
    ) {
        /*
        Setup Filters
        */
        let filtersObject
        if (filters !== undefined) {
            try {
                filtersObject = JSON.parse(filters)
            } catch (err) { }
        }
        let tableRecords = []
        let tableRecordDefinition = {
            "properties": [
                {
                    "name": "name",
                    "label": "Name",
                    "type": "string",
                    "order": "ascending",
                    "textAlign": "left"
                },
                {
                    "name": "tokensReward",
                    "label": "Tokens Reward",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "integer"
                },
                {
                    "name": "rewardInBTC",
                    "label": "Reward In BTC",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "8 decimals"
                },
                {
                    "name": "weight",
                    "label": "Weight",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "percentage"
                },
                {
                    "name": "weightPower",
                    "label": "Weight Power",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "2 decimals"
                }
            ]
        }
        /*
        Here we get from the workspace all User Profiles.
        */
        let nodes = UI.projects.workspaces.spaces.designSpace.workspace.getNodesByTypeAndHierarchyHeadsType(nodeType, hierarchyHeadsType)
        /*
        Transform the result array into table records.
        */
        for (let j = 0; j < nodes.length; j++) {
            let node = nodes[j]
            let name = ''
            if (node.payload.parentNode !== undefined) {
                if (node.payload.parentNode.payload.parentNode !== undefined) {
                    if (node.payload.parentNode.payload.parentNode.payload.parentNode !== undefined) {
                        if (node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode !== undefined) {
                            name = name + node.payload.parentNode.payload.parentNode.payload.parentNode.payload.parentNode.name + ' - '
                        }
                        name = name + node.payload.parentNode.payload.parentNode.payload.parentNode.name + ' - '
                    }
                    name = name + node.payload.parentNode.payload.parentNode.name + ' - '
                }
                name = name + node.payload.parentNode.name + ' - '
            }
            name = name + node.name

            let tableRecord = {
                "name": name,
                "tokensReward": node.payload.tokens | 0,
                "rewardInBTC": UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload.tokens | 0),
                "weight": node.payload.weight,
                "weightPower": node.payload.votingProgram.votes | 0
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
                property: 'tokensReward',
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