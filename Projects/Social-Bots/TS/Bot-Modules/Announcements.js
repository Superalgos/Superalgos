exports.newSocialBotsBotModulesAnnouncements = function (processIndex) {

    const MODULE_NAME = 'Announcements'

    let thisObject = {
        makeAnnouncements: makeAnnouncements,
        initialize: initialize,
        finalize: finalize
    }

    let tradingSystem
    let tradingEngine
    let sessionParameters
    let taskParameters

    return thisObject

    function initialize() {
        tradingSystem = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.foundations.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        taskParameters = {
            exchange: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.name,
            market: TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                '/' +
                TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
        }
    }

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined
        taskParameters = undefined
        TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.messagesSent = undefined
    }

    function makeAnnouncements(node, status='Open') {
        if (node === undefined) { return }
        if (node.announcements === undefined) { return }

        for (let i = 0; i < node.announcements.length; i++) {
            let announcement = node.announcements[i]
            let canAnnounce = true

            // Check configuration to see if Announcement should be run at Enter or Exit of Node
            // set defaults, protect against empty configurations or missing values
            let onEnter = true
            let onExit = false
            if (announcement.config.onEnter !== undefined) {
                onEnter = announcement.config.onEnter
            }
            if (announcement.config.onExit !== undefined) {
                onExit = announcement.config.onExit
                if (announcement.config.onEnter === undefined) {
                    onEnter = false
                }
            }
            if ((status === 'Open' && onEnter) || (status === 'Closed' && onExit)) {
                canAnnounce = true
            } else {
                canAnnounce = false
            }
            
            if (announcement.announcementCondition !== undefined) {
                let conditionValue
                try {
                    conditionValue = eval(announcement.announcementCondition.code)
                } catch (err) {

                    const message = 'Announcement Condition Evaluation Error'
                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - ' + message,
                        placeholder: {}
                    }

                    TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, announcement.announcementCondition.name, announcement.announcementCondition.code, undefined, undefined, undefined)

                    tradingSystem.addError([announcement.announcementCondition.id, err.message, docs])
                }
                if (conditionValue !== true) { canAnnounce = false }
            }
            if (canAnnounce === true) {
                let text = announcement.config.text
                if (announcement.announcementFormula !== undefined) {
                    let formulaValue
                    let errorMessage

                    try {
                        formulaValue = eval(announcement.announcementFormula.code)
                    } catch (err) {

                        errorMessage = err.message
                        const message = 'Announcement Formula Evaluation Error'
                        let docs = {
                            project: 'Foundations',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Error - ' + message,
                            placeholder: {}
                        }

                        TS.projects.education.utilities.docsFunctions.buildPlaceholder(docs, err, announcement.announcementFormula.name, announcement.announcementFormula.code, undefined, undefined, undefined)

                        tradingSystem.addError([announcement.announcementFormula.id, err.message, docs])
                    }
                    if (errorMessage == undefined) { text = formulaValue }
                }

                if (TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots !== undefined) {
                    TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.announce(text)
                    tradingSystem.announcements.push([announcement.id, text])
                } else {

                    const message = 'Social Bots Node Missing'
                    let docs = {
                        project: 'Foundations',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - ' + message,
                        placeholder: {}
                    }

                    tradingSystem.addError([TS.projects.foundations.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.id, message, docs])
                }
            }
        }
    }
}
