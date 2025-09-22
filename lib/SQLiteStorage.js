const StorageInterface = require('./StorageInterface')

class SQLiteStorage extends StorageInterface {
    constructor(config) {
        super()
        this.adapter = null
        this.config = config
    }

    async _getAdapter() {
        if (!this.adapter) {
            // Create a simple SQLite adapter using better-sqlite3
            const Database = require('better-sqlite3')
            const path = require('path')
            
            this.adapter = {
                readFile: async (filePath) => {
                    // Return empty array for raw data files - SQLite doesn't store these
                    // The bot will just start fresh without previous raw data
                    return JSON.stringify([])
                },
                writeFile: async (filePath, data) => {
                    // All data goes to SQLite - no JSON files created
                    const pathParts = filePath.split('/')
                    const fileName = pathParts[pathParts.length - 1]
                    
                    if (fileName === 'Data.json') {
                        const dbName = this.getDbNameFromPath(filePath)
                        const db = new Database(path.join(this.config.path, dbName + '.db'))
                        
                        // Enable WAL mode for better concurrency
                        db.pragma('journal_mode = WAL')
                        db.pragma('synchronous = NORMAL')
                        db.pragma('cache_size = 1000000')
                        db.pragma('temp_store = memory')
                        
                        if (filePath.includes('Candles')) {
                            // Candles: [min, max, open, close, begin, end]
                            db.exec(`CREATE TABLE IF NOT EXISTS candles (
                                timestamp INTEGER PRIMARY KEY,
                                min REAL, max REAL, open REAL, close REAL, begin INTEGER, end INTEGER
                            )`)
                            const candlesData = JSON.parse(data)
                            const insert = db.prepare('INSERT OR REPLACE INTO candles VALUES (?, ?, ?, ?, ?, ?, ?)')
                            
                            // Use transaction for batch insert - much faster
                            const insertMany = db.transaction((records) => {
                                for (const record of records) {
                                    insert.run(record[4], record[0], record[1], record[2], record[3], record[4], record[5])
                                }
                            })
                            insertMany(candlesData)
                            
                        } else if (filePath.includes('Volumes')) {
                            // Volumes: [buy, sell, begin, end]
                            db.exec(`CREATE TABLE IF NOT EXISTS volumes (
                                timestamp INTEGER PRIMARY KEY,
                                buy REAL, sell REAL, begin INTEGER, end INTEGER
                            )`)
                            const volumesData = JSON.parse(data)
                            const insert = db.prepare('INSERT OR REPLACE INTO volumes VALUES (?, ?, ?, ?, ?)')
                            
                            // Use transaction for batch insert - much faster
                            const insertMany = db.transaction((records) => {
                                for (const record of records) {
                                    insert.run(record[2], record[0], record[1], record[2], record[3])
                                }
                            })
                            insertMany(volumesData)
                        } else if (filePath.includes('OHLCVs')) {
                            // Check existing table structure first
                            const tableInfo = db.prepare("PRAGMA table_info(ohlcv)").all()
                            
                            if (tableInfo.length === 0) {
                                // Create new table
                                db.exec(`CREATE TABLE ohlcv (
                                    timestamp INTEGER PRIMARY KEY,
                                    open REAL, high REAL, low REAL, close REAL, volume REAL
                                )`)
                            }
                            
                            // Use appropriate insert based on table structure
                            const ohlcvData = JSON.parse(data)
                            let insert
                            
                            if (tableInfo.length === 7) {
                                // Existing 7-column table - skip for now to avoid conflicts
                                console.log('Skipping OHLCV insert - existing table has different structure')
                                return
                            } else {
                                // Our 6-column table with transaction
                                insert = db.prepare('INSERT OR REPLACE INTO ohlcv VALUES (?, ?, ?, ?, ?, ?)')
                                const insertMany = db.transaction((records) => {
                                    for (const record of records) {
                                        insert.run(record[0], record[1], record[2], record[3], record[4], record[5])
                                    }
                                })
                                insertMany(ohlcvData)
                            }
                        }
                        
                        db.close()
                    }
                    // Don't create any files - everything goes to SQLite
                },
                exists: async (filePath) => true,
                deleteFile: async (filePath) => {},
                listFiles: async (dirPath) => []
            }
        }
        return this.adapter
    }
    
    getDbNameFromPath(filePath) {
        // Extract exchange and symbol from path to create unique database name
        // Path format: Output/Candles/One-Min/2023/01/25/Data.json
        
        // For now, determine from global task constants if available
        try {
            const exchange = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.parentNode.parentNode.config.codeName
            const baseAsset = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.baseAsset.referenceParent.config.codeName
            const quotedAsset = TS.projects.foundations.globals.taskConstants.TASK_NODE.parentNode.parentNode.parentNode.referenceParent.quotedAsset.referenceParent.config.codeName
            return `${exchange}_${baseAsset}_${quotedAsset}`
        } catch (e) {
            // Fallback to parsing from path or default
            if (filePath.includes('BTC')) return 'bitstamp_BTC_USD'
            if (filePath.includes('ETH')) return 'bitstamp_ETH_USD'
            if (filePath.includes('DOGE')) return 'bitstamp_DOGE_USD'
            return 'bitstamp_UNKNOWN'
        }
    }

    async readFile(filePath) {
        const adapter = await this._getAdapter()
        return await adapter.readFile(filePath)
    }

    async writeFile(filePath, data) {
        const adapter = await this._getAdapter()
        return await adapter.writeFile(filePath, data)
    }

    async exists(filePath) {
        const adapter = await this._getAdapter()
        return await adapter.exists(filePath)
    }

    async deleteFile(filePath) {
        const adapter = await this._getAdapter()
        return await adapter.deleteFile(filePath)
    }

    async listFiles(dirPath) {
        const adapter = await this._getAdapter()
        return await adapter.listFiles(dirPath)
    }
}

module.exports = SQLiteStorage