var assert = require("chai").assert
var ExchangeAPI = require("../index")
var logger = require("./utils/logger")
var globals = require("./utils/globals")
require('dotenv').config()

describe("Poloniex Exchange API Client.", function () {

    globals.setGlobals()

    describe("Poloniex Public Methods", function () {
        it("getTicker", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Poloniex")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }
                exchangeAPI.getTicker(market, (response, ticker) => {
                    assert.strictEqual(response.result, "Ok")
                    done()
                })
            })
        })

        it("getPublicTradeHistory", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Poloniex")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }
                exchangeAPI.getPublicTradeHistory(market.assetA, market.assetB, "", "", (response, trades) => {
                    assert.strictEqual(response, "Ok")
                    done()
                })
            })
        })
    })

    describe("Poloniex Private Methods", function () {
        it("putPosition Sell", function (done) {
            this.timeout(300000)
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Poloniex")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }

                var rate = 10130
                var amountToSell = 1.001
                var amountA = amountToSell * rate
                exchangeAPI.putPosition(market, "sell", rate, amountA, amountToSell, (result, positionId) => {
                    console.log(result)
                    assert.exists(positionId)
                    done()
                })
            })
        })
        it("putPosition Buy", function (done) {
            this.timeout(300000)
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Poloniex")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }

                var rate = 10130
                var amountToSell = 1.001
                var amountA = amountToSell * rate
                exchangeAPI.putPosition(market, "buy", rate, amountA, amountToSell, (result, positionId) => {
                    assert.exists(positionId)
                    done()
                })
            })
        })
        it("getOpenPositions", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Poloniex")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }
                exchangeAPI.getOpenPositions(market, (response, positions) => {
                    assert(Array.isArray([positions]))
                    assert.strictEqual(positions[0].amountB, 0.001)
                    console.log("Open Positions: " + JSON.stringify(positions))
                    done()
                })
            })
        })
        it("getExecutedTrades", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Poloniex")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }
                var positionId = "32446fd8-8232-4ee5-b6ff-6366e8b935d4"
                exchangeAPI.getExecutedTrades(positionId, (response, trades) => {
                    assert(Array.isArray([trades]))
                    // assert.strictEqual(positionId, positionId)
                    done()
                })
            })
        })
    })
})
