function newGovernanceUtilitiesDecendentTables() {
    let thisObject = {
        addHTML: addHTML
    }

    return thisObject

    function addHTML(
        table,
        programName,
        programPropertyName,
        tabIndex
    ) {
        let tableRecords = []
        let tableRecordDefinition = {
            "properties": [
                {
                    "name": "name",
                    "label": "User Profile",
                    "type": "string",
                    "order": "ascending"
                },
                {
                    "name": "ownPower",
                    "label": "Own Power",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "incoming",
                    "label": "Incoming",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "tokensAwarded",
                    "label": "Awarded",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "decendants",
                    "label": "Descendants",
                    "type": "number",
                    "order": "descending"
                },
                {
                    "name": "tokensBonus",
                    "label": "Bonus",
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

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, programName)
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            let tableRecord = {
                "name": userProfile.name,
                "ownPower": program.payload[programPropertyName].ownPower | 0,
                "incoming": program.payload[programPropertyName].incomingPower | 0,
                "tokensAwarded": program.payload[programPropertyName].awarded.tokens | 0,
                "decendants": program.payload[programPropertyName].awarded.count | 0,
                "tokensBonus": program.payload[programPropertyName].bonus.tokens | 0
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
                property: 'tokensAwarded',
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