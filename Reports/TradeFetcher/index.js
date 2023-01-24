const ccxt = require('ccxt')
const yargs = require('yargs')
const {hideBin} = require('yargs/helpers')
const fs = require('fs')

const addDays = require('date-fns/addDays')
const getTime = require('date-fns/getTime')
const startOfMonth = require('date-fns/startOfMonth')
const subMonths = require('date-fns/subMonths')
const endOfMonth = require('date-fns/endOfMonth')
const differenceInDays = require('date-fns/differenceInDays')
const format = require('date-fns/format')
const parseISO = require('date-fns/parseISO')


const argv = yargs(hideBin(process.argv))
    .option('exchange',
        {
            alias: 'e', 
            demandOption: true, 
            string: true
        })
    .option('key-file',
        {
            alias: 'f', 
            demandOption: true, 
            string: true, 
            description: 'JSON file with configuration exchange keys in format {apikey: string, secret: string}'
        })
    .option('out-file',
        {
            alias: 'o',
            description: 'Optional output file, the directory should already exist but the file will be created or overwritten',
            string: true,
            demandOption: false
        })
    .option('last-month',
        {
            boolean: true,
            default: false,
            demandOption: false
        })
    .parse()

/**
 * @param {{
 * fetchMyTrades: {(key: string, timestamp: number, limit: number?, params: {}?) => Promise<[]>}}} exchange
 * @param {Date} startTime millisecond datestamp for start point of trading activity,
 * @param {Date} endTime millisecond datestamp for end point of trading activity,
 * this will only return a maximum one week of trades
 * @returns {Promise<{
 * date: string,
 * market: string,
 * type: string,
 * price: number,
 * amount: number,
 * total: number,
 * fee: number,
 * feeCoin: string,
 * }[]>}
 */
async function fetchTrades(exchange, startTime, endTime) {
    const params = {
        type: 'spot',
        endTime: getTime(endTime)
    }
    const tradeHistory = await exchange.fetchMyTrades('BTCUSDT', getTime(startTime), 500, params)
    const trades = tradeHistory.map(mapTrade)
    if(tradeHistory.length == 500) {
        return trades.concat(await fetchTrades(exchange, getTime(parseISO(tradeHistory[499].datetime)), endTime))
    }
    return trades
}

function mapTrade(trade) {
    return {
        id: trade.id,
        date: trade.datetime, 
        market: trade.info.symbol, 
        type: trade.side,
        price: trade.price,
        amount: trade.amount,
        total: trade.cost,
        fee: trade.fee.cost,
        feeCoin: trade.fee.currency,
    }
}

/**
 * 
 * @param {{
 * date: string,
 * market: string,
 * type: string,
 * price: number,
 * amount: number,
 * total: number,
 * fee: number,
 * feeCoin: string,
 * }} trades 
 * @returns {string}
 */
function mapTradesToCsvLine(trade) {
    return `${format(parseISO(trade.date), "yyyy-MM-dd HH:mm:ss.SSS")},${trade.market},${trade.type.toUpperCase()},${trade.price},${trade.amount},${trade.total},${trade.fee},${trade.feeCoin}`
}

function deDuplicateTradeHistory(tradeHistory) {
    const deDuplicatedHistory = tradeHistory.reduce((a,c) => {
        if(a.has(c.id)) {
            return a
        }
        a.set(c.id, c)
        return a
    }, new Map())

    return Array.from(deDuplicatedHistory).map(([key, value]) => value)
}

function getRequestDates() {
    const now = new Date()
    const currentMonth = startOfMonth(now)

    let startDate = currentMonth
    let endDate = now

    if(argv.lastMonth) {
        startDate = subMonths(currentMonth, 1)
        endDate = endOfMonth(startDate)
    }

    return {startDate, endDate}
}

async function main() {
    const config = JSON.parse(fs.readFileSync(argv.keyFile))
    const exchangeId = argv.exchange
        , exchangeClass = ccxt[exchangeId]
        , exchange = new exchangeClass(config)

    const {startDate, endDate} = getRequestDates()

    const totalDaysDifference = differenceInDays(endDate, startDate)

    let tradeHistory = [];

    for(let i = 0; i < totalDaysDifference; i++) {
        tradeHistory = tradeHistory.concat(await fetchTrades(exchange, addDays(startDate, i), addDays(startDate, i+1)))
    }

    const csvLines = deDuplicateTradeHistory(tradeHistory).reduce((a,c) => {
        a.push(mapTradesToCsvLine(c))
        return a
    }, ['Date(UTC),Market,Type,Price,Amount,Total,Fee,Fee Coin'])

    if(argv.outFile !== undefined) {
        fs.writeFileSync(argv.outFile, csvLines.join('\n'))
        console.log('Data written to file ' + argv.outFile)
    }
    else {
        csvLines.forEach(line => console.log(line))
    }
}

main().catch(error => console.error(error))