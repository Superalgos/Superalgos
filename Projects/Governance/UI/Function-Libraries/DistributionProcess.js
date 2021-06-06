function newGovernanceFunctionLibraryDistributionProcess() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate() {

        let pools = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Pools')
        let features = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Features')
        let assets = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Assets')
        let positions = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('Positions')
        let userProfiles = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')

        UI.projects.governance.functionLibraries.votes.calculate(
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
/*
        UI.projects.governance.functionLibraries.claims.calculate(
            features,
            assets,
            positions
        )
*/
        UI.projects.governance.functionLibraries.tokens.calculate(
            pools
        )
    }
}