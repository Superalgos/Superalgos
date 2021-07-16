function newGovernanceReportsPools() {
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
        let table = 'pools'
        let tableRecordDefinition = {
            "properties": [
                {
                    "name": "name",
                    "label": "Name",
                    "type": "string",
                    "order": "ascending"
                },
                {
                    "name": "tokensReward",
                    "label": "Tokens Reward",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "weight",
                    "label": "Weight",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "weightPower",
                    "label": "Weight Power",
                    "type": "number",
                    "order": "descending"
                }
            ]
        }
        /*
        Here we get from the workspace all User Profiles.
        */
        let pools = UI.projects.foundations.spaces.designSpace.workspace.getNodesByTypeAndHierarchyHeadsType('Pool', 'Pools')
        /*
        Transform the result array into table records.
        */
        for (let j = 0; j < pools.length; j++) {
            let pool = pools[j]

            let tableRecord = {
                "name": pool.name,
                "tokensReward": pool.payload.tokens | 0,
                "weight": pool.payload.weight ,
                "weightPower": pool.payload.votingProgram.votes 
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