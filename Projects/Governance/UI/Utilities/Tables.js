function newGovernanceUtilitiesTables() {
    let thisObject = {
        addHTML: addHTML
    }

    return thisObject

    function addHTML(table, tableRecords, tableRecordDefinition) {
        let HTML = ''
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
        /*
        Get the property type for the current sorting order.
        */
        let propertyType
        for (let i = 0; i < tableRecordDefinition.properties.length; i++) {
            let property = tableRecordDefinition.properties[i]
            if (property.name === sortingOrder.property) {
                propertyType = property.type
                break
            }
        }
        /*
        Apply the sorting order for this table.
        */
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
        /*
        Build the HTML
        */
        let odd = false
        const upArrow = '&uarr;'
        const downArrow = '&darr;'

        HTML = HTML + '<section id="governance-report-page-div" class="governance-search-result-content">'

        HTML = HTML + '<table class="governance-info-table">'
        HTML = HTML + '<thead>'
        HTML = HTML + '<tr>'
        for (let i = 0; i < tableRecordDefinition.properties.length; i++) {
            let property = tableRecordDefinition.properties[i]
            let newOrder
            let orderArrow
            /*
            If the property is the one defining the order, then the new order will be
            the opossite order.
            */
            if (property.name === sortingOrder.property) {
                if (sortingOrder.order === 'ascending') {
                    newOrder = 'descending'
                    orderArrow = upArrow
                } else {
                    newOrder = 'ascending'
                    orderArrow = downArrow
                }
            } else {
                orderArrow = ""
                /*
                If the property is not the current defininf the order, then the new order will
                be the default order for that property.
                */
                for (let i = 0; i < tableRecordDefinition.properties.length; i++) {
                    let propertyDefinition = tableRecordDefinition.properties[i]
                    if (property.name === propertyDefinition.name) {
                        newOrder = propertyDefinition.order
                        break
                    }
                }
            }
            HTML = HTML + '<th>' + '<a href="#" onClick="UI.projects.governance.spaces.reportsSpace.changeTableSortingOrder(\'' + table + '\',\'' + property.name + '\',\'' + newOrder + '\')">' + property.label + ' ' + orderArrow + '</a>' + '</th>'
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

        HTML = HTML + '</section>'

        return HTML
    }
}