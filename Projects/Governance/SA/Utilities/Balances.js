exports.newGovernanceUtilitiesBalances = function newGovernanceUtilitiesBalances() {

    let thisObject = {
        toSABalanceString: toSABalanceString
    }

    return thisObject

    function toSABalanceString(balance) {
        return Math.trunc(balance).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' SA'
    }
}