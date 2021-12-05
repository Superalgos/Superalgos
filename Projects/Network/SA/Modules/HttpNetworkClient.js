exports.newNetworkModulesHttpNetworkClient = function newNetworkModulesHttpNetworkClient() {

    let thisObject = {
        callerRole: undefined,
        host: undefined,
        port: undefined,
        p2pNetworkNode: undefined,
        p2pNetworkClientIdentity: undefined,
        p2pNetworkClientCodeName: undefined,
        sendMessage: sendMessage,
        initialize: initialize,
        finalize: finalize
    }

    let web3

    return thisObject

    function finalize() {
        thisObject.host = undefined
        thisObject.port = undefined

        thisObject.p2pNetworkNode = undefined
        thisObject.p2pNetworkClientIdentity = undefined

        web3 = undefined
    }

    async function initialize(callerRole, p2pNetworkClientIdentity, p2pNetworkNode) {
        thisObject.callerRole = callerRole
        thisObject.p2pNetworkClientIdentity = p2pNetworkClientIdentity
        thisObject.p2pNetworkClientCodeName = JSON.parse(thisObject.p2pNetworkClientIdentity.node.config).codeName
        thisObject.p2pNetworkNode = p2pNetworkNode

        web3 = new SA.nodeModules.web3()

        thisObject.host = JSON.parse(thisObject.p2pNetworkNode.node.config).host
        thisObject.port = JSON.parse(thisObject.p2pNetworkNode.node.config).webPort
    }

    async function sendMessage(message) {

        await axios()
        async function axios() {
            /*
            This function helps a caller to use await syntax while the called
            function uses callbacks, specifically for retrieving files.
            */
            let promise = new Promise((resolve, reject) => {

                const axios = require('axios')
                console.log('call axios')
                axios
                    .post('http://localhost:31248/New-Signal', {
                        messageId: 'La concha de tu madre.'
                    })
                    .then(res => {
                        console.log(`statusCode: ${res.status}`)
                        console.log('ATENTIONNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNNN !!!!!!!!!!!!!!!! ' + res.data)
                        resolve()
                    })
                    .catch(error => {
                        console.error(error)
                        reject()
                    })
            })

            return promise
        }


        /*
        let signature = web3.eth.accounts.sign(JSON.stringify(message), SA.secrets.map.get(thisObject.p2pNetworkClientCodeName).privateKey)

        let body = {
            messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
            messageType: 'Request',
            signature: JSON.stringify(signature),
            payload: JSON.stringify(message)
        }

        const data = JSON.stringify(body)
        const http = SA.nodeModules.http

        const options = {
            hostname: thisObject.host,
            port: thisObject.port,
            path: '/New-Signal',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }

        const req = http.request(options, res => {
            console.log(`statusCode: ${res.statusCode}`)

            res.on('data', d => {
                process.stdout.write(d)
            })
        })

        req.on('error', error => {
            console.error(error)
        })

        req.write(data)
        req.end()
*/

        /*
        
                return new Promise(sendHttpMessage)
        
                async function sendHttpMessage(resolve, reject) {
                    try {
                        let signature = web3.eth.accounts.sign(JSON.stringify(message), SA.secrets.map.get(thisObject.p2pNetworkClientCodeName).privateKey)
        
                        let body = {
                            messageId: SA.projects.foundations.utilities.miscellaneousFunctions.genereteUniqueId(),
                            messageType: 'Request',
                            signature: JSON.stringify(signature),
                            payload: JSON.stringify(message)
                        }
        
                        const data = JSON.stringify(body)
                        const http = SA.nodeModules.http
        
                        const options = {
                            hostname: thisObject.host,
                            port: thisObject.port,
                            path: '/New-Signal',
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': data.length
                            }
                        }
        
                        const req = http.request(options, res => {
                            console.log(`statusCode: ${res.statusCode}`)
        
                            res.on('data', d => {
                                process.stdout.write(d)
                            })
                        })
        
                        req.on('error', error => {
                            console.error(error)
                        })
        
                        req.write(data)
                        req.end()
        
                        return
        
                        /*
                                        const fetch = SA.nodeModules.nodeFetch
                                        const url = 'http://' + thisObject.host + ':' + thisObject.port + '/' + 'New-Signal'
                                        const options = {
                                            method: 'post',
                                            body: JSON.stringify(body),
                                            headers: { 'Content-Type': 'application/json' }
                                        }
                                        const response = fetch(url)
                                            .then(returnData)
                                            .catch(onError)
                        
                                        function onError(errorMessage) {
                                            console.log('[ERROR] Error sending http request to P2P Network Node via httpInterdace: ' + errorMessage)
                                        }
                        
                                        async function returnData() {
                                            const data = await response.json();
                                            resolve(data)
                                        }
                        */
        /*
     } catch (err) {
         console.log('[ERROR] Http Network Client -> err.message = ' + err.message)
         reject(err.description)
     }

   
 }  */
    }
}