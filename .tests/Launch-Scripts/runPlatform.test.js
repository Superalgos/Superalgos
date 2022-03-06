const os = require('os')
const child_process = require('child_process')

const { 
  fatalErrorHelp, 
  runPlatform 
} = require('../../Launch-Scripts/runPlatform')

jest.mock('fs', () => {
  return {
    existsSync: jest.fn(() => true)
  }
})

jest.mock('child_process', () => {
  fork: jest.fn((dir, args, options) => false)
})

afterEach(() => {
  jest.clearAllMocks()
})

describe ('fatalErrorHelp()', () => {
  it('should return an error', () => {
    expect(fatalErrorHelp()).toEqual('fatal error help message displayed')
  })
})

describe('runPlatform()', () => {
  it('should catch errors when loading client file', () => {
    jest.spyOn(os, 'totalmem').mockReturnValue(8148832256)

    expect(runPlatform()).toEqual('client error')
  })
  it('should display help message when command line args like \'-h\'', () => {
    process.argv.push('-h')

    expect(runPlatform()).toEqual('help message has been displayed')
  })
})