function newGovernanceFunctionLibraryDistributionProcess() {
    let thisObject = {
        calculate: calculate,
        finalize: finalize,
        initialize: initialize
    }

    const DISTRIBUTION_PROCESS_RECALCULATION_DELAY = 5000
    let loop

    return thisObject

    function initialize() {
        loop = true
        calculate()
    }

    function finalize() {
        loop = false
    }

    function calculate() {

        let pools = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Pools')
        let features = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Features')
        let assets = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Assets')
        let positions = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Positions')
        let userProfiles = UI.projects.workspaces.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')
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
        that are going to be delegated, are transferred to the Delegate's User Profile.
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
        /*
        Run the Voting Program
        */
        UI.projects.governance.functionLibraries.votingProgram.calculate(
            pools,
            features,
            assets,
            positions,
            userProfiles
        )
        /*
        Now that we have all votes applied, we will calculate all weights
        */
        UI.projects.governance.functionLibraries.weights.calculate(
            pools,
            features,
            assets,
            positions
        )
        /*
        Let's see how the tokens to be distributed flows into pools, assets, features and positions.
        */
        UI.projects.governance.functionLibraries.tokens.calculate(
            pools
        )
        /*
        Run the Referral Program
        */
        UI.projects.governance.functionLibraries.referralProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Run the Support Program
        */
        UI.projects.governance.functionLibraries.supportProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Run the Influenced Program
        */
        UI.projects.governance.functionLibraries.influencerProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Run the Mentorship Program
        */
        UI.projects.governance.functionLibraries.mentorshipProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Run the Staking Program
        */
        UI.projects.governance.functionLibraries.stakingProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Run the Bitcoin Factory Computing Program
        */
        UI.projects.governance.functionLibraries.computingProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Run the Liquidity Program: One per SA Token Market and Exchange if contract address defined in SaToken.js
        */
        UI.projects.governance.functionLibraries.liquidityProgram.calculate(
            pools,
            userProfiles
        )                    
        /*
        Run the Claims Program
        */
        UI.projects.governance.functionLibraries.claimsProgram.calculate(
            features,
            assets,
            positions,
            userProfiles
        )
        /*
        Run the Github Program
        */
        UI.projects.governance.functionLibraries.githubProgram.calculate(
            pools,
            userProfiles
        )
        /*
        Run the Airdrop Program
        */
        UI.projects.governance.functionLibraries.airdropProgram.calculate(
            pools,
            userProfiles
        )
        /*
        After all the programs were ran, we can calculate the tokens mining
        calculation each profile.
        */
        UI.projects.governance.functionLibraries.tokenMining.calculate(
            userProfiles
        )

        if (loop === true) {
            setTimeout(calculate, DISTRIBUTION_PROCESS_RECALCULATION_DELAY)
        }
    }
}

exports.newGovernanceFunctionLibraryDistributionProcess = newGovernanceFunctionLibraryDistributionProcess