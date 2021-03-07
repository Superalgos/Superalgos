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
        if (detectAppCommands() === true) { return }
        if (detectDocsCommands() === true) { return }

        /* If we can not detect any app or docs commands, then we assume the users is running a search query */
        UI.projects.superalgos.spaces.docsSpace.searchResultsPage.render()
    }

    function detectAppCommands() {
        if (checkContributeCommand() === undefined) { return true }
        if (checkUpdateCommand() === undefined) { return true }

        function checkContributeCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'app.help app.contribute') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Contribute Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('App.Contribute') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('app.contribute') !== 0) { return 'Not Contribute Commands' }

            /* Set up the commit message */
            let message = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.trim().substring(UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf(' ') + 1, UI.projects.superalgos.spaces.docsSpace.commandInterface.command.length)
            if (message.toLowerCase() === 'app.contribute') {
                message = 'This is my contribution to Superalgos'
            }

            /* Find the Username and Password */
            let apisNode = UI.projects.superalgos.spaces.designSpace.workspace.getHierarchyHeadsByType('APIs')
            if (apisNode === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (apisNode.githubAPI === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            let config = JSON.parse(apisNode.githubAPI.config)
            if (config.username === undefined || config.username === "") {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (config.token === undefined || config.token === "") {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            message = message.replaceAll('#', '_HASHTAG_')
            message = message.replaceAll('/', '_SLASH_')

            httpRequest(
                undefined,
                'App/Contribute/' +
                message + '/' +
                config.username + '/' +
                config.token + '/' +
                UI.projects.superalgos.spaces.docsSpace.currentBranch + '/' +
                UI.projects.superalgos.spaces.docsSpace.contributionsBranch
                , onResponse)

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Message - Creating Pull Request')

            return

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                data = JSON.parse(data)
                if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Message - Contribution Done')
                } else {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo(
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

        function checkUpdateCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'app.help app.update') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Update Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('App.Update') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('app.update') !== 0) { return 'Not Update Commands' }

            httpRequest(undefined, 'App/Update/' + UI.projects.superalgos.spaces.docsSpace.currentBranch, onResponse)
            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Message - Updating Your Local App')

            return

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                data = JSON.parse(data)
                if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.CUSTOM_OK_RESPONSE.result) {
                    if (data.message.summary.changes + data.message.summary.deletions + data.message.summary.insertions > 0) {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Message - Update Done - New Version Found')
                    } else {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'App Message - Update Done - Already Up-To-Date')
                    }
                } else {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo(
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

    function detectDocsCommands() {

        if (checkHelpCommand() === undefined) { return true }
        if (checkGotoCommand() === undefined) { return true }
        if (checkAddCommand() === undefined) { return true }
        if (checkDeleteCommand() === undefined) { return true }
        if (checkRepaginateCommand() === undefined) { return true }
        if (checkUReIndexCommand() === undefined) { return true }
        if (checkUSaveCommand() === undefined) { return true }

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
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                return
            }
            let secondaryCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.substring(UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf(' ') + 1, UI.projects.superalgos.spaces.docsSpace.commandInterface.command.length)
            let splittedSecondaryCommand = secondaryCommand.split('->')
            let project = splittedSecondaryCommand[0]
            let category = splittedSecondaryCommand[1]
            let type = splittedSecondaryCommand[2]
            let anchor = splittedSecondaryCommand[3]

            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
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
                case 'tutorial': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.get(type)
                    break
                }
                case 'review': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.get(type)
                    break
                }
                case 'book': {
                    docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.get(type)
                    break
                }
                default: {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
                    return
                }
            }
            if (docsSchemaDocument === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Not Found', 'Anchor Page Not Found')
                return
            }
            if (docsSchemaDocument.paragraphs === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page With No Paragraphs', 'Anchor Page With No Paragraphs')
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
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Only In English', 'Anchor Only In English')
                return
            }

            let splittedCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.split(': ')
            if (splittedCommand[1] === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Missing Colon', 'Anchor Missing Colon')
                return
            }
            let primaryCommand = splittedCommand[0]
            let secondaryCommand = splittedCommand[1]

            let splittedPrimaryCommand = primaryCommand.split(' ')

            if (splittedPrimaryCommand[0].toLowerCase() === 'docs.add') {
                if (splittedPrimaryCommand[2] !== 'to') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Missing To', 'Anchor Missing To')
                    return
                }

                if (splittedPrimaryCommand.length < 4) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                    return
                }

                if (secondaryCommand === '') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
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
                        if (splittedSecondaryCommand.length < 2) {
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                            return
                        }
                        addTopic(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    case 'tutorial': {
                        let splittedSecondaryCommand = secondaryCommand.split('->')
                        if (splittedSecondaryCommand.length < 2) {
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                            return
                        }
                        addTutorial(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    case 'review': {
                        let splittedSecondaryCommand = secondaryCommand.split('->')
                        if (splittedSecondaryCommand.length < 2) {
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                            return
                        }
                        addReview(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    case 'book': {
                        addBook(splittedPrimaryCommand[3], secondaryCommand)
                        return
                    }
                    default: {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
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
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Only In English', 'Anchor Only In English')
                return
            }

            let splittedCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.split(': ')
            if (splittedCommand[1] === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Missing Colon', 'Anchor Missing Colon')
                return
            }
            let primaryCommand = splittedCommand[0]
            let secondaryCommand = splittedCommand[1]

            let splittedPrimaryCommand = primaryCommand.split(' ')

            if (splittedPrimaryCommand[0].toLowerCase() === 'docs.delete') {
                if (splittedPrimaryCommand[2] !== 'from') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Missing From', 'Anchor Missing From')
                    return
                }

                if (splittedPrimaryCommand.length < 4) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                    return
                }

                if (secondaryCommand === '') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
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
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                            return
                        }
                        deleteTopic(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    case 'tutorial': {
                        let splittedSecondaryCommand = secondaryCommand.split('->')
                        if (splittedSecondaryCommand.length < 3) {
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                            return
                        }
                        deleteTutorial(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    case 'review': {
                        let splittedSecondaryCommand = secondaryCommand.split('->')
                        if (splittedSecondaryCommand.length < 3) {
                            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                            return
                        }
                        deleteReview(splittedPrimaryCommand[3], splittedSecondaryCommand[0], splittedSecondaryCommand[1], splittedSecondaryCommand[2])
                        return
                    }
                    case 'book': {
                        deleteBook(splittedPrimaryCommand[3], secondaryCommand)
                        return
                    }
                    default: {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
                        return
                    }
                }
                return 'Not Delete Command'
            }
        }

        function checkRepaginateCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help docs.repaginate') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Repaginate Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('Docs.Repaginate') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('docs.repaginate') !== 0) { return 'Not Repaginate Command' }

            let splittedCommand = UI.projects.superalgos.spaces.docsSpace.commandInterface.command.split(': ')
            if (splittedCommand[1] === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Missing Colon', 'Anchor Missing Colon')
                return
            }
            let primaryCommand = splittedCommand[0]
            let secondaryCommand = splittedCommand[1]

            let splittedPrimaryCommand = primaryCommand.split(' ')

            if (splittedPrimaryCommand[0].toLowerCase() === 'docs.repaginate') {
                if (splittedPrimaryCommand[2] !== 'from') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Missing From', 'Anchor Missing From')
                    return
                }

                if (splittedPrimaryCommand.length < 4) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Too Few Parameters', 'Anchor Too Few Parameters')
                    return
                }

                if (secondaryCommand === '') {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
                    return
                }

                switch (splittedPrimaryCommand[1].toLowerCase()) {
                    case 'node': {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
                        return
                    }
                    case 'concept': {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
                        return
                    }
                    case 'topic': {
                        repaginate(splittedPrimaryCommand[3], 'Topic', secondaryCommand)
                        return
                    }
                    case 'tutorial': {
                        repaginate(splittedPrimaryCommand[3], 'Tutorial', secondaryCommand)
                        return
                    }
                    case 'review': {
                        repaginate(splittedPrimaryCommand[3], 'Review', secondaryCommand)
                        return
                    }
                    case 'book': {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
                        return
                    }
                    default: {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Category Not Valid', 'Anchor Category Not Valid')
                        return
                    }
                }
            }
        }

        function checkUReIndexCommand() {
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.toLowerCase() === 'docs.help docs.reindex') {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Reindex Command')
                return
            }
            if (UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('Docs.Reindex') !== 0 && UI.projects.superalgos.spaces.docsSpace.commandInterface.command.indexOf('docs.reindex') !== 0) { return 'Not Reindex Command' }

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Reindexing Started')
            setTimeout(startReindexingProcess, 100)

            function startReindexingProcess() {
                UI.projects.superalgos.spaces.docsSpace.searchEngine.setUpSearchEngine(onFinish)

                function onFinish() {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Reindexing Done')
                }
            }
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

                docsSchema = SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema
                httpRequest(JSON.stringify(docsSchema), 'Docs/Save-Tutorial-Schema/' + project, onResponse)
                requestsSent++

                docsSchema = SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema
                httpRequest(JSON.stringify(docsSchema), 'Docs/Save-Review-Schema/' + project, onResponse)
                requestsSent++

                docsSchema = SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema
                httpRequest(JSON.stringify(docsSchema), 'Docs/Save-Book-Schema/' + project, onResponse)
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
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Saving Done')
                        afterSaving()
                    } else {
                        UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Changes Not Saved', 'Anchor Changes Not Saved')
                    }
                }
            }

            function afterSaving() {
                /*
                Since all the changes where saved, we need to remove the change flags at the different shcema documents.
                We also need to remove from the arrays the deleted items.
                */
                for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                    let project = PROJECTS_ARRAY[j]
                    let documents

                    /* Nodes */
                    documents = []
                    for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.length; i++) {
                        docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema[i]
                        docsSchemaDocument.updated = undefined
                        docsSchemaDocument.created = undefined

                        if (docsSchemaDocument.deleted === true) {
                            SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.delete(docsSchemaDocument.type)
                        } else {
                            documents.push(docsSchemaDocument)
                        }
                    }
                    SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema = documents

                    /* Concepts */
                    documents = []
                    for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.length; i++) {
                        docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema[i]
                        docsSchemaDocument.updated = undefined
                        docsSchemaDocument.created = undefined

                        if (docsSchemaDocument.deleted === true) {
                            SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.delete(docsSchemaDocument.type)
                        } else {
                            documents.push(docsSchemaDocument)
                        }
                    }
                    SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema = documents

                    /* Topics */
                    documents = []
                    for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.length; i++) {
                        docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema[i]
                        docsSchemaDocument.updated = undefined
                        docsSchemaDocument.created = undefined

                        if (docsSchemaDocument.deleted === true) {
                            SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.delete(docsSchemaDocument.type)
                        } else {
                            documents.push(docsSchemaDocument)
                        }
                    }
                    SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema = documents

                    /* Tutorials */
                    documents = []
                    for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema.length; i++) {
                        docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema[i]
                        docsSchemaDocument.updated = undefined
                        docsSchemaDocument.created = undefined

                        if (docsSchemaDocument.deleted === true) {
                            SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.delete(docsSchemaDocument.type)
                        } else {
                            documents.push(docsSchemaDocument)
                        }
                    }
                    SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema = documents

                    /* Reviews */
                    documents = []
                    for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema.length; i++) {
                        docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema[i]
                        docsSchemaDocument.updated = undefined
                        docsSchemaDocument.created = undefined

                        if (docsSchemaDocument.deleted === true) {
                            SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.delete(docsSchemaDocument.type)
                        } else {
                            documents.push(docsSchemaDocument)
                        }
                    }
                    SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema = documents

                    /* Books */
                    documents = []
                    for (let i = 0; i < SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema.length; i++) {
                        docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema[i]
                        docsSchemaDocument.updated = undefined
                        docsSchemaDocument.created = undefined

                        if (docsSchemaDocument.deleted === true) {
                            SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.delete(docsSchemaDocument.type)
                        } else {
                            documents.push(docsSchemaDocument)
                        }
                    }
                    SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema = documents
                }
            }
        }

        function repaginate(project, category, query) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }

            let orderedArray = UI.projects.superalgos.utilities.docs.buildOrderedPageIndex(
                project,
                category,
                query
            )

            if (orderedArray.length === 0) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'No Matching Topic, Tutorial or Review Found')
                return
            }

            let pageNumber = 1
            for (let i = 0; i < orderedArray.length; i++) {
                schemaDocument = orderedArray[i]
                schemaDocument.pageNumber = pageNumber
                pageNumber++
                schemaDocument.updated = true
            }
            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Repagination Done')
        }

        function addNode(project, type) {
            let template = {
                created: true,
                type: type,
                definition: { text: "Write a definition for this Node." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsNodeSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Node', type)
        }

        function addConcept(project, type) {
            let template = {
                created: true,
                type: type,
                definition: { text: "Write a summary / definition for this Concept." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }

            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsConceptSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Concept', type)
        }

        function addTopic(project, topic, type, pageNumber) {
            if (pageNumber === undefined) {

                let orderedArray = UI.projects.superalgos.utilities.docs.buildOrderedPageIndex(
                    project,
                    'Topic',
                    topic
                )

                pageNumber = orderedArray.length + 1
            }

            let template = {
                created: true,
                topic: topic,
                pageNumber: pageNumber,
                type: type,
                definition: { text: "Write a summary for this topic page." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Topic', type)
        }

        function addTutorial(project, tutorial, type, pageNumber) {
            if (pageNumber === undefined) {

                let orderedArray = UI.projects.superalgos.utilities.docs.buildOrderedPageIndex(
                    project,
                    'Tutorial',
                    tutorial
                )

                pageNumber = orderedArray.length + 1
            }

            let template = {
                created: true,
                tutorial: tutorial,
                pageNumber: pageNumber,
                type: type,
                definition: { text: "Write a summary for this tutorial page." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Tutorial', type)
        }

        function addReview(project, review, type, pageNumber) {
            if (pageNumber === undefined) {

                let orderedArray = UI.projects.superalgos.utilities.docs.buildOrderedPageIndex(
                    project,
                    'Review',
                    review
                )

                pageNumber = orderedArray.length + 1
            }

            let template = {
                created: true,
                review: review,
                pageNumber: pageNumber,
                type: type,
                definition: { text: "Write a summary for this review page." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Review', type)
        }

        function addBook(project, type) {
            let template = {
                created: true,
                type: type,
                definition: { text: "Write a summary / definition for this Book." },
                paragraphs: [
                    {
                        style: "Text",
                        text: UI.projects.superalgos.globals.docs.NEW_PARAGRAPH_TEXT
                    }
                ]
            }

            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.get(type)
            if (exist !== undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Already Exists', 'Anchor Page Already Exists')
                return
            }

            SCHEMAS_BY_PROJECT.get(project).array.docsBookSchema.push(template)
            SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.set(type, template)
            UI.projects.superalgos.spaces.docsSpace.navigateTo(project, 'Book', type)
        }

        function deleteNode(project, type) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            }

            let schemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
            schemaDocument.deleted = true

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Deleting Done')
        }

        function deleteConcept(project, type) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            }

            let schemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
            schemaDocument.deleted = true

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Deleting Done')
        }

        function deleteTopic(project, topic, type, pageNumber) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            } else {
                if (exist.pageNumber !== pageNumber) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Number Mismatch', 'Anchor Page Number Mismatch')
                    return
                }
                if (exist.topic !== topic) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Topic Mismatch', 'Anchor Topic Mismatch')
                    return
                }
            }

            let schemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
            schemaDocument.deleted = true

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Deleting Done')
        }

        function deleteTutorial(project, tutorial, type, pageNumber) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            } else {
                if (exist.pageNumber !== pageNumber) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Number Mismatch', 'Anchor Page Number Mismatch')
                    return
                }
                if (exist.tutorial !== tutorial) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Tutorial Mismatch', 'Anchor Tutorial Mismatch')
                    return
                }
            }

            let schemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.get(type)
            schemaDocument.deleted = true

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Deleting Done')
        }

        function deleteReview(project, review, type, pageNumber) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            } else {
                if (exist.pageNumber !== pageNumber) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Number Mismatch', 'Anchor Page Number Mismatch')
                    return
                }
                if (exist.review !== review) {
                    UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Review Mismatch', 'Anchor Review Mismatch')
                    return
                }
            }

            let schemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.get(type)
            schemaDocument.deleted = true

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Deleting Done')
        }

        function deleteBook(project, type) {
            if (SCHEMAS_BY_PROJECT.get(project) === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Project Does Not Exist', 'Anchor Project Does Not Exist')
                return
            }
            let exist = SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.get(type)
            if (exist === undefined) {
                UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Error - Page Does Not Exist', 'Anchor Page Does Not Exist')
                return
            }

            let schemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.get(type)
            schemaDocument.deleted = true

            UI.projects.superalgos.spaces.docsSpace.navigateTo('Superalgos', 'Topic', 'Docs Message - Deleting Done')
        }
    }
}