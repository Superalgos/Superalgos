exports.newAnnouncements = function newAnnouncements(bot, logger) {

    const MODULE_NAME = 'Announcements'

    let thisObject = {
        makeAnnoucements: makeAnnoucements,
        initialize: initialize,
        finalize: finalize
    }

    let tradingSystem
    let tradingEngine

    return thisObject

    function initialize() {
        tradingSystem = bot.simulationState.tradingSystem
        tradingEngine = bot.simulationState.tradingEngine
    }

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        bot.SESSION.messagesSent = undefined
    }

    function makeAnnoucements(node) {
        if (node.announcements !== undefined) {
            for (let i = 0; i < node.announcements.length; i++) {
                let announcement = node.announcements[i]
                let canAnnounce = true
                if (announcement.announcementCondition !== undefined) {
                    let conditionValue
                    try {
                        conditionValue = eval(announcement.announcementCondition.code)
                    } catch (err) {
                        tradingSystem.errors.push([announcement.announcementCondition.id, err.message])
                    }
                    if (conditionValue !== true) { canAnnounce = false }
                }
                if (canAnnounce === true) {
                    let text = announcement.config.text
                    if (announcement.formula !== undefined) {
                        text = tradingSystem.formulas.get(announcement.formula.id)
                    }

                    if (bot.SESSION.socialBots !== undefined) {
                        bot.SESSION.socialBots.announce(text)
                        tradingSystem.announcements.push([announcement.id, text])
                    } else {
                        tradingSystem.errors.push([announcement.id, 'Could not announce because session does not have Social Bots.'])
                    }
                }
            }
        }
    }
}