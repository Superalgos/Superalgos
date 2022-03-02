const https = require('https')
const nock = require('nock')
const simpleGit = require('simple-git')
const { 
  setUpstreamAndOrigin, 
  runSetup
} = require('../../Launch-Scripts/runSetup')

jest.mock('simple-git', async () => {
  return {
    getRemotes: jest.fn((options) => {
      if (options) {
        return new Promise((resolve, reject) => {
          return resolve
        }
    )
  }
})

afterEach(() => {
  jest.clearAllMocks()
  nock.restore()
})

describe('setUpstreamAndOrigin', () => {
  it('should return true', async () => {
    // simpleGit.mockImplementation((options) => {
    //   console.log(options)
    // })
    const resp = await setUpstreamAndOrigin('./')
    expect(resp).toEqual("ok")
  })
})