const https = require('https')
const nock = require('nock')
const simpleGit = require('simple-git')
const { 
  setUpstreamAndOrigin, 
  runSetup
} = require('../../Launch-Scripts/runSetup')

jest.mock('simple-git')
simpleGit.mockReturnValue({
  getRemotes: jest.fn()
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('setUpstreamAndOrigin', () => {
  it('should return true', async () => {
    // console.log(simpleGit)
    const resp = await setUpstreamAndOrigin('./')
    expect(resp).toEqual("ok")
  })
})