function newGovernanceUtilitiesConversions () {
    let thisObject = {
        estimateSATokensInBTC: estimateSATokensInBTC
    }

    return thisObject

    function estimateSATokensInBTC(SATokens) {
        const SA_BTC_BASELINE_EXCHANGE_RATE = 1.0 / 1000000  
        const BTC = SATokens * SA_BTC_BASELINE_EXCHANGE_RATE
        
        return   BTC.toFixed(3)  
    }
}

exports.newGovernanceUtilitiesConversions = newGovernanceUtilitiesConversions