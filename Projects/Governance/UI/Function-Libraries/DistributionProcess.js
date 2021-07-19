function newGovernanceFunctionLibraryDistributionProcess() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate() {

        let pools = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Pools')
        let features = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Features')
        let assets = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Assets')
        let positions = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Positions')
        let userProfiles = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
        /*
        Here we are going to read the amount of tokens at the blockchain
        and make a first round of distribution so that they can reach 
        all the defined Programs.
        */
        UI.projects.governance.functionLibraries.tokenPower.calculateTokenPower(
            userProfiles
        )
        /*
        Here we will run the Delegation Program, so that all the tokens
        that are going to be delegated, are transfered to the Delegate User Profile.
        */
        UI.projects.governance.functionLibraries.delegationProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Here we are going to do the distribution of the delegated tokens so that they
        can also reach all the defined Programs.
        */
        UI.projects.governance.functionLibraries.tokenPower.calculateDelegatedPower(
            userProfiles
        )
        UI.projects.governance.functionLibraries.votingProgram.calculate(
            pools,
            features,
            assets,
            positions,
            userProfiles
        )

        UI.projects.governance.functionLibraries.weights.calculate(
            pools,
            features,
            assets,
            positions
        )

        UI.projects.governance.functionLibraries.tokens.calculate(
            pools
        )

        UI.projects.governance.functionLibraries.referralProgram.calculate(
            pools,
            userProfiles
        )

        UI.projects.governance.functionLibraries.supportProgram.calculate(
            pools,
            userProfiles
        )

        UI.projects.governance.functionLibraries.mentorshipProgram.calculate(
            pools,
            userProfiles
        )

        UI.projects.governance.functionLibraries.stakingProgram.calculate(
            pools,
            userProfiles
        )

        UI.projects.governance.functionLibraries.claimsProgram.calculate(
            features,
            assets,
            positions,
            userProfiles
        )
    }
}