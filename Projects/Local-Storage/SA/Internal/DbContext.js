/**
 * @typedef {Object} ConnectionProperties
 * @property {string} database
 * @property {string} host
 * @property {string} password
 * @property {number} port
 * @property {string} user
 */

/**
 * @typedef {Object} DbContext
 * @property {(properties: ConnectionProperties) => void} intialize
 * @property {() => import('knex').knex.QueryBuilder} getTableContext
 * @property {() => void} finalize
 * @property {() => Promise<void>} migrate
 */

/**
 * @returns {DbContext}
 */
exports.newDbContext = function newDbContext() {
    thisObject = {
        intialize: intialize,
        getTableContext: getTableContext,
        finalize: finalize,
        migrate: migrate,
    }

    /** @type {import('knex').knex} */ 
    let db = undefined;

    return thisObject

    /**
     * Creates a connection pool to the database.
     * The Pool manages the client connections to allow for
     * multiple concurrent connections to the database.
     * 
     * @param {ConnectionProperties} properties 
     * @returns {void}
     */
    function intialize(properties) {
        if(db === undefined) {
            db = require('knex')({
                client: 'pg',
                connection: {
                    user: properties.user,
                    host: properties.host,
                    database: properties.database,
                    password: properties.password,
                    port: properties.port,
                }
            })
        }
    }

    /**
     * returns the databse context
     * 
     * @returns {import('knex').knex.QueryBuilder} 
     */
    function getTableContext(table) {
        if (db === undefined) {
            throw new Error("The Database has not been initialized, you query will not be executed")
        }
        return db(table)
    }

    /**
     * Closes the database connection so no more queries can be executed
     * 
     * @returns {void}
     */
    function finalize() {
        db = undefined
    }

    /**
     * Triggers any migrations to run on the database
     * 
     * @returns {Promise<void>}
     */
    async function migrate() {
        if (db === undefined) {
            throw new Error("The Database has not been initialized, you query will not be executed")
        }
        await db.migrate.latest()
    }
}