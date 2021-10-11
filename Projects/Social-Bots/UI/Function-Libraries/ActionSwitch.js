function newSocialBotsActionSwitch() {

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
            case 'Send Telegram Test Message':
                {
                    UI.projects.socialBots.functionLibraries.socialBotsFunctions.sendTelegramTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Send Discord Test Message':
                {
                    UI.projects.socialBots.functionLibraries.socialBotsFunctions.sendDiscordTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Send Slack Test Message':
                {
                    UI.projects.socialBots.functionLibraries.socialBotsFunctions.sendSlackTestMessage(action.node, action.callBackFunction)
                }
                break
            case 'Send Twitter Test Message':
                {
                    UI.projects.socialBots.functionLibraries.socialBotsFunctions.sendTwitterTestMessage(action.node, action.callBackFunction)
                }
                break
        }
    }
}
