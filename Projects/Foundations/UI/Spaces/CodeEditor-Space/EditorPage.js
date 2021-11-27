function newFoundationsCodeEditorEditorPage() {
    let thisObject = {
        originatingNode: undefined,
        editorType: undefined,
        render: render,
        reset:reset,
        initialize: initialize,
        finalize: finalize
    }

    let monacoInitialized = false
    let monacoEditor = undefined
    let codeString = ''
    let stringObjects = []
    let tradingEngineObj = undefined
    let recordFormulasObj = {}
    let chartMarketExchangeObj = {}

    return thisObject


    function initialize() {
        buildEditorHTML()
        buildIntelliSenseModels()
    }


    function finalize() {
        monacoInitialized = false
        monacoEditor = undefined
        codeString = ''
        stringObjects = []
        tradingEngineObj = undefined
        recordFormulasObj = {}
        chartMarketExchangeObj = {}
        thisObject.originatingNode = undefined
        thisObject.editorType = undefined

    }

    function reset() {
        finalize()
        initialize()
    }

    function render(originatingNode, editorType) {

        thisObject.editorType = editorType
        thisObject.originatingNode = originatingNode
        createEditingNodePath()


        /**
         * The reason we are doing the monaco initialization here is simply because monaco will set his own width at the moment it's rendered
         * Rendering it earlier when the code panel is closed will result in a very narrow width
         * Therefore we choose to render it after the panel has his width set correctly
         * Probably there is a better way but at the time this has been coded, nothing else seemed to work
         **/

        require(["vs/editor/editor.main"], initMonacoEditor)

    }

    function initMonacoEditor() {
        if (monacoEditor === undefined) {
            document.getElementById('no-content').remove()
            document.getElementById('code-path').insertAdjacentHTML('afterend', `<div class="docs-summary"><b>Notes:</b> Changes are saved automatically</div>`)
            monacoEditor = monaco.editor.create(document.querySelector('#editor'), {
                model: null,
                theme: 'vs-dark',
                fixedOverflowWidgets: true
            });

            // Create autocomplete models and providers only once
            monaco.editor.createModel(codeString, "javascript")
            createAutocompletionFor(tradingEngineObj)
            createAutocompletionFor(recordFormulasObj)
            createAutocompletionFor(chartMarketExchangeObj)

            monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true)
            monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
                allowNonTsExtensions: true
            });

        }

        createCurrentEditorModel()
        // Ensure proper code formatting
        monacoEditor.getAction('editor.action.formatDocument').run();


    }


    function createCurrentEditorModel() {

        let payload = thisObject.originatingNode.payload;
        // Determine the editor type and change source for code
        if (thisObject.editorType === codeEditorType.CODE) {
            monacoEditor.setModel(monaco.editor.createModel(payload.node.code, "javascript"))
            //Update code values
            monacoEditor.getModel().onDidChangeContent(function () {
                payload.node.code = monacoEditor.getValue()
            })
        } else if (thisObject.editorType === codeEditorType.CONFIG) {

            // monacoEditor.setModel(monaco.editor.createModel(JSON.stringify(payload.node.config, null, 4), "json"))
            monacoEditor.setModel(monaco.editor.createModel(payload.node.config, "json"))
            //Update config values
            monacoEditor.getModel().onDidChangeContent(function () {
                payload.node.config = monacoEditor.getValue()
            })
        }

    }

    function createAutocompletionFor(object) {
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
                    return monaco.languages.CompletionItemKind.Variable;
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
                let activeTyping = words[words.length - 1]; // What the user is currently typing (everything after the last space)
                if (activeTyping.includes('(')) {
                    let split = activeTyping.split('(');
                    activeTyping = split[split.length - 1]
                }

                // If the last character typed is a period then we need to look at member objects of our object
                let isMember = activeTyping.charAt(activeTyping.length - 1) === ".";

                // Array of autocompletion results
                let result = [];

                // Used for generic handling between member and non-member objects
                let lastToken = object;
                let prefix = '';

                if (isMember) {
                    // Is a member, get a list of all members, and the prefix
                    let parents = activeTyping.substring(0, activeTyping.length - 1).split(".");
                    lastToken = object[parents[0]];
                    prefix = parents[0];

                    // Loop through all the parents the current one will have (to generate prefix)
                    for (let i = 1; i < parents.length; i++) {
                        if (lastToken !== undefined && lastToken.hasOwnProperty(parents[i])) {
                            prefix += '.' + parents[i];
                            lastToken = lastToken[parents[i]];
                        } else {
                            // Not valid
                            return result[0] = '';
                        }
                    }
                }

                // Get all the child properties of the last token
                for (let prop in lastToken) {
                    if (lastToken.hasOwnProperty(prop) && !prop.startsWith("__")) {
                        // Get the detail type (try-catch) in case object does not have prototype
                        let details = '';
                        try {
                            details = lastToken[prop].__proto__.constructor.name;
                        } catch (e) {
                            details = typeof lastToken[prop];
                        }

                        // Create completion object
                        let suggestion = {
                            label: prop,
                            kind: getType(lastToken[prop], isMember),
                            detail: details,
                            insertText: prop
                        };

                        // Change insertText and documentation for functions
                        if (suggestion.detail.toLowerCase() === 'function') {
                            suggestion.insertText += "(";
                            suggestion.documentation = (lastToken[prop].toString()).split("{")[0]; // Show function prototype in the documentation popup
                        }

                        // Add to final results
                        result.push(suggestion);
                        // TODO: Manually adding "value" property if parent is tradingEngine

                    }
                }

                return {
                    suggestions: result
                };
            }
        });
    }

    /**
     * The autocomplete models will be based on:
     * 1.  Existing code in the data mines -> we will create models for each code node (it's like opening multiple files in vscode)
     * 2.  Formulas from data mines by creating an object representation of all formulas see implementation below then passing it to the monaco registerCompletionItemProvider
     * 2.  Trading engine loaded into the workspace - we create an obj. representation using getProtocolNode and we are using monaco registerCompletionItemProvider
     *
     */
    function buildIntelliSenseModels() {


        let chartObjectPrefix = 'chart.'
        let marketPrefix = 'market.'
        let exchangePrefix = 'exchange.'
        let dot = '.'
        let numberOfPreviousSuffixes = 5

        UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes.forEach(node => {
            if (node.type === 'Data Mine') {
                // Getting all the Javascript code nodes into one single model
                UI.projects.visualScripting.utilities.branches.nodeBranchToArray(node, 'Procedure Javascript Code').forEach(node => {
                    codeString += '\n'
                    codeString += node.code
                })

                /**
                 * Generating an object represantation for "chart" object autocomplete
                 * The logic is inspired by the condition editor
                 * First we create a string representation with "." notation e.g: chart.at24hs.candlesChannel.begin for all the data mines and their bots in the workspace
                 * Secondly we are going to convert all the strings to an object which will be used by the editor to predict possible values
                 * e.g : we will end with something like {
                 *     chart: {
                 *         at24hs: {
                 *              candlesChannel: {
                 *                  begin: "",
                 *                  direction: "",
                 *                  end: "",
                 *                  period: ""
                 *              },
                 *              previous: {...},
                 *              previous: {
                 *                  previous: {...}
                 *              }
                 *              ...
                 *          },
                 *         at01hs: {...}
                 *         ...
                 *     },
                 * }
                 *
                 */
                let bots = node.sensorBots.concat(node.apiDataFetcherBots).concat(node.indicatorBots)

                bots.forEach(bot => {
                    let products = bot.products
                    products.forEach(product => {
                        let productName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(product.payload, 'singularVariableName')
                        if (product.record !== undefined) {
                            product.record.properties.forEach(property => {
                                let propertyName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(property.payload, 'codeName')
                                product.datasets.forEach(dataset => {
                                    let validTimeFrames = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(dataset.payload, 'validTimeFrames')
                                    if (validTimeFrames !== undefined) {
                                        validTimeFrames.forEach(tf => {
                                            let timeFrame = 'at' + tf.replace('-', '')

                                            stringObjects.push(chartObjectPrefix + timeFrame + '.' + productName + '.' + propertyName)
                                            for (let i = 1; i <= numberOfPreviousSuffixes; i++) {
                                                stringObjects.push(chartObjectPrefix + timeFrame + getPreviousSuffixTimes(i) + productName + dot + propertyName)
                                            }

                                        })
                                    }
                                })
                            })
                        }
                    })
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
                 * the above object will have as many properties as we can find in the entire workspace by scanning the formulas
                 *
                 */

                UI.projects.visualScripting.utilities.branches.nodeBranchToArray(node, 'Record Formula').forEach(node => {
                    /**
                     * Extract each code formula as an object to be merged with the next one until we end up with an object containing all the objects present in the formula with proper children
                     * The resulting object will be later used as model for autocompletion
                     */
                    objectMerge(recordFormulasObj, node.code.split('.').reduceRight((o, x) => ({[x]: o}), ""))

                })
            } else if (node.type === 'Trading Engine') {
                // Create an object representation for the engine
                tradingEngineObj = {tradingEngine: UI.projects.visualScripting.functionLibraries.protocolNode.getProtocolNode(node, false, false, false, false, false, undefined)}
            }
        })

        // Enrich chart data with market and exchange structure
/*        UI.projects.foundations.spaces.designSpace.workspace.workspaceNode.rootNodes.forEach(node => {
            if (node.type === 'Crypto Ecosystem') {
                node.cryptoExchanges.forEach(cxs => {
                    cxs.exchanges.forEach(exchange => {
                        let exchangeName = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(exchange.payload, 'codeName')
                        exchange.exchangeMarkets.markets.forEach(market => {
                            let marketPair = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(market.payload, 'codeName')
                            let baseAsset = marketPair.split('/')[0]
                            let quotedAsset = marketPair.split('/')[1]
                            stringObjects.forEach(chartObj => {
                                /!**
                                 * We will provide auto-complete only for assets pair found in Markets
                                 * Doing so we will avoid providing completion for assets that are not used in a market
                                 *!/

                                    //TODO: Disabled on purpose, causes high memory consumption when multiple exchanges are loaded
                                let market = marketPrefix + baseAsset + dot + quotedAsset + dot + chartObj
                                // stringObjects.push(market)
                                // stringObjects.push(exchangePrefix + exchangeName + dot + market)
                            })
                        })
                    })
                })
            }
        })*/

        //Actually building the objects for chart, market and exchange, no need for multiple objects, as one is enough for the autocomplete to work
        stringObjects.forEach(stringRepresentation => {
            objectMerge(chartMarketExchangeObj, stringRepresentation.split('.').reduceRight((o, x) => ({[x]: o}), ""))
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

        function getPreviousSuffixTimes(number) {
            let result = ''
            let previousString = 'previous.'
            let dotString = '.'
            for (let i = 0; i < number; i++) {
                if (i === 0) {
                    result += dotString
                }
                result += previousString
            }

            return result
        }

    }

    function buildEditorHTML() {
        let HTML = ''

        HTML += `<section id="code-editor-page" class="code-editor-page">`
        HTML += '<div class="governance-report-page-header">'
        HTML += '<div class="governance-image-logo-report-page"><img src="Images/superalgos-logo.png" width=200></div>'
        HTML += '</div>'
        HTML += `<div class="docs-title-table"><div class="docs-table-cell"><h2 class="docs-h2"> Code Editor</h2></div><div id="projectImageDiv" class="docs-image-container"><img src="Icons/Foundations/javascript-code.png" width="50" height="50"></div></div>`
        HTML += `<div id="code-path"></div>`
        HTML += `<div id="no-content" style="margin:auto;text-align:center;"><h2>Nothing to edit...</h2><h3>Try opening a node config or node code</h3></div>`
        HTML += '<div class="editor" id="editor"></div>'
        HTML += `</section>`
        HTML += footer()
        document.getElementById('code-editor-content-div').innerHTML = HTML

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


    function createEditingNodePath() {
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
        if (nodePathString !== '') {
            document.getElementById("code-path").innerHTML = `<strong>Editing node: </strong>` + nodePathString
        }

        function parentNodeRecursive(node, output) {
            if (node.payload.parentNode !== undefined) {
                output.push(node.payload.parentNode.name === undefined ? node.payload.parentNode.type : node.payload.parentNode.name)
                parentNodeRecursive(node.payload.parentNode, output)
            }
        }
    }
}