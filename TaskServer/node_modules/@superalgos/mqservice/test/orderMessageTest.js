var assert = require("chai").assert
const { orderMessage } = require("../index")
const {
  MESSAGE_ENTITY, MESSAGE_TYPE, ORDER_CREATOR, ORDER_TYPE, ORDER_OWNER,
  ORDER_DIRECTION, ORDER_STATUS, ORDER_EXIT_OUTCOME, ORDER_MARGIN_ENABLED,
  createMessage, getMessage, getExpandedMessage, createMessageFromObject
} = orderMessage.newOrderMessage()

describe("SimulatorExecutor ", function () {
  describe("order Message Test", function () {
    it("testCreateMessage", function () {
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

      let message = createMessage(90, MESSAGE_ENTITY.SimulationEngine, MESSAGE_ENTITY.SimulationExecutor,
        MESSAGE_TYPE.Order, 1553850096262, 1, ORDER_CREATOR.SimulationEngine, 155385234234, ORDER_OWNER.User,
        "Poloniex", "BTC/USDT", 0, ORDER_TYPE.Limit, 6286.707, 6381.007, ORDER_MARGIN_ENABLED.False, ORDER_DIRECTION.Sell, 0,
        ORDER_STATUS.Signaled, 0, ORDER_EXIT_OUTCOME.StopLoss)

      let result = JSON.stringify(message)
      assert.equal(result, expected)
    })
    it("testGetMessage", function () {
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

      let message = getMessage(fileContent)
      let result = JSON.stringify(message)
      assert.equal(result, expected)
    })
    it("testGetExpandedMessage", function () {
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

      let expandedMessage = getExpandedMessage(fileContent)
      let result = JSON.stringify(expandedMessage)
      assert.equal(result, expected)
    })
    it("createMessageFromObject", function () {
      let expected = JSON.stringify(JSON.parse('[136, "EN", "EX", "ORD", 1553850096262, [1, "S", 155385234234, "U", "Poloniex", "BTC/USDT", 0, "L", 6286.707, 6381.007, 0, "Sell", 0, "SIG", 0, "SL"]]'))

      let newMessage = {}
      newMessage.id = 136
      newMessage.from = MESSAGE_ENTITY.SimulationEngine
      newMessage.to = MESSAGE_ENTITY.SimulationExecutor
      newMessage.messageType = MESSAGE_TYPE.Order
      newMessage.dateTime = 1553850096262

      newMessage.order = {}
      newMessage.order.id = 1
      newMessage.order.creator = ORDER_CREATOR.SimulationEngine
      newMessage.order.dateTime = 155385234234
      newMessage.order.owner = ORDER_OWNER.User
      newMessage.order.exchange = "Poloniex"
      newMessage.order.market = "BTC/USDT"
      newMessage.order.marginEnabled = ORDER_MARGIN_ENABLED.False
      newMessage.order.type = ORDER_TYPE.Limit
      newMessage.order.rate = 6286.707
      newMessage.order.stop = 6381.007
      newMessage.order.takeProfit = 0
      newMessage.order.direction = ORDER_DIRECTION.Sell
      newMessage.order.size = 0
      newMessage.order.status = ORDER_STATUS.Signaled
      newMessage.order.sizeFilled = 0
      newMessage.order.exitOutcome = ORDER_EXIT_OUTCOME.StopLoss

      let messageFromObject = createMessageFromObject(newMessage)
      let result = JSON.stringify(messageFromObject)
      assert.equal(result, expected)
    })
  })
})
