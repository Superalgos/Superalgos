import logger from '../config/logger'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'

const removeClone = async (cloneName) => {
  try {
    logger.info("removeClone %j", cloneName)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    let query = {
      "qs":{
        "labelSelector": "job-name="+cloneName
      }
    }

    // Remove the Job
    const removed = await client.apis.batch.v1.namespaces('default').jobs(
      cloneName).delete()
    logger.debug("Job Removed: %j ", removed)

    // Get the pod
    const pod = await client.api.v1.namespaces('default').pods.get(query)
    const podRemoved = await client.api.v1.namespaces('default')
      .pods(pod.body.items[0].metadata.name).delete()
    logger.debug("Pod Removed: %j ", podRemoved)

    logger.info("removeClone %j succesfull", cloneName)
  } catch (err) {
      throw new KubernateError(err)
  }
}
export default removeClone
