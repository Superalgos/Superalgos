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
    .option('trades',
        {
            boolean: true,
            default: false,
            demandOption: false
        })
    .option('orders',
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
 * id: string,
 * date: Date,
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
    console.log(tradeHistory.length)
    const trades = tradeHistory.map(mapTrade)
    if(tradeHistory.length == 500) {
        return trades.concat(await fetchTrades(exchange, getTime(parseISO(tradeHistory[499].datetime)), endTime))
    }
    return trades
}

function mapTrade(trade) {
    console.log(JSON.stringify(trade))
    return {
        id: trade.id,
        date: parseISO(trade.datetime), 
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
 * date: Date,
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
    return `${format(trade.date, "yyyy-MM-dd HH:mm:ss.SSS")},${trade.market},${trade.type.toUpperCase()},${trade.price},${trade.amount},${trade.total},${trade.fee},${trade.feeCoin}`
}

/**
 * @param {{
 * fetchOrders: {(key: string, timestamp: number, limit: number?, params: {}?) => Promise<[]>}}} exchange
 * @param {Date} startTime millisecond datestamp for start point of trading activity,
 * @param {Date} endTime millisecond datestamp for end point of trading activity,
 * this will only return a maximum one week of trades
 * @returns {Promise<{
 * id: string,
 * date: Date,
 * market: string,
 * type: string,
 * price: number,
 * amount: number,
 * total: number,
 * fee: number,
 * feeCoin: string,
 * }[]>}
 */
async function fetchOrders(exchange, startTime, endTime) {
    const params = {
        type: 'spot',
        endTime: getTime(endTime)
    }
    const orderHistory = await exchange.fetchOrders('BTCUSDT', getTime(startTime), 500, params)
    const orders = orderHistory.map(mapOrder)
    if(orderHistory.length == 500) {
        return orders.concat(await fetchTrades(exchange, getTime(parseISO(orderHistory[499].datetime)), endTime))
    }
    return orders
}

function mapOrder(order) {
    return {
        id: order.id,
        date: parseISO(order.datetime), 
        orderNumber: order.info.orderId, 
        pair: order.info.symbol,
        type: order.side,
        orderPrice: order.info.price,
        orderAmount: order.amount,
        avgTradingPrice: order.average,
        filled: order.filled,
        total: order.cost,
        status: order.info.status,
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
function mapOrdersToCsvLine(order) {
    return `${format(order.date, "yyyy-MM-dd HH:mm:ss.SSS")},${order.orderNumber},${order.pair.toUpperCase()},${order.type.toUpperCase()},${order.orderPrice},${order.orderAmount},${order.avgTradingPrice},${order.filled},${order.total},${order.status}`
}

/**
 * 
 * @param {{id: string}[]} history 
 * @returns {{id: string}[]}
 */
function deDuplicateHistory(history) {
    const deDuplicatedHistory = history.reduce((a,c) => {
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

/**
 * @param {{(exchange: *, start: Date, end: Date) => Promise<[]>}} fetchFn
 * @param {{(history: *) => string}} csvFn
 * @param {string[]} csvHeaders
 */
async function main(fetchFn, csvFn, csvHeaders) {
    const config = JSON.parse(fs.readFileSync(argv.keyFile))
    const exchangeId = argv.exchange
        , exchangeClass = ccxt[exchangeId]
        , exchange = new exchangeClass(config)

    const {startDate, endDate} = getRequestDates()

    const totalDaysDifference = differenceInDays(endDate, startDate)

    let history = [];

    for(let i = 0; i < totalDaysDifference; i++) {
        history = history.concat(await fetchFn(exchange, addDays(startDate, i), addDays(startDate, i+1)))
    }

    const uniqueHistory = deDuplicateHistory(history)
    uniqueHistory.sort((a,b) => b.date - a.date)
    const csvLines = uniqueHistory.reduce((a,c) => {
        a.push(csvFn(c))
        return a
    }, csvHeaders)

    if(argv.outFile !== undefined) {
        fs.writeFileSync(argv.outFile, csvLines.join('\n'))
        console.log('Data written to file ' + argv.outFile)
    }
    else {
        csvLines.forEach(line => console.log(line))
    }
}

if((!argv.trades && !argv.orders) || (argv.trades && argv.orders)) {
    console.log('You must choose to either process trades or orders')
}
else if(argv.trades) {
    console.log('Processing trade history')
    main(fetchTrades, mapTradesToCsvLine, ['Date(UTC),Market,Type,Price,Amount,Total,Fee,Fee Coin']).catch(error => console.error(error))
}
else if(argv.orders) {
    console.log('Processing order history')
    main(fetchOrders, mapOrdersToCsvLine, ['Date(UTC),OrderNo,Pair,Type,Order Price,Order Amount,AvgTrading Price,Filled,Total,Status']).catch(error => console.error(error))
}