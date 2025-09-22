exports.newDataMiningFunctionLibrariesSQLiteFileAdapter = function () {
    const path = require('path')
    const fs = require('fs')
    
    let thisObject = {
        createFileStructure: createFileStructure,
        generateCandlesFile: generateCandlesFile,
        generateVolumesFile: generateVolumesFile
    }

    return thisObject

    function createFileStructure(exchangeName, symbol, callback) {
        try {
            // Create the expected directory structure
            const basePath = path.join(process.cwd(), 'Platform', 'My-Data-Storage', 'Project', 'Data-Mining', 'Data-Mine', 'Candles', 'Candles-Volumes', exchangeName, symbol, 'Output')
            
            const candlesPath = path.join(basePath, 'Candles', 'One-Min')
            const volumesPath = path.join(basePath, 'Volumes', 'One-Min')
            
            // Create directories
            fs.mkdirSync(candlesPath, { recursive: true })
            fs.mkdirSync(volumesPath, { recursive: true })
            
            callback(null, { candlesPath, volumesPath })
        } catch (err) {
            callback(err)
        }
    }

    function generateCandlesFile(ohlcvData, filePath, callback) {
        try {
            // Convert OHLCV to Candles format: [min, max, open, close, begin, end]
            const candles = ohlcvData.map(ohlcv => [
                ohlcv[3], // low -> min
                ohlcv[2], // high -> max  
                ohlcv[1], // open
                ohlcv[4], // close
                ohlcv[0], // timestamp -> begin
                ohlcv[0] + 59999 // timestamp + 59999 -> end
            ])
            
            const content = JSON.stringify(candles)
            fs.writeFileSync(filePath, content)
            callback(null)
        } catch (err) {
            callback(err)
        }
    }

    function generateVolumesFile(ohlcvData, filePath, callback) {
        try {
            // Convert OHLCV to Volumes format: [buy, sell, begin, end]
            const volumes = ohlcvData.map(ohlcv => [
                ohlcv[5] / 2, // volume / 2 -> buy
                ohlcv[5] / 2, // volume / 2 -> sell
                ohlcv[0], // timestamp -> begin
                ohlcv[0] + 59999 // timestamp + 59999 -> end
            ])
            
            const content = JSON.stringify(volumes)
            fs.writeFileSync(filePath, content)
            callback(null)
        } catch (err) {
            callback(err)
        }
    }
}