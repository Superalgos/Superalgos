function newFoundationsUtilitiesValidations() {
    let thisObject = {
        onlyOneProgram: onlyOneProgram
    }

    return thisObject

    function onlyOneProgram(userProfile, programNodeType) {
        /*
         Find all the nodes representing the current program.
         */
        let programs = UI.projects.foundations.utilities.branches.nodeBranchToArray(userProfile, programNodeType)
        if (programs !== undefined) {
            if (programs.length > 1) {
                userProfile.payload.uiObject.setErrorMessage('Only one ' + programNodeType + ' is allowed.')
                return
            }
            if (programs.length === 1) {
                return programs[0]
            }
        }
    }
}