exports.newPortfolioManagementBotModulesPortfolioFormulasManager = function (processIndex) {
    /*
    This object represents the Formulas Manager at the Portfolio System.
    Here we will process requests comming from Trading Bots to
    the Formulas Manager.
    */
    let thisObject = {
        confirmThisFormula: confirmThisFormula,
        setThisFormula: setThisFormula,
        initialize: initialize,
        finalize: finalize
    }

    let portfolioSystem
    let formulasManagerMap

    return thisObject

    function initialize() {
        portfolioSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.portfolioSystem

        formulasManagerMap = new Map()
        for (let i = 0; i < portfolioSystem.managedSessionReferences.length; i++) {
            let managedSessionReference = portfolioSystem.managedSessionReferences[i]
            if (managedSessionReference.referenceParent === undefined) { continue }
            formulasManagerMap.set(managedSessionReference.referenceParent.id, managedSessionReference.formulasManager)
        }
    }

    function finalize() {
        portfolioSystem = undefined
        formulasManagerMap = undefined
    }

    function confirmThisFormula(sessionId, formula) {
        let formulasManager = formulasManagerMap.get(sessionId)

        if (formulasManager === undefined) {
            let response = {
                status: 'Not Ok',
                reason: "No Portfolio Formulas Manager found at Portfolio System for this Managed Session."
            }
            return response
        }
        if (formulasManager.confirmFormulaRules === undefined) {
            let response = {
                status: 'Not Ok',
                reason: "No Confirm Formulas Rules found at Portfolio Formulas Manager"
            }
            return response
        }

        for (let i = 0; i < formulasManager.confirmFormulaRules.confirmFormulaReferences.length; i++) {
            let confirmFormulaReference = formulasManager.confirmFormulaRules.confirmFormulaReferences[i]

            if (confirmFormulaReference.formula === undefined) { continue }
            if (confirmFormulaReference.referenceParent === undefined) { continue }
            if (confirmFormulaReference.referenceParent.id !== formula.node.parentNode.id) { continue }

            portfolioSystem.evalFormulas(confirmFormulaReference, 'Confirm Formula Reference', formula.value)

            let value = portfolioSystem.formulas.get(confirmFormulaReference.formula.id)

            let response = {
                status: 'Ok',
                value: value
            }
            return response
        }
    }

    function setThisFormula(sessionId, formula) {
        let formulasManager = formulasManagerMap.get(sessionId)

        if (formulasManager === undefined) {
            let response = {
                status: 'Not Ok',
                reason: "No Portfolio Formulas Manager found at Portfolio System for this Managed Session."
            }
            return response
        }
        if (formulasManager.setFormulaRules === undefined) {
            let response = {
                status: 'Not Ok',
                reason: "No Set Formulas Rules found at Portfolio Formulas Manager"
            }
            return response
        }

        for (let i = 0; i < formulasManager.setFormulaRules.setFormulaReferences.length; i++) {
            let setFormulaReference = formulasManager.setFormulaRules.setFormulaReferences[i]

            if (setFormulaReference.formula === undefined) { continue }
            if (setFormulaReference.referenceParent === undefined) { continue }
            if (setFormulaReference.referenceParent.id !== formula.node.parentNode.id) { continue }

            portfolioSystem.evalFormulas(setFormulaReference, 'Set Formula Reference')

            let value = portfolioSystem.formulas.get(setFormulaReference.formula.id)

            let response = {
                status: 'Ok',
                value: value
            }
            return response
        }
    }
}
