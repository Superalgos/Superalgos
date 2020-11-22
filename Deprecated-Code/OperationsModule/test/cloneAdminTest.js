var assert = require('chai').assert
const axios = require('axios')
const { activeCloneList } = require('./activeCloneList')
require('dotenv').config()
var cloneList = activeCloneList("Poloniex")

describe('Admin clones Clones', function () {
	it('Remove clones', async function () {
		this.timeout(300000)
		var clones = await getClones()
		for (let clone of clones) {
			await removeClone(clone.id, clone.botName)
		}
		assert.isOk('everything', 'everything is ok')
	})
	// it('Add COSS Live Indicator Clones', async function () {
	// 	this.timeout(1000000)
	// 	var error
	// 	var clones = activeCloneList("Coss")
	// 	try {
	// 		for (let clone of clones) {
	// 			await createClone(clone)
	// 		}
	// 	} catch (err) {
	// 		console.log('Error: ' + err)
	// 		error = err
	// 	}
	// 	assert.equal(error, undefined)
	// })
	// it('Add POLONIEX Live Indicator Clones', async function () {
	// 	this.timeout(1000000)
	// 	var error
	// 	var clones = activeCloneList("Poloniex")
	// 	try {
	// 		for (let clone of clones) {
	// 			await createClone(clone)
	// 		}
	// 	} catch (err) {
	// 		console.log('Error: ' + err)
	// 		error = err
	// 	}
	// 	assert.equal(error, undefined)
	// })
	describe('Poloniex clones', function () {
		it('Add Charly', async function () {
			this.timeout(10000)
			await createClone(cloneList[0])
			await createClone(cloneList[1])
			assert.isOk('everything', 'everything is ok')
		})
		it('Add Bruce', async function () {
			this.timeout(10000)
			await createClone(cloneList[2])
			assert.isOk('everything', 'everything is ok')
		})
		it('Add Olivia', async function () {
			this.timeout(10000)
			await createClone(cloneList[3])
			await createClone(cloneList[4])
			assert.isOk('everything', 'everything is ok')
		})
		it('Add Tom', async function () {
			this.timeout(10000)
			await createClone(cloneList[5])
			await createClone(cloneList[6])
			assert.isOk('everything', 'everything is ok')
		})
		it('Add Chris', async function () {
			this.timeout(10000)
			await createClone(cloneList[7])
			await createClone(cloneList[8])
			assert.isOk('everything', 'everything is ok')
		})
		it('Add Paula', async function () {
			this.timeout(10000)
			await createClone(cloneList[9])
			await createClone(cloneList[10])
			assert.isOk('everything', 'everything is ok')
		})
		it('Add Gauss', async function () {
			this.timeout(6000)
			await createClone(cloneList[11])
			await createClone(cloneList[12])
			assert.isOk('everything', 'everything is ok')
		})
	})
})

async function getClones() {
	try {
		const clones = await axios({
			url: process.env.GATEWAY_ENDPOINT,
			method: 'post',
			data: {
				query: `
            query {
                operations_Clones(queryLogs: false) {
                    id
                    botName
                }
            }
            `,
			},
			headers: {
				authorization: 'Bearer ' + process.env.ACCESS_TOKEN
			}
		})

		console.log('getClones ok ')
		return clones.data.data.operations_Clones
	} catch (error) {
		console.log('getClones error: ' + error.response.data.errors[0])
		throw error
	}
}

async function removeClone(cloneId, botName) {
	try {
		await axios({
			url: process.env.GATEWAY_ENDPOINT,
			method: 'post',
			data: {
				query: `
              mutation ($id: ID!){
                operations_RemoveClone(
                  id: $id
                )
              }
              `,
				variables: {
					id: cloneId
				},
			},
			headers: {
				authorization: 'Bearer ' + process.env.ACCESS_TOKEN
			}
		})

		console.log('removeClone ok: ' + botName)
		return true
	} catch (error) {
		console.log('removeClone error: ' + error.response.data.errors[0])
		throw error
	}
}

async function createClone(clone) {
	try {
		const clones = await axios({
			url: process.env.GATEWAY_ENDPOINT,
			method: 'post',
			data: {
				query: `
              mutation ($clone: operations_CloneInput){
                operations_AddClone(
                    clone: $clone
                ) {
                  id
                  teamName
                  botName
                  processName
                }
              }
              `,
				variables: {
					clone: clone
				},
			},
			headers: {
				authorization: 'Bearer ' + process.env.ACCESS_TOKEN
			}
		})

		console.log('createClone id: ' + clones.data.data.operations_AddClone.id + ', botId: ' + clone.botId)
		return clones.data.data.operations_AddClone
	} catch (error) {
		console.log('createClone error: ' + error.response.data.errors[0])
		throw error
	}
}
