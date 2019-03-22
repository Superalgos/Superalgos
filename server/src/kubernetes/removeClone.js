import logger from '../config/logger'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'

const removeClone = async (clone) => {
  try {
    logger.debug('removeClone %s', clone.id)
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    let query = {
      'qs': {
        'labelSelector': 'job-name=' + clone.id
      }
    }

    await client.apis.batch.v1.namespaces('default').jobs(clone.id).delete()

    const pod = await client.api.v1.namespaces('default').pods.get(query)
    await client.api.v1.namespaces('default').pods(pod.body.items[0].metadata.name).delete()

    logger.debug('removeClone %s on kubernates succesful', clone.id)
  } catch (err) {
    logger.warn('removeClone %s on kubernates failed, the job was not found on the server.', clone.id)
  }
}
export default removeClone
