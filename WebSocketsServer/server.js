require('dotenv').config()
const WebSocket = require('ws')
let wss 

let ipc = require('node-ipc');

ipc.config.id = 'hello';
ipc.config.retry = 1500;
ipc.config.silent = true;

let port = process.env.WEB_SOCKETS_PORT  

process.on('uncaughtException', function (err) {
    if (err.message.indexOf("EADDRINUSE") > 0) {
        console.log("Superalgos Web Server cannot be started. Reason: the port " + port + " is already in use by another application. The web server cannot be started until either you stop the other application or you change the port number at the WebServer/.env file for an unused one. (variable name VIRTUAL_PORT)")
        return
    }
    console.log('[ERROR] Web Sockets Server -> server -> uncaughtException -> err.message = ' + err.message)
    console.log('[ERROR] Web Sockets Server -> server -> uncaughtException -> err.stack = ' + err.stack)
    process.exit(1)
})

process.on('unhandledRejection', (reason, p) => {
    console.log('[ERROR] Web Sockets Server -> server -> unhandledRejection -> reason = ' + JSON.stringify(reason))
    console.log('[ERROR] Web Sockets Server -> server -> unhandledRejection -> p = ' + JSON.stringify(p))
    process.exit(1)
})

try {
    ipc.connectTo(
        'world',
        function () {
            ipc.of.world.on(
                'connect',
                function () {

                    let lastNonce = -1

                    ipc.log('## connected to world ##'.rainbow, ipc.config.delay);

                    let eventCommand = {
                        action: 'greetings',
                        from: 'Web Sockets Server'
                    }

                    ipc.of.world.emit(
                        'message',
                        JSON.stringify(eventCommand)
                    )

                    wss = new WebSocket.Server({ port: port })

                    wss.on('connection', ws => {
                        ws.on('message', message => {

                            if (ipc.config.silent !== true) {
                                console.log(`Received message from browser => ${message}`)
                            }

                            //console.log('Message Received From Browser: ' + message)

                            let dividerPosition = message.indexOf('->')
                            let nonce = message.substring(0, dividerPosition)
                            let messageToEventServer = message.substring(dividerPosition + 2, message.length)

                            if (isNaN(nonce) || nonce === "") {
                                console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromBrowser -> Nonce is not a Number. message = ' + message)
                                console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromBrowser -> Nonce is not a Number. nonce = ' + nonce)
                                return
                            }

                            if (Number(nonce) < Number(lastNonce)) {
                                console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromBrowser -> Nonce received is less than Last Nonce. message = ' + message)
                                console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromBrowser -> Nonce received is less than Last Nonce. nonce = ' + nonce)
                                console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromBrowser -> Nonce received is less than Last Nonce. lastNonce = ' + lastNonce)
                                return
                            }

                            lastNonce = nonce

                            try {
                                let jsonCheck = JSON.parse(messageToEventServer)
                            } catch (err) {
                                console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromBrowser -> Message received from the browser is not a valid JSON. message = ' + message)
                                console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromBrowser -> Message received from the browser is not a valid JSON. messageToEventServer = ' + messageToEventServer)
                                return
                            }

                            let acknowledgeMessage = {
                                action: 'Acknowledge',
                                nonce: nonce
                            }

                            ws.send(JSON.stringify(acknowledgeMessage))
                                                        
                            ipc.of.world.emit(
                                'message',
                                messageToEventServer
                            )
                        })

                        ipc.of.world.on(
                            'message',
                            function (data) {
                                ipc.log('got a message from Event Server : '.debug, data);

                                try {
                                    let jsonCheck = JSON.parse(data)
                                } catch (err) {
                                    console.log('[ERROR] Web Sockets Server -> server -> connectTo -> onMessageFromEventServer -> Data received from the Event Server is not a valid JSON. data = ' + data)
                                }

                                ws.send(data)
                            }
                        );
                    })

                    console.log('Web Socket Server Started.')
                }
            );
            ipc.of.world.on(
                'disconnect',
                function () {
                    ipc.log('disconnected from world'.notice);
                }
            );
        }
    );
} catch (err) {
    console.log('[ERROR] Web Sockets Server -> server -> connectTo -> err.message = ' + err.message)
}

