/* 
 * This is not added to the SA.nodeModules object as 
 * we don't want it being used anywhere else in the system 
 */
const { Pool } = require('pg')

/**
 * @typedef {{
 *   databse: string
 *   host: string,
 *   password: string,
 *   port: number
 *   user: string,
 * }} ConnectionProperties
 */

/**
 * @typedef {{
 *   intialize: {(properties: ConnectionProperties) => Promise<void>},
 *   execute: {(query: string) => Promise<any>},
 *   finalize: {() => Promise<void>},
 * }} DbContext
 */

/**
 * @returns {DbContext}
 */
exports.newDbContext = function newDbContext() {
    thisObject = {
        intialize: intialize,
        execute: execute,
        finalize: finalize,
    }

    /** @type Pool */ let pool = undefined;
    return thisObject

    /**
     * Creates a connection pool to the database.
     * The Pool manages the client connections to allow for
     * multiple concurrent connections to the database.
     * 
     * @param {ConnectionProperties} properties 
     * @returns {Promise<void>}
     */
    async function intialize(properties) {
        pool = new Pool({
            user: properties.user,
            host: properties.host,
            database: properties.databse,
            password: properties.password,
            port: properties.port,
        })
    }

    /**
     * Executes the given query returning the result object
     * 
     * @param {string} query
     * @returns {Promise<any>} 
     */
    async function execute(query) {
        if (pool === undefined) {
            throw new Error("The Database has not been initialized, you query will not be executed")
        }
        await pool.query(query)
    }

    /**
     * Closes the database connection so no more queries can be executed
     * 
     * @returns {Promise<void>}
     */
    async function finalize() {
        await pool.end().then(() => {
            pool = undefined
        })
    }
}