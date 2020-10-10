variable.last20Buy = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
variable.last20Sell = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]





let candle = record.current // This is the primary dependency
let volume = getElement('volumes', candle) // Here I get the volume bar corresponding to the current candle
let totalVolume = volume.buy + volume.sell // Candles Volumes split the volume received from the exchange evenly betwen buy and sell because it does not know how much of it there is.

variable.buyVolume = 0
variable.sellVolume = 0

if (candle.direction === 'Up') {
    variable.buyVolume = totalVolume
}
if (candle.direction === 'Down') {
    variable.sellVolume = totalVolume
}

variable.last20Buy.splice(0, 1)
variable.last20Buy.push(variable.buyVolume)
let totalBuy = 0
let totalNonZero = 0
for (let i = 0; i < variable.last20Buy.length; i++) {
    let value = variable.last20Buy[i]
    if (value > 0) {
        totalBuy = totalBuy + value
        totalNonZero++
    }
}
variable.buySMA = totalBuy / totalNonZero

variable.last20Sell.splice(0, 1)
variable.last20Sell.push(variable.sellVolume)
let totalSell = 0
totalNonZero = 0
for (let i = 0; i < variable.last20Sell.length; i++) {
    let value = variable.last20Sell[i]
    if (value > 0) {
        totalSell = totalSell + value
        totalNonZero++
    }
}
variable.sellSMA = totalSell / totalNonZero
