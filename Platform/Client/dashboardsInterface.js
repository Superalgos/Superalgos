exports.newDashboardsInterface = function newDashboardsInterface() {
    /* 
    Este archivo maneja la interfaz que agrega métricas y otros datos del sistema
    y los envía a través de WebSocket a la Aplicación Dashboards 
    */

    const eventServerClientModule = SA.projects.dashboards.modules.dashboardsEventServerClient;
    const simulationDataFunction = SA.projects.dashboards.functionLibraries.SimulationData;
    const candlesDataFunction = SA.projects.dashboards.functionLibraries.CandlesData;
    const examplesDataFunction = SA.projects.dashboards.functionLibraries.ExamplesData;    
    const eventServerDataFunction = SA.projects.dashboards.functionLibraries.EventServerData;
    const taskManagerDataFunction = SA.projects.dashboards.functionLibraries.TaskManagerData;
    const governanceDataModule = SA.projects.dashboards.functionLibraries.GovernanceData;

    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        run: run
    };

    const WEB_SOCKET = SA.nodeModules.ws;
    let socketClient;
    let port = global.env.DASHBOARDS_WEB_SOCKETS_INTERFACE_PORT;
    let url = 'ws://localhost:' + port;
    let eventsServerClient = eventServerClientModule.newEventServerClient();
    //let dataSendingInterval;

    return thisObject;

    async function initialize() {
        eventsServerClient.createEventHandler('Dashboard Manager');
        eventsServerClient.listenToEvent('Dashboard Manager', 'Dashboard App Status', undefined, undefined, undefined, runInterface);

        function runInterface(response) {
            if (response.event.isRunning === true) {
                SA.logger.info('');
                SA.logger.info(response.event.message);
                setUpWebSocketClient(url);
            } else if (response.event.isRunning === false) {
                SA.logger.warn('[WARN] Dashboards App is not running.');
            } else {
                SA.logger.error('[ERROR] Something went wrong running the Dashboard App Interface: ', response);
            }
        }
    }

    function finalize() {
        if (socketClient) {
            socketClient.terminate(); // Termina cualquier conexión existente
            socketClient = undefined;
        }
        // if (dataSendingInterval) {
        //     clearInterval(dataSendingInterval); // Detener el envío periódico de datos
        // }
    }

    async function run() {
        const interval = setInterval(() => {
            checkDashboardAppStatus(port, statusResponse);
        }, 10000); // Reintentar cada 10 segundos

        function statusResponse(status, message) {
            if (status) {
                clearInterval(interval); // Detiene los intentos cuando el Dashboard está corriendo
                let event = {
                    isRunning: status,
                    message: message
                };
                eventsServerClient.raiseEvent("Dashboard Manager", 'Dashboard App Status', event);
                setUpWebSocketClient(url);
            } else {
                SA.logger.warn(`[WARN] ${message}`);
            }
        }
    }

    async function checkDashboardAppStatus(port, callbackFunc) {
        const net = require('net');
        const tester = net.createServer()
            .once('error', function (err) {
                if (err.code !== 'EADDRINUSE') {
                    callbackFunc(false, '[ERROR] Unexpected error checking Dashboard status.');
                } else {
                    callbackFunc(true, '[INFO] Dashboard App Interface is Running!');
                }
            })
            .once('listening', function () {
                tester.once('close', function () {
                    //callbackFunc(false, '[WARN] Dashboard App is not Running... Pausing Interface.');
                }).close();
            })
            .listen(port);
    }

    function setUpWebSocketClient(url) {
        socketClient = new WEB_SOCKET.WebSocket(url);
    
        socketClient.on('open', async function () {
            SA.logger.info('[INFO] WebSocket connection established.');
            let message = (new Date()).toISOString() + '|*|Platform|*|Info|*|Platform Dashboards Client has been Opened';
            sendMessage(message);
            
            // **Inicializar EventServerData y TaskManagerData**
            eventServerDataFunction.initialize(socketClient, WEB_SOCKET);
            taskManagerDataFunction.initialize(socketClient, WEB_SOCKET);

            // **Inicializar GovernanceData**
            await initializeGovernanceData();

            // Iniciar el envío de datos periódicamente
            startSendingData();
        });
    
        socketClient.on('close', function () {
            SA.logger.warn('[WARN] WebSocket connection closed. Attempting to reconnect...');
            retryConnection();
        });
    
        socketClient.on('error', function (error) {
            SA.logger.error(`[ERROR] Dashboards Client error: ${error.message}`);
            retryConnection();
        });
    
        socketClient.on('message', function (message) {
            SA.logger.info('[INFO] Message received from Dashboards App:', message);
        });
    }
    
    function retryConnection() {
        if (socketClient) {
            socketClient.terminate(); // Asegura que la conexión previa esté cerrada
        }
    
        setTimeout(() => {
            SA.logger.info('[INFO] Attempting to reconnect to Dashboards App...');
            setUpWebSocketClient(url);
        }, 5000); // Reintenta cada 5 segundos
    }
    
    async function initializeGovernanceData() {
        try {
            //SA.logger.info('[InitializeGovernanceData] Sending Governance Data.');
            
            // Acceder a userProfilesById directamente desde la memoria global
            const bootstrappingProcess = SA.projects.dashboards.modules.dashboardsAppBootstrappingProcess.newDashboardsAppBootstrappingProcess();
    
            await bootstrappingProcess.initialize();
            await bootstrappingProcess.run();
    
            const userProfilesById = bootstrappingProcess.userProfilesById;
    
            //SA.logger.info('userProfilesById:', userProfilesById);
    
            if (!userProfilesById || userProfilesById.size === 0) {
                //SA.logger.warn('[WARN] USER_PROFILES_BY_ID is undefined or empty.');
                return;
            }
    
            // Inicializar y enviar GovernanceData
            governanceDataModule.initialize(
                socketClient,
                WEB_SOCKET,
                userProfilesById
            );
            //SA.logger.info('[InitializeGovernanceData] GovernanceData initialized.');
            governanceDataModule.sendGovernanceData();
            //SA.logger.info('[InitializeGovernanceData] GovernanceData.sendGovernanceData() called.');
    
        } catch (err) {
            SA.logger.error('[ERROR] Error sending Governance Data:', err);
        }
    }
    
    function startSendingData() {
        
        setInterval(() => {
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                simulationDataFunction.newSimulationData(socketClient, WEB_SOCKET);
            } else {
                SA.logger.warn('[WARN] WebSocket client is not ready. Retrying send Simulation Data...');
            }
        }, 10000); 

        setInterval(() => {
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                candlesDataFunction.newCandlesData(socketClient, WEB_SOCKET);
            } else {
                SA.logger.warn('[WARN] WebSocket client is not ready. Retrying to send candle data...');
            }
        }, 10000); 
        
        setInterval(() => {
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                examplesDataFunction.sendExampleData(socketClient, WEB_SOCKET);
            } else {
                SA.logger.warn('[WARN] WebSocket client is not ready. Retrying to send example data...');
            }
        }, 10000);

        // **Envío Periódico de GovernanceData**
        setInterval(() => {
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                governanceDataModule.sendGovernanceData();
                //SA.logger.info('[INFO] Governance Data sent successfully.');
            } else {
                SA.logger.warn('[WARN] WebSocket client is not ready. Retrying to send Governance Data...');
            }
        }, 10000); // Cada 10 segundos

        // **Envío Periódico de EventServerData y TaskManagerData**
        setInterval(() => {
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                eventServerDataFunction.sendEventServerData();
                //SA.logger.info('[INFO] Event Server Data sent successfully.');
            } else {
                SA.logger.warn('[WARN] WebSocket client is not ready. Retrying to send Event Server Data...');
            }
        }, 10000); // Cada 10 segundos

        setInterval(() => {
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                taskManagerDataFunction.sendTaskManagerData();
                //SA.logger.info('[INFO] Task Manager Data sent successfully.');
            } else {
                SA.logger.warn('[WARN] WebSocket client is not ready. Retrying to send Task Manager Data...');
            }
        }, 10000); // Cada 10 segundos

    }
    
    function sendMessage(message) {
        if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
            socketClient.send(message);
            SA.logger.info(`[INFO] Sent message: ${message}`);
        } else {
            SA.logger.warn('[WARN] WebSocket is not open. Message could not be sent.');
        }
    }
    
};
