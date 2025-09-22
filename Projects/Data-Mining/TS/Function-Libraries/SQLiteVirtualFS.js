exports.newDataMiningFunctionLibrariesSQLiteVirtualFS = function () {
    const originalReadFile = require('fs').readFile
    const originalReadFileSync = require('fs').readFileSync
    const originalExistsSync = require('fs').existsSync
    
    let thisObject = {
        initialize: initialize,
        interceptFileSystem: interceptFileSystem
    }

    let dataStorage = null
    let exchangeName = null
    let symbolName = null

    return thisObject

    function initialize(storage, exchange, symbol) {
        dataStorage = storage
        exchangeName = exchange
        symbolName = symbol
        interceptFileSystem()
    }

    function interceptFileSystem() {
        // Override fs.readFile to serve SQLite data
        require('fs').readFile = function(filePath, options, callback) {
            if (typeof options === 'function') {
                callback = options
                options = 'utf8'
            }
            
            if (isDataFile(filePath)) {
                serveFromSQLite(filePath, callback)
            } else {
                originalReadFile.call(this, filePath, options, callback)
            }
        }

        // Override fs.readFileSync
        require('fs').readFileSync = function(filePath, options) {
            if (isDataFile(filePath)) {
                // For sync calls, return empty array for now
                return JSON.stringify([])
            } else {
                return originalReadFileSync.call(this, filePath, options)
            }
        }

        // Override fs.existsSync to claim our virtual files exist
        require('fs').existsSync = function(filePath) {
            if (isDataFile(filePath)) {
                return true
            } else {
                return originalExistsSync.call(this, filePath)
            }
        }
    }

    function isDataFile(filePath) {
        // Intercept both data files and status files for network discovery
        return (filePath.includes('Data.json') || filePath.includes('Status.json')) && 
               filePath.includes(exchangeName) && 
               (filePath.includes(symbolName.replace('/', '-')) || filePath.includes(symbolName.replace('/', '_')))
    }

    function serveFromSQLite(filePath, callback) {
        try {
            // Handle Status.json files for network discovery
            if (filePath.includes('Status.json')) {
                const statusData = {
                    "file": {
                        "lastFile": {
                            "year": new Date().getUTCFullYear(),
                            "month": new Date().getUTCMonth() + 1,
                            "days": new Date().getUTCDate(),
                            "hours": new Date().getUTCHours(),
                            "minutes": new Date().getUTCMinutes()
                        }
                    }
                }
                return callback(null, JSON.stringify(statusData))
            }
            
            // Extract date from file path
            const dateMatch = filePath.match(/(\d{4})\/(\d{2})\/(\d{2})/)
            if (!dateMatch) {
                return callback(null, JSON.stringify([]))
            }

            const year = parseInt(dateMatch[1])
            const month = parseInt(dateMatch[2]) - 1
            const day = parseInt(dateMatch[3])
            
            const startOfDay = new Date(Date.UTC(year, month, day)).valueOf()
            const endOfDay = startOfDay + (24 * 60 * 60 * 1000) - 1

            // Get data from SQLite
            dataStorage.getOHLCVRange(startOfDay, endOfDay, (err, ohlcvData) => {
                if (err || !ohlcvData || ohlcvData.length === 0) {
                    return callback(null, JSON.stringify([]))
                }

                let result
                if (filePath.includes('Candles')) {
                    // Convert to Candles format: [min, max, open, close, begin, end]
                    result = ohlcvData.map(ohlcv => [
                        ohlcv[3], // low -> min
                        ohlcv[2], // high -> max
                        ohlcv[1], // open
                        ohlcv[4], // close
                        ohlcv[0], // timestamp -> begin
                        ohlcv[0] + 59999 // end
                    ])
                } else if (filePath.includes('Volumes')) {
                    // Convert to Volumes format: [buy, sell, begin, end]
                    result = ohlcvData.map(ohlcv => [
                        ohlcv[5] / 2, // buy
                        ohlcv[5] / 2, // sell
                        ohlcv[0], // begin
                        ohlcv[0] + 59999 // end
                    ])
                } else {
                    result = []
                }

                callback(null, JSON.stringify(result))
            })
        } catch (err) {
            callback(null, JSON.stringify([]))
        }
    }
}