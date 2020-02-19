var assert = require("chai").assert
const {
  MESSAGE_ENTITY, MESSAGE_TYPE, ORDER_CREATOR, ORDER_TYPE, ORDER_OWNER,
  ORDER_DIRECTION, ORDER_STATUS, ORDER_EXIT_OUTCOME, ORDER_MARGIN_ENABLED,
  createRecord, getRecord, getExpandedRecord, createRecordFromObject
} = require("../../orderLifeCicle/index")

describe("SimulatorExecutor ", function () {
  describe("Order Life Cicle Test", function () {
    it("testCreateRecord", function () {
      let expected = JSON.stringify([
        90,
        "EN",
        "EX",
        "ORD",
        1553850096262,
        [
          1,
          "S",
          155385234234,
          "U",
          "Poloniex",
          "BTC/USDT",
          0,
          "L",
          6286.707,
          6381.007,
          0,
          "Sell",
          0,
          "SIG",
          0,
          "SL"
        ]
      ])

      let record = createRecord(90, MESSAGE_ENTITY.SimulationEngine, MESSAGE_ENTITY.SimulationExecutor,
        MESSAGE_TYPE.Order, 1553850096262, 1, ORDER_CREATOR.SimulationEngine, 155385234234, ORDER_OWNER.User,
        "Poloniex", "BTC/USDT", 0, ORDER_TYPE.Limit, 6286.707, 6381.007, ORDER_MARGIN_ENABLED.False, ORDER_DIRECTION.Sell, 0,
        ORDER_STATUS.Signaled, 0, ORDER_EXIT_OUTCOME.StopLoss)

      let result = JSON.stringify(record)
      assert.equal(result, expected)
    })
    it("testGetRecord", function () {
      let fileContent = '[90, "EN", "EX", "ORD", 1553850096262, [1, "S", 155385234234, "U", "Poloniex", "BTC/USDT", 0, "L", 6286.707, 6381.007, 0, "Sell", 0, "SIG", 0, "SL"]]'

      let expected = JSON.stringify({
        "id": 90,
        "from": "EN",
        "to": "EX",
        "messageType": "ORD",
        "dateTime": 1553850096262,
        "order": {
          "id": 1,
          "creator": "S",
          "dateTime": 155385234234,
          "owner": "U",
          "exchange": "Poloniex",
          "market": "BTC/USDT",
          "marginEnabled": 0,
          "type": "L",
          "rate": 6286.707,
          "stop": 6381.007,
          "takeProfit": 0,
          "direction": "Sell",
          "size": 0,
          "status": "SIG",
          "sizeFilled": 0,
          "exitOutcome": "SL"
        }
      })

      let record = getRecord(fileContent)
      let result = JSON.stringify(record)
      assert.equal(result, expected)
    })
    it("testGetExpandedRecord", function () {
      let fileContent = '[90, "EN", "EX", "ORD", 1553850096262, [1, "S", 155385234234, "U", "Poloniex", "BTC/USDT", 0, "L", 6286.707, 6381.007, 0, "Sell", 0, "SIG", 0, "SL"]]'

      let expected = JSON.stringify({
        "id": 90,
        "from": "Simulation Engine",
        "to": "Simulation Executor",
        "messageType": "Order",
        "dateTime": 1553850096262,
        "order": {
          "id": 1,
          "creator": "Simulation Engine",
          "dateTime": 155385234234,
          "owner": "User",
          "exchange": "Poloniex",
          "market": "BTC/USDT",
          "marginEnabled": "False",
          "type": "Limit",
          "rate": 6286.707,
          "stop": 6381.007,
          "takeProfit": 0,
          "direction": "Sell",
          "size": 0,
          "status": "Signaled",
          "sizeFilled": 0,
          "exitOutcome": "Stop Loss"
        }
      })

      let expandedRecord = getExpandedRecord(fileContent)
      let result = JSON.stringify(expandedRecord)
      assert.equal(result, expected)
    })
    it("createRecordFromObject", function () {
      let expected = JSON.stringify(JSON.parse('[136, "EN", "EX", "ORD", 1553850096262, [1, "S", 155385234234, "U", "Poloniex", "BTC/USDT", 0, "L", 6286.707, 6381.007, 0, "Sell", 0, "SIG", 0, "SL"]]'))

      let newRecord = {}
      newRecord.id = 136
      newRecord.from = MESSAGE_ENTITY.SimulationEngine
      newRecord.to = MESSAGE_ENTITY.SimulationExecutor
      newRecord.messageType = MESSAGE_TYPE.Order
      newRecord.dateTime = 1553850096262

      newRecord.order = {}
      newRecord.order.id = 1
      newRecord.order.creator = ORDER_CREATOR.SimulationEngine
      newRecord.order.dateTime = 155385234234
      newRecord.order.owner = ORDER_OWNER.User
      newRecord.order.exchange = "Poloniex"
      newRecord.order.market = "BTC/USDT"
      newRecord.order.marginEnabled = ORDER_MARGIN_ENABLED.False
      newRecord.order.type = ORDER_TYPE.Limit
      newRecord.order.rate = 6286.707
      newRecord.order.stop = 6381.007
      newRecord.order.takeProfit = 0
      newRecord.order.direction = ORDER_DIRECTION.Sell
      newRecord.order.size = 0
      newRecord.order.status = ORDER_STATUS.Signaled
      newRecord.order.sizeFilled = 0
      newRecord.order.exitOutcome = ORDER_EXIT_OUTCOME.StopLoss

      let recordFromObject = createRecordFromObject(newRecord)
      let result = JSON.stringify(recordFromObject)
      assert.equal(result, expected)
    })
  })
})
