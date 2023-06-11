/**
 * @typedef {{
 *   id: string,
 *   balance: number,
 *   name: string,
 *   updateAt: Date
 * }} UserItem
 */

exports.newUserBalanceRepository = function newUserBalanceRepository() {
    const thisObject = {
        TABLE_NAME: () => 'user-balances',
        intialize: intialize,
        saveItem: saveItem,
        saveAll: saveAll,
        deleteItem: deleteItem,
        deleteAll: deleteAll,
        findItem: findItem,
        findMany: findMany,
    }

    /**
     * @type {import('../Globals/DbContext').DbContext}
     */
    let thisDbContext = undefined
    const structure = {
        id: {
            name: 'id',
            type: 'VARCHAR (36)',
            params: ['PRIMARY KEY']
        },
        name: {
            name: 'name',
            type: 'VARCHAR (255)',
            params: ['NOT NULL']
        },
        balance: {
            name: 'balance',
            type: 'BIGINT',
            params: ['NOT NULL']
        },
        updateAt: {
            name: 'updated_at',
            type: 'TIMESTAMP',
            params: ['NOT NULL']
        }
    }

    return thisObject

    async function intialize(dbContext) {
        thisDbContext = dbContext
        await createTable()
    }

    async function createTable() {
        const columns = Object.keys(structure)
            .map(key => `${structure[key].name} ${structure[key].type} ${structure[key].params.join(' ')}`)
            .join(',')
        const query = `CREATE TABLE [IF NOT EXISTS] ${thisObject.TABLE_NAME()} (${columns});`
        await thisDbContext.execute(query)
    }

    /**
     * @param {UserItem} item
     * @returns {Promise<string>} item ID
     */
    async function saveItem(item) {
        const query = `
        INSERT INTO ${thisObject.TABLE_NAME()}(${structure.id.name}, ${structure.name.name}, ${structure.balance.name}, ${structure.updateAt.name}) 
        VALUES (${item.id}, ${item.name}, ${item.balance}, ${item.updateAt})
        RETURNING ${structure.id.name}`
        return await thisDbContext.execute(query)
    }

    /**
     * @param {UserItem[]} items
     * @returns {Promise<string[]>} list of items IDs
     */
    async function saveAll(items) {
        const values = items.map(item => `(${item.id}, ${item.name}, ${item.balance}, ${item.updateAt})`).join(',')
        const query = `
        INSERT INTO ${thisObject.TABLE_NAME()}(${structure.id.name}, ${structure.name.name}, ${structure.balance.name}, ${structure.updateAt.name}) 
        VALUES ${values}
        RETURNING ${structure.id.name}`
        return await thisDbContext.execute(query)
    }

    async function deleteItem(item) {

    }

    async function deleteAll() {

    }

    async function findItem(item) {

    }

    async function findMany(items) {

    }

}