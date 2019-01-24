import logger from '../config/logger'
import { toPlatformDatetime } from '../config/utils'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'
// Get base Deployment config
import deploymentManifest from '../config/clone-deployment.json'
import { BACKTEST} from '../enums/CloneMode';

const platformExecutionContext = async (clone, cloneName) => {
  try {
    logger.info("createClone %j", cloneName)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    // Make changes to base deployment config
    deploymentManifest.metadata.name = cloneName

    logger.debug("createClone Set basic environment configuration.")
    let env = envConfig

    logger.debug("createClone Configuration for team, bot and process.")
    env.push({
      "name": "DEV_TEAM",
      "value": clone.teamId
    })

    env.push({
      "name": "BOT",
      "value": clone.botId
    })

    // TODO allow other types
    env.push({
      "name": "PROCESS",
      "value": "Trading-Process"
    })

    // TODO allow other types
    env.push({
      "name": "TYPE",
      "value": "Trading"
    })

    env.push({
      "name": "RUN_AS_TEAM",
      "value": clone.runAsTeam.toString()
    })

    env.push({
      "name": "USER_LOGGED_IN",
      "value": clone.userLoggedIn
    })

    logger.debug("createClone Configuration for the execution.")
    env.push({
      "name": "START_MODE",
      "value": clone.mode.toLowerCase()
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

    deploymentManifest.spec.template.spec.containers[0].env = env

    // Create a new Deployment
    const create = await client.apis.batch.v1.namespaces('default').jobs.post(
      { body: deploymentManifest })
    logger.debug("Create: %j ", create)

    // Fetch the Deployment we just created
    const deployment = await client.apis.batch.v1.namespaces('default').jobs(
      deploymentManifest.metadata.name).get()
    logger.debug("Job: %j ", deployment)

    logger.info("createClone %j succesfull", cloneName)
  } catch (err) {
     throw new KubernateError(err)
  }
}
export default platformExecutionContext
