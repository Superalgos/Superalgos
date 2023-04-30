exports.newGovernanceUtilitiesBalances = function newGovernanceUtilitiesBalances() {

    let thisObject = {
        toSABalanceString: toSABalanceString,
        toTokenPowerString: toTokenPowerString
    }

    return thisObject

    function toSABalanceString(balance) {
        return Math.trunc(balance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' SA'
    }

    function toTokenPowerString(tokenPower) {
        return parseFloat(tokenPower.toFixed(0)).toLocaleString('en')
    }

}