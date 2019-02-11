const availableMonths = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]

const tradingStartModes ={
    live: "Live",
    competition: "Competition",
    backtest: "Backtest"
}

const indicatorStartModes = {
  allMonths: "All Months",
  oneMonth: "One Month",
  noTime: "No Time"
}

const exchanges = [
  {
    id: '1',
    name: 'Poloniex'
  }
]



export { tradingStartModes, exchanges, indicatorStartModes, availableMonths }
