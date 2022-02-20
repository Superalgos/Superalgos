function newFoundationsContributionsPage() {
    let thisObject = {
        editorType: undefined,
        render: render,
        reset:reset,
        initialize: initialize,
        finalize: finalize
    }

    // add needed variables here let monacoInitialized = false

    return thisObject


    function initialize() {
        buildEditorHTML()
    }


    function finalize() {
        // garbage collect variables here
        thisObject.editorType = undefined

    }

    function reset() {
        finalize()
        initialize()
    }

    function render(editorType) {

        thisObject.editorType = editorType
    }

    function buildEditorHTML() {
        let HTML = ''

        HTML += `<section id="contributions-editor-page" class="contributions-editor-page">`
        HTML += '<div class="governance-report-page-header">'
        HTML += '<div class="governance-image-logo-report-page"><img src="Images/superalgos-logo.png" width=200></div>'
        HTML += '</div>'
        HTML += `<div class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2"> Code Editor</h2></div><div id="projectImageDiv" class="docs-image-container"><img src="Icons/Foundations/javascript-code.png" width="50" height="50"></div></div>`
        HTML += `<div id="code-path"></div>`
        HTML += `<div id="no-content" style="margin:auto;text-align:center;"><h2>Nothing to edit...</h2><h3>Try opening a node config or node code</h3></div>`
        HTML += '<div class="editor" id="editor"></div>'
        HTML += `</section>`
        HTML += footer()
        document.getElementById('contributions-content-div').innerHTML = HTML

    }


    function footer() {
        let HTML = ''

        HTML += '<div id="governance-footer" class="governance-node-html-footer-container">' // Container Starts

        // Buttons Section

        HTML += '<div class="governance-node-html-footer-table">'

        HTML += '<div height="100%" class="governance-footer-row">'

        HTML += '<div class="governance-footer-cell">'
        HTML += '<img src="Images/superalgos-logo-white.png" width="200 px" style="margin-bottom: 500px">'
        HTML += '</div>'

        HTML += '</div>'

        HTML += '</div>' // Container Ends

        return HTML
    }
}