import logger from '../config/logger'
import { toPlatformDatetime, isDefined } from '../config/utils'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'
// Get base Deployment config
import deploymentManifest from '../config/clone-deployment.json'
import { BACKTEST} from '../enums/CloneMode';

const createClone = async (clone) => {
  try {
    logger.debug("createClone %s", clone.cloneName)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    // Make changes to base deployment config
    deploymentManifest.metadata.name = clone.cloneName

    logger.debug("createClone Environment and Auth Configuration.")
    let env = []
    env.push({
      "name": "PLATFORM_ENVIRONMENT",
      "value": process.env.PLATFORM_ENVIRONMENT
    })
    env.push({
      "name": "GATEWAY_ENDPOINT",
      "value": process.env.GATEWAY_ENDPOINT
    })
    env.push({
      "name": "STORAGE_BASE_URL",
      "value": process.env.STORAGE_BASE_URL
    })
    env.push({
      "name": "STORAGE_CONNECTION_STRING",
      "value": process.env.STORAGE_CONNECTION_STRING
    })
    env.push({
      "name": "AUTH_URL",
      "value": process.env.AUTH_URL
    })
    env.push({
      "name": "AUTH_CLIENT_ID",
      "value": process.env.AUTH_CLIENT_ID
    })
    env.push({
      "name": "AUTH_CLIENT_SECRET",
      "value": process.env.AUTH_CLIENT_SECRET
    })
    env.push({
      "name": "AUTH_AUDIENCE",
      "value": process.env.AUTH_AUDIENCE
    })

    logger.debug("createClone General Financial Being Configuration.")
    env.push({
      "name": "DEV_TEAM",
      "value": clone.teamSlug
    })
    env.push({
      "name": "BOT",
      "value": clone.botSlug
    })
    env.push({
      "name": "TYPE",
      "value": clone.botType
    })
    env.push({
      "name": "CLONE_ID",
      "value": clone.id.toString()
    })
    env.push({
      "name": "START_MODE",
      "value": clone.mode.toLowerCase()
    })
    env.push({
      "name": "RUN_AS_TEAM",
      "value": clone.runAsTeam.toString()
    })
    env.push({
      "name": "USER_LOGGED_IN",
      "value": clone.userLoggedIn
    })

    logger.debug("createClone Trading Configuration.")
    if(clone.botType === 'Trading'){
      env.push({
        "name": "PROCESS",
        "value": 'Trading-Process'
      })
      env.push({
        "name": "RESUME_EXECUTION",
        "value": clone.resumeExecution.toString()
      })

      if(clone.mode === BACKTEST){
        env.push({
          "name": "BEGIN_DATE_TIME",
          "value": toPlatformDatetime(clone.beginDatetime)
        })
        env.push({
          "name": "END_DATE_TIME",
          "value": toPlatformDatetime(clone.endDatetime)
        })
        env.push({
          "name": "WAIT_TIME",
          "value": clone.waitTime.toString()
        })
      }
    } else if(clone.botType === 'Indicator' || clone.botType === 'Extraction'){
        env.push({
          "name": "PROCESS",
          "value": clone.processName
        })
        env.push({
          "name": "MIN_YEAR",
          "value": isDefined(clone.startYear) ? clone.startYear.toString() : ''
        })
        env.push({
          "name": "MAX_YEAR",
          "value": isDefined(clone.endYear) ? clone.endYear.toString() : ''
        })
        env.push({
          "name": "MONTH",
          "value": isDefined(clone.month) ? clone.month.toString() : ''
        })
        env.push({
          "name": "INTERVAL",
          "value": isDefined(clone.interval) ? clone.interval.toString() : ''
        })
    }

    deploymentManifest.spec.template.spec.containers[0].env = env

    const create = await client.apis.batch.v1.namespaces('default').jobs.post(
      { body: deploymentManifest })

    logger.debug("createClone %s on Kubernates success.", clone.cloneName)
  } catch (err) {
     throw new KubernateError(err)
  }
}
export default createClone
