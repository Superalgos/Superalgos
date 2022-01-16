function newGovernanceReportsMentors() {
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
            'mentors',
            'Mentorship Program',
            'mentorshipProgram',
            tabIndex,
            filters
        )
    }
}