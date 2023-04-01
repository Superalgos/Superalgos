function newGovernanceUtilitiesNodeCalculations() {
    let thisObject = {
       // percentage: percentage,
        getDistributionConfig: getDistributionConfig,
        drawPercentage: drawPercentage
    }

    return thisObject

    // We will calculate the preferred power allocation percentage by using either the user defined 'percentage' or the user defined 'amount' in the node config.
   /*
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
*/

    function getDistributionConfig(node, mode, programPropertyName) {
        if (node.payload === undefined) { return }
        let result = { type: undefined, value: undefined }
        let amount = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'amount')
        let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(node.payload, 'percentage')

        if (percentage !== undefined && amount !== undefined) { return }

        /* Node configuration requests an absolute amount of available power */
        if (amount !== undefined) {
            result.type = "amount"
            /* We do not allow amounts smaller than 0 */
            if (!isFinite(amount) || amount < 0) { return }
            /* Check if the node already has token power and reduce the result accordingly */
            let value;
            if (mode === "tokenPower" && isFinite(node.payload.tokenPower)) {
                value = Math.max(amount - node.payload.tokenPower, 0);
            } else if (mode === "voting" && isFinite(node.payload.votingProgram?.votes)) {
                value = Math.max(amount - node.payload.votingProgram.votes, 0);
            } else if (
                mode === "descendent" &&
                programPropertyName !== undefined &&
                isFinite(node.payload[programPropertyName]?.outgoingPower)
            ) {
                value = Math.max(amount - node.payload[programPropertyName].outgoingPower, 0);
            } else {
                value = amount;
            }
            result.value = value;      
        /* Node configuration requests a percentage of available power  */
        } else if (percentage !== undefined) {
            result.type = "percentage"
            /* We do not allow percentages smaller than 0 */
            if (!isFinite(percentage) || percentage < 0) { return }
            result.value = percentage
        } else {
            return
        }
        return result
    }

    function drawPercentage(node, percentage, percentageAngleOffset) {
        /* Outputs percentage power allocations at nodes, depending if the allocation is percentage or absolute amount-based */
        if (node === undefined) { return }
        if (percentage === undefined) { return }
        if (isNaN(percentage)) {
            node.payload.uiObject.resetPercentage()
        } else {
            if (percentageAngleOffset !== undefined && isFinite(percentageAngleOffset)) {
                node.payload.uiObject.percentageAngleOffset = percentageAngleOffset
                node.payload.uiObject.percentageAtAngle = true
            }
            node.payload.uiObject.setPercentage(percentage.toFixed(2),
            UI.projects.governance.globals.designer.SET_PERCENTAGE_COUNTER)
        }
    }

}