exports.newAnnouncements = function newAnnouncements(bot, logger) {

    const MODULE_NAME = 'Announcements'

    let thisObject = {
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine

    return thisObject

    function initialize() {
        tradingEngine = bot.TRADING_ENGINE
    }

    function finalize() {
        tradingEngine = undefined
    }

}