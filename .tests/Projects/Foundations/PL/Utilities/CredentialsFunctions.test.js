const project = 'Foundations'
const credentialsFunctions = require('../../../../../Projects/Foundations/PL/Utilities/CredentialsFunctions')

beforeEach(() => {
    global.SA = {
        nodeModules: {
            fs: {
                existsSync: undefined,
                readFileSync: undefined,
                writeFileSync: undefined
            },
            path: require('path')
        }
    }
    
    global.env = {
        PATH_TO_SECRETS: './'
    }
})

describe('loadExchangesCredentials()', () => {
    it('should find existing credentials and load into payload', () => {
        const codeName = 'testCode'
        const secret = 'testSecret'

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'exchange',
            key: codeName,
            value: secret
        }, {
            type: 'exchange',
            key: 'other',
            value: 'other'
        }, {
            type: 'github',
            key: codeName,
            value: secret
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'Crypto Ecosystem',
                cryptoExchanges: [{
                    exchanges: [{
                        exchangeAccounts: {
                            userAccounts: [{
                                userKeys: {
                                    keys: [{
                                        config: JSON.stringify({ codeName, secret: '' })
                                    }]
                                }
                            }]
                        }
                    }]
                }]
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().loadExchangesCredentials(payload)

        expect(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config)
        expect(resultConfig.codeName).toBe(codeName)
        expect(resultConfig.secret).toBe(secret)
    })
    it('should not update payload when credentials do not exist', () => {
        const codeName = 'testCode'
        const secret = 'testSecret'

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'exchange',
            key: 'other',
            value: 'other'
        }, {
            type: 'github',
            key: codeName,
            value: secret
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'Crypto Ecosystem',
                cryptoExchanges: [{
                    exchanges: [{
                        exchangeAccounts: {
                            userAccounts: [{
                                userKeys: {
                                    keys: [{
                                        config: JSON.stringify({ codeName, secret: '' })
                                    }]
                                }
                            }]
                        }
                    }]
                }]
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().loadExchangesCredentials(payload)

        expect(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config)
        expect(resultConfig.codeName).toBe(codeName)
        expect(resultConfig.secret).toBe('')
    })
    it('should not update payload when credentials do not exist and will create credentials file', () => {
        const codeName = 'testCode'

        SA.nodeModules.fs.existsSync = jest.fn((_) => false)
        SA.nodeModules.fs.writeFileSync = jest.fn()
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([]))

        const payload = {
            rootNodes: [{
                project,
                type: 'Crypto Ecosystem',
                cryptoExchanges: [{
                    exchanges: [{
                        exchangeAccounts: {
                            userAccounts: [{
                                userKeys: {
                                    keys: [{
                                        config: JSON.stringify({ codeName, secret: '' })
                                    }]
                                }
                            }]
                        }
                    }]
                }]
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().loadExchangesCredentials(payload)

        expect(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config)
        expect(resultConfig.codeName).toBe(codeName)
        expect(resultConfig.secret).toBe('')
        expect(SA.nodeModules.fs.writeFileSync.mock.calls.length).toBe(1)
    })
})

describe('loadGithubCredentials()', () => {
    it('should find existing credentials and load into payload', () => {
        const username = 'testCode'
        const secret = 'testSecret'

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'exchange',
            key: username,
            value: secret
        }, {
            type: 'exchange',
            key: 'other',
            value: 'other'
        }, {
            type: 'github',
            key: username,
            value: secret
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'APIs',
                githubAPI: {
                    config: JSON.stringify({ username, token: '' })
                }
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().loadGithubCredentials(payload)

        expect(result.rootNodes[0].githubAPI.config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].githubAPI.config)
        expect(resultConfig.username).toBe(username)
        expect(resultConfig.token).toBe(secret)
    })
    it('should not update payload when credentials do not exist', () => {
        const username = 'testCode'
        const secret = 'testSecret'

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'github',
            key: 'other',
            value: 'other'
        }, {
            type: 'exchange',
            key: username,
            value: secret
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'APIs',
                githubAPI: {
                    config: JSON.stringify({ username, token: '' })
                }
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().loadGithubCredentials(payload)

        expect(result.rootNodes[0].githubAPI.config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].githubAPI.config)
        expect(resultConfig.username).toBe(username)
        expect(resultConfig.token).toBe('')
    })
    it('should not update payload when credentials do not exist and will create credentials file', () => {
        const username = 'testCode'

        SA.nodeModules.fs.existsSync = jest.fn((_) => false)
        SA.nodeModules.fs.writeFileSync = jest.fn()
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([]))

        const payload = {
            rootNodes: [{
                project,
                type: 'APIs',
                githubAPI: {
                    config: JSON.stringify({ username, token: '' })
                }
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().loadGithubCredentials(payload)

        expect(result.rootNodes[0].githubAPI.config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].githubAPI.config)
        expect(resultConfig.username).toBe(username)
        expect(resultConfig.token).toBe('')
        expect(SA.nodeModules.fs.writeFileSync.mock.calls.length).toBe(1)
    })
})

describe('storeExchangesCredentials()', () => {
    it('should find existing credentials and update from payload', () => {
        const codeName = 'testCode'
        const secret = 'testSecret'

        let fileResult = []

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.writeFileSync = jest.fn((_, contents) => fileResult = JSON.parse(contents))
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'exchange',
            key: codeName,
            value: 'abc'
        }, {
            type: 'exchange',
            key: 'other',
            value: 'other'
        }, {
            type: 'github',
            key: codeName,
            value: secret
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'Crypto Ecosystem',
                cryptoExchanges: [{
                    exchanges: [{
                        exchangeAccounts: {
                            userAccounts: [{
                                userKeys: {
                                    keys: [{
                                        config: JSON.stringify({ codeName, secret })
                                    }]
                                }
                            }]
                        }
                    }]
                }]
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().storeExchangesCredentials(payload)

        expect(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config)
        expect(resultConfig.codeName).toBe(codeName)
        expect(resultConfig.secret).toBe('')
        expect(fileResult.length).toBe(3)
        expect(fileResult.filter(x => x.type == 'exchange' && x.key == codeName && x.value == secret).length).toBe(1)
    })
    it('should add credentials when credentials do not exist', () => {
        const codeName = 'testCode'
        const secret = 'testSecret'

        let fileResult = []

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.writeFileSync = jest.fn((_, contents) => fileResult = JSON.parse(contents))
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'exchange',
            key: 'other',
            value: 'other'
        }, {
            type: 'github',
            key: codeName,
            value: secret
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'Crypto Ecosystem',
                cryptoExchanges: [{
                    exchanges: [{
                        exchangeAccounts: {
                            userAccounts: [{
                                userKeys: {
                                    keys: [{
                                        config: JSON.stringify({ codeName, secret })
                                    }]
                                }
                            }]
                        }
                    }]
                }]
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().storeExchangesCredentials(payload)

        expect(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config)
        expect(resultConfig.codeName).toBe(codeName)
        expect(resultConfig.secret).toBe('')
        expect(fileResult.length).toBe(3)
        expect(fileResult.filter(x => x.type == 'exchange' && x.key == codeName && x.value == secret).length).toBe(1)
    })
    it('should add credentials when none do not exist and will create credentials file', () => {
        const codeName = 'testCode'
        const secret = 'testSecret'

        let fileResult = []

        SA.nodeModules.fs.existsSync = jest.fn((_) => false)
        SA.nodeModules.fs.writeFileSync = jest.fn((_, contents) => fileResult = JSON.parse(contents))
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([]))

        const payload = {
            rootNodes: [{
                project,
                type: 'Crypto Ecosystem',
                cryptoExchanges: [{
                    exchanges: [{
                        exchangeAccounts: {
                            userAccounts: [{
                                userKeys: {
                                    keys: [{
                                        config: JSON.stringify({ codeName, secret })
                                    }]
                                }
                            }]
                        }
                    }]
                }]
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().storeExchangesCredentials(payload)

        expect(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].cryptoExchanges[0].exchanges[0].exchangeAccounts.userAccounts[0].userKeys.keys[0].config)
        expect(resultConfig.codeName).toBe(codeName)
        expect(resultConfig.secret).toBe('')
        expect(SA.nodeModules.fs.writeFileSync.mock.calls.length).toBe(2)
        expect(fileResult.length).toBe(1)
        expect(fileResult.filter(x => x.type == 'exchange' && x.key == codeName && x.value == secret).length).toBe(1)
    })
})

describe('storeGithubCredentials()', () => {
    it('should find existing credentials and update from payload', () => {
        const username = 'testCode'
        const secret = 'testSecret'

        let fileResult = []

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.writeFileSync = jest.fn((_, contents) => fileResult = JSON.parse(contents))
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'exchange',
            key: username,
            value: secret
        }, {
            type: 'exchange',
            key: 'other',
            value: 'other'
        }, {
            type: 'github',
            key: username,
            value: 'abc'
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'APIs',
                githubAPI: {
                    config: JSON.stringify({ username, token: secret })
                }
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().storeGithubCredentials(payload)

        expect(result.rootNodes[0].githubAPI.config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].githubAPI.config)
        expect(resultConfig.username).toBe(username)
        expect(resultConfig.token).toBe('')
        expect(fileResult.length).toBe(3)
        expect(fileResult.filter(x => x.type == 'github' && x.key == username && x.value == secret).length).toBe(1)
    })
    it('should add credentials when credentials do not exist', () => {
        const username = 'testCode'
        const secret = 'testSecret'

        let fileResult = []

        SA.nodeModules.fs.existsSync = jest.fn((_) => true)
        SA.nodeModules.fs.writeFileSync = jest.fn((_, contents) => fileResult = JSON.parse(contents))
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([{
            type: 'github',
            key: 'other',
            value: 'other'
        }, {
            type: 'exchange',
            key: username,
            value: secret
        }]))

        const payload = {
            rootNodes: [{
                project,
                type: 'APIs',
                githubAPI: {
                    config: JSON.stringify({ username, token: secret })
                }
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().storeGithubCredentials(payload)

        expect(result.rootNodes[0].githubAPI.config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].githubAPI.config)
        expect(resultConfig.username).toBe(username)
        expect(resultConfig.token).toBe('')
        expect(fileResult.length).toBe(3)
        expect(fileResult.filter(x => x.type == 'github' && x.key == username && x.value == secret).length).toBe(1)
    })
    it('should add credentials when none do not exist and will create credentials file', () => {
        const username = 'testCode'
        const secret = 'testSecret'

        let fileResult = []

        SA.nodeModules.fs.existsSync = jest.fn((_) => false)
        SA.nodeModules.fs.writeFileSync = jest.fn((_, contents) => fileResult = JSON.parse(contents))
        SA.nodeModules.fs.readFileSync = jest.fn((_) => JSON.stringify([]))

        const payload = {
            rootNodes: [{
                project,
                type: 'APIs',
                githubAPI: {
                    config: JSON.stringify({ username, token: secret })
                }
            }]
        }

        const result = credentialsFunctions.newFoundationsUtilitiesCredentials().storeGithubCredentials(payload)

        expect(result.rootNodes[0].githubAPI.config).toBeDefined()
        const resultConfig = JSON.parse(result.rootNodes[0].githubAPI.config)
        expect(resultConfig.username).toBe(username)
        expect(resultConfig.token).toBe('')
        expect(SA.nodeModules.fs.writeFileSync.mock.calls.length).toBe(2)
        expect(fileResult.length).toBe(1)
        expect(fileResult.filter(x => x.type == 'github' && x.key == username && x.value == secret).length).toBe(1)
    })
})