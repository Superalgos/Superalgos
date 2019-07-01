import logger from '../config/logger'
import { Client } from 'kubernetes-client'
import kubeconfig from './kubeConfig'

const getClonePodLogs = async (cloneName) => {
  try {
    logger.debug('getClonePodLogs on kubernates started.')

    const Request = require('kubernetes-client/backends/request')
    const backend = new Request(Request.config.fromKubeconfig(kubeconfig()))
    const client = new Client({ backend, version: '1.9' })

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
    if(pod.body.items[0] !== undefined){
      const logs = await client.api.v1.namespaces('default')
        .pods(pod.body.items[0].metadata.name).log.get(queryLogs)
      let logsArray = logs.body.split('\n')

      logger.debug('getClonePodLogs on kubernates successful.')

      return JSON.stringify(logsArray, null, 2)
    } else {
      logger.warn('getClonePodStatus pod not found %s: ', cloneName)
      return "Logs not available."
    }
  } catch (err) {
    logger.error('There was an error getting the pod logs %s: ', err)
    return "Logs not available."
  }
}
export default getClonePodLogs
