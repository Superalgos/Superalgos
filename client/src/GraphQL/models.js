const types = [ 'Live', 'Competition', 'Backtest' ]
const availableMonths = ["January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"]

const startModes = [
  {
    name: 'All Months',
    value: 'allMonths'
  },
  {
    name: 'One Month',
    value: 'oneMonth'
  },
  {
    name: 'No Time',
    value: 'noTime'
  }
]
const exchanges = [
  {
    id: '1',
    name: 'Poloniex'
  }
]



export { types, exchanges, startModes, availableMonths }
