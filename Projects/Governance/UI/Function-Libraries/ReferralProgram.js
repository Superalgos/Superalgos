function newGovernanceFunctionLibraryReferralProgram() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools,
        userProfiles
    ) {
        UI.projects.governance.utilities.decendentProgram.run(
            pools,
            userProfiles,
            "referralProgram",
            "Referral-Program",
            "Referral Program",
            "Referral Power",
            "userReferrers",
            "User Referrer"
        )
    }
}