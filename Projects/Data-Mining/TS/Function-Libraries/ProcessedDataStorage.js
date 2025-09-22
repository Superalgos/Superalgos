let sqlite3

try {
    sqlite3 = require('sqlite3').verbose()
} catch (err) {
    console.error('[ProcessedDataStorage] Failed to load sqlite3 module:', err.message)
}

const path = require('path')
const fs = require('fs')

class ProcessedDataStorage {
    constructor(exchangeName, symbol) {
        if (!sqlite3) {
            throw new Error('SQLite dependency does not exist')
        }
        
        this.exchangeName = exchangeName
        this.symbol = symbol
        this.db = null
        this.initialize()
    }

    initialize() {
        const dbDir = path.join(process.cwd(), 'Data', 'SQLite')
        if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true })
        }

        const sanitizedSymbol = this.symbol.replace(/[^a-zA-Z0-9]/g, '_')
        const dbPath = path.join(dbDir, `${this.exchangeName}_${sanitizedSymbol}_processed.db`)
        
        // Use better-sqlite3 if available, otherwise fallback to sqlite3
        try {
            const Database = require('better-sqlite3')
            this.db = new Database(dbPath)
        } catch (err) {
            this.db = new sqlite3.Database(dbPath)
        }
        
        this.createTables()
    }

    createTables() {
        // Create tables for each timeframe
        const timeframes = ['01-min', '02-min', '03-min', '04-min', '05-min', '10-min', '15-min', '20-min', '30-min', '45-min', '01-hs', '02-hs', '03-hs', '04-hs', '06-hs', '08-hs', '12-hs', '24-hs']
        
        timeframes.forEach(timeframe => {
            const tableName = `candles_${timeframe.replace('-', '_')}`
            const volumeTableName = `volumes_${timeframe.replace('-', '_')}`
            
            // Candles table
            const createCandlesTable = `
                CREATE TABLE IF NOT EXISTS ${tableName} (
                    timestamp INTEGER PRIMARY KEY,
                    open REAL NOT NULL,
                    high REAL NOT NULL,
                    low REAL NOT NULL,
                    close REAL NOT NULL,
                    begin_time INTEGER NOT NULL,
                    end_time INTEGER NOT NULL,
                    created_at INTEGER DEFAULT (strftime('%s', 'now'))
                )
            `
            
            // Volumes table
            const createVolumesTable = `
                CREATE TABLE IF NOT EXISTS ${volumeTableName} (
                    timestamp INTEGER PRIMARY KEY,
                    buy_volume REAL NOT NULL,
                    sell_volume REAL NOT NULL,
                    begin_time INTEGER NOT NULL,
                    end_time INTEGER NOT NULL,
                    created_at INTEGER DEFAULT (strftime('%s', 'now'))
                )
            `
            
            try {
                // Use appropriate method based on database type
                if (this.db.exec) {
                    // better-sqlite3
                    this.db.exec(createCandlesTable)
                    this.db.exec(createVolumesTable)
                } else {
                    // regular sqlite3
                    this.db.run(createCandlesTable)
                    this.db.run(createVolumesTable)
                }
            } catch (err) {
                console.error(`[ProcessedDataStorage] Error creating tables for ${timeframe}:`, err.message)
            }
        })
    }

    saveCandles(timeframe, candles) {
        if (!candles || candles.length === 0) {

            return 0
        }
        
        const tableName = `candles_${timeframe.replace('-', '_')}`

        
        if (this.db.transaction) {
            // better-sqlite3
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO ${tableName} (timestamp, open, high, low, close, begin_time, end_time)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `)
            
            const insertMany = this.db.transaction((candles) => {
                for (const candle of candles) {
                    stmt.run(
                        candle.begin,
                        candle.open,
                        candle.max,
                        candle.min,
                        candle.close,
                        candle.begin,
                        candle.end
                    )
                }
            })
            insertMany(candles)
        } else {
            // regular sqlite3
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION')
                
                const insertSQL = `INSERT OR REPLACE INTO ${tableName} (timestamp, open, high, low, close, begin_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?)`
                
                for (const candle of candles) {
                    this.db.run(insertSQL, [
                        candle.begin,
                        candle.open,
                        candle.max,
                        candle.min,
                        candle.close,
                        candle.begin,
                        candle.end
                    ])
                }
                
                this.db.run('COMMIT')
            })
        }

        return candles.length
    }

    saveVolumes(timeframe, volumes) {
        if (!volumes || volumes.length === 0) {

            return 0
        }
        
        const tableName = `volumes_${timeframe.replace('-', '_')}`

        
        if (this.db.transaction) {
            // better-sqlite3
            const stmt = this.db.prepare(`
                INSERT OR REPLACE INTO ${tableName} (timestamp, buy_volume, sell_volume, begin_time, end_time)
                VALUES (?, ?, ?, ?, ?)
            `)
            
            const insertMany = this.db.transaction((volumes) => {
                for (const volume of volumes) {
                    stmt.run(
                        volume.begin,
                        volume.buy,
                        volume.sell,
                        volume.begin,
                        volume.end
                    )
                }
            })
            insertMany(volumes)
        } else {
            // regular sqlite3
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION')
                
                const insertSQL = `INSERT OR REPLACE INTO ${tableName} (timestamp, buy_volume, sell_volume, begin_time, end_time) VALUES (?, ?, ?, ?, ?)`
                
                for (const volume of volumes) {
                    this.db.run(insertSQL, [
                        volume.begin,
                        volume.buy,
                        volume.sell,
                        volume.begin,
                        volume.end
                    ])
                }
                
                this.db.run('COMMIT')
            })
        }

        return volumes.length
    }

    getCandlesByDateRange(timeframe, startDate, endDate) {
        const tableName = `candles_${timeframe.replace('-', '_')}`
        const startTimestamp = startDate.valueOf()
        const endTimestamp = endDate.valueOf()
        
        // Check if table exists first
        try {
            const tableExists = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName)
            if (!tableExists) {
                return []
            }
        } catch (err) {
            return []
        }
        
        const query = `
            SELECT timestamp, open, high, low, close, begin_time, end_time
            FROM ${tableName}
            WHERE begin_time >= ? AND end_time <= ?
            ORDER BY begin_time ASC
        `
        
        try {
            if (this.db.prepare('SELECT 1').all) {
                // better-sqlite3
                const rows = this.db.prepare(query).all(startTimestamp, endTimestamp)
                return rows || []
            } else {
                // regular sqlite3
                const stmt = this.db.prepare(query)
                const rows = stmt.all(startTimestamp, endTimestamp)
                stmt.finalize()
                return rows || []
            }
        } catch (err) {
            return []
        }
    }

    getVolumesByDateRange(timeframe, startDate, endDate) {
        const tableName = `volumes_${timeframe.replace('-', '_')}`
        const startTimestamp = startDate.valueOf()
        const endTimestamp = endDate.valueOf()
        
        // Check if table exists first
        try {
            const tableExists = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(tableName)
            if (!tableExists) {
                return []
            }
        } catch (err) {
            return []
        }
        
        const query = `
            SELECT timestamp, buy_volume, sell_volume, begin_time, end_time
            FROM ${tableName}
            WHERE begin_time >= ? AND end_time <= ?
            ORDER BY begin_time ASC
        `
        
        try {
            if (this.db.prepare('SELECT 1').all) {
                // better-sqlite3
                const rows = this.db.prepare(query).all(startTimestamp, endTimestamp)
                return rows || []
            } else {
                // regular sqlite3
                const stmt = this.db.prepare(query)
                const rows = stmt.all(startTimestamp, endTimestamp)
                stmt.finalize()
                return rows || []
            }
        } catch (err) {
            return []
        }
    }

    getCandles(timeframe) {
        const tableName = `candles_${timeframe.replace('-', '_')}`
        const query = `SELECT * FROM ${tableName} ORDER BY begin_time ASC`
        
        try {
            if (this.db.prepare && this.db.prepare('SELECT 1').all) {
                // better-sqlite3
                const rows = this.db.prepare(query).all()
                return rows.map(row => ({
                    min: row.low,
                    max: row.high,
                    open: row.open,
                    close: row.close,
                    begin: row.begin_time,
                    end: row.end_time
                }))
            } else {
                // regular sqlite3 - return empty for now, needs async handling
                return []
            }
        } catch (err) {
            console.error('Error getting candles:', err)
            return []
        }
    }

    getVolumes(timeframe) {
        const tableName = `volumes_${timeframe.replace('-', '_')}`
        const query = `SELECT * FROM ${tableName} ORDER BY begin_time ASC`
        
        try {
            if (this.db.prepare && this.db.prepare('SELECT 1').all) {
                // better-sqlite3
                const rows = this.db.prepare(query).all()
                return rows.map(row => ({
                    buy: row.buy_volume,
                    sell: row.sell_volume,
                    begin: row.begin_time,
                    end: row.end_time
                }))
            } else {
                // regular sqlite3 - return empty for now, needs async handling
                return []
            }
        } catch (err) {
            console.error('Error getting volumes:', err)
            return []
        }
    }

    // Legacy compatibility - generate JSON on demand for downstream bots
    generateLegacyJSON(timeframe, startDate, endDate) {
        const candles = this.getCandlesByDateRange(timeframe, startDate, endDate)
        const volumes = this.getVolumesByDateRange(timeframe, startDate, endDate)
        
        // Convert to legacy JSON format
        const candlesJSON = candles.map(c => [c.low, c.high, c.open, c.close, c.begin_time, c.end_time])
        const volumesJSON = volumes.map(v => [v.buy_volume, v.sell_volume, v.begin_time, v.end_time])
        
        return {
            candles: candlesJSON,
            volumes: volumesJSON
        }
    }
}

module.exports = ProcessedDataStorage