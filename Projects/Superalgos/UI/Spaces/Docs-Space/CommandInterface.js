function newSuperalgosDocsCommmandInterface() {
    let thisObject = {
        command: undefined,
        detectCommands: detectCommands, 
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function initialize() {

    }

    function finalize() {

    }

    function detectCommands() {

        if (checkHelpCommand() === undefined) { return }
        if (checkGotoCommand() === undefined) { return }
        if (checkAddCommand() === undefined) { return }
        if (checkDeleteCommand() === undefined) { return }
        if (checkUReIndexCommand() === undefined) { return }
        if (checkUSaveCommand() === undefined) { return }

        UI.projects.superalgos.spaces.docsSpace.searchResultsPage.render()

        function checkHelpCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Help Command')
                return
            }
            return 'Not Help Command'
        }

        function checkGotoCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help docs.goto') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Goto Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('Docs.Goto') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('docs.goto') !== 0) { return 'Not Goto Command' }

            let splittedCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.split(' ')

            if (splittedCommand[1] === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Too Few Parameters', 'Anchor Too Few Paramenters')
                return
            }
            let secondaryCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.substring(UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf(' ') + 1, UI.projects.superalgos.spaces.docsSpace.commandInterface.command.length)
            let splittedSecondaryCommand = secondaryCommand.split('->')
            let project = splittedSecondaryCommand[0]
            let category = splittedSecondaryCommand[1]
            let type = splittedSecondaryCommand[2]
            let anchor = splittedSecondaryCommand[3]

            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let docsSchemaDocument
            switch (category.toLowerCase()) {
                case 'node': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
                    break
                }
                case 'concept': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
                    break
                }
                case 'topic': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
                    break
                }
                default: {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Category Not Valid', 'Anchor Category Not Valid')
                    return
                }
            }
            if (docsSchemaDocument === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Not Found', 'Anchor Page Not Found')
                return
            }
            if (docsSchemaDocument.paragraphs === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page With No Paragraphs', 'Anchor Page With No Paragraphs')
                return
            }
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, category, type, anchor, undefined)

        }

        function checkAddCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help docs.add') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Add Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('Docs.Add') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('docs.add') !== 0) { return 'Not Add Command' }

            if (UI.projects.superalgos.spaces.docsSpace.language !== UI.projects.superalgos.globals.docs.DEFAULT_LANGUAGE) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Only In English', 'Anchor Only In English')
                return
            }

            let splittedCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.split(': ')
            if (splittedCommand[1] === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Missing Colon', 'Anchor Missing Colon')
                return
            }
            let primaryCommand = splittedCommand[0]
            let secondaryCommand = splittedCommand[1]

            let splittedPrimaryCommand = primaryCommand.split(' ')

            if (splittedPrimaryCommand[0].toLowerCase() === 'docs.add') {
                if (splittedPrimaryCommand[2] !== 'to') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Missing To', 'Anchor Missing To')
                    return
                }

                if (splittedPrimaryCommand.length < 4) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Too Few Parameters', 'Anchor Too Few Paramenters')
                    return
                }

                if (secondaryCommand === '') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Category Not Valid', 'Anchor Category Not Valid')
                    return
                }

                switch (splittedPrimaryCommand[1].toLowerCase()) {
                    case 'node': {
                        addNode(splittedPrimaryCommand[3], secondaryCommand)
                        return
                    }
                    case 'concept': {
                        addConcept(splittedPrimaryCommand[3], secondaryCommand)
                        return
                    }
                    case 'topic': {
                        let splittedSecondaryCommand = secondaryCommand.split('->')
                        if (splittedSecondaryCommand.length < 3) {
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Too Few Parameters', 'Anchor Too Few Paramenters')
                            return
                        }
                        addTopic(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    default: {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Category Not Valid', 'Anchor Category Not Valid')
                        return
                    }
                }
                return 'Not Add Command'
            }
        }

        function checkDeleteCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help docs.delete') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Delete Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('Docs.Delete') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('docs.delete') !== 0) { return 'Not Delete Command' }

            if (UI.projects.superalgos.spaces.docsSpace.language !== UI.projects.superalgos.globals.docs.DEFAULT_LANGUAGE) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Only In English', 'Anchor Only In English')
                return
            }

            let splittedCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.split(': ')
            if (splittedCommand[1] === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Missing Colon', 'Anchor Missing Colon')
                return
            }
            let primaryCommand = splittedCommand[0]
            let secondaryCommand = splittedCommand[1]

            let splittedPrimaryCommand = primaryCommand.split(' ')

            if (splittedPrimaryCommand[0].toLowerCase() === 'docs.delete') {
                if (splittedPrimaryCommand[2] !== 'from') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Missing From', 'Anchor Missing From')
                    return
                }

                if (splittedPrimaryCommand.length < 4) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Too Few Parameters', 'Anchor Too Few Paramenters')
                    return
                }

                if (secondaryCommand === '') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Category Not Valid', 'Anchor Category Not Valid')
                    return
                }

                switch (splittedPrimaryCommand[1].toLowerCase()) {
                    case 'node': {
                        deleteNode(splittedPrimaryCommand[3], secondaryCommand)
                        return
                    }
                    case 'concept': {
                        deleteConcept(splittedPrimaryCommand[3], secondaryCommand)
                        return
                    }
                    case 'topic': {
                        let splittedSecondaryCommand = secondaryCommand.split('->')
                        if (splittedSecondaryCommand.length < 3) {
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Too Few Parameters', 'Anchor Too Few Paramenters')
                            return
                        }
                        deleteTopic(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    default: {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Category Not Valid', 'Anchor Category Not Valid')
                        return
                    }
                }
                return 'Not Delete Command'
            }
        }

        function checkUReIndexCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help docs.reindex') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Reindex Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('Docs.Reindex') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('docs.reindex') !== 0) { return 'Not Reindex Command' }

            setUpWorkspaceSchemas()
            thisObject.searchEngine.setUpSearchEngine()

            renderCommandResultsPage(["Succesfully rebuild the search engine indexes."])
        }

        function checkUSaveCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help docs.save') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Save Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('Docs.Save') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('docs.save') !== 0) { return 'Not Save Command' }

            let requestsSent = 0
            let responseCount = 0
            let okResponses = 0
            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let docsSchema
                let project = PROJECTS_ARRAY[j]

                docsSchema = SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema
                httpRequest(JSON.stringify(docsSchema), 'Docs/Save-Node-Schema/' + project, onResponse)
                requestsSent++

                docsSchema = SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema
                httpRequest(JSON.stringify(docsSchema), 'Docs/Save-Concept-Schema/' + project, onResponse)
                requestsSent++

                docsSchema = SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema
                httpRequest(JSON.stringify(docsSchema), 'Docs/Save-Topic-Schema/' + project, onResponse)
                requestsSent++
            }

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                data = JSON.parse(data)
                if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    okResponses++
                }
                responseCount++

                if (responseCount === requestsSent) {
                    if (responseCount === okResponses) {
                        renderCommandResultsPage(["Succesfully saved all the latest changes."])
                    } else {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Changes Not Saved', 'Anchor Changes Not Saved')
                    }
                }
            }
        }

        function addNode(project, type) {
            let template = {
                type: type,
                definition: { text: "Write here the definition of this Node." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Node', type)
        }

        function addConcept(project, type) {
            let template = {
                type: type,
                definition: { text: "Write here the summary / definition of this Concept." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }

            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Concept', type)
        }

        function addTopic(project, topic, type, pageNumber) {
            let template = {
                topic: topic,
                pageNumber: pageNumber,
                type: type,
                definition: { text: "Write here a summary for this topic page." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Topic', type)
        }

        function deleteNode(project, type) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.delete(type)
            renderCommandResultsPage(["Node <b>" + type + "</b> deleted."])

            for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.length; i++) {
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema[i]
                if (docsSchemaDocument.type === type) {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.splice(i, 1)
                    break
                }
            }
        }

        function deleteConcept(project, type) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.delete(type)
            renderCommandResultsPage(["Concept <b>" + type + "</b> deleted."])

            for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.length; i++) {
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema[i]
                if (docsSchemaDocument.type === type) {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.splice(i, 1)
                    break
                }
            }
        }

        function deleteTopic(project, topic, type, pageNumber) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            } else {
                if (exist.pageNumber !== pageNumber) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Page Number Mismatch', 'Anchor Page Number Mismatch')
                    return
                }
                if (exist.topic !== topic) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error Topic Mismatch', 'Anchor Topic Mismatch')
                    return
                }
            }

            SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.delete(type)
            renderCommandResultsPage(["Topic <b>" + type + "</b> deleted."])

            for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.length; i++) {
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema[i]
                if (docsSchemaDocument.type === type) {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.splice(i, 1)
                    break
                }
            }
        }
    }

    function renderCommandResultsPage(resultArray) {

        buildHTML()

        function buildHTML() {
            let HTML = ''
            HTML = HTML + '<section id="docs-search-results-div" class="docs-search-page-container">'
            HTML = HTML + UI.projects.superalgos.spaces.docsSpace.mainSearchPage.addSearchHeader()
            // Results
            for (let i = 0; i < resultArray.length; i++) {
                let result = resultArray[i]
                HTML = HTML + '<p class="docs-command-result-message">' + result + '</p>'
            }

            // End Content
            HTML = HTML + '</div>'

            // End Section
            HTML = HTML + '</section>'

            let docsContentDiv = document.getElementById('docs-content-div')
            docsContentDiv.innerHTML = HTML + UI.projects.superalgos.spaces.docsSpace.footer.addFooter()

            UI.projects.superalgos.spaces.docsSpace.mainSearchPage.detectEnterOnSearchBox()
            UI.projects.superalgos.spaces.docsSpace.mainSearchPage.setFocusOnSearchBox()
        }
    }
}