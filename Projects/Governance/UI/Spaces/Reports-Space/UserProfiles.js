function newGovernanceReportsUserProfiles() {
    let thisObject = {
        resultCounter: undefined, 
        addHTML: addHTML,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function addHTML() {

        thisObject.resultCounter = 0
        let HTML = ''

        let resultsArary = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')

        for (let j = 0; j < resultsArary.length; j++) {
            let userProfile = resultsArary[j]

            thisObject.resultCounter++

            HTML = HTML + '<div class="governance-search-result-content-record-container">'
            HTML = HTML + '<p class="governance-search-result-content-record-project-category">' + userProfile.name + '</p>'

            HTML = HTML + '</div>'
        }

        return HTML
    }
}