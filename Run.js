require('dotenv').config()
const strategy = require('./Integrations/Strategy')
const sequenceList = require('./sequence');

global.SHALL_BOT_STOP = false
global.AT_BREAKPOINT = false // This is used only when running at the browser.
global.FULL_LOG = process.env.FULL_LOG

/* Default parameters can be changed by the execution configuration */
global.EXCHANGE_NAME = process.env.EXCHANGE_NAME
global.MARKET = { assetA: 'USDT', assetB: 'BTC' }
global.CLONE_EXECUTOR = { codeName: 'AACloud', version: '1.1' }

process.on('uncaughtException', function (err) {
  console.log('[INFO] Run -> uncaughtException -> err.message = ' + err.message)
  console.log('[INFO] Run -> uncaughtException -> err.stack = ' + err.stack)
  process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
  console.log('[INFO] Run -> unhandledRejection -> reason = ' + JSON.stringify(reason))
  console.log('[INFO] Run -> unhandledRejection -> p = ' + JSON.stringify(p))
  process.exit(1)
})

process.on('exit', function (code) {
  console.log('[INFO] Run -> process.on.exit -> About to exit -> code = ' + code)
})


let isRunSequence = false;
let sequenceStep = 0;
let loopCount = 0;
let processedSteps = new Map()
if (process.env.RUN_SEQUENCE !== undefined) {
  isRunSequence = JSON.parse(process.env.RUN_SEQUENCE)
}

if (isRunSequence) {
  sequenceExecution(sequenceStep)
} else {
  readExecutionConfiguration()
}

function sequenceExecution(currentStep) {
    let execution = sequenceList[currentStep];
    process.env.STOP_GRACEFULLY = true;
    execution.devTeam ? process.env.DEV_TEAM = execution.devTeam : undefined;
    execution.bot ? process.env.BOT = execution.bot : undefined;
    execution.mode ? process.env.START_MODE = execution.mode : undefined;
    execution.resumeExecution ? process.env.RESUME_EXECUTION = execution.resumeExecution : undefined;
    execution.type ? process.env.TYPE = execution.type : undefined;
    execution.process ? process.env.PROCESS = execution.process : undefined;
    execution.startYear ? process.env.MIN_YEAR = execution.startYear : undefined;
    execution.endYear ? process.env.MAX_YEAR = execution.endYear : undefined;
    execution.month ? process.env.MONTH = execution.month : undefined;
    execution.beginDatetime ? process.env.BEGIN_DATE_TIME = execution.beginDatetime : undefined;
    execution.dataSet ? process.env.DATA_SET = execution.dataSet : undefined;
    process.env.CLONE_ID = 1;

    execution.timePeriod ? process.env.TIME_PERIOD = execution.timePeriod : undefined;

    execution.exchangeName ? global.EXCHANGE_NAME = execution.exchangeName : undefined;
    // global.FULL_LOG = execution.fullLog;

  let stepKey = execution.devTeam + '.' + execution.bot + '.' + execution.process
  if (processedSteps.has(stepKey)) {
    processedSteps.set(stepKey, processedSteps.get(stepKey) + 1)
  } else {
    processedSteps.set(stepKey, 0)
  }
  console.log('EXECUTION: ' + JSON.stringify(execution))
  readExecutionConfiguration()
  sequenceStep++
}

function onExecutionFinish (result, finishStepKey) {
  processedSteps.set(finishStepKey, processedSteps.get(finishStepKey) + 1)
  if (processedSteps.get(finishStepKey) > 1) {
    console.log('[INFO] onExecutionFinish -> Step already processed.')
  } else {
    if (sequenceStep < sequenceList.length) {
      sequenceExecution(sequenceStep)
    } else {
        if (sequenceStep < sequenceList.length) {
            sequenceExecution(sequenceStep);
        } else {
            setTimeout(function () {
                console.log("[INFO] onExecutionFinish -> New round for sequence execution started.");
                loopCount++;
                sequenceStep = 0;
                processedSteps = new Map();
                sequenceExecution(sequenceStep);
            }, process.env.EXECUTION_LOOP_DELAY);
        }
    }
  }
}

async function readExecutionConfiguration () {
  try {
    console.log('[INFO] Run -> readExecutionConfiguration -> Entering function. ')

        /* Try to get the begin and end dates from the Definition */
    let definition = await strategy.getStrategy()
    let initialDatetime = process.env.BEGIN_DATE_TIME
    let finalDatetime = process.env.END_DATE_TIME

    if (definition !== undefined) {
      if (definition.tradingSystem !== undefined) {
        if (definition.tradingSystem.parameters !== undefined) {
          if (definition.tradingSystem.parameters.baseAsset !== undefined) {
            if (definition.tradingSystem.parameters.baseAsset.formula !== undefined) {
              if (definition.tradingSystem.parameters.baseAsset.formula.code !== undefined) {
                let code = JSON.parse(definition.tradingSystem.parameters.baseAsset.formula.code)
                initialDatetime = code.initialDatetime
                finalDatetime = code.finalDatetime
              }
            }
          }
        }
      }
    }

    let startMode

        // General Financial Being Configuration
    global.DEV_TEAM = process.env.DEV_TEAM
    global.CURRENT_BOT_REPO = process.env.BOT + '-' + process.env.TYPE + '-Bot'

    if (process.env.TYPE === 'Trading' || process.env.TYPE === 'Trading-Engine') {
      let live = {
        run: 'false',
        resumeExecution: process.env.RESUME_EXECUTION,
        beginDatetime: initialDatetime,
        endDatetime: finalDatetime
      }

      let backtest = {
        run: 'false',
        resumeExecution: process.env.RESUME_EXECUTION,
        beginDatetime: initialDatetime,
        endDatetime: finalDatetime
      }

      let competition = {
        run: 'false',
        resumeExecution: process.env.RESUME_EXECUTION,
        beginDatetime: initialDatetime,
        endDatetime: finalDatetime
      }

      startMode = {
        live: live,
        backtest: backtest,
        competition: competition
      }
    } else if (process.env.TYPE === 'Indicator' || process.env.TYPE === 'Sensor') {
      let allMonths = {
        run: 'false',
        minYear: process.env.MIN_YEAR,
        maxYear: process.env.MAX_YEAR
      }
      let oneMonth = {
        run: 'false',
        year: process.env.MIN_YEAR,
        month: process.env.MONTH
      }
      let noTime = {
        run: 'false',
        beginDatetime: process.env.BEGIN_DATE_TIME,
        resumeExecution: process.env.RESUME_EXECUTION
      }
      let fixedInterval = {
        run: 'false',
        interval: process.env.INTERVAL
      }

      startMode = {
        allMonths: allMonths,
        oneMonth: oneMonth,
        noTime: noTime,
        fixedInterval: fixedInterval
      }
    } else {
      console.log('[ERROR] readExecutionConfiguration -> Bot Type is invalid.')
      throw new Error('readExecutionConfiguration -> Bot Type is invalid.')
    }

    startMode[process.env.START_MODE].run = 'true'

    let cloneToExecute = {
      enabled: 'true',
      devTeam: process.env.DEV_TEAM,
      bot: process.env.BOT,
      process: process.env.PROCESS,
      repo: global.CURRENT_BOT_REPO
    }

    catch (err) {
        console.log("[ERROR] readExecutionConfiguration -> err = " + err);
        console.log("[ERROR] readExecutionConfiguration -> Please verify that the Start Mode for the type of Bot configured applies to that type.");
        console.log("[ERROR] readExecutionConfiguration -> err = " + err.stack);
    }

    global.CLONE_EXECUTOR = {
      codeName: 'AACloud',
      version: '1.1'
    }

    startRoot()
  } catch (err) {
    console.log('[ERROR] readExecutionConfiguration -> err = ' + err)
    console.log('[ERROR] readExecutionConfiguration -> Please verify that the Start Mode for the type of Bot configured applies to that type.')
    console.log('[ERROR] readExecutionConfiguration -> err = ' + err.stack)
  }
}

function getTimePeriod (timePeriod) {
  if (timePeriod !== undefined) {
    try {
      let timePeriodMap = new Map()
      timePeriodMap.set('24-hs', 86400000)
      timePeriodMap.set('12-hs', 43200000)
      timePeriodMap.set('08-hs', 28800000)
      timePeriodMap.set('06-hs', 21600000)
      timePeriodMap.set('04-hs', 14400000)
      timePeriodMap.set('03-hs', 10800000)
      timePeriodMap.set('02-hs', 7200000)
      timePeriodMap.set('01-hs', 3600000)
      timePeriodMap.set('45-min', 2700000)
      timePeriodMap.set('40-min', 2400000)
      timePeriodMap.set('30-min', 1800000)
      timePeriodMap.set('20-min', 1200000)
      timePeriodMap.set('15-min', 900000)
      timePeriodMap.set('10-min', 600000)
      timePeriodMap.set('05-min', 300000)
      timePeriodMap.set('04-min', 240000)
      timePeriodMap.set('03-min', 180000)
      timePeriodMap.set('02-min', 120000)
      timePeriodMap.set('01-min', 60000)
      return timePeriodMap.get(timePeriod)
    } catch (error) {
      console.log('[WARN] Run -> readExecutionConfiguration -> getTimePeriod -> Error: ', error)
    }
  } else {
    return undefined
  }
}

function startRoot () {
  console.log('[INFO] Run -> startRoot -> Entering function. ')

  const ROOT_DIR = './'
  const ROOT_MODULE = require(ROOT_DIR + 'Root')
  let root = ROOT_MODULE.newRoot()

  let UI_COMMANDS = {
    beginDatetime: undefined,
    endDatetime: undefined,
    timePeriod: undefined,
    startMode: undefined,
    eventHandler: undefined
  }

  root.initialize(UI_COMMANDS, onInitialized)

  function onInitialized () {
    console.log('[INFO] Run -> startRoot -> onInitialized -> Entering function. ')

    root.start(onExecutionFinish)
  }
}

