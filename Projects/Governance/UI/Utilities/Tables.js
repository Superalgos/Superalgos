function newGovernanceUtilitiesTables() {
    let thisObject = {
        addHTML: addHTML
    }

    return thisObject

    function addHTML(
        table,
        tableRecords,
        tableRecordDefinition,
        sortingOrder,
        tabIndex
    ) {
        let HTML = ''
        let resultCounter = 0
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
            the opposite order.
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
                If the property is not the current defining the order, then the new order will
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
            HTML = HTML + '<th>' + '<a href="#" onClick="UI.projects.governance.spaces.reportsSpace.changeTableSortingOrder(\'' + table + '\',\'' + property.name + '\',\'' + newOrder + '\',\'' + tabIndex + '\')">' + property.label + ' ' + orderArrow + '</a>' + '</th>'
        }
        HTML = HTML + '</tr>'
        HTML = HTML + '<thead>'
        HTML = HTML + '<tbody>'

        for (let j = 0; j < tableRecords.length; j++) {
            let textAligment = 'center'
            let format = 'text'
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

                    /*
                    Get Text Align and Format
                    */
                    for (let i = 0; i < tableRecordDefinition.properties.length; i++) {
                        let propertyDefinition = tableRecordDefinition.properties[i]
                        if (property === propertyDefinition.name) {
                            textAligment = propertyDefinition.textAlign
                            format = propertyDefinition.format
                            break
                        }
                    }
                    let value = tableRecord[property]
                    if (value === undefined) { value = 0 }
                    switch (format) {
                        case 'text': {

                            break
                        }
                        case 'integer': {
                            value = parseFloat(parseFloat(value).toFixed(0)).toLocaleString('en')
                            break
                        }
                        case '2 decimals': {
                            value = parseFloat(parseFloat(value).toFixed(2)).toLocaleString('en')
                            break
                        }
                        case 'percentage': {
                            if (isNaN(value)) { value = 0 }
                            value = (value * 100).toFixed(2) + "%"
                            break
                        }
                    }
                    HTML = HTML + '<td style="text-align:' + textAligment + ';">' + value + '</td>'
                }
            }

            resultCounter++

            HTML = HTML + '</tr>'
        }

        HTML = HTML + '<tbody>'
        HTML = HTML + '</table>'

        HTML = HTML + '</section>'

        return { HTML: HTML, resultCounter: resultCounter }
    }
}