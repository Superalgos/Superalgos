exports.newTaskManagerData = function newTaskManagerData() {
    let thisObject = {
        initialize: initialize,
        finalize: finalize,
        sendTaskManagerData: sendTaskManagerData
    };

    let socketClient;
    let WEB_SOCKET;

    return thisObject;

    function initialize(pSocketClient, pWEB_SOCKET) {
        socketClient = pSocketClient;
        WEB_SOCKET = pWEB_SOCKET;
    }

    function finalize() {
        // Limpiar recursos si es necesario
    }

    function sendTaskManagerData() {
        try {
            if (!PL.servers || !PL.servers.TASK_MANAGER_SERVER) {
                SA.logger.warn('[WARN] TASK_MANAGER_SERVER is not initialized.');
                return;
            }
    
            let tasksMap = PL.servers.TASK_MANAGER_SERVER.tasksMap;
    
            if (!tasksMap) {
                SA.logger.warn('[WARN] tasksMap is undefined.');
                return;
            }
    
            let tasksData = [];
    
            for (let [taskId, task] of tasksMap) {
                tasksData.push({
                    taskId: taskId,
                    taskName: task.name,
                    // Puedes agregar más información sobre la tarea si es necesario
                });
            }
    
            let messageToSend = `${new Date().toISOString()}|*|Platform|*|Data|*|TaskManagerData|*|${JSON.stringify(tasksData)}`;
    
            if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                socketClient.send(messageToSend);
                //SA.logger.info('[INFO] Task Manager data sent successfully.');
            } else {
                SA.logger.warn('[WARN] WebSocket is not open. Could not send Task Manager data.');
            }
        } catch (err) {
            SA.logger.error('[ERROR] Error sending Task Manager data:', err);
        }
    }   
};
