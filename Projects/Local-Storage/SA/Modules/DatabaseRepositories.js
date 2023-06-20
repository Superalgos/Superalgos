/**
 * 
 * @returns {{
 *   getRepository: (name: string) => import('../Globals/Persistence').PersistenceModel
 * }}
 */
exports.newDatabaseRepositories = function newDatabaseRepositories() {
    const thisObject = {
        getRepository: getRepository
    }

    /**
     * This property should only be accessed using the getDbContext function 
     * as it will operate as a singleton for all the repositories and only be 
     * initialized when first required
     * 
     * @type {import('../Internal/DbContext').DbContext}
     */
    let privateDbContext = undefined

    return thisObject


    /**
     * 
     * @param {string} name 
     * @returns {Promise<void|import('../Globals/Persistence').PersistenceModel>}
     */
    async function getRepository(name) {
        SA.logger.info('Requesting access to ' + name + ' table')
        switch (name) {
            case 'migrate': 
                return await getDbContext().migrate()
            case 'users':
                const repo = require('../Repositories/UsersRepository').newUsersRepository(getDbContext())
                await repo.initialize()
                return repo
            default:
                throw new Error('The database repository ' + name + ' is not implemented, why not create it yourself.')

        }
    }

    /**
     * 
     * @returns {import('../Internal/DbContext').DbContext}
     */
    function getDbContext() {
        if (privateDbContext === undefined) {
            privateDbContext = require('../Internal/DbContext').newDbContext()
            const config = {
                database: global.env.DATABASE.database,
                host: global.env.DATABASE.host,
                password: global.env.DATABASE.password,
                port: global.env.DATABASE.port,
                user: global.env.DATABASE.user,
            }
            // SA.logger.debug('Connecting to DB with config: ' + JSON.stringify({
            //     host: config.host,
            //     port: config.port,
            //     user: config.user,
            //     password: 'xxxxxxxxxxxxx',
            //     database: config.database,
            // }))
            privateDbContext.intialize(config)
            SA.logger.info('Initialized DbContext')
        }
        return privateDbContext
    }
}