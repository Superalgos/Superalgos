function newGovernanceReportsReferrals() {
    let thisObject = {
        addHTML: addHTML,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function addHTML(tabIndex, filters) {
        return UI.projects.governance.utilities.decendentTables.addHTML(
            'referrals',
            'Referral Program',
            'referralProgram',
            tabIndex, 
            filters
        )
    }
}