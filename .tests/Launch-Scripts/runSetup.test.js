const nock = require('nock')
const simpleGit = require('simple-git')
const process = require('process')
const env = require('../../Environment').newEnvironment()
const externalScriptsURLs = env.EXTERNAL_SCRIPTS
const { 
  getRemotesResponse,
  branchLocalResponse,
  removeRemoteResponse
} = require('../../.mocks/simple-git')
const { 
  setUpstreamAndOrigin, 
  runSetup,
  installExternalScripts,
  errorResp
} = require('../../Launch-Scripts/runSetup')

// ****** VERY IMPORTANT NOTE *******
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

jest.mock('process', () => {
  return {
    cwd: jest.fn(() => './'),
    exit: jest.fn(() => 'there was an error')
  }
})

jest.mock('child_process', () => {
  return {
    exec: jest.fn((command, dir) => {
      if (command.includes('echo Results of install at')) {
        return 1
      } else {
        return 0
      }
    })
  }
})

for (let i = 0; i< externalScriptsURLs.length; i++) {
  nock(externalScriptsURLs[i])
    .get('')
    .reply(200, 'successfully mocked')
}

afterEach(() => {
  jest.clearAllMocks()
  nock.restore()
})

describe('errorResp()', () => {
  it('should exit if error caught', () => {
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
    errorResp('there was an error')
    
    expect(mockExit).toHaveBeenCalledWith()
  })
})
describe('setUpstreamAndOrigin()', () => {
  it('should return success msg if github is setup correctly', async () => {
    const resp = await setUpstreamAndOrigin('./')
  
    expect(resp).toEqual('Set upstream and origin for github')
  })
})
describe('installExternalScripts()', () => {
  // TODO: figure out how to properly mock createWriteStream
  it('should install all external scripts to disk', async () => {
    expect(installExternalScripts()).toEqual('External scripts installed')
  })
})
describe('runSetup()', () => {
  it('should return success message if setup completes properly', () => {
    expect(runSetup()).toEqual('Setup complete')
  })
})