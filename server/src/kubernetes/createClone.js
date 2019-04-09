import logger from '../config/logger'
import { toPlatformDatetime, isDefined } from '../config/utils'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'
import deploymentManifest from '../config/clone-deployment.json'
import { BACKTEST, COMPETITION, LIVE, NO_TIME } from '../enums/CloneMode'
import { Trading, Indicator, Sensor } from '../enums/BotTypes'

const createClone = async (clone) => {
  try {
    logger.debug('createClone %s', clone.id)
    const client = new Client({ config: config.fromKubeconfig(), version: '1.9' })
    deploymentManifest.metadata.name = clone.id

    logger.debug('createClone Environment and Auth Configuration.')
    let env = []
    env.push({
      'name': 'PLATFORM_ENVIRONMENT',
      'value': process.env.PLATFORM_ENVIRONMENT
    })
    env.push({
      'name': 'GATEWAY_ENDPOINT',
      'value': process.env.GATEWAY_ENDPOINT
    })
    env.push({
      'name': 'STORAGE_BASE_URL',
      'value': process.env.STORAGE_BASE_URL
    })
    env.push({
      'name': 'STORAGE_CONNECTION_STRING',
      'value': process.env.STORAGE_CONNECTION_STRING
    })
    env.push({
      'name': 'AUTH_URL',
      'value': process.env.AUTH_URL
    })
    env.push({
      'name': 'AUTH_CLIENT_ID',
      'value': process.env.AUTH_CLIENT_ID
    })
    env.push({
      'name': 'AUTH_CLIENT_SECRET',
      'value': process.env.AUTH_CLIENT_SECRET
    })
    env.push({
      'name': 'AUTH_AUDIENCE',
      'value': process.env.AUTH_AUDIENCE
    })

    // MINIO
    env.push({
      'name': 'MINIO_END_POINT',
      'value': process.env.MINIO_END_POINT
    })
    env.push({
      'name': 'MINIO_PORT',
      'value': process.env.MINIO_PORT
    })
    env.push({
      'name': 'MINIO_USE_SSL',
      'value': process.env.MINIO_USE_SSL
    })
    env.push({
      'name': 'MINIO_ACCESS_KEY',
      'value': process.env.MINIO_ACCESS_KEY
    })
    env.push({
      'name': 'MINIO_SECRET_KEY',
      'value': process.env.MINIO_SECRET_KEY
    })

    logger.debug('createClone General Financial Being Configuration.')
    env.push({
      'name': 'DEV_TEAM',
      'value': clone.teamSlug
    })
    env.push({
      'name': 'BOT',
      'value': clone.botSlug
    })
    env.push({
      'name': 'TYPE',
      'value': clone.botType
    })
    env.push({
      'name': 'CLONE_ID',
      'value': clone.id.toString()
    })
    env.push({
      'name': 'START_MODE',
      'value': clone.mode
    })
    env.push({
      'name': 'RUN_AS_TEAM',
      'value': clone.runAsTeam.toString()
    })
    env.push({
      'name': 'USER_LOGGED_IN',
      'value': clone.userLoggedIn
    })
    env.push({
      'name': 'PROCESS',
      'value': clone.processName
    })
    env.push({
      'name': 'EXCHANGE_NAME',
      'value': clone.exchangeName
    })

    logger.debug('createClone Trading Configuration.')
    if (clone.botType === Trading) {
      env.push({
        'name': 'RESUME_EXECUTION',
        'value': clone.resumeExecution.toString()
      })

      env.push({
        'name': 'TIME_PERIOD',
        'value': clone.timePeriod
      })

      env.push({
        'name': 'DATA_SET',
        'value': datasetNames().get(clone.timePeriod)
      })

      if (clone.mode === BACKTEST) {
        env.push({
          'name': 'BEGIN_DATE_TIME',
          'value': toPlatformDatetime(clone.beginDatetime)
        })
        env.push({
          'name': 'END_DATE_TIME',
          'value': toPlatformDatetime(clone.endDatetime)
        })
        env.push({
          'name': 'WAIT_TIME',
          'value': clone.waitTime.toString()
        })
      } else if (clone.mode === COMPETITION) {
        env.push({
          'name': 'BEGIN_DATE_TIME',
          'value': toPlatformDatetime(clone.beginDatetime)
        })
        env.push({
          'name': 'END_DATE_TIME',
          'value': toPlatformDatetime(clone.endDatetime)
        })
        env.push({
          'name': 'KEY_ID',
          'value': clone.keyId
        })
      } else if (clone.mode === LIVE) {
        env.push({
          'name': 'KEY_ID',
          'value': clone.keyId
        })
      }
    } else if (clone.botType === Indicator || clone.botType === Sensor) {
      if (clone.mode === NO_TIME) {
        if (!clone.resumeExecution) {
          env.push({
            'name': 'BEGIN_DATE_TIME',
            'value': toPlatformDatetime(clone.beginDatetime)
          })
        }
      } else {
        env.push({
          'name': 'MIN_YEAR',
          'value': isDefined(clone.startYear) ? clone.startYear.toString() : ''
        })
        env.push({
          'name': 'MAX_YEAR',
          'value': isDefined(clone.endYear) ? clone.endYear.toString() : ''
        })
        env.push({
          'name': 'MONTH',
          'value': isDefined(clone.month) ? clone.month.toString() : ''
        })
        env.push({
          'name': 'INTERVAL',
          'value': isDefined(clone.interval) ? clone.interval.toString() : ''
        })
      }
    }

    deploymentManifest.spec.template.spec.containers[0].env = env

    await client.apis.batch.v1.namespaces('default').jobs.post(
      { body: deploymentManifest })

    logger.debug('createClone %s on Kubernates success.', clone.id)
  } catch (err) {
    throw new KubernateError(err)
  }
}

function datasetNames() {
  let dataSetMap = new Map()
  dataSetMap.set("24-hs", "Multi-Period-Market")
  dataSetMap.set("12-hs", "Multi-Period-Market")
  dataSetMap.set("08-hs", "Multi-Period-Market")
  dataSetMap.set("06-hs", "Multi-Period-Market")
  dataSetMap.set("04-hs", "Multi-Period-Market")
  dataSetMap.set("03-hs", "Multi-Period-Market")
  dataSetMap.set("02-hs", "Multi-Period-Market")
  dataSetMap.set("01-hs", "Multi-Period-Market")
  dataSetMap.set("45-min", "Multi-Period-Daily")
  dataSetMap.set("40-min", "Multi-Period-Daily")
  dataSetMap.set("30-min", "Multi-Period-Daily")
  dataSetMap.set("20-min", "Multi-Period-Daily")
  dataSetMap.set("15-min", "Multi-Period-Daily")
  dataSetMap.set("10-min", "Multi-Period-Daily")
  dataSetMap.set("05-min", "Multi-Period-Daily")
  dataSetMap.set("04-min", "Multi-Period-Daily")
  dataSetMap.set("03-min", "Multi-Period-Daily")
  dataSetMap.set("02-min", "Multi-Period-Daily")
  dataSetMap.set("01-min", "Multi-Period-Daily")
  return dataSetMap
}

export default createClone
