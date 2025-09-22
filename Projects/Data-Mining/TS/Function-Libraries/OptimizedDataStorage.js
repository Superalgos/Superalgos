let sqlite3

try {
    sqlite3 = require('sqlite3').verbose()
} catch (err) {
    console.error('[OptimizedDataStorage] Failed to load sqlite3 module:', err.message)
}

const path = require('path')
const fs = require('fs')

function newDataMiningFunctionLibrariesOptimizedDataStorage() {
    let thisObject = {
        initialize: initialize,
        saveOHLCVBatch: saveOHLCVBatch,
        getOHLCVRange: getOHLCVRange,
        getLastTimestamp: getLastTimestamp,
        cleanup: cleanup
    }

    let db = null
    let dbPath = null

    return thisObject

    function initialize(exchangeName, symbol, callback) {
        try {
            // Create database directory if it doesn't exist
            const dbDir = path.join(process.cwd(), 'Data', 'SQLite')
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true })
            }

            // Create database file path
            const sanitizedSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '_')
            dbPath = path.join(dbDir, `${exchangeName}_${sanitizedSymbol}.db`)

            // Open database connection
            db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err.message)
                    return callback(err)
                }

                // Create tables if they don't exist
                createTables(callback)
            })

        } catch (err) {
            callback(err)
        }
    }

    function createTables(callback) {
        const createOHLCVTable = `
            CREATE TABLE IF NOT EXISTS ohlcv (
                timestamp INTEGER PRIMARY KEY,
                open REAL NOT NULL,
                high REAL NOT NULL,
                low REAL NOT NULL,
                close REAL NOT NULL,
                volume REAL NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now'))
            )
        `

        const createIndexes = `
            CREATE INDEX IF NOT EXISTS idx_ohlcv_timestamp ON ohlcv(timestamp);
            CREATE INDEX IF NOT EXISTS idx_ohlcv_created_at ON ohlcv(created_at);
        `

        db.serialize(() => {
            db.run(createOHLCVTable, (err) => {
                if (err) return callback(err)
                
                db.exec(createIndexes, (err) => {
                    if (err) return callback(err)
                    callback(null)
                })
            })
        })
    }

    function saveOHLCVBatch(ohlcvArray, callback) {
        if (!db || !ohlcvArray || ohlcvArray.length === 0) {
            return callback(new Error('Database not initialized or empty data'))
        }

        const stmt = db.prepare(`
            INSERT OR REPLACE INTO ohlcv (timestamp, open, high, low, close, volume)
            VALUES (?, ?, ?, ?, ?, ?)
        `)

        db.serialize(() => {
            db.run('BEGIN TRANSACTION')
            
            for (const ohlcv of ohlcvArray) {
                stmt.run([
                    ohlcv[0], // timestamp
                    ohlcv[1], // open
                    ohlcv[2], // high
                    ohlcv[3], // low
                    ohlcv[4], // close
                    ohlcv[5]  // volume
                ])
            }
            
            db.run('COMMIT', (err) => {
                stmt.finalize()
                if (err) return callback(err)
                callback(null, ohlcvArray.length)
            })
        })
    }

    function getOHLCVRange(startTimestamp, endTimestamp, callback) {
        if (!db) {
            return callback(new Error('Database not initialized'))
        }

        const query = `
            SELECT timestamp, open, high, low, close, volume
            FROM ohlcv
            WHERE timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC
        `

        db.all(query, [startTimestamp, endTimestamp], (err, rows) => {
            if (err) return callback(err)
            
            // Convert back to OHLCV array format
            const ohlcvArray = rows.map(row => [
                row.timestamp,
                row.open,
                row.high,
                row.low,
                row.close,
                row.volume
            ])
            
            callback(null, ohlcvArray)
        })
    }

    function getLastTimestamp(callback) {
        if (!db) {
            return callback(new Error('Database not initialized'))
        }

        const query = 'SELECT MAX(timestamp) as last_timestamp FROM ohlcv'
        
        db.get(query, (err, row) => {
            if (err) return callback(err)
            callback(null, row ? row.last_timestamp : null)
        })
    }

    function cleanup() {
        if (db) {
            db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message)
                } else {
                    console.log('Database connection closed')
                }
            })
            db = null
        }
    }
}

// Simple class for processing bots
class OptimizedDataStorage {
    constructor(exchangeName, symbol) {

        if (!sqlite3) {
            console.error('[OptimizedDataStorage] Cannot initialize: SQLite3 module not available')
            throw new Error('SQLite dependency does not exist')
        }
        
        this.exchangeName = exchangeName
        this.symbol = symbol
        this.db = null
        this.initialize()
    }

    initialize() {
        const dbDir = path.join(process.cwd(), 'Data', 'SQLite')
        const sanitizedSymbol = this.symbol.replace(/[^a-zA-Z0-9]/g, '_')
        const dbPath = path.join(dbDir, `${this.exchangeName}_${sanitizedSymbol}.db`)
        
        // Use better-sqlite3 style synchronous API if available, otherwise fallback
        try {
            const Database = require('better-sqlite3')
            this.db = new Database(dbPath)

        } catch (err) {
            // Fallback to regular sqlite3 but we need to handle it differently
            this.db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY)

        }
    }

    getRecordsByDateRange(startDate, endDate) {
        if (!this.db) return []
        
        const startTimestamp = startDate.valueOf()
        const endTimestamp = endDate.valueOf()
        
        const query = `
            SELECT timestamp, open, high, low, close, volume
            FROM ohlcv
            WHERE timestamp >= ? AND timestamp <= ?
            ORDER BY timestamp ASC
        `
        
        try {
            const rows = this.db.prepare(query).all(startTimestamp, endTimestamp)
            return rows || []
        } catch (err) {
            console.error('Error querying records:', err)
            return []
        }
    }

    getFirstRecord() {
        if (!this.db) {
            console.log('[OptimizedDataStorage] getFirstRecord: db not initialized')
            return null
        }
        
        try {
            // Check if this is better-sqlite3 (has prepare method that returns synchronous statement)
            if (this.db.prepare && typeof this.db.prepare('SELECT 1').get === 'function') {
                const row = this.db.prepare('SELECT MIN(timestamp) as timestamp FROM ohlcv').get()

                return row && row.timestamp ? row : null
            } else {
                // This is regular sqlite3, we need to use async methods but we can't in this context

                return null
            }
        } catch (err) {

            return null
        }
    }

    getLastRecord() {
        if (!this.db) return null
        
        try {
            const row = this.db.prepare('SELECT MAX(timestamp) as timestamp FROM ohlcv').get()
            return row && row.timestamp ? row : null
        } catch (err) {
            return null
        }
    }
}

// Export function first, then add class
exports.newDataMiningFunctionLibrariesOptimizedDataStorage = newDataMiningFunctionLibrariesOptimizedDataStorage
exports.OptimizedDataStorage = OptimizedDataStorage