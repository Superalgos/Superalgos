import logger from '../config/logger'
import { toPlatformDatetime, getJobNameFromClone, isDefined } from '../config/utils'
import envConfig from '../config/envConfig'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'
// Get base Deployment config
import deploymentManifest from '../config/clone-deployment.json'
import { BACKTEST} from '../enums/CloneMode';

const createClone = async (clone, teamSlug, botSlug) => {
  try {
    let cloneName = getJobNameFromClone(teamSlug, botSlug, clone.mode)
    logger.info("createClone %s", cloneName)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    // Make changes to base deployment config
    deploymentManifest.metadata.name = cloneName

    logger.debug("createClone Environment and Auth Configuration.")
    let env = envConfig

    logger.debug("createClone General Financial Being Configuration.")
    env.push({
      "name": "DEV_TEAM",
      "value": clone.teamId
    })
    env.push({
      "name": "BOT",
      "value": clone.botId
    })
    env.push({
      "name": "TYPE",
      "value": clone.kind
    })
    env.push({
      "name": "PROCESS",
      "value": clone.processName
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
    if(clone.kind === 'Trading'){
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
    } else if(clone.kind === 'Indicator' || clone.kind === 'Extractor'){
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

    logger.info("createClone %s on Kubernates success.", cloneName)
  } catch (err) {
     throw new KubernateError(err)
  }
}
export default createClone
