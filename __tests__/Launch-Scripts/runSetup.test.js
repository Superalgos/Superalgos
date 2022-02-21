const { 
    setUpstreamAndOrigin, 
    runSetup,
    testHttp
} = require('../../Launch-Scripts/runSetup')


describe('setUpstreamAndOrigin', () => {
    it('should return true', async () => {
      // expect(false).toEqual(false)
        expect(testHttp()).toEqual(false)
    })
})