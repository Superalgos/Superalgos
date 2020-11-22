import logger from '../config/logger'
import { Client } from 'kubernetes-client'
import kubeconfig from './kubeConfig'

const removeClone = async (cloneId) => {
  try {
    logger.debug('removeClone %s', cloneId)

    const Request = require('kubernetes-client/backends/request')
    const backend = new Request(Request.config.fromKubeconfig(kubeconfig()))
    const client = new Client({ backend, version: '1.9' })

    let query = {
      'qs': {
        'labelSelector': 'job-name=' + cloneId
      }
    }

    await client.apis.batch.v1.namespaces('default').jobs(cloneId).delete()

    const pod = await client.api.v1.namespaces('default').pods.get(query)
    await client.api.v1.namespaces('default').pods(pod.body.items[0].metadata.name).delete()

    logger.debug('removeClone %s on kubernates succesful', cloneId)
  } catch (err) {
    logger.warn('removeClone %s on kubernates failed, the job was not found on the server.', cloneId)
  }
}
export default removeClone
