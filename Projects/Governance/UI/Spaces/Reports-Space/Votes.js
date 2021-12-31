function newGovernanceReportsVotes() {
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
        Parameters
        */
        let table = 'votes'
        let programName = 'Voting Program'
        let programPropertyName = 'votingProgram'
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
                    "name": "ownPower",
                    "label": "Own Power",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "2 decimals"
                },
                {
                    "name": "incoming",
                    "label": "Incoming",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "2 decimals"
                },
                {
                    "name": "reputation",
                    "label": "Reputation",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "2 decimals"
                },
                {
                    "name": "votingPower",
                    "label": "Voting Power",
                    "type": "number",
                    "order": "descending",
                    "textAlign": "center",
                    "format": "2 decimals"
                },
                {
                    "name": "tokensBonus",
                    "label": "Bonus",
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
        let userProfiles = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        /*
        Transform the result array into table records.
        */
        for (let j = 0; j < userProfiles.length; j++) {
            let userProfile = userProfiles[j]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, programName)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            if (program.payload[programPropertyName] === undefined) { continue }
            if (program.payload[programPropertyName].bonus === undefined) { continue }

            let tableRecord = {
                "name": userProfile.name,
                "ownPower": program.payload[programPropertyName].ownPower - userProfile.payload.reputation | 0,
                "incoming": program.payload[programPropertyName].incomingPower | 0,
                "reputation": userProfile.payload.reputation | 0,
                "votingPower": program.payload[programPropertyName].ownPower + program.payload[programPropertyName].incomingPower | 0,
                "tokensBonus": program.payload[programPropertyName].bonus.tokens | 0
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
                property: 'tokensBonus',
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