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
        let HTML = ''
        let tableRecords = []
        let tableRecordDefinition = {
            "properties": [
                {
                    "name": "name",
                    "label": "Name",
                    "type": "string"
                },
                {
                    "name": "blockchainPower",
                    "label": "Blockchain Power",
                    "type": "number"
                },
                {
                    "name": "delegatedPower",
                    "label": "Name",
                    "type": "number"
                },
                {
                    "name": "tokenPower",
                    "label": "Token Power",
                    "type": "number"
                }
            ]
        }
        let resultsArary = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')

        for (let j = 0; j < resultsArary.length; j++) {
            let node = resultsArary[j]

            let tableRecord = {
                "name": node.name,
                "blockchainPower": node.payload.blockchainTokens,
                "delegatedPower": node.payload.tokenPower - node.payload.blockchainTokens,
                "tokenPower": node.payload.tokenPower
            }

            tableRecords.push(tableRecord)
        }

        /*
        Apply the sorting order for this table.
        */
        let sortingOrder = UI.projects.governance.spaces.reportsSpace.tablesSortingOrders['userProfiles']
        let propertyType

        for (let i = 0; i < tableRecordDefinition.properties.length; i++) {
            let property = tableRecordDefinition.properties[i]
            if (property.name === sortingOrder.property) {
                propertyType = property.type
                break
            }
        }

        switch (propertyType) {
            case 'string': {
                switch (sortingOrder.order) {
                    case 'ascending': {
                        tableRecords.sort((a, b) => (a[sortingOrder.property].toLowerCase() > b[sortingOrder.property].toLowerCase()) ? 1 : -1)
                        break
                    }
                    case 'descending': {
                        tableRecords.sort((a, b) => (a[sortingOrder.property].toLowerCase() > b[sortingOrder.property].toLowerCase()) ? -1 : 1)
                        break
                    }
                }
                break
            }
            case 'number': {
                switch (sortingOrder.order) {
                    case 'ascending': {
                        tableRecords.sort((a, b) => (a[sortingOrder.property] > b[sortingOrder.property]) ? 1 : -1)
                        break
                    }
                    case 'descending': {
                        tableRecords.sort((a, b) => (a[sortingOrder.property] > b[sortingOrder.property]) ? -1 : 1)
                        break
                    }
                }
                break
            }
        }

        let odd = false

        HTML = HTML + '<table class="governance-info-table">'
        HTML = HTML + '<thead>'
        HTML = HTML + '<tr>'
        for (let i = 0; i < tableRecordDefinition.properties.length; i++) {
            let property = tableRecordDefinition.properties[i]
            HTML = HTML + '<th>' + '<a href="#" onClick="UI.projects.governance.spaces.reportsSpace.changeTableSortingOrder(\'' + property.name + '\')">' + property.label + '</a>' + '</th>'
        }
        HTML = HTML + '</tr>'
        HTML = HTML + '<thead>'
        HTML = HTML + '<tbody>'

        for (let j = 0; j < tableRecords.length; j++) {
            let tableRecord = tableRecords[j]

            if (odd === true) {
                HTML = HTML + '<tr class="governance-info-table-alt-bg">'
                odd = false
            } else {
                HTML = HTML + '<tr>'
                odd = true
            }

            /*
            Iterate through tableRecord properties.
            */
            for (var property in tableRecord) {
                if (Object.prototype.hasOwnProperty.call(tableRecord, property)) {
                    HTML = HTML + '<td>' + tableRecord[property] + '</td>'
                }
            }

            thisObject.resultCounter++

            HTML = HTML + '</tr>'
        }

        HTML = HTML + '<tbody>'
        HTML = HTML + '</table>'

        return HTML
    }
}