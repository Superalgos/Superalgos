function newGovernanceUtilitiesFilters() {
    let thisObject = {
        applyFilters: applyFilters
    }

    return thisObject

    function applyFilters(filters, filtersObject, tableRecord) {
        /* Apply Filters */
        let passedFilters = true
        if (filtersObject !== undefined) {
            for (var property in tableRecord) {
                if (Object.prototype.hasOwnProperty.call(tableRecord, property)) {
                    let fiter = filtersObject[property]
                    if (fiter === undefined) { continue }
                    let value = tableRecord[property]
                    let condition = eval(fiter)
                    if (condition === false) {
                        passedFilters = false
                    }
                }
            }
        } else {
            /*
            We will assume the filter is a string and that needs to be applied to the property name.
            */
            if (
                filters !== undefined &&
                filters !== "" &&
                tableRecord.name.indexOf(filters) < 0
            ) {
                passedFilters = false
            }
        }
        return passedFilters
    }
}

exports.newGovernanceUtilitiesFilters = newGovernanceUtilitiesFilters