function newGovernanceUtilitiesNodeCalculations() {
    let thisObject = {
        percentage: percentage
    }

    return thisObject

    // We will calculate the preferred power allocation percentage by using either the user defined 'percentage' or the user defined 'amount' in the node config.

    function percentage(node) {
        let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'percentage')
        let amount = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'amount')
        let parentPower = node.payload.parentNode.payload.tokenPower

        // If user havn't defined any of the values in the config, we return 'undefined'
        if (percentage === undefined && amount === undefined) {
            return undefined
        }

        // If only 'percentage' is defined, we return that number
        else if (isFinite(percentage) && !isFinite(amount)) {
            return percentage
        }

        // If only 'amount' is defined, we use calculate what percentage 'amount' is of the 'parentPower'.
        else if (!isFinite(percentage) && isFinite(amount)) {
            percentage = (amount / parentPower) * 100

            // If the 'amount' is greater than what is available at the parent node, we assume it is intended and is used as a "maximum power".
            if (percentage > 100) {
                return 100
            }
            return percentage
        }

        // If both 'percentage' and 'amount' is defined or 'parentPower' is missing - We throw an error
        else {
            node.payload.uiObject.setErrorMessage(
                '"parentPower" missing or both "amount" and "percentage" are present in the config - Only one may be defined.',
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
    }
}