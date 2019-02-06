import logger from '../config/logger'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'

const removeClone = async (clone) => {
  try {
    logger.debug("removeClone %s", clone.id)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    let query = {
      "qs":{
        "labelSelector": "job-name=" + clone.id
      }
    }

    const removed = await client.apis.batch.v1.namespaces('default').jobs(
      clone.cloneName).delete()

    const pod = await client.api.v1.namespaces('default').pods.get(query)
    const podRemoved = await client.api.v1.namespaces('default')
      .pods(pod.body.items[0].metadata.name).delete()

    logger.debug("removeClone %s on kubernates succesful", clone.cloneName)
  } catch (err) {
      throw new KubernateError(err)
  }
}
export default removeClone
