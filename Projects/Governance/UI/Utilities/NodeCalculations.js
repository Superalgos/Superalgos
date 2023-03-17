function newGovernanceUtilitiesNodeCalculations() {
    let thisObject = {
        percentage: percentage
    }

    return thisObject

    // We will calculate the preferred power allocation percentage by using either the user defined 'percentage' or the user defined 'amount' in the node config.

    function percentage(node) {
        if (node.config !== undefined) {
            try {
                JSON.parse(node.config)
            }
            catch (error) {
                return
            }
            let config = JSON.parse(node.config)
            let percentage = config.percentage
            let amount = config.amount
            let parentPower = node.payload.parentNode.payload.tokenPower

            // Check that not both are defined
            if (percentage !== undefined && amount !== undefined) {
                node.payload.uiObject.setErrorMessage(
                    'Both "amount" and "percentage" are present in the config - Only one may be defined.',
                    10
                )
                return
            }

            // If only 'percentage' is defined, we return that number
            else if (isFinite(percentage) && !isFinite(amount)) {
                return percentage
            }

            // If only 'amount' is defined, we use calculate what percentage 'amount' is of the 'parentPower'.
            else if (!isFinite(percentage) && isFinite(amount) && isFinite(parentPower)) {
                percentage = (amount / parentPower) * 100

                // If the 'amount' is greater than what is available at the parent node, we assume it is intended and is used as a "maximum power".
                if (percentage > 100) {
                    return 100
                }
                return percentage
            }

            // If user havn't defined any of the values in the config, we return 'undefined'
            else {
                return undefined
            }
        }
        return
    }
}