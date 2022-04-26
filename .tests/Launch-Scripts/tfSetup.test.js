const tfSetup = require('../../Launch-Scripts/tfSetup')
const os = require('os')

jest.mock('os', () => {
  return {
    platform: jest.fn(() => 'win32')
  }
})

jest.mock('fs', () => {
  return {
    copyFile: jest.fn(() => 'true'),
    existsSync: jest.fn(() => true),
    readdirSync: jest.fn(() => {
      return {
        filter: jest.fn((dirent) => {
          return {
            map: jest.fn((dirent) => 'dirname')
          }
        })
      }
    })
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('tfSetup()', () => {
  it('should copy tensorflow.dll for windows sytems', () => {
    expect(tfSetup()).toEqual('tensorflow dll copied')
  })
  it('should do nothing if not windows system', () => {
    jest.spyOn(os, 'platform').mockReturnValue('linux')

    expect(tfSetup()).toEqual('non-windows system')
  })
})