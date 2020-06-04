exports.newSnapshots = function newSnapshots(bot, logger) {

    const MODULE_NAME = 'Snapshots'

    let thisObject = {
        manageSnapshots: manageSnapshots,
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


            if (positionedAtYesterday === false) {
                snapshots.triggerOn.push(closeValues.concat(snapshots.lastTriggerOn))
                snapshots.takePosition.push(closeValues.concat(snapshots.lastTakePosition))
            }
            snapshots.lastTriggerOn = undefined
            snapshots.lastTakePosition = undefined
            addToSnapshots = false
        }

        let closeHeaders = ['Trade Number', 'Close Datetime', 'Strategy', 'Trigger On Situation', 'Take Position Situation', 'Result', 'ROI', 'Exit Type']
        if (snapshots.headers === undefined) {
            snapshots.headers = closeHeaders.concat(JSON.parse(JSON.stringify(snapshotLoopHeaders)))
        }
    }
}