exports.newAnnouncements = function newAnnouncements(bot, logger) {

    const MODULE_NAME = 'Announcements'

    let thisObject = {
        makeAnnoucements: makeAnnoucements,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine
    let announcementsToBeMade = []

    return thisObject

    function initialize() {
        tradingEngine = bot.simulationState.tradingEngine
    }

    function finalize() {
        tradingEngine = undefined
        announcementsToBeMade = undefined
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
                        try {
                            text = eval(announcement.formula.code)
                        } catch (err) {
                            tradingSystem.errors.push([announcement.formula.id, err.message])
                        }
                    }

                    if (bot.SESSION.socialBots !== undefined) {
                        bot.SESSION.socialBots.announce(text)
                    } else {
                        tradingSystem.errors.push([announcement.id, 'Could not announce because session does not have Social Bots.'])
                    }
                }
            }
        }
    }
}