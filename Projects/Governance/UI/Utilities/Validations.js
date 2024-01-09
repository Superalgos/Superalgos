function newGovernanceUtilitiesValidations() {
    let thisObject = {
        onlyOneProgram: onlyOneProgram,
        onlyOneProgramBasedOnConfigProperty: onlyOneProgramBasedOnConfigProperty,
        onlyOneProgramBasedOnMultipleConfigProperties: onlyOneProgramBasedOnMultipleConfigProperties
    }

    return thisObject

    function onlyOneProgram(userProfile, programNodeType) {
        /*
         Find all the nodes representing the current program.
         */
        let programs = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile, programNodeType)
        if (programs !== undefined) {
            if (programs.length > 1) {
                userProfile.payload.uiObject.setErrorMessage(
                    'Only one ' + programNodeType + ' is allowed.',
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
                return
            }
            if (programs.length === 1) {
                return programs[0]
            }
        }
    }

    function onlyOneProgramBasedOnConfigProperty(userProfile, programNodeType, configProperetyName, configProperetyValue) {
        /*
         Find all the nodes representing the current program.
         */
        let programs = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile, programNodeType)
        if (programs !== undefined) {
            for (let i = 0; i < programs.length; i++) {
                let program = programs[i]
                let propertyValue = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(program.payload, configProperetyName)
                if (propertyValue === configProperetyValue) {
                    return program
                }
            }
        }
    }

    function onlyOneProgramBasedOnMultipleConfigProperties(userProfile, programNodeType, configPropertyObject) {
        /*
         Find all the nodes representing the current program. All parameters passed in the configPropertyObject must be configured.
         */
        let programs = UI.projects.visualScripting.utilities.branches.nodeBranchToArray(userProfile, programNodeType)
        if (programs !== undefined) {
            for (let i = 0; i < programs.length; i++) {
                let program = programs[i]
                let valid = true
                for (let configPropertyName in configPropertyObject) {
                    let configPropertyValue = configPropertyObject[configPropertyName]
                    let propertyValue = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(program.payload, configPropertyName)
                    if ((propertyValue === undefined || propertyValue === '') && configPropertyValue === null) { continue }
                    if (propertyValue !== configPropertyValue) { 
                        valid = false
                    }
                }
                if (valid === true) {
                    return program
                }
            }
        }
    }
}

exports.newGovernanceUtilitiesValidations = newGovernanceUtilitiesValidations