function newContributionsSystemActionSwitch() {

    let thisObject = {
        name: 'newContributionsSystemActionSwitch',
        executeAction: executeAction,
        initialize: initialize,
        finalize: finalize
    }

    return thisObject

    function finalize() {

    }

    function initialize() {
        /* Nothing to initialize since a Function Library does not hold any state. */
    }

    async function executeAction(action) {
        switch (action.name) {
            case 'contributeAll':
                {
                    UI.projects.contributions.spaces.contributionsSpace.editorPage.contributeAll()
                }
                break
            case 'update':
                {
                    UI.projects.contributions.spaces.contributionsSpace.editorPage.update()
                }
                break
            case 'reset':
                {
                    UI.projects.contributions.spaces.contributionsSpace.editorPage.update()
                }
                break
            default: {
                console.log("[WARN] Action sent to Workspaces System Action Switch does not belong here. -> Action = " + action.name)
            }
        }
    }
}
