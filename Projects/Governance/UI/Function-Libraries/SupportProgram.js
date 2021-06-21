function newGovernanceFunctionLibrarySupportProgram() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools,
        userProfiles
    ) {
        UI.projects.governance.utilities.mandatoryProgram.run(
            pools,
            userProfiles,
            "supportProgram",
            "Support-Program",
            "Support Program",
            "Support Power",
            "userSupporters",
            "User Supporter"
        )
    }
}