import logger from '../config/logger'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'

const getClonePodLogs = async (cloneName) => {
  try {
    logger.debug('getClonePodLogs on kubernates started.')
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    let query = {
      'qs': {
        'labelSelector': 'job-name=' + cloneName
      }
    }

    const pod = await client.api.v1.namespaces('default').pods.get(query)

    let queryLogs = {
      'qs': {
        'tailLines': '20'
      }
    }
    const logs = await client.api.v1.namespaces('default')
      .pods(pod.body.items[0].metadata.name).log.get(queryLogs)
    let logsArray = logs.body.split('\n')

    logger.debug('getClonePodLogs on kubernates successful.')

    return JSON.stringify(logsArray, null, 2)
  } catch (err) {
    throw new KubernateError(err)
  }
}
export default getClonePodLogs
