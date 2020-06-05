exports.newSnapshots = function newSnapshots(bot, logger) {

    const MODULE_NAME = 'Snapshots'

    let thisObject = {
        manageSnapshots: manageSnapshots,
        addCodeToSnapshot: addCodeToSnapshot,
        initialize: initialize,
        finalize: finalize
    }

    let tradingEngine


    /* Snapshots of Trigger On and Take Positions */
    let snapshots = {
        headers: undefined,
        triggerOn: [],
        takePosition: [],
        lastTriggerOn: undefined,
        lastTakePosition: undefined
    }

    /* We are going to take snapshots of the values of indicators at key moments of the sumulation. */
    let snapshotKeys = new Map()
    snapshotLoopHeaders = []
    snapshotDataRecord = []
    saveAsLastTriggerOnSnapshot = false
    saveAsLastTakePositionSnapshot = false
    addToSnapshots = false

    let announcementsToBeMade = []

    return thisObject

    function initialize() {
        tradingEngine = bot.TRADING_ENGINE
    }

    function finalize() {
        tradingEngine = undefined
    }

    function manageSnapshots() {
        /* Snapshots Management (before we generate the trade record and delete that info) */
        if (saveAsLastTriggerOnSnapshot === true) {
            snapshots.lastTriggerOn = snapshotDataRecord
            saveAsLastTriggerOnSnapshot = false
        }

        if (saveAsLastTakePositionSnapshot === true) {
            snapshots.lastTakePosition = snapshotDataRecord
            saveAsLastTakePositionSnapshot = false
        }

        if (addToSnapshots === true) {
            let closeValues = [
                tradingEngine.episode.positionCounters.positions.value,                                   // Position Number
                (new Date(candle.begin)).toISOString(),                             // Datetime
                tradingSystem.strategies[tradingEngine.current.strategy.index.value].name,     // Strategy Name
                tradingEngine.current.strategy.situationName.value,                            // Trigger On Situation
                tradingEngine.current.position.situationName.value,                            // Take Position Situation
                hitOrFial(),                                                        // Result
                tradingEngine.last.position.ROI.value,                                         // ROI
                exitType()                                                          // Exit Type
            ]

            function hitOrFial() {
                if (tradingEngine.last.position.ROI.value > 0) { return 'HIT' } else { return 'FAIL' }
            }

            function exitType() {
                switch (tradingEngine.current.position.exitType.value) {
                    case 1: return 'Stop'
                    case 2: return 'Take Profit'
                }
            }


            snapshots.triggerOn.push(closeValues.concat(snapshots.lastTriggerOn))
            snapshots.takePosition.push(closeValues.concat(snapshots.lastTakePosition))

            snapshots.lastTriggerOn = undefined
            snapshots.lastTakePosition = undefined
            addToSnapshots = false
        }

        let closeHeaders = ['Trade Number', 'Close Datetime', 'Strategy', 'Trigger On Situation', 'Take Position Situation', 'Result', 'ROI', 'Exit Type']
        if (snapshots.headers === undefined) {
            snapshots.headers = closeHeaders.concat(JSON.parse(JSON.stringify(snapshotLoopHeaders)))
        }
    }

    function addCodeToSnapshot(code) {
        if (code === undefined) { return }

        try {
            let instructionsArray = code.split(' ')
            for (let i = 0; i < instructionsArray.length; i++) {
                let instruction = instructionsArray[i]
                instruction = instruction.replace('(', '')
                instruction = instruction.replace(')', '')
                instruction = instruction.replace(/</g, '')
                instruction = instruction.replace(/>/g, '')
                instruction = instruction.replace(/<=/g, '')
                instruction = instruction.replace(/>=/g, '')
                instruction = instruction.replace(/!=/g, '')
                instruction = instruction.replace(/!==/g, '')
                instruction = instruction.replace(/==/g, '')
                instruction = instruction.replace(/===/g, '')
                instruction = instruction.replace(/{/g, '')
                instruction = instruction.replace(/}/g, '')
                if (instruction.indexOf('chart') >= 0) {
                    let parts = instruction.split('.')
                    let timeFrame = parts[1]
                    let product = parts[2]
                    let property
                    checkPrevious(3)
                    function checkPrevious(index) {
                        property = parts[index]
                        if (property === 'previous') {
                            product = product + '.previous'
                            checkPrevious(index + 1)
                        }
                    }

                    // Example: chart.at01hs.popularSMA.sma200 - chart.at01hs.popularSMA.sma100  < 10
                    if (timeFrame !== 'atAnyvariable.timeFrame') {
                        timeFrame = timeFrame.substring(2, 4) + '-' + timeFrame.substring(4, 7)
                    }
                    let key = timeFrame + '-' + product + '-' + property
                    let existingKey = snapshotKeys.get(key)

                    if (existingKey === undefined) { // means that at the current loop this property of this product was not used before.
                        snapshotKeys.set(key, key)
                        snapshotLoopHeaders.push(key)

                        let value = eval(instruction)
                        snapshotDataRecord.push(value)
                    }
                }
            }
        } catch (err) {
            logger.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> code = ' + code)
            logger.write(MODULE_NAME, '[ERROR] runSimulation -> addCodeToSnapshot -> err = ' + err.stack)
            callBackFunction(global.DEFAULT_FAIL_RESPONSE)
        }
    }
}