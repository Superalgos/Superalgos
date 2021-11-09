function newFoundationsCodeEditorEditorPage() {
    let thisObject = {
        originatingNode: undefined,
        render: render,
        initialize: initialize,
        finalize: finalize
    }

    let monacoInitialized = false
    let monacoEditor = undefined
    let recordFormulaString = ''
    let codeString = ''
    let tradingEngineObj = undefined

    return thisObject


    function initialize() {
        monacoInitialized = false
        buildEditorHTML()
        buildIntelliSenseModels()
    }

    function buildEditorHTML() {
        let HTML = ''

        HTML += `<section id="code-editor-page" class="code-editor-page">`
        HTML += '<div class="governance-report-page-header">'
        HTML += '<div class="governance-image-logo-report-page"><img src="Images/superalgos-logo.png" width=200></div>'
        HTML += '</div>'
        HTML += `<div class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2"> Code Editor</h2></div><div id="projectImageDiv" class="docs-image-container"><img src="Icons/Foundations/javascript-code.png" width="50" height="50"></div></div>`
        HTML += `<div id="code-path"></div>`
        HTML += `<div class="docs-summary"><b>Notes:</b> Changes are saved automatically</div>`
        HTML += `<div class="editor" id="editor"></div>`
        HTML += `</section>`
        HTML += footer()
        document.getElementById('code-editor-content-div').innerHTML = HTML

    }


    function footer() {
        let HTML = ''

        HTML += HTML + '<div id="governance-footer" class="governance-node-html-footer-container">' // Container Starts

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


    function finalize() {
        monacoEditor = undefined
    }

    function render(originatingNode, rootNodes) {

        thisObject.originatingNode = originatingNode
        intellisenseModels = []

        createCodePath()
        /**
         * The reason we are doing the monaco initialization here is simply because monaco will set his own width at the moment it's rendered
         * Rendering it earlier when the code panel is closed will result in a very narrow width
         * Thus we choose to render it after the panel has his width set correctly
         * Probably there is a better way but at the time this has been coded, nothing seemed to work
         **/

        require(["vs/editor/editor.main"], function () {
            if (monacoEditor === undefined) {
                monacoEditor = monaco.editor.create(document.querySelector('#editor'), {
                    language: 'javascript',
                    model: null,
                    theme: 'vs-dark',
                    fixedOverflowWidgets: true
                });


                //Creating default models
                monaco.editor.createModel(codeString, "javascript")
                monaco.editor.createModel(recordFormulaString, "javascript")


                monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                    allowNonTsExtensions: true
                });
                let currentModel = monaco.editor.createModel(originatingNode.payload.node.code, "javascript")
                monacoEditor.setModel(currentModel)
            } else {
                let currentModel = monaco.editor.createModel(originatingNode.payload.node.code, "javascript")
                monacoEditor.setModel(currentModel)
            }

            //Registering events
            monacoEditor.getModel().onDidChangeContent(function () {
                originatingNode.payload.node.code = monacoEditor.getValue()
            })
        });

    }

    /**
     * The autocomplete models will be based on:
     * 1.  all data mines loaded into workspace
     * 2. trading engine loaded into the workspace
     *
     * TODO: It is compulsory that at one moment in time we should add proper definitions for our variables (to mimic some framework), but this is a different task and can be improved over time
     * TODO: It is recommended that for extending it to read the monaco editor docs: https://microsoft.github.io/monaco-editor/api/interfaces/monaco.languages.completionitemprovider.html and https://microsoft.github.io/monaco-editor/playground.html#extending-language-services-completion-provider-example
     * TODO: Right now the intellisense model is rather primitive being built on existing code available in the workspace without having any definitions, but strong enough to provide accurate autocompletion
     */
    function buildIntelliSenseModels() {

        UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes.forEach(node => {
            if (node.type === 'Data Mine') {
                //Getting all the Javascript code into one single variable
                UI.projects.visualScripting.utilities.branches.nodeBranchToArray(node, 'Procedure Javascript Code').forEach(node => {
                    codeString += '\n'
                    codeString += node.code
                })
                //Getting all the Formula code into one single variable
                UI.projects.visualScripting.utilities.branches.nodeBranchToArray(node, 'Record Formula').forEach(node => {
                    recordFormulaString += '\n'
                    recordFormulaString += node.code
                })
            } else if (node.type === 'Trading Engine') {
                // Create an object representation for
                tradingEngineObj = UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node, false, true, true, false, false, undefined)
            }
        })

        console.log(codeString)
        console.log(recordFormulaString)

        function extractCodeValues(node) {

        }

        function stepBackUntilNodeType(originatingNode, nodeType) {
            if (originatingNode === undefined) {
                return
            }
            if (nodeType === undefined) {
                return
            }
            if (originatingNode.payload === undefined) {
                return
            }
            if (originatingNode.payload.parentNode === undefined) {
                return
            }


            let parent = originatingNode.payload.parentNode;
            if (parent.type === nodeType) {
                console.log(parent)
                return parent
            } else {
                stepBackUntilNodeType(parent, nodeType)
            }
        }
    }

    function createCodePath() {
        let parentNodeStructure = []

        parentNodeRecursive(thisObject.originatingNode, parentNodeStructure)

        parentNodeStructure.reverse()
        let nodePathString = ''

        parentNodeStructure.forEach((item, idx, arr) => {
            if (idx !== arr.length - 1) {
                nodePathString += item
                nodePathString += '/'
            } else {
                nodePathString += `<strong>`
                nodePathString += item
                nodePathString += `</strong>`
            }
        })

        document.getElementById("code-path").innerHTML = `<strong>Editing node: </strong>` + nodePathString

        function parentNodeRecursive(node, output) {
            if (node.payload.parentNode !== undefined) {
                output.push(node.payload.parentNode.name === undefined ? node.payload.parentNode.type : node.payload.parentNode.name)
                parentNodeRecursive(node.payload.parentNode, output)
            }
        }
    }

}