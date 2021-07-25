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
            if (UI.projects.governance.spaces.reportsSpace.commandInterface.command.toLowerCase() === 'gov.help gov.prs') {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov PRs Command')
                return
            }
            if (UI.projects.governance.spaces.reportsSpace.commandInterface.command.indexOf('Gov.PRs') !== 0 && UI.projects.governance.spaces.reportsSpace.commandInterface.command.indexOf('gov.prs') !== 0) { return 'Not PRs Commands' }

            /* Set up the commit message */
            let message = UI.projects.governance.spaces.reportsSpace.commandInterface.command.trim().substring(UI.projects.governance.spaces.reportsSpace.commandInterface.command.indexOf(' ') + 1, UI.projects.governance.spaces.reportsSpace.commandInterface.command.length)
            if (message.toLowerCase() === 'gov.prs') {
                message = 'Automated PR merging process.'
            }

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

            message = message.replaceAll('#', '_HASHTAG_')
            message = message.replaceAll('/', '_SLASH_')

            httpRequest(
                undefined,
                'Gov/PRs/' +
                message + '/' +
                config.username + '/' +
                config.token + '/' +
                UI.projects.education.spaces.docsSpace.currentBranch + '/' +
                UI.projects.education.spaces.docsSpace.contributionsBranch
                , onResponse)

            UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Processing Pull Requests')

            return

            function onResponse(err, data) {
                /* Lets check the result of the call through the http interface */
                data = JSON.parse(data)
                if (err.result === GLOBAL.DEFAULT_OK_RESPONSE.result && data.result === GLOBAL.DEFAULT_OK_RESPONSE.result) {
                    UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Message - Pull Requests Processed')
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

        function checkPayCommand() {
            if (UI.projects.governance.spaces.reportsSpace.commandInterface.command.toLowerCase() === 'gov.help gov.pay') {
                UI.projects.education.spaces.docsSpace.navigateTo('Governance', 'Topic', 'Gov Pay Command')
                return
            }
            if (UI.projects.governance.spaces.reportsSpace.commandInterface.command.indexOf('Gov.Pay') !== 0 && UI.projects.governance.spaces.reportsSpace.commandInterface.command.indexOf('gov.pay') !== 0) { return 'Not Pay Commands' }

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