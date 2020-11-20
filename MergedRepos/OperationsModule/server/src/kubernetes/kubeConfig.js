import logger from '../config/logger'

const kubeConfig = () => {

    let clusterConfig = {}
    clusterConfig.name = process.env.CLUSTER_NAME
    let cluster = {}
    cluster.server = process.env.CLUSTER_SERVER
    if (process.env.CERTIFICATE_AUTHORITY_DATA) {
        cluster['certificate-authority-data'] = process.env.CERTIFICATE_AUTHORITY_DATA
    }
    if (process.env.INSECURE_SKIP_TLS_VERIFY) {
        cluster['insecure-skip-tls-verify'] = JSON.parse(process.env.INSECURE_SKIP_TLS_VERIFY)
    }
    clusterConfig.cluster = cluster

    let contextConfig = {}
    contextConfig.name = process.env.CONTEXT_NAME
    let context = {}
    context.cluster = process.env.CLUSTER_NAME
    context.user = process.env.USER_NAME
    contextConfig.context = context

    let userConfig = {}
    userConfig.name = process.env.USER_NAME
    let user = {}
    if (process.env.USER_PASSWORD) {
        user.password = process.env.USER_PASSWORD
        user.username = process.env.USER_NAME
    }
    if (process.env.CLIENT_CERTIFICATE_DATA) {
        user['client-certificate-data'] = process.env.CLIENT_CERTIFICATE_DATA
        user['client-key-data'] = process.env.CLIENT_KEY_DATA
    }
    userConfig.user = user

    const config = {
        apiVersion: 'v1',
        clusters: [clusterConfig],
        contexts: [contextConfig],
        'current-context': process.env.CONTEXT_NAME,
        kind: 'Config',
        users: [userConfig]
    }

    return config
}

export default kubeConfig
