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


    async function getRepository(name) {
        switch (name) {
            case 'UserBalances':
                const repo = require('../Repositories/UserBalanceRepository').newUserBalanceRepository(await getDbContext())
                await repo.initialize()
                return repo
            default:
                throw new Error('The database repository ' + name + ' is not implemented, why not create it yourself.')

        }
    }

    /**
     * 
     * @returns {Promise<import('../Internal/DbContext').DbContext>}
     */
    async function getDbContext() {
        if (privateDbContext === undefined) {
            privateDbContext = require('../Internal/DbContext').newDbContext()
            return await privateDbContext.intialize({
                databse: global.env.DATABASE.name,
                host: global.env.DATABASE.host,
                password: global.env.DATABASE.password,
                port: global.env.DATABASE.port,
                user: global.env.DATABASE.username,
            }).then(() => privateDbContext)
        }
        return privateDbContext
    }
}