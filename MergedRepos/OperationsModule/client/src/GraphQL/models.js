const availableTimePeriods = ["24-hs", "12-hs", "08-hs", "06-hs", "04-hs", "03-hs", "02-hs", "01-hs", "45-min", "40-min", "30-min", "20-min", "15-min", "10-min", "05-min", "04-min", "03-min", "02-min", "01-min"]

const tradingStartModes = {
  live: 'Live',
  backtest: 'Backtest'
}

const tradingStartModesList = {
  live: 'Live',
  backtest: 'Backtest',
  competition: 'Competition'
}

const indicatorStartModes = {
  allMonths: 'All Months',
  oneMonth: 'One Month',
  noTime: 'Head of the Market'
}

const sensorProcessNames = {
  Live: "Live-Trades",
  HoleFixing: "Hole-Fixing"
}

const indicatorProcessNames = {
  Daily: 'Multi-Period-Daily',
  Market: 'Multi-Period-Market'
}


const botTypes = {
  Trading: "Trading",
  Indicator: "Indicator",
  Sensor: "Sensor"
}

const exchanges = {
  // COSS: "COSS",
  Poloniex: "Poloniex"
}

const markets = {
  USDT_BTC: "USDT_BTC"
}

const baseAssets = {
  assetA: "USDT",
  assetB: "BTC"
}

export {
  tradingStartModes, tradingStartModesList, exchanges, indicatorStartModes, availableTimePeriods, sensorProcessNames, indicatorProcessNames, botTypes, markets, baseAssets
}
