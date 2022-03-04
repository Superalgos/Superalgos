const https = require('https')
const nock = require('nock')
const simpleGit = require('simple-git')
const { 
  getRemotesResponse,
  branchLocalResponse,
  removeRemoteResponse
} = require('../../.mocks/simple-git')
const { 
  setUpstreamAndOrigin, 
  runSetup
} = require('../../Launch-Scripts/runSetup')

// ** VERY IMPORTANT NOTE **
// when your node module has a special character
// like '-' in it, you cannot mock it like this:
// jest.mock('simple-git', () => {
//  return { ..... }
// })
//
// THIS WILL NOT WORK and will break your tests, you must mock it as seen
// below
jest.mock('simple-git')
simpleGit.mockReturnValue({
  getRemotes: jest.fn(() => {
    return {
      catch: jest.fn(() => getRemotesResponse)
    }
  }),
  addRemote: jest.fn(() => {
    return 'done'
  }),
  branchLocal: jest.fn(() => {
    return {
      catch: jest.fn(() => branchLocalResponse)
    }
  }),
  checkout: jest.fn(() => {
    return {}
  }),
  removeRemote: jest.fn(() => {
    return {
      catch: jest.fn(() => removeRemoteResponse)
    }
  })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('setUpstreamAndOrigin', () => {
  it('should return success msg if github is setup correctly', async () => {
    const resp = await setUpstreamAndOrigin('./')
    expect(resp).toEqual('Set upstream and origin for github')
  })
})