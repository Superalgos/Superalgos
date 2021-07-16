function newGovernanceReportsFiltersHeader() {
    let thisObject = {
        addFilterHeader: addFilterHeader,
        detectEnterOnFiltersBox: detectEnterOnFiltersBox,
        setFocusOnFiltersBox: setFocusOnFiltersBox,
        render: render,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function render() {
        let HTML = ''
        HTML = HTML + '<div id="governance-search-page-div">'
        HTML = HTML + '<center><img src="Images/superalgos-logo.png" class="governance-image-logo-search" width=400></center>'
        HTML = HTML + '<center><div class="governance-font-normal governance-search-box"><input class="governance-search-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input></div></center>'
        HTML = HTML + '</div>'
        let docsContentDiv = document.getElementById('governance-content-div')
        docsContentDiv.innerHTML = HTML + UI.projects.education.spaces.docsSpace.footer.addFooter()

        UI.projects.governance.spaces.reportsSpace.filtersHeader.detectEnterOnFiltersBox()
        UI.projects.governance.spaces.reportsSpace.filtersHeader.setFocusOnFiltersBox()
    }

    function addFilterHeader() {
        let HTML = ''
        // Logo & Search Box
        HTML = HTML + '<div class="governance-report-page-header">'
        HTML = HTML + '<div class="governance-image-logo-report-page"><img src="Images/superalgos-logo.png" width=200></div>'
        HTML = HTML + '<div class="governance-report-page-box">'
        HTML = HTML + '<input class="governance-search-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input>'
        HTML = HTML + '</div>'
        HTML = HTML + '</div>'

        return HTML
    }

    function detectEnterOnFiltersBox() {
        const element = document.getElementsByClassName("governance-search-input")[0]
        if (UI.projects.education.spaces.docsSpace.commandInterface.command !== undefined) {
            element.value = UI.projects.education.spaces.docsSpace.commandInterface.command
        }
        element.addEventListener("keyup", function (event) {
            if (event.key === "Enter" || event.keyCode === 13) {
                UI.projects.education.spaces.docsSpace.exitEditMode()
                UI.projects.education.spaces.docsSpace.currentBookBeingRendered = undefined
                UI.projects.education.spaces.docsSpace.currentDocumentBeingRendered = undefined
                UI.projects.education.spaces.docsSpace.contextMenu.removeContextMenuFromScreen()
                UI.projects.education.spaces.docsSpace.commandInterface.command = element.value.trim()
                UI.projects.education.spaces.docsSpace.commandInterface.detectCommands()
            }
        });
    }

    function setFocusOnFiltersBox() {
        const element = document.getElementsByClassName("governance-search-input")[0]
        element.focus()
    }
}