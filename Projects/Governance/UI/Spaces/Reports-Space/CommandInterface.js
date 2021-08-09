function newGovernanceReportsCommmandInterface() {
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
        if (detectGovCommands() === true) { return }

        /* If we can not detect any gov or docs commands, then we assume the users is typing a filter */
    }

    function detectGovCommands() {
        if (checkPRsCommand() === undefined) { return true }
        if (checkPayCommand() === undefined) { return true }

        function checkPRsCommand() {

            let command = UI.projects.governance.spaces.reportsSpace.commandInterface.command.toLowerCase()
            if (command === 'gov.help gov.prs') {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov PRs Command')
                return
            }
            if (command.indexOf('gov.prs') !== 0 ) { return 'Not PRs Commands' }

            /* Set up the commit message */
            let message = command.trim().substring(command.indexOf(' ') + 1, command.length)
            if (message.toLowerCase() === 'gov.prs') {
                message = 'Automated PR merging process.'
            }

            /* Closing the Governance Tab */
            UI.projects.governance.spaces.reportsSpace.sidePanelTab.close()
            UI.projects.education.spaces.docsSpace.sidePanelTab.open()

            /* Find the Username and Password */
            let apisNode = UI.projects.foundations.spaces.designSpace.workspace.getHierarchyHeadByNodeType('APIs')
            if (apisNode === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (apisNode.githubAPI === undefined) {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            let config = JSON.parse(apisNode.githubAPI.config)
            if (config.username === undefined || config.username === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }
            if (config.token === undefined || config.token === "") {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Error - Github Credentials Missing', 'Anchor Github Credentials Missing')
                return
            }

            UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Processing Pull Requests')

            message = message.replaceAll('#', '_HASHTAG_')
            message = message.replaceAll('/', '_SLASH_')

            /* Lets execute this command against the Client */

            let params = {
                method: 'mergePullRequests',
                commitMessage: message,
                username: config.username,
                token: config.token
            }

            let url = 'GOV' // We will access the default Client GOV endpoint.

            httpRequest(JSON.stringify(params), url, onResponse)

            function onResponse(err, data) {

                /* Lets check the result of the call through the http interface */
                if (err.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log('[ERROR] Call via HTTP Interface failed.' + err.stack)
                    console.log('[ERROR] Params = ' + JSON.stringify(params))
                    return
                }

                let response = JSON.parse(data)

                /* Lets check the result of the method call */
                if (response.result !== GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    console.log('[ERROR] Call to Client Github Server failed.' + err.stack)
                    console.log('[ERROR] Params = ' + JSON.stringify(params))
                }

                /* Successful Call */

                if (response.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Pull Requests Processed')
                } else {
                    UI.projects.education.spaces.docsSpace.navigateTo(
                        response.docs.project,
                        response.docs.category,
                        response.docs.type,
                        response.docs.anchor,
                        undefined,
                        response.docs.placeholder
                    )
                }
            }
        }

        function checkPayCommand() {

            let command = UI.projects.governance.spaces.reportsSpace.commandInterface.command.toLowerCase()
            if (command === 'gov.help gov.pay') {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Pay Command')
                return
            }
            if (command.indexOf('gov.pay') !== 0) { return 'Not Pay Commands' }

            httpRequest(undefined, 'Gov/Pay/' + UI.projects.education.spaces.docsSpace.currentBranch, onResponse)
            UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Paying to Contributors')

            return

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                data = JSON.parse(data)
                if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.CUSTOM_OK_RESPONSE.result) {
                    if (data.message.summary.changes + data.message.summary.deletions + data.message.summary.insertions > 0) {
                        UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Pay Done')
                    } else {
                        UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Pay Failed')
                    }
                } else {
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
}