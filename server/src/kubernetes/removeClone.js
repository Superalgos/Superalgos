import logger from '../config/logger'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'
import { getJobNameFromClone } from '../config/utils'

const removeClone = async (clone, teamSlug, botSlug) => {
  try {
    let cloneName = getJobNameFromClone(teamSlug, botSlug, clone.mode)
    logger.info("removeClone %s", cloneName)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    let query = {
      "qs":{
        "labelSelector": "job-name="+cloneName
      }
    }

    const removed = await client.apis.batch.v1.namespaces('default').jobs(
      cloneName).delete()

    const pod = await client.api.v1.namespaces('default').pods.get(query)
    const podRemoved = await client.api.v1.namespaces('default')
      .pods(pod.body.items[0].metadata.name).delete()

    logger.info("removeClone %s on kubernates succesful", cloneName)
  } catch (err) {
      throw new KubernateError(err)
  }
}
export default removeClone
