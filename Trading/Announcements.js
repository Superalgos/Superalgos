exports.newAnnouncements = function newAnnouncements(bot, logger) {

    const MODULE_NAME = 'Announcements'

    let thisObject = {
        checkAnnouncements: checkAnnouncements,
        makeAnnoucements: makeAnnoucements,
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

    function checkAnnouncements(node, value) {
        /*
        Value is an optional parameter that represents the value that the announcement is monitoring for change (for numeric values only).
        If we do receive this value, we will only make the annoucement if the variance is grater than the user pre-defined value
        for this variance.
        */

        if (node.announcements !== undefined) {
            for (let i = 0; i < node.announcements.length; i++) {
                let announcement = node.announcements[i]
                let key = node.type + '-' + announcement.name + '-' + announcement.id

                let lastPeriodAnnounced = -1
                let newAnnouncementRecord = {}

                for (let j = 0; j < variable.announcements.length; j++) {
                    let announcementRecord = variable.announcements[j]
                    if (announcementRecord.key === key) {
                        lastPeriodAnnounced = announcementRecord.periods
                        newAnnouncementRecord = announcementRecord
                        break
                    }
                }

                if (tradingEngine.episode.episodeCounters.periods > lastPeriodAnnounced) {
                    if (isNaN(value) === false) {
                        /* The Value Variation is what tells us how much the value already announced must change in order to annouce it again. */
                        let valueVariation

                        let config = announcement.config
                        valueVariation = config.valueVariation

                        if (newAnnouncementRecord.value !== undefined && valueVariation !== undefined) {
                            let upperLimit = newAnnouncementRecord.value + newAnnouncementRecord.value * valueVariation / 100
                            let lowerLimit = newAnnouncementRecord.value - newAnnouncementRecord.value * valueVariation / 100
                            if (value > lowerLimit && value < upperLimit) {
                                /* There is not enough variation to announce this again. */
                                return
                            }
                        }
                    }

                    /*
                    We store the announcement temporarily at an Array to differ its execution, becasue we need to evaulate its formula
                    and at this point in time the potential variables used at the formula are still not set.
                    */
                    announcement.value = value
                    announcementsToBeMade.push(announcement)

                    /* Next, we will remmeber this announcement was already done, so that it is not announced again in further processing of the same day. */
                    if (newAnnouncementRecord.periods !== undefined) {
                        newAnnouncementRecord.periods = tradingEngine.episode.episodeCounters.periods
                        newAnnouncementRecord.value = value
                    } else {
                        newAnnouncementRecord = {
                            key: key,
                            periods: tradingEngine.episode.episodeCounters.periods,
                            value: value
                        }
                        variable.announcements.push(newAnnouncementRecord)
                    }
                }
            }
        }
    }

    function makeAnnoucements() {
        /* Here we go through all the annoucements that need to be done during this loop, and we just do them. */
        for (let i = 0; i < announcementsToBeMade.length; i++) {
            announcement = announcementsToBeMade[i]
            /* Here we check if there is a formula attached to the annoucement, we evaluate it to get the annoucement text. */
            let formulaValue
            if (announcement.formula !== undefined) {
                try {
                    let value = announcement.value
                    formulaValue = eval(announcement.formula.code)
                } catch (err) {
                    announcement.formula.error = err.message
                }
            }
            announcement.formulaValue = formulaValue

            if (bot.SESSION.socialBots !== undefined) {
                bot.SESSION.socialBots.announce(announcement)
            }
        }
    }
}