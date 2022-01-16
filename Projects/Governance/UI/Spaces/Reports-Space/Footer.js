function newGovernanceReportsFooter() {
    let thisObject = {
        addFooter: addFooter,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function addFooter() {

        let HTML = ''

        HTML = HTML + '<div id="governance-footer" class="governance-node-html-footer-container">' // Container Starts

        // Buttons Section

        HTML = HTML + '<div class="governance-node-html-footer-table">'

        HTML = HTML + '<div height="100%" class="governance-footer-row">'

        HTML = HTML + '<div class="governance-footer-cell">'
        HTML = HTML + '<img src="Images/superalgos-logo-white.png" width="200 px" style="margin-bottom: 500px">'
        HTML = HTML + '</div>'

        HTML = HTML + '</div>'

        HTML = HTML + '</div>' // Container Ends

        return HTML
    }
}