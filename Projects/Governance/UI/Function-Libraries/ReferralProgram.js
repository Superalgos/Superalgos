function newGovernanceFunctionLibraryReferralProgram() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools,
        userProfiles
    ) {

        UI.projects.governance.utilities.bonusProgram.run(
            pools,
            userProfiles,
            "referralProgram",
            "Referrals-Bonus"
        )

        UI.projects.governance.utilities.decendentProgram.run(
            pools,
            userProfiles,
            "referralProgram",
            "Referrals-Rewards",
            "Referral Program",
            "Referral Power",
            "userReferrers",
            "User Referrer"
        )
    }
}