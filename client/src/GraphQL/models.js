const availableMonths = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]

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
  noTime: 'No Time'
}

const processNames = {
  Daily: 'Multi-Period-Daily',
  Market: 'Multi-Period-Market',
  Min: "One-Min-Daily-Candles-Volumes",
  Live: "Poloniex-Live-Trades",
  HoleFixing:"Poloniex-Hole-Fixing"
}

const exchanges = [
  {
    id: '1',
    name: 'Poloniex'
  }
]

export { tradingStartModes, tradingStartModesList, exchanges, indicatorStartModes, availableMonths, processNames }
