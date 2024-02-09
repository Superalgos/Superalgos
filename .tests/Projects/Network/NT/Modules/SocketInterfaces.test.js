const socketInterfaces = require('../../../../../Projects/Network/NT/Modules/SocketInterfaces')

const userProfileHandle = 'profileHandle'

const setup = (userProfilesMapFn) => {
    global.SA = {
        logger: {
            info: (x) => console.log(x),
            error: (x) => console.error(x)
        },
        nodeModules: {
            web3: jest.fn().mockImplementation(() => ({
                eth: {
                    accounts: {
                        sign: jest.fn((x,y) => x + y),
                        recover: jest.fn(x => x),
                        hashMessage: jest.fn(x => JSON.parse(x).callerProfileHandle)
                    }
                }
            }))
        },
        projects: {
            network: {
                globals: {
                    memory: {
                        maps: {
                            PERMISSIONS_GRANTED_BY_USER_PRFILE_ID: {
                                get: jest.fn(x => x)
                            },
                            USER_PROFILES_BY_BLOKCHAIN_ACCOUNT: {
                                get: userProfilesMapFn
                            }
                        }
                    }
                }
            },
            governance: {
                utilities: {
                    balances: {
                        toSABalanceString: jest.fn(x => x)
                    }
                }
            },
            foundations: {
                utilities: {
                    asyncFunctions: {
                        sleep: jest.fn(x => new Promise(req => setTimeout(req, 100)))
                    }
                }
            }
        },
        secrets: {
            signingAccountSecrets: {
                map: {
                    get: (key) => ({
                        userProfileHandle: userProfileHandle,
                        privateKey: key
                    })
                }
            }
        }
    }
    global.env = {
        P2P_NETWORK_NODE_MAX_INCOMING_CLIENTS: 2,
        P2P_NETWORK_NODE_MAX_INCOMING_PEERS: 2,
        P2P_NETWORK_NODE_SIGNING_ACCOUNT: 'abc'
    }
    global.NT = {
        networkApp: {
            socialGraphNetworkService: {
                clientInterface: {
                    messageReceived: jest.fn((x,y,z) => ({
                        boradcastTo: 'abc',
                        messageId: undefined
                    }))
                },
                peerInterface: {
                    messageReceived: jest.fn((x,y,z) => ({
                        boradcastTo: 'abc',
                        messageId: undefined
                    }))
                }
            },
            machineLearningNetworkService: {
                clientInterface: {
                    messageReceived: jest.fn((x,y,z) => ({
                        boradcastTo: 'abc',
                        messageId: undefined
                    }))
                }
            },
            p2pNetworkNode: {
                userProfile: {
                    config: {
                        codeName: 'codeName'
                    }
                },
                node: {
                    config: {
                        codeName: 'codeName',
                        clientMinimunBalance: 0
                    },
                    p2pNetworkReference: {
                        referenceParent: {
                            type: 'general'
                        }
                    }
                }
            },
            p2pNetworkNodesConnectedTo: {
                peers: []
            }
        }
    }
}

const tearDown = () => {
    global.SA = undefined
    global.NT = undefined
}

const signatureMessage = (name, timestamp) => JSON.stringify({
    callerProfileHandle: name,
    calledProfileHandle: userProfileHandle,
    calledTimestamp: timestamp
})

const userSignature = (name, timestamp) => JSON.stringify({message: signatureMessage(name, timestamp), messageHash: name})

const caller = (id) => ({
    role: 'Network Client',
    socket: {
        id,
        send: jest.fn(),
        close: jest.fn()
    }
})

const userProfileFactory = (balance, name) => ({
    id: name,
    balance,
    ranking: balance,
    config: {
        codeName: name,
        signature: {
            message: name
        }
    }
})

const userOne   = {name: 'abc', balance: 1}
const userTwo   = {name: 'def', balance: 2}
const userThree = {name: 'ghi', balance: 3}

describe('Testing addCaller queue ordering', () => {
    let socketInterfaceModule;

    afterEach(() => {
        if(socketInterfaceModule !== undefined) {
            socketInterfaceModule.finalize()
            socketInterfaceModule = undefined
        }
        tearDown()
    })

    it('should add a single user to networkClients list', async () => {
        setup(jest.fn().mockReturnValueOnce(userProfileFactory(userOne.balance, userOne.name)))

        socketInterfaceModule = socketInterfaces.newNetworkModulesSocketInterfaces()
        socketInterfaceModule.initialize()
        const timestamp = Date.now().valueOf()

        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userOne.name, timestamp)
        }), caller(userOne.balance), timestamp)
        expect(socketInterfaceModule.networkClients.length).toBe(1)
        expect(socketInterfaceModule.networkClients[0].userProfile.id).toBe(userOne.name)
    })

    it('should add a multiple asc ordered users to networkClients list in desc order', async () => {
        setup(
            jest.fn()
                .mockReturnValueOnce(userProfileFactory(userOne.balance, userOne.name))
                .mockReturnValueOnce(userProfileFactory(userTwo.balance, userTwo.name))
                .mockReturnValueOnce(userProfileFactory(userThree.balance, userThree.name)))

        socketInterfaceModule = socketInterfaces.newNetworkModulesSocketInterfaces()
        socketInterfaceModule.initialize()
        const timestamp = Date.now().valueOf()

        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userOne.name, timestamp)
        }), caller(userOne.balance), timestamp)
        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userTwo.name, timestamp)
        }), caller(userTwo.balance), timestamp)
        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userThree.name, timestamp)
        }), caller(userThree.balance), timestamp)
        expect(socketInterfaceModule.networkClients.length).toBe(3)
        expect(socketInterfaceModule.networkClients[0].userProfile.id).toBe(userOne.name)
        expect(socketInterfaceModule.networkClients[1].userProfile.id).toBe(userTwo.name)
        expect(socketInterfaceModule.networkClients[2].userProfile.id).toBe(userThree.name)
    })

    it('should add a multiple desc ordered users to networkClients list in desc order', async () => {
        setup(
            jest.fn()
                .mockReturnValueOnce(userProfileFactory(userThree.balance, userThree.name))
                .mockReturnValueOnce(userProfileFactory(userTwo.balance, userTwo.name))
                .mockReturnValueOnce(userProfileFactory(userOne.balance, userOne.name)))

        socketInterfaceModule = socketInterfaces.newNetworkModulesSocketInterfaces()
        socketInterfaceModule.initialize()
        const timestamp = Date.now().valueOf()

        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userThree.name, timestamp)
        }), caller(userThree.balance), timestamp)
        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userTwo.name, timestamp)
        }), caller(userTwo.balance), timestamp)
        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userOne.name, timestamp)
        }), caller(userOne.balance), timestamp)
        expect(socketInterfaceModule.networkClients.length).toBe(3)
        expect(socketInterfaceModule.networkClients[0].userProfile.id).toBe(userOne.name)
        expect(socketInterfaceModule.networkClients[1].userProfile.id).toBe(userTwo.name)
        expect(socketInterfaceModule.networkClients[2].userProfile.id).toBe(userThree.name)
    })

    it('should add a multiple random ordered users to networkClients list in desc order', async () => {
        setup(
            jest.fn()
                .mockReturnValueOnce(userProfileFactory(userTwo.balance, userTwo.name))
                .mockReturnValueOnce(userProfileFactory(userOne.balance, userOne.name))
                .mockReturnValueOnce(userProfileFactory(userThree.balance, userThree.name)))

        socketInterfaceModule = socketInterfaces.newNetworkModulesSocketInterfaces()
        socketInterfaceModule.initialize()
        const timestamp = Date.now().valueOf()

        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userTwo.name, timestamp)
        }), caller(userTwo.balance), timestamp)
        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userOne.name, timestamp)
        }), caller(userOne.balance), timestamp)
        await socketInterfaceModule.onMessage(JSON.stringify({
            step: 'Two',
            messageType: 'Handshake',
            callerRole: '',
            signature: userSignature(userThree.name, timestamp)
        }), caller(userThree.balance), timestamp)
        expect(socketInterfaceModule.networkClients.length).toBe(3)
        expect(socketInterfaceModule.networkClients[0].userProfile.id).toBe(userOne.name)
        expect(socketInterfaceModule.networkClients[1].userProfile.id).toBe(userTwo.name)
        expect(socketInterfaceModule.networkClients[2].userProfile.id).toBe(userThree.name)
    })
})