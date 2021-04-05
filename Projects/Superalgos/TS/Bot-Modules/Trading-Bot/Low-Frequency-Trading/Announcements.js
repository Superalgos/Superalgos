exports.newSuperalgosBotModulesAnnouncements = function (processIndex) {

    const MODULE_NAME = 'Announcements'

    let thisObject = {
        makeAnnoucements: makeAnnoucements,
        initialize: initialize,
        finalize: finalize
    }

    let tradingSystem
    let tradingEngine
    let sessionParameters
    let taskParameters

    return thisObject

    function initialize() {
        tradingSystem = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingSystem
        tradingEngine = TS.projects.superalgos.globals.processVariables.VARIABLES_BY_PROCESS_INDEX_MAP.get(processIndex).SIMULATION_STATE.tradingEngine
        sessionParameters = TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.tradingParameters

        let taskParameters = {
            market: TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName +
                '/' +
                TS.projects.superalgos.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
        }
    }

    function finalize() {
        tradingSystem = undefined
        tradingEngine = undefined
        sessionParameters = undefined
        taskParameters = undefined
        TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.messagesSent = undefined
    }

    function makeAnnoucements(node) {
        if (node === undefined) { return }
        if (node.announcements === undefined) { return }

        for (let i = 0; i < node.announcements.length; i++) {
            let announcement = node.announcements[i]
            let canAnnounce = true
            if (announcement.announcementCondition !== undefined) {
                let conditionValue
                try {
                    conditionValue = eval(announcement.announcementCondition.code)
                } catch (err) {

                    const message = 'Announcement Condition Evaluation Error'
                    let docs = {
                        project: 'Superalgos',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - ' + message,
                        placeholder: {}
                    }

                    TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(docs, err, announcement.announcementCondition.name, announcement.announcementCondition.code, undefined, undefined, undefined)

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
                            project: 'Superalgos',
                            category: 'Topic',
                            type: 'TS LF Trading Bot Error - ' + message,
                            placeholder: {}
                        }

                        TS.projects.superalgos.utilities.docsFunctions.buildPlaceholder(docs, err, announcement.announcementFormula.name, announcement.announcementFormula.code, undefined, undefined, undefined)

                        tradingSystem.addError([announcement.announcementFormula.id, err.message, docs])
                    }
                    if (errorMessage == undefined) { text = formulaValue }

                }

                if (TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots !== undefined) {
                    TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.socialBots.announce(text)
                    tradingSystem.announcements.push([announcement.id, text])
                } else {

                    const message = 'Social Bots Node Missing'
                    let docs = {
                        project: 'Superalgos',
                        category: 'Topic',
                        type: 'TS LF Trading Bot Error - ' + message,
                        placeholder: {}
                    }

                    tradingSystem.addError([TS.projects.superalgos.globals.processConstants.CONSTANTS_BY_PROCESS_INDEX_MAP.get(processIndex).SESSION_NODE.id, message, docs])
                }
            }
        }
    }
}
