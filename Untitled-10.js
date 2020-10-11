

let candle = record.current
let previousCandle = record.previous

variable.supportResistanceZone = calculateSupportResistanceZone()

deleteResistances(candle.max)
increasePeriods()

variable.resistance = {}

variable.resistance.rate = 0
variable.resistance.period = 0
variable.resistance.type = ''

if (previousCandle !== undefined) {

    let previousPreviousCandle = record.previous.previous

    if (previousPreviousCandle !== undefined) {

        if (previousCandle.max > previousPreviousCandle.max && previousCandle.max > candle.max) {
            variable.resistance.rate = previousCandle.max
            variable.resistance.period = 0
            variable.resistance.type = 'Resistance'
            increaseResistancesBounces(variable.resistance.rate)
            rememberResistance(variable.resistance.rate)
        }
    }
}

setClosestResistances()

function deleteResistances(rate) {

    let max

    for (let i = 0; i < variable.resistances.length; i++) {
        let currenRecord = variable.resistances[i]
        let currentRate = currenRecord[0]

        if (rate >= currentRate + currentRate * variable.supportResistanceZone / 2 / 100) {  // It must go through the support / resistance zone around the current rate value
            max = i
        }
    }
    if (max !== undefined) {
        variable.resistances.splice(0, max + 1)
    }
}

function increasePeriods() {

    for (let i = 0; i < variable.resistances.length; i++) {
        let currenRecord = variable.resistances[i]
        currenRecord[1] = currenRecord[1] + 1
    }
}

function setClosestResistances() {
    let record

    record = variable.resistances[0]
    if (record === undefined) { record = [0, 0, 0, 0, 0, 0, 0, 0] }
    variable.resistance1Rate = record[0]
    variable.resistance1Period = record[1]
    variable.resistance1Bounce1 = record[2]
    variable.resistance1Bounce2 = record[3]
    variable.resistance1Bounce3 = record[4]
    variable.resistance1Bounce5 = record[5]
    variable.resistance1Bounce10 = record[6]
    variable.resistance1BounceAll = record[7]

    record = variable.resistances[1]
    if (record === undefined) { record = [0, 0, 0, 0, 0, 0, 0, 0] }
    variable.resistance2Rate = record[0]
    variable.resistance2Period = record[1]
    variable.resistance2Bounce1 = record[2]
    variable.resistance2Bounce2 = record[3]
    variable.resistance2Bounce3 = record[4]
    variable.resistance2Bounce5 = record[5]
    variable.resistance2Bounce10 = record[6]
    variable.resistance2BounceAll = record[7]

    record = variable.resistances[2]
    if (record === undefined) { record = [0, 0, 0, 0, 0, 0, 0, 0] }
    variable.resistance3Rate = record[0]
    variable.resistance3Period = record[1]
    variable.resistance3Bounce1 = record[2]
    variable.resistance3Bounce2 = record[3]
    variable.resistance3Bounce3 = record[4]
    variable.resistance3Bounce5 = record[5]
    variable.resistance3Bounce10 = record[6]
    variable.resistance3BounceAll = record[7]

    record = variable.resistances[3]
    if (record === undefined) { record = [0, 0, 0, 0, 0, 0, 0, 0] }
    variable.resistance4Rate = record[0]
    variable.resistance4Period = record[1]
    variable.resistance4Bounce1 = record[2]

    record = variable.resistances[4]
    if (record === undefined) { record = [0, 0, 0, 0, 0, 0, 0, 0] }
    variable.resistance5Rate = record[0]
    variable.resistance5Period = record[1]
    variable.resistance5Bounce1 = record[2]

}

function rememberResistance(rate) {
    if (variable.resistances.length === 0) {
        variable.resistances.push([rate, 1, 0, 0, 0, 0, 0, 0])
        return
    }
    for (let i = 0; i < variable.resistances.length; i++) {
        let currenRecord = variable.resistances[i]
        let currentRate = currenRecord[0]

        if (rate > currentRate - currentRate * variable.supportResistanceZone / 2 / 100 && rate < currentRate + currentRate * variable.supportResistanceZone / 2 / 100) {
            // We are not going to remember this new level since it is absorved by this existing one.
            return
        }

        if (rate < currentRate) {
            variable.resistances.splice(i, 0, [rate, 1, 0, 0, 0, 0, 0, 0])
            return
        }

        if (i === variable.resistances.length - 1) {
            variable.resistances.push([rate, 1, 0, 0, 0, 0, 0, 0])
            return
        }
    }
}

function increaseResistancesBounces(rate) {

    for (let i = 0; i < variable.resistances.length; i++) {
        let currenRecord = variable.resistances[i]
        let currentRate = currenRecord[0]
        let percentage = 100 - rate * 100 / currentRate

        if (percentage <= variable.supportResistanceZone / 2 * 1) {
            currenRecord[2] = currenRecord[2] + 1
        }

        if (percentage <= variable.supportResistanceZone / 2 * 2) {
            currenRecord[3] = currenRecord[3] + 1
        }

        if (percentage <= variable.supportResistanceZone / 2 * 3) {
            currenRecord[4] = currenRecord[4] + 1
        }

        if (percentage <= variable.supportResistanceZone / 2 * 5) {
            currenRecord[5] = currenRecord[5] + 1
        }

        if (percentage <= variable.supportResistanceZone / 2 * 10) {
            currenRecord[6] = currenRecord[6] + 1
        }

        currenRecord[7] = currenRecord[7] + 1
    }
}

function calculateSupportResistanceZone() {
    /* 
    The variable % is a percentage we will use for support and resistance based on the time frame.
    We will fix the % for 1 minute candles and for 24 hs candle and the use the formula to obtain
    y on a line by knowing 2 points of the line as described here: https://en.wikipedia.org/wiki/Line_(geometry)
    */

    let x0 = system.ONE_MIN_IN_MILISECONDS
    let y0 = 0.1 // At one min, we will consider the resistance / support zone to be 0.1% resistance 
    let x1 = system.ONE_DAY_IN_MILISECONDS
    let y1 = 4 // At one day, we will consider the resistance / support zone to be 4% resistance

    let x = system.timeFrame  // This is the current time frame being calculated
    let y = (x - x0) * (y1 - y0) / (x1 - x0) + y0

    return y

}