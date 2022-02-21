function newFoundationsContributionsPage() {
    let thisObject = {
        repoStatus: undefined,
        render: render,
        reset:reset,
        initialize: initialize,
        finalize: finalize,
        getStatus: getStatus
    }

    // add needed variables here let monacoInitialized = false

    return thisObject


    function initialize() {
        getStatus()
    }


    function finalize() {
        // garbage collect variables here
        thisObject.repoStatus = undefined

    }

    function reset() {
        finalize()
        initialize()
    }

    function render(editorType) {

        //thisObject.editorType = editorType
    }

    function buildEditorHTML() {
        let HTML = ''

        HTML += `<section id="contributions-editor-page" class="contributions-editor-page">`

        //Page Header
        HTML += '<div class="governance-report-page-header">'
        HTML += '<div class="governance-image-logo-report-page"><img src="Images/superalgos-logo.png" width=200></div>'
        HTML += '</div>'
        HTML += `<div class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h3"> Contributions Editor</h2></div><div id="projectImageDiv" class="docs-image-container"><img src="Icons/Foundations/github.png" width="50" height="50"></div></div>`
        
        // Page content
        HTML += '<div class="contributions-common-style-container" id="contributions">'
        
        for (const stat of thisObject.repoStatus) {
            HTML += '<div class="docs-h2">' + stat[0] + '</div>'
            HTML += '<div>Changed: ' + JSON.stringify(stat[1].changed) + '\n Deletions: ' + JSON.stringify(stat[1].deletions) + '\n Insertions: ' + JSON.stringify(stat[1].insertions) +'\n </div>'
            for (const file of stat[1].files) {
                HTML += '<div>File: ' + JSON.stringify(file.file) + ' Changes: ' + JSON.stringify(file.changes) + ' Deletions: ' + JSON.stringify(file.deletions) + ' Insertions: ' + JSON.stringify(file.insertions) +'</div>'
            }
        }
        
        HTML +='</div>'
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

    function getStatus() {
        httpRequest(undefined, 'App/Status', onResponse)
        
        function onResponse(err, data) {
            /* Lets check the result of the call through the http interface */
            data = JSON.parse(data)
            if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                thisObject.repoStatus = data
                // Render information by rebuilding html
                buildEditorHTML()
                console.log("this is the reponse", data)
        
            } else {
                // will need to open docs space to display this error 
                UI.projects.education.spaces.docsSpace.navigateTo(
                    data.docs.project,
                    data.docs.category,
                    data.docs.type,
                    data.docs.anchor,
                    undefined,
                    data.docs.placeholder
                    )               
                }
            }
    }
}