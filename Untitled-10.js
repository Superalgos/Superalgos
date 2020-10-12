let candle = record.current // This is the primary dependency
let volume = getElement('volumes', candle) // Here I get the volume bar corresponding to the current candle
let totalVolume = volume.buy + volume.sell // Candles Volumes split the volume received from the exchange evenly betwen buy and sell because it does not know how much of it there is.

variable.buyVolume = 0
variable.sellVolume = 0

/* 
We will estimate a buy volume or sell volume proportional to the distance from 
the open to the max and min of the candle.
*/
let distanceOpenMax = candle.max - candle.open
let distanceOpenMin = candle.open - candle.min
let distanceMaxMin = candle.max - candle.min

variable.buyVolume = totalVolume * distanceOpenMax * 100 / distanceMaxMin
variable.sellVolume = totalVolume * distanceOpenMin * 100 / distanceMaxMin

let totalBuy
let totalSell
let totalNonZero
/* Maintain the 20 periods moving averages. */
variable.last20Buy.splice(0, 1)
variable.last20Buy.push(variable.buyVolume)
totalBuy = 0
totalNonZero = 0
for (let i = 0; i < variable.last20Buy.length; i++) {
    let value = variable.last20Buy[i]
    if (value > 0) {
        totalBuy = totalBuy + value
        totalNonZero++
    }
}
variable.buySMA20 = totalBuy / totalNonZero

variable.last20Sell.splice(0, 1)
variable.last20Sell.push(variable.sellVolume)
totalSell = 0
totalNonZero = 0
for (let i = 0; i < variable.last20Sell.length; i++) {
    let value = variable.last20Sell[i]
    if (value > 0) {
        totalSell = totalSell + value
        totalNonZero++
    }
}
variable.sellSMA20 = totalSell / totalNonZero

/* Maintain the 200 periods moving averages. */
variable.last200Buy.splice(0, 1)
variable.last200Buy.push(variable.buyVolume)
totalBuy = 0
totalNonZero = 0
for (let i = 0; i < variable.last200Buy.length; i++) {
    let value = variable.last200Buy[i]
    if (value > 0) {
        totalBuy = totalBuy + value
        totalNonZero++
    }
}
variable.buySMA200 = totalBuy / totalNonZero

variable.last200Sell.splice(0, 1)
variable.last200Sell.push(variable.sellVolume)
totalSell = 0
totalNonZero = 0
for (let i = 0; i < variable.last200Sell.length; i++) {
    let value = variable.last200Sell[i]
    if (value > 0) {
        totalSell = totalSell + value
        totalNonZero++
    }
}
variable.sellSMA200 = totalSell / totalNonZero

/* Finaly we compute how many times the 200 moving average the volume is */
variable.buyForce = Math.trunc(variable.buyVolume / variable.buySMA200)
variable.sellForce = Math.trunc(variable.sellVolume / variable.sellSMA200)








variable.last20Buy = []
variable.last20Sell = []
variable.last200Buy = []
variable.last200Sell = []

for (let i = 0; i < 20; i++) {
    variable.last20Buy.push(0)
    variable.last20Sell.push(0)
}

for (let i = 0; i < 200; i++) {
    variable.last200Buy.push(0)
    variable.last200Sell.push(0)
}




