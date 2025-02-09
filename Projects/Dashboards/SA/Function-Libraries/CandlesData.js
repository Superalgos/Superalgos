exports.newCandlesData = function newCandlesData() {
    let thisObject = {
        newCandlesData: newCandlesData
    };

    return thisObject;

    function newCandlesData(socketClient, WEB_SOCKET) {    
        const fs = require('fs').promises;
        const path = require('path');

        // Base path donde se almacenan los archivos de velas
        const basePath = path.join(global.env.PATH_TO_DATA_STORAGE, 'Project', 'Data-Mining', 'Data-Mine', 'Candles', 'Exchange-Raw-Data');

        // Función para encontrar todos los archivos de velas en la ruta especificada
        async function findCandlesFiles(dir) {
            let results = [];
            try {
                const list = await fs.readdir(dir);
                for (const file of list) {
                    const filePath = path.resolve(dir, file);
                    const stat = await fs.stat(filePath);
                    if (stat && stat.isDirectory()) {
                        results = results.concat(await findCandlesFiles(filePath));
                    } else if (filePath.endsWith('Data.json')) {
                        results.push(filePath);
                    }
                }
            } catch (error) {
                console.error(`[ERROR] Error reading directory ${dir}:`, error);
            }
            return results;
        }

        // Función para extraer datos del path
        function extractCandleDataFromPath(candlePath) {
            const pathParts = candlePath.split(path.sep);

            const indexOfExchangeRawData = pathParts.indexOf('Exchange-Raw-Data');
            if (indexOfExchangeRawData === -1) {
                console.warn(`[WARN] Could not find 'Exchange-Raw-Data' in path: ${candlePath}`);
                return null;
            }

            const exchange = pathParts[indexOfExchangeRawData + 1];
            const assetPair = pathParts[indexOfExchangeRawData + 2];

            return {
                exchange,
                assetPair
            };
        }

        // Función para validar los datos de las velas
        function isValidCandleData(candleData) {
            if (typeof candleData.high !== 'number' || typeof candleData.low !== 'number') {
                return false;
            }

            if (isNaN(new Date(candleData.beginDate)) || isNaN(new Date(candleData.endDate))) {
                return false;
            }

            return true;
        }

        // Función principal para enviar datos de velas
        async function sendCandlesData() {
            try {
                const candlePaths = await findCandlesFiles(basePath);
                if (candlePaths.length === 0) {
                    console.warn('[WARN] No candle data files found to send.');
                    return;
                }

                const candlesByExchangePair = {};

                for (const candlePath of candlePaths) {
                    let data;
                    try {
                        data = await fs.readFile(candlePath, 'utf8');
                    } catch (fileReadError) {
                        console.error(`[ERROR] Error reading file ${candlePath}:`, fileReadError);
                        continue;
                    }

                    let jsonData;
                    try {
                        jsonData = JSON.parse(data);
                    } catch (parseError) {
                        console.warn(`[WARN] Error parsing JSON: ${parseError}, path: ${candlePath}`);
                        continue;
                    }

                    if (!jsonData || jsonData.length === 0) {
                        console.warn('[WARN] Empty or invalid JSON data:', candlePath);
                        continue;
                    }

                    const pathData = extractCandleDataFromPath(candlePath);
                    if (!pathData) {
                        continue;
                    }

                    const { exchange, assetPair } = pathData;
                    const key = `${exchange} | ${assetPair}`;

                    // Agregar validaciones adicionales
                    const firstCandle = jsonData[0];
                    const lastCandle = jsonData[jsonData.length - 1];

                    if (!firstCandle || !lastCandle) {
                        console.warn(`[WARN] Missing candle data in file: ${candlePath}`);
                        continue;
                    }

                    // Verifica que los índices existen
                    if (firstCandle.length <= 0 || lastCandle.length <= 0) {
                        console.warn(`[WARN] Candle data format is incorrect in file: ${candlePath}`);
                        continue;
                    }

                    // Ajusta los índices según el formato real de tus datos
                    // Supongamos que el timestamp está en el índice 0
                    const beginTimestamp = Number(firstCandle[0]);
                    const endTimestamp = Number(lastCandle[0]);

                    if (isNaN(beginTimestamp) || isNaN(endTimestamp)) {
                        console.warn(`[WARN] Invalid timestamp in data: ${candlePath}`);
                        continue;
                    }

                    const candleData = {
                        high: Math.max(...jsonData.map(c => c[2])),
                        low: Math.min(...jsonData.map(c => c[1])),
                        beginDate: new Date(beginTimestamp).toISOString(),
                        endDate: new Date(endTimestamp).toISOString(),
                        dataPath: candlePath,
                    };

                    if (!isValidCandleData(candleData)) {
                        console.warn(`[WARN] Invalid candle data generated for ${key}`);
                        continue;
                    }

                    if (!candlesByExchangePair[key]) {
                        candlesByExchangePair[key] = [];
                    }

                    candlesByExchangePair[key].push(candleData);
                }

                for (const [exchangePair, candleDataArray] of Object.entries(candlesByExchangePair)) {
                    const filteredData = {
                        exchangePair,
                        candleData: candleDataArray,
                    };

                    let messageToSend = `${new Date().toISOString()}|*|Platform|*|Data|*|CandlesData|*|${JSON.stringify(filteredData)}`;

                    if (socketClient && socketClient.readyState === WEB_SOCKET.OPEN) {
                        socketClient.send(messageToSend);
                        //console.info(`[INFO] Candle data sent successfully for ${exchangePair}`);
                    } else {
                        console.warn(`[WARN] WebSocket is not ready. Could not send data for ${exchangePair}.`);
                    }
                }
            } catch (error) {
                console.error('[ERROR] Error processing candle data:', error);
            }
        }

        // Enviar datos de velas una vez por invocación
        sendCandlesData();
    }
};
