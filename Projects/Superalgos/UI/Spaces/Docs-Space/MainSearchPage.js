function newSuperalgosDocsMainSearchPage() {
    let thisObject = {
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
        HTML = HTML + '<div id="docs-search-page-div">'
        HTML = HTML + '<center><img src="Images/superalgos-logo.png" class="docs-image-logo-search" width=400></center>'
        HTML = HTML + '<center><div class="docs-font-normal docs-search-box"><input class="docs-search-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input></div></center>'
        HTML = HTML + '</div>'
        let docsContentDiv = document.getElementById('docs-content-div')
        docsContentDiv.innerHTML = HTML + UI.projects.superalgos.spaces.docsSpace.footer.addFooter()
    }
}