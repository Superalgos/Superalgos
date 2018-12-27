import logger from '../config/logger'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'

const getClonePodStatus = async (cloneName) => {
  try {
    logger.info("getClonePodStatus %j", cloneName)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    let query = {
      "qs":{
        "labelSelector": "job-name="+cloneName
      }
    }
    // Get the pod
    const pod = await client.api.v1.namespaces('default').pods.get(query)
    // logger.debug("pod: %j ", pod)

    let queryLogs = {
      "qs":{
        "tailLines": "15"
      }
    }
    const logs = await client.api.v1.namespaces('default')
      .pods(pod.body.items[0].metadata.name).log.get(queryLogs)
    let logsArray = logs.body.split('\n')
    // logger.debug("logs: %j ", logsArray)

    return JSON.stringify(logsArray, null, 2)
  } catch (err) {
     throw new KubernateError(err)
  }
}
export default getClonePodStatus
