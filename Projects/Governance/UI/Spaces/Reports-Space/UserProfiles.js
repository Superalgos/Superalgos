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
        let userProfiles = []
        let resultsArary = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadsByNodeType('User Profile')

        for (let j = 0; j < resultsArary.length; j++) {
            let node = resultsArary[j]

            let userProfile = {
                "name": node.name,
                "blockchainPower": node.payload.blockchainTokens,
                "delegatedPower": node.payload.tokenPower - node.payload.blockchainTokens,
                "tokenPower": node.payload.tokenPower
            }

            userProfiles.push(userProfile)
        }

        userProfiles.sort((a, b) => (a.name.toLowerCase() > b.name.toLowerCase()) ? 1 : -1)

        let odd = false

        HTML = HTML + '<table class="governance-info-table">'
        HTML = HTML + '<thead>'
        HTML = HTML + '<tr>'
        HTML = HTML + '<th>' + 'Name' + '</th>'
        HTML = HTML + '<th>' + 'Blockchain Power' + '</th>'
        HTML = HTML + '<th>' + 'Delegated Power' + '</th>'
        HTML = HTML + '<th>' + 'Token Power' + '</th>'
        HTML = HTML + '</tr>'
        HTML = HTML + '<thead>'
        HTML = HTML + '<tbody>'

        for (let j = 0; j < userProfiles.length; j++) {
            let userProfile = userProfiles[j]

            if (odd === true) {
                HTML = HTML + '<tr class="governance-info-table-alt-bg">'
                odd = false
            } else {
                HTML = HTML + '<tr>'
                odd = true
            }

            /*
            Iterate through an object properties.
            */
            for (var property in userProfile) {
                if (Object.prototype.hasOwnProperty.call(userProfile, property)) {
                    HTML = HTML + '<td>' + userProfile[property] + '</td>'
                }
            }

            thisObject.resultCounter++

            HTML = HTML + '</tr>'
        }

        HTML = HTML + '<tbody>'
        HTML = HTML + '</table>'

        return HTML
    }
}