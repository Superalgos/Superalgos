exports.newDataMiningFunctionLibrariesDatabaseAccess = function () {
    const sqlite3 = require('sqlite3').verbose() 

    let thisObject = {
        firstCallToSQLiteDB: firstCallToSQLiteDB,
        callToSQLiteDB: callToSQLiteDB
    }

  
    return thisObject
  
    async function firstCallToSQLiteDB(dbPath, dbTableName, dbTimestamp, beginingOfMarket, callBack){
        // Function to load the whole database on first run
        const data_1 = await new Promise((resolve, reject) => {
            // Create connection to database
            const database = new sqlite3.Database(
                dbPath,
                sqlite3.OPEN_READWRITE,
                (error) => {
                    if (error) {
                        console.error("Error connecting to database", error.message)
                        reject(error)
                    }
                    // TODO: Make comments formated correctly 
                    console.log("Connected to database")
                }
            )

            // TODO: get query values from task node configs 
            database.serialize(() => {
                // Gather all Data from Table
                database.all(`SELECT * FROM ${dbTableName} WHERE ${dbTimestamp} >= ${beginingOfMarket.getTime()}`, (error_1, data) => {
                    console.log('Loading data from table')

                    if (error_1) {
                        console.error("Error executing query", error_1)
                        reject(error_1)
                        return
                    }

                    database.close((error_2) => {
                        if (error_2) {
                            console.error("Error closing connection", error_2.message)
                            reject(error_2)
                        } else {
                            resolve(data)
                        }
                    })
                })
            })
        })
        callBack(data_1)
    }

    async function callToSQLiteDB(dbPath, dbTableName, dbTimestamp, lastRun, callBack){
        // Function to get new database rows
        const data_1 = await new Promise((resolve, reject) => {
            // Create connection to database
            const database = new sqlite3.Database(
                dbPath,
                sqlite3.OPEN_READWRITE,
                (error) => {
                    if (error) {
                        console.error("Error connecting to database", error.message)
                        reject(error)
                    }
                    // TODO: Make comments formated correctly 
                    console.log("Connected to database")
                }
            )

            database.serialize(() => {
                // Gather Data based on second query from Table
                unixTimestamp = Date.parse(lastRun)
                database.all(`SELECT * FROM ${dbTableName} WHERE ${dbTimestamp} >= ${unixTimestamp}`, (error_1, data) => {
                    console.log('Loading new data from table')

                    if (error_1) {
                        console.error("Error executing query", error_1)
                        reject(error_1)
                        return
                    }

                    database.close((error_2) => {
                        if (error_2) {
                            console.error("Error closing connection", error_2.message)
                            reject(error_2)
                        } else {
                            resolve(data)
                        }
                    })
                })
            })
        })
        callBack(data_1)
    }
  }