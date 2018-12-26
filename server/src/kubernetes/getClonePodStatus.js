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
    // Get The Pod
    const pod = await client.api.v1.namespaces('default').pods.get(query)
    logger.debug("pod: %j ", pod)

    let clonePodStatus = pod.body.items[0].status.containerStatuses[0].state
    logger.debug("clonePodStatus: %j ", clonePodStatus)

    if (clonePodStatus.hasOwnProperty('terminated')
      && clonePodStatus.terminated.hasOwnProperty('containerID')) {
      delete clonePodStatus.terminated.containerID
    }
    logger.info("getClonePodStatus %j succesfull", cloneName)
    return JSON.stringify(clonePodStatus, null, 2)
  } catch (err) {
     throw new KubernateError(err)
  }
}
export default getClonePodStatus
