import logger from '../config/logger'
import { KubernateError } from '../errors'
import { Client, config } from 'kubernetes-client'

const getClonePodStatus = async (cloneName) => {
  try {
    logger.debug('getClonePodStatus on kubernates started. ')
    const client = new Client({config: config.fromKubeconfig(), version: '1.9'})

    let query = {
      'qs': {
        'labelSelector': 'job-name=' + cloneName
      }
    }

    const pod = await client.api.v1.namespaces('default').pods.get(query)

    let clonePodStatus = pod.body.items[0].status.containerStatuses[0].state

    if (clonePodStatus.hasOwnProperty('terminated')
      && clonePodStatus.terminated.hasOwnProperty('containerID')) {
      delete clonePodStatus.terminated.containerID
    }
    logger.debug('getClonePodStatus %s on kubernates successful', cloneName)
    return JSON.stringify(clonePodStatus, null, 2)
  } catch (err) {
    throw new KubernateError(err)
  }
}
export default getClonePodStatus
