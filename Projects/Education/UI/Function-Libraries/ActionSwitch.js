function newEducationActionSwitch() {

    let thisObject = {
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
            case 'Play Tutorial':
                {
                    UI.projects.education.spaces.tutorialSpace.playTutorial(action.node)
                }
                break
            case 'Play Tutorial Topic':
                {
                    UI.projects.education.spaces.tutorialSpace.playTutorialTopic(action.node)
                }
                break
            case 'Play Tutorial Step':
                {
                    UI.projects.education.spaces.tutorialSpace.playTutorialStep(action.node)
                }
                break
            case 'Resume Tutorial':
                {
                    UI.projects.education.spaces.tutorialSpace.resumeTutorial(action.node)
                }
                break
            case 'Resume Tutorial Topic':
                {
                    UI.projects.education.spaces.tutorialSpace.resumeTutorialTopic(action.node)
                }
                break
            case 'Resume Tutorial Step':
                {
                    UI.projects.education.spaces.tutorialSpace.resumeTutorialStep(action.node)
                }
                break
            case 'Reset Tutorial Progress':
                {
                    UI.projects.education.spaces.tutorialSpace.resetTutorialProgress(action.node)
                }
                break
        }
    }
}
