

function detectOptimalStorage() {
    const dataDir = './data'
    try {
        const fs = require('fs')
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir, { recursive: true })
            const jsonFiles = files.filter(f => f.endsWith('.json')).length
            
            if (jsonFiles > 1000) {
                console.log('\n🚀 PERFORMANCE TIP: Large dataset detected (' + jsonFiles + ' JSON files)')
                console.log('   SQLite storage can provide 10-50x faster data operations')
                console.log('   Enable with: node platform sqlite')
                console.log('   Or set environment: DATA_STORAGE_TYPE=sqlite\n')
            }
        }
    } catch (e) {}
}

module.exports = {
    dataStorage: {
        type: process.argv.includes('sqlite') ? 'sqlite' : (process.env.DATA_STORAGE_TYPE || 'json'), // 'json' | 'sqlite'
        sqlite: {
            path: process.env.SQLITE_PATH || './data',
            enableWAL: process.env.SQLITE_WAL === 'true',
            enableOptimizations: process.env.SQLITE_OPTIMIZATIONS !== 'false'
        },
        json: {
            path: process.env.JSON_PATH || './data'
        }
    },
    detectOptimalStorage,
    
    // Call this during app startup
    async init() {
        this.detectOptimalStorage()
        
        // Auto-migrate existing JSON data to SQLite if needed
        if (this.dataStorage.type === 'sqlite') {
            const DataMigration = require('../lib/DataMigration')
            const migration = new DataMigration(this)
            await migration.migrateToSQLite()
        }
        
        return this.dataStorage
    }
}