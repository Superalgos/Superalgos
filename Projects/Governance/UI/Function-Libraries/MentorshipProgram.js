function newGovernanceFunctionLibraryMentorshipProgram() {
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
            "mentorshipProgram",
            "Mentorship-Rewards",
            "Mentorship Program",
            "Mentorship Power",
            "userMentors",
            "User Mentor"
        )

        UI.projects.governance.utilities.bonusProgram.run(
            pools,
            userProfiles,
            "mentorshipProgram",
            "Mentorship-Bonus",
            "Mentorship Program"
        )
    }
}

exports.newGovernanceFunctionLibraryMentorshipProgram = newGovernanceFunctionLibraryMentorshipProgram