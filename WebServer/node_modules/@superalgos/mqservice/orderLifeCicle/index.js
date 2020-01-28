const MESSAGE_ENTITY = {
  SimulationExecutor: 'EX',
  TradingCokpit: 'CO',
  SimulationEngine: 'EN',
  TradingAssistant: 'AS'
}
const MESSAGE_TYPE = {
  HeartBeat: 'HBT',
  OrderAuthorizationRequest: 'REQ',
  OrderAuthorizationResponse: 'RES',
  Order: 'ORD',
  OrderUpdate: 'UPD'
}
const ORDER_CREATOR = { SimulationEngine: 'S', HumanTrader: 'H' }
const ORDER_TYPE = { Market: 'M', Limit: 'L', Stop: 'S', }
const ORDER_OWNER = { Node: 'N', Team: 'T', User: 'U', }
const ORDER_DIRECTION = { Sell: 'Sell', Buy: 'Buy' }
const ORDER_STATUS = {
  Signaled: 'SIG', // The order has been created and is ready to be authorized
  ManualAuthorized: 'MAU', // Authorized by the user manually
  ManualNotAuthorized: 'MNA', // Rejected by the user manually
  AutoAuthorized: 'AAU', // Authorize all as been selected by the user
  AutoNotAuthorized: 'ANA', // Reject all as been selected by the user
  Executing: 'EXE', // The order is efectively being executed on the exchange
  Cancelled: 'CAN', // The order has been canceled
  Filled: 'FIL',  // The order bas been completed on the exchange
  PartiallyFilled: 'PRT', // The order is partially filled and is still on the exchange
  Discarded: 'DIS', // Order discarded since there is already an order in place
  Placed: 'PLA', // Order has been just been placed on the exchange
  Rejected: 'REJ', // Order has been rejected by the exchange due to some error
  Undeliverable: 'UND' // The order was not able to be delivered to the exchange
}
const ORDER_EXIT_OUTCOME = { StopLoss: 'SL', TakeProfit: 'TP' }
const ORDER_MARGIN_ENABLED = { True: 1, False: 0 }

function createRecord(messageId, from, to, messageType, messageDateTime, orderId, creator, orderDateTime,
  owner, exchange, market, marginEnabled, type, rate, stop, takeProfit, direction, size, status, sizeFilled, exitOutcome) {

  return [
    messageId,
    from,
    to,
    messageType,
    messageDateTime,
    [
      orderId,
      creator,
      orderDateTime,
      owner,
      exchange,
      market,
      marginEnabled,
      type,
      rate,
      stop,
      takeProfit,
      direction,
      size,
      status,
      sizeFilled,
      exitOutcome
    ]
  ]
}

function createRecordFromObject(object) {

  return createRecord(object.id, object.from, object.to, object.messageType, object.dateTime, object.order.id,
    object.order.creator, object.order.dateTime, object.order.owner, object.order.exchange, object.order.market,
    object.order.marginEnabled, object.order.type, object.order.rate, object.order.stop, object.order.takeProfit,
    object.order.direction, object.order.size, object.order.status, object.order.sizeFilled, object.order.exitOutcome)
}

function getRecord(fileContent) {
  return {
    id: fileContent[0],
    from: fileContent[1],
    to: fileContent[2],
    messageType: fileContent[3],
    dateTime: fileContent[4],
    order: {
      id: fileContent[5][0],
      creator: fileContent[5][1],
      dateTime: fileContent[5][2],
      owner: fileContent[5][3],
      exchange: fileContent[5][4],
      market: fileContent[5][5],
      marginEnabled: fileContent[5][6],
      type: fileContent[5][7],
      rate: fileContent[5][8],
      stop: fileContent[5][9],
      takeProfit: fileContent[5][10],
      direction: fileContent[5][11],
      size: fileContent[5][12],
      status: fileContent[5][13],
      sizeFilled: fileContent[5][14],
      exitOutcome: fileContent[5][15]
    }
  }
}

function getExpandedRecord(fileContent) {
  return {
    id: fileContent[0],
    from: getKeyByValue(MESSAGE_ENTITY, fileContent[1]),
    to: getKeyByValue(MESSAGE_ENTITY, fileContent[2]),
    messageType: getKeyByValue(MESSAGE_TYPE, fileContent[3]),
    dateTime: fileContent[4],
    order: {
      id: fileContent[5][0],
      creator: getKeyByValue(ORDER_CREATOR, fileContent[5][1]),
      dateTime: fileContent[5][2],
      owner: getKeyByValue(ORDER_OWNER, fileContent[5][3]),
      exchange: fileContent[5][4],
      market: fileContent[5][5],
      marginEnabled: getKeyByValue(ORDER_MARGIN_ENABLED, fileContent[5][6]),
      type: getKeyByValue(ORDER_TYPE, fileContent[5][7]),
      rate: fileContent[5][8],
      stop: fileContent[5][9],
      takeProfit: fileContent[5][10],
      direction: getKeyByValue(ORDER_DIRECTION, fileContent[5][11]),
      size: fileContent[5][12],
      status: getKeyByValue(ORDER_STATUS, fileContent[5][13]),
      sizeFilled: fileContent[5][14],
      exitOutcome: getKeyByValue(ORDER_EXIT_OUTCOME, fileContent[5][15])
    }
  }
}

function getKeyByValue(object, value) {
  let retrievedValue = Object.keys(object).find(key => object[key] === value)
  if (retrievedValue !== undefined) {
    retrievedValue = retrievedValue.replace(/([A-Z])/g, ' $1').trim()
  }
  else {
    throw new Error("The property is not valid: " + value + ". Available values: " + JSON.stringify(Object.values(object)))
  }
  return retrievedValue
}

module.exports = {
  MESSAGE_ENTITY, MESSAGE_TYPE, ORDER_CREATOR, ORDER_TYPE, ORDER_OWNER, ORDER_DIRECTION, ORDER_STATUS, ORDER_EXIT_OUTCOME, ORDER_MARGIN_ENABLED,
  createRecord, getRecord, getExpandedRecord, createRecordFromObject
}
