const { 
    setUpstreamAndOrigin, 
    runSetup
} = require('../../Launch-Scripts/runSetup')

describe('setUpstreamAndOrigin', () => {
    it('should return true', async () => {
        expect(runSetup()).toEqual(false)
    })
})