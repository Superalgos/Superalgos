function newGovernanceFunctionLibrarySupportProgram() {
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
            "supportProgram",
            "Support-Rewards",
            "Support Program",
            "Support Power",
            "userSupporters",
            "User Supporter"
        )

        UI.projects.governance.utilities.bonusProgram.run(
            pools,
            userProfiles,
            "supportProgram",
            "Support-Bonus",
            "Support Program"
        )
    }
}

exports.newGovernanceFunctionLibrarySupportProgram = newGovernanceFunctionLibrarySupportProgram