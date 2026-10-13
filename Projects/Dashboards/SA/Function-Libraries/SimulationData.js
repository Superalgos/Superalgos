// Adjusted newSimulationData function
exports.newSimulationData = function newSimulationData() {
    let thisObject = {
        newSimulationData: newSimulationData
    };
    return thisObject;

    function newSimulationData(socketClient, WEB_SOCKET) {
        const fs = require('fs').promises;
        const path = require('path');

        const basePath = path.join(global.env.PATH_TO_DATA_STORAGE, 'Project', 'Algorithmic-Trading', 'Trading-Mine', 'Masters', 'Low-Frequency');

        async function findStatusReports(dir) {
            let results = [];
            try {
                const list = await fs.readdir(dir);
                for (const file of list) {
                    const filePath = path.resolve(dir, file);
                    const stat = await fs.stat(filePath);
                    if (stat && stat.isDirectory()) {
                        results = results.concat(await findStatusReports(filePath));
                    } else if (filePath.endsWith('Status.Report.json') || filePath.endsWith('Status.Report.json.Previous.json')) {
                        results.push(filePath);
                    }
                }
            } catch (error) {
                console.error(`[ERROR] Error reading directory ${dir}:`, error);
            }
            return results;
        }

        async function sendReports() {
            try {
                const reportPaths = await findStatusReports(basePath);
                if (reportPaths.length === 0) {
                    console.warn('[WARN] No status reports found to send.');
                    return;
                }

                for (const reportPath of reportPaths) {
                    let data;
                    try {
                        data = await fs.readFile(reportPath, 'utf8');
                    } catch (fileReadError) {
                        console.error(`[ERROR] Error reading file ${reportPath}:`, fileReadError);
                        continue;
                    }

                    let jsonData;
                    try {
                        jsonData = JSON.parse(data);
                    } catch (parseError) {
                        console.error('[ERROR] Error parsing JSON:', parseError);
                        continue;
                    }

                    jsonData.reportPath = reportPath;
                    const jsonDataString = JSON.stringify(jsonData);
                    const messageToSend = `${new Date().toISOString()}|*|Platform|*|Data|*|SimulationResult|*|${jsonDataString}`;

                    if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                        socketClient.send(messageToSend);
                        //console.info(`[INFO] Simulation report sent successfully from ${reportPath}`);
                    } else {
                        console.warn(`[WARN] WebSocket is not ready. Could not send data for ${reportPath}.`);
                    }
                }
            } catch (error) {
                console.error('[ERROR] Error processing simulation data:', error);
            }
        }

        // Send reports once per invocation
        sendReports();
    };
};
