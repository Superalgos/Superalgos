var assert = require("chai").assert
const Coss = require("../wrappers/coss")
var ExchangeAPI = require("../index")
var logger = require("./utils/logger")
var globals = require("./utils/globals")
require('dotenv').config()

describe("COSS Exchange API Client.", function () {

    globals.setGlobals()

    describe("Coss External Library Tests", function () {
        it("getExchangeInfo", async function () {
            var API = Coss()
            var response = await API.getExchangeInfo()
            var localDate = new Date().valueOf()
            var timeDifference = Math.abs(localDate - response.server_time)
            assert.isBelow(timeDifference, 4000)
        })
    })

    describe("Coss Public Methods", function () {
        it("getTicker", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Coss")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }
                exchangeAPI.getTicker(market, (response, ticker) => {
                    assert.strictEqual(response, "Ok")
                    done()
                })
            })
        })

        it("getPublicTradeHistory", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Coss")
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

    describe("Coss Private Methods", function () {
        var position
        it("putPosition Sell", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Coss")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }

                var rate = 6598.65
                var amountToSell = 0.001
                var amountA = amountToSell * rate
                exchangeAPI.putPosition(market, "sell", rate, amountA, amountToSell,  (result, positionId) => {
                    assert.exists(positionId)
                    done()
                })
            })
        })
        it("getOpenPositions", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Coss")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }
                exchangeAPI.getOpenPositions(market, (response, positions) => {
                    assert(Array.isArray([positions]))
                    assert.strictEqual(positions[0].amountB, 0.001)
                    console.log("Open Positions: "+ JSON.stringify(positions))
                    done()
                })
            })
        })
        it("getExecutedTrades", function (done) {
            var exchangeAPI = ExchangeAPI.newExchangeAPI(logger, "Coss")
            exchangeAPI.initialize(() => {
                var market = {
                    assetA: "USDT",
                    assetB: "BTC"
                }
                var positionId="32446fd8-8232-4ee5-b6ff-6366e8b935d4"
                exchangeAPI.getExecutedTrades(positionId, (response, trades) => {
                    assert(Array.isArray([trades]))
                    // assert.strictEqual(positionId, positionId)
                    done()
                })
            })
        })
    })
})
