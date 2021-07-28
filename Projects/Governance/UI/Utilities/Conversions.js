function newGovernanceUtilitiesConversions () {
    let thisObject = {
        estimateSATokensInBTC: estimateSATokensInBTC
    }

    return thisObject

    function estimateSATokensInBTC(SATokens) {
        const SA_BTC_BASELINE_EXCHANGE_RATE = 1.5 / 1000000  
        const BTC = SATokens * SA_BTC_BASELINE_EXCHANGE_RATE
        
        return SATokens + ' SA ≃ ' + BTC.toFixed(8) + ' BTC' 
    }
}