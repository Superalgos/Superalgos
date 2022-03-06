const child_process = require('child_process')
const os = require('os')
const systemCheck = require('../../Launch-Scripts/systemCheck')

// FYI the mock below must be repeated as done in the 'it' blocks for each
// use case. jest mocks do not allow reference to out of scope anything so 
// we can't re-use one function on top unfortunately
jest.mock('child_process', () => {
  return {
    execSync: jest.fn((command) => {
      const env = require('../../Environment').newEnvironment()
      if (command === 'npm -v') {
        return `${env.NPM_NEEDED_VERSION}.0.0`
      }
      if (command === 'node -v') {
        return `v${env.NODE_NEEDED_VERSION}.0.0`
      }
      if (command === 'git --version') {
        return `git version ${env.GIT_NEEDED_VERSION}.0.0`
      }
      if (command == 'echo %PATH%') {
        return 'System32'
      }
    })
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('systemCheck()', () => {
  it('should exit if npm version is less than needed version', () => {
    const env = require('../../Environment').newEnvironment()
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})
    child_process.execSync.mockImplementation((command) => {
      if (command === 'npm -v') {
        return '1.0.0'
      }
      if (command === 'node -v') {
        return `v${env.NODE_NEEDED_VERSION}.0.0`
      }
      if (command === 'git --version') {
        return `git version ${env.GIT_NEEDED_VERSION}.0.0`
      }
    })

    systemCheck()
    expect(mockExit).toHaveBeenCalledWith()
  })
  it('should exit if the node version is less than needed version', () => {
    const env = require('../../Environment').newEnvironment()
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})

    child_process.execSync.mockImplementation((command) => {
      if (command === 'node -v') {
        return 'v1.0.0'
      }
      if (command === 'npm -v') {
        return `${env.NPM_NEEDED_VERSION}.0.0`
      }
      if (command === 'git --version') {
        return `git version ${env.GIT_NEEDED_VERSION}.0.0`
      }
    })

    systemCheck()
    expect(mockExit).toHaveBeenCalledWith()
  })
  it('should exit if the git version is less then needed version', () => {
    const env = require('../../Environment').newEnvironment()
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})

    child_process.execSync.mockImplementation((command) => {
      if (command === 'npm -v') {
        return `${env.NPM_NEEDED_VERSION}.0.0`
      }
      if (command === 'node -v') {
        return `v${env.NODE_NEEDED_VERSION}.0.0`
      }
      if (command === 'git --version') {
        return `git version 1.0.0`
      }
    })

    systemCheck()
    expect(mockExit).toHaveBeenCalledWith()
  })
  it('should exit if System32 is not in the path for windows sytems', () => {
    const env = require('../../Environment').newEnvironment()
    const mockOs = jest.spyOn(os, 'platform').mockReturnValueOnce('win32')
    const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {})

    child_process.execSync.mockImplementation((command) => {
      if (command === 'npm -v') {
        return `${env.NPM_NEEDED_VERSION}.0.0`
      }
      if (command === 'node -v') {
        return `v${env.NODE_NEEDED_VERSION}.0.0`
      }
      if (command === 'git --version') {
        return `git version ${env.GIT_NEEDED_VERSION}.0.0`
      }
      if (command === 'echo %PATH%') {
        return 'darwin'
      }
    })

    systemCheck()
    expect(mockExit).toHaveBeenCalledWith()        
  })
})
