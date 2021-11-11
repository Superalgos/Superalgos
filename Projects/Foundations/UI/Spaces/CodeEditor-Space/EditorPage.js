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
    let recordFormulasObj = {}

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

    function render(originatingNode) {

        thisObject.originatingNode = originatingNode
        intellisenseModels = []

        createCodePath()
        /**
         * The reason we are doing the monaco initialization here is simply because monaco will set his own width at the moment it's rendered
         * Rendering it earlier when the code panel is closed will result in a very narrow width
         * Thus we choose to render it after the panel has his width set correctly
         * Probably there is a better way but at the time this has been coded, nothing else seemed to work
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

                showAutocompletionFor(tradingEngineObj)
                showAutocompletionFor(recordFormulasObj)


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


            function showAutocompletionFor(obj) {
                // Disable default autocompletion for javascript
                monaco.languages.typescript.javascriptDefaults.setCompilerOptions({noLib: true});

                // Helper function to return the monaco completion item type of a thing
                function getType(thing, isMember) {
                    isMember = (isMember === undefined) ? (typeof isMember == "boolean") ? isMember : false : false; // Give isMember a default value of false

                    switch ((typeof thing).toLowerCase()) {
                        case "object":
                            return monaco.languages.CompletionItemKind.Class;

                        case "function":
                            return (isMember) ? monaco.languages.CompletionItemKind.Method : monaco.languages.CompletionItemKind.Function;

                        default:
                            return (isMember) ? monaco.languages.CompletionItemKind.Property : monaco.languages.CompletionItemKind.Variable;
                    }
                }

                // Register object that will return autocomplete items
                monaco.languages.registerCompletionItemProvider('javascript', {
                    // Run this function when the period or open parenthesis is typed (and anything after a space)
                    triggerCharacters: ['.', '('],

                    // Function to generate autocompletion results
                    provideCompletionItems: function (model, position, token) {
                        // Split everything the user has typed on the current line up at each space, and only look at the last word
                        let last_chars = model.getValueInRange({
                            startLineNumber: position.lineNumber,
                            startColumn: 0,
                            endLineNumber: position.lineNumber,
                            endColumn: position.column
                        });
                        let words = last_chars.replace("\t", "").split(" ");
                        let active_typing = words[words.length - 1]; // What the user is currently typing (everything after the last space)
                        if (active_typing.includes('(')) {
                            let split = active_typing.split('(');
                            active_typing = split[split.length - 1]
                        }

                        // If the last character typed is a period then we need to look at member objects of the obj object
                        let is_member = active_typing.charAt(active_typing.length - 1) === ".";

                        // Array of autocompletion results
                        let result = [];

                        // Used for generic handling between member and non-member objects
                        let last_token = obj;
                        let prefix = '';

                        if (is_member) {
                            // Is a member, get a list of all members, and the prefix
                            let parents = active_typing.substring(0, active_typing.length - 1).split(".");
                            last_token = obj[parents[0]];
                            prefix = parents[0];

                            // Loop through all the parents the current one will have (to generate prefix)
                            for (let i = 1; i < parents.length; i++) {
                                if (last_token.hasOwnProperty(parents[i])) {
                                    prefix += '.' + parents[i];
                                    last_token = last_token[parents[i]];
                                } else {
                                    // Not valid
                                    return result;
                                }
                            }

                            prefix += '.';
                        }

                        // Get all the child properties of the last token
                        for (let prop in last_token) {
                            // Do not show properites that begin with "__"
                            if (last_token.hasOwnProperty(prop) && !prop.startsWith("__")) {
                                // Get the detail type (try-catch) incase object does not have prototype
                                let details = '';
                                try {
                                    details = last_token[prop].__proto__.constructor.name;
                                } catch (e) {
                                    details = typeof last_token[prop];
                                }

                                // Create completion object
                                let to_push = {
                                    label: prop,
                                    kind: getType(last_token[prop], is_member),
                                    detail: details,
                                    insertText: prop
                                };

                                // Change insertText and documentation for functions
                                if (to_push.detail.toLowerCase() === 'function') {
                                    to_push.insertText += "(";
                                    to_push.documentation = (last_token[prop].toString()).split("{")[0]; // Show function prototype in the documentation popup
                                }

                                // Add to final results
                                result.push(to_push);
                            }
                        }

                        return {
                            suggestions: result
                        };
                    }
                });
            }

        });

    }

    /**
     * The autocomplete models will be based on:
     * 1.  Existing code in the data mines -> we will create models for each code node (it's like opening multiple files in vscode)
     * 2.  Formulas from data mines by creating an object representation of all formulas see implementation below than passing it to the monaco registerCompletionItemProvider
     * 2.  Trading engine loaded into the workspace - we create an obj. representation using getProtocolNode and we are using monaco registerCompletionItemProvider
     *
     */
    function buildIntelliSenseModels() {


        UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes.forEach(node => {
            if (node.type === 'Data Mine') {
                // Getting all the Javascript code nodes into one single model
                UI.projects.visualScripting.utilities.branches.nodeBranchToArray(node, 'Procedure Javascript Code').forEach(node => {
                    codeString += '\n'
                    codeString += node.code
                })
                /**
                 * Getting all the Formula codes and create an object representation, all non-object children will be initialized with strings
                 *
                 * e.g : we will end with something like {
                 *     variable: {
                 *         last24hsDirection: "",
                 *         last24HsMax: ""
                 *     },
                 *     record: {
                 *         current: {
                 *             direction: ""
                 *         }
                 *     }
                 * }
                 * the above object will have as many properties as we can find in the entire workspace
                 *
                 */

                UI.projects.visualScripting.utilities.branches.nodeBranchToArray(node, 'Record Formula').forEach(node => {
                    /**
                     * Extract each code formula as an object to be merged with the next one until we end up with an object containing all the objects present in the formula with proper children
                     * The resulting object will be later used as model for autocompletion
                     */
                    console.log(node.code)
                    objectMerge(recordFormulasObj, node.code.split('.').reduceRight((o, x) => ({[x]: o}), ""))

                })
            } else if (node.type === 'Trading Engine') {
                // Create an object representation for the engine
                tradingEngineObj = {tradingEngine: UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node, false, false, false, false, false, undefined)}
            }
        })


        function objectMerge(target, source) {
            for (const key of Object.keys(source)) {
                const currTarget = target[key];
                const currSource = source[key];

                if (currTarget) {
                    const objSource = typeof currSource === 'object';
                    const objTarget = typeof currTarget === 'object';

                    if (objSource && objTarget) {
                        void objectMerge(currTarget, currSource)
                        continue;
                    }
                }

                target[key] = currSource;
            }

            return target;
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