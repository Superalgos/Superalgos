function newGovernanceFunctionLibraryInfluencerProgram() {
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
            "influencerProgram",
            "Influencer-Rewards",
            "Influencer Program",
            "Influencer Power",
            "userInfluencerers",
            "User Influencerer"
        )

        UI.projects.governance.utilities.bonusProgram.run(
            pools,
            userProfiles,
            "influencerProgram",
            "Influencer-Bonus",
            "Influencer Program"
        )
    }
}

exports.newGovernanceFunctionLibraryInfluencerProgram = newGovernanceFunctionLibraryInfluencerProgram