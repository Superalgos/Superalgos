function newFoundationsCodeEditorEditorPage() {
    let thisObject = {
        originatingNode: undefined,
        render: render,
        initialize: initialize,
        finalize: finalize
    }

    let monacoInitialized
    let monacoEditor

    return thisObject


    function initialize() {
        monacoInitialized = false
        buildEditorHTML()

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

    function render(originatingNode) {

        thisObject.originatingNode = originatingNode
        intellisenseModels = []

        createCodePath()
        buildIntelliSenseModels()
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

    function buildIntelliSenseModels() {

        /**
         * Building some autocomplete models is not an easy task, thus the procedure does the following steps
         * 1. Determines if the code node is part of a Data mine
         *      a) If yes, it will find its Product Definition parent
         *      b) It will go trough all the other codes part (e.g Procedure Loop, Procedure initialization etc...), and record formula
         *      c) It will create a model for each code, and one model for all formulas (memory efficient)
         *  2. Determines if the code node is part of a Trading System
         *      a) If yes it will try to create models and autocompletion capabilities based on Trading Mines
         *      b) It will try to create models and autocompletion capabilities based on available Data mines
         *
         */

        if (thisObject.originatingNode.payload.parentNode.type === 'Procedure Initialization' ||
            thisObject.originatingNode.payload.parentNode.type === 'Procedure Loop') {

            let productDefinition = stepBackUntilNodeType(thisObject.originatingNode, 'Product Definition')
            console.log(productDefinition)
        }

        function stepBackUntilNodeType(originatingNode, nodeType) {
            if(originatingNode ===undefined) {return}
            if(nodeType === undefined) {return}
            if(originatingNode.payload === undefined) {return}
            if(originatingNode.payload.parentNode === undefined) {return}


            let parent = originatingNode.payload.parentNode;
            if(parent.type === nodeType) {
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