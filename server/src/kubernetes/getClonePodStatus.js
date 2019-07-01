import logger from '../config/logger'
import { Client } from 'kubernetes-client'
import kubeconfig from './kubeConfig'

const getClonePodStatus = async (cloneName) => {
  try {
    logger.debug('getClonePodStatus on kubernates started.')

    const Request = require('kubernetes-client/backends/request')
    const backend = new Request(Request.config.fromKubeconfig(kubeconfig()))
    const client = new Client({ backend, version: '1.9' })

    let query = {
      'qs': {
        'labelSelector': 'job-name=' + cloneName
      }
    }

    const pod = await client.api.v1.namespaces('default').pods.get(query)

    if (pod.body.items[0] !== undefined) {
      let clonePodStatus = pod.body.items[0].status.containerStatuses[0].state

      if (clonePodStatus.hasOwnProperty('terminated')
        && clonePodStatus.terminated.hasOwnProperty('containerID')) {
        delete clonePodStatus.terminated.containerID
      }
      logger.debug('getClonePodStatus %s on kubernates successful', cloneName)

      return JSON.stringify(clonePodStatus, null, 2)
    } else {
      logger.warn('getClonePodStatus pod not found: %s', cloneName)
      return " Clone not found on the server. "
    }
  } catch (err) {
    logger.error('There was an error getting the pod status %s: ', err)
    return "Status not available."
  }
}
export default getClonePodStatus
