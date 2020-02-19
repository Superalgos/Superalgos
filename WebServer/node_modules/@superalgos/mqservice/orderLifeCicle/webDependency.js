
function newOrderRecord() {

  let thisObject = {
    MESSAGE_ENTITY: MESSAGE_ENTITY,
    MESSAGE_TYPE: MESSAGE_TYPE,
    ORDER_CREATOR: ORDER_CREATOR,
    ORDER_TYPE: ORDER_TYPE,
    ORDER_OWNER: ORDER_OWNER,
    ORDER_DIRECTION: ORDER_DIRECTION,
    ORDER_STATUS: ORDER_STATUS,
    ORDER_EXIT_OUTCOME: ORDER_EXIT_OUTCOME,
    createRecord: createRecord,
    getRecord: getRecord,
    getExpandedRecord: getExpandedRecord,
    createRecordFromObject: createRecordFromObject
  };

  return thisObject

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
    Signaled: 'SIG',
    ManualAuthorized: 'MAU',
    ManualNotAuthorized: 'MNA',
    AutoAuthorized: 'AAU',
    AutoNotAuthorized: 'ANA',
    Executing: 'EXE',
    Cancelled: 'CAN',
    Filled: 'FIL',
    PartiallyFilled: 'PRT',
    Discarded: 'DIS',
    Placed: 'PLA'
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
    let parsedFileContent = JSON.parse(fileContent)

    return {
      id: parsedFileContent[0],
      from: parsedFileContent[1],
      to: parsedFileContent[2],
      messageType: parsedFileContent[3],
      dateTime: parsedFileContent[4],
      order: {
        id: parsedFileContent[5][0],
        creator: parsedFileContent[5][1],
        dateTime: parsedFileContent[5][2],
        owner: parsedFileContent[5][3],
        exchange: parsedFileContent[5][4],
        market: parsedFileContent[5][5],
        marginEnabled: parsedFileContent[5][6],
        type: parsedFileContent[5][7],
        rate: parsedFileContent[5][8],
        stop: parsedFileContent[5][9],
        takeProfit: parsedFileContent[5][10],
        direction: parsedFileContent[5][11],
        size: parsedFileContent[5][12],
        status: parsedFileContent[5][13],
        sizeFilled: parsedFileContent[5][14],
        exitOutcome: parsedFileContent[5][15]
      }
    }
  }

  function getExpandedRecord(fileContent) {
    let parsedFileContent = JSON.parse(fileContent)

    return {
      id: parsedFileContent[0],
      from: getKeyByValue(MESSAGE_ENTITY, parsedFileContent[1]),
      to: getKeyByValue(MESSAGE_ENTITY, parsedFileContent[2]),
      messageType: getKeyByValue(MESSAGE_TYPE, parsedFileContent[3]),
      dateTime: parsedFileContent[4],
      order: {
        id: parsedFileContent[5][0],
        creator: getKeyByValue(ORDER_CREATOR, parsedFileContent[5][1]),
        dateTime: parsedFileContent[5][2],
        owner: getKeyByValue(ORDER_OWNER, parsedFileContent[5][3]),
        exchange: parsedFileContent[5][4],
        market: parsedFileContent[5][5],
        marginEnabled: getKeyByValue(ORDER_MARGIN_ENABLED, parsedFileContent[5][6]),
        type: getKeyByValue(ORDER_TYPE, parsedFileContent[5][7]),
        rate: parsedFileContent[5][8],
        stop: parsedFileContent[5][9],
        takeProfit: parsedFileContent[5][10],
        direction: getKeyByValue(ORDER_DIRECTION, parsedFileContent[5][11]),
        size: parsedFileContent[5][12],
        status: getKeyByValue(ORDER_STATUS, parsedFileContent[5][13]),
        sizeFilled: parsedFileContent[5][14],
        exitOutcome: getKeyByValue(ORDER_EXIT_OUTCOME, parsedFileContent[5][15])
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

}
