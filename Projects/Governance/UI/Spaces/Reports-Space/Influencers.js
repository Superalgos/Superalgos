function newGovernanceReportsInfluencers() {
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
            'influencers',
            'Influencer Program',
            'influencerProgram',
            tabIndex,
            filters
        )
    }
}