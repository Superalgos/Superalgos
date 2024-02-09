exports.newGovernanceUtilitiesSAValidations = function newGovernanceUtilitiesSAValidations() {

    let thisObject = {
        onlyOneProgram: onlyOneProgram
    }

    return thisObject

    function onlyOneProgram(userProfile, programNodeType) {
        /*
         Find all the nodes representing the current program.
         */
        let programs = SA.projects.visualScripting.utilities.nodeFunctions.nodeBranchToArray(userProfile, programNodeType)
        if (programs !== undefined) {
            if (programs.length > 1) {
                SA.logger.info('User Profile ' + userProfile.name + ' contains more than one node of type ' + programNodeType + ', ignoring')
                return
            }
            if (programs.length === 1) {
                return programs[0]
            }
        }
    }
}