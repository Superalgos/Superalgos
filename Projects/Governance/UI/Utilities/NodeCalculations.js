function newGovernanceUtilitiesNodeCalculations() {
    let thisObject = {
        getDistributionConfig: getDistributionConfig,
        drawPercentage: drawPercentage
    }

    return thisObject

    // We will calculate the preferred power allocation percentage by using either the user defined 'percentage' or the user defined 'amount' in the node config.
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

exports.newGovernanceUtilitiesNodeCalculations = newGovernanceUtilitiesNodeCalculations