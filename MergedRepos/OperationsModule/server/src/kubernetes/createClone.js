import logger from '../config/logger'
import { toPlatformDatetime, isDefined } from '../config/utils'
import { KubernateError } from '../errors'
import { Client } from 'kubernetes-client'
import deploymentManifest from '../config/clone-deployment.json'
import { BACKTEST, COMPETITION, LIVE, NO_TIME } from '../enums/CloneMode'
import { Trading, Indicator, Sensor } from '../enums/BotTypes'
import kubeconfig from './kubeConfig'

const createClone = async (clone) => {
  try {
    logger.debug('createClone %s', clone.id)

    const Request = require('kubernetes-client/backends/request')
    const backend = new Request(Request.config.fromKubeconfig(kubeconfig()))
    const client = new Client({ backend, version: '1.9' })

    deploymentManifest.metadata.name = clone.id
    deploymentManifest.spec.template.spec.containers[0].image = process.env.CLONE_EXECUTOR_IMAGE

    logger.debug('createClone Environment and Storage Configuration.')
    let env = []
    env.push({
      'name': 'GATEWAY_ENDPOINT',
      'value': process.env.GATEWAY_ENDPOINT
    })
    env.push({
      'name': 'GATEWAY_ENDPOINT_K8S',
      'value': process.env.GATEWAY_ENDPOINT_K8S
    })
    env.push({
      'name': 'HOST_STORAGE',
      'value': 'localStorage'
    })
    if (clone.authorization) {
      env.push({
        'name': 'AUTHORIZATION',
        'value': clone.authorization
      })
    }

    if (JSON.parse(process.env.FULL_LOG)) {
      env.push({
        'name': 'FULL_LOG',
        'value': process.env.FULL_LOG
      })
    }
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
      'name': 'PROCESS',
      'value': clone.processName
    })
    env.push({
      'name': 'EXCHANGE_NAME',
      'value': clone.exchangeName
    })

    if (isDefined(clone.timePeriod)) {
      env.push({
        'name': 'TIME_PERIOD',
        'value': clone.timePeriod.toString()
      })
    }

    logger.debug('createClone Trading Configuration.')
    if (clone.botType === Trading) {
      env.push({
        'name': 'RESUME_EXECUTION',
        'value': clone.resumeExecution.toString()
      })

      env.push({
        'name': 'DATA_SET',
        'value': datasetNames().get(clone.timePeriod)
      })

      env.push({
        'name': 'BASE_ASSET',
        'value': clone.baseAsset
      })
      env.push({
        'name': 'INITIAL_BALANCE_ASSET_A',
        'value': clone.balanceAssetA.toString()
      })
      env.push({
        'name': 'INITIAL_BALANCE_ASSET_B',
        'value': clone.balanceAssetB.toString()
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
        env.push({
          'name': 'ACCESS_TOKEN',
          'value': clone.accessTokenKey
        })
      } else if (clone.mode === LIVE) {
        env.push({
          'name': 'KEY_ID',
          'value': clone.keyId
        })
        env.push({
          'name': 'ACCESS_TOKEN',
          'value': clone.accessTokenKey
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
    logger.error('Error creating clone: %s', err)
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
