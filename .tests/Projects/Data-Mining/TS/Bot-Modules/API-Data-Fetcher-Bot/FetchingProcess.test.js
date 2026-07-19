const {
    buildHeaderOptions
} = require('../../../../../../Projects/Data-Mining/TS/Bot-Modules/API-Data-Fetcher-Bot/FetchingProcess')

describe('buildHeaderOptions()', () => {
    const value = ['fixture', 'value'].join('-')

    it('returns an X-API-Key header for an API key', () => {
        expect(buildHeaderOptions({ api_key: value })).toEqual({
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'X-API-Key': value
            }
        })
    })

    it.each([undefined, null, {}, { api_key: '' }])(
        'does not add headers for empty credentials',
        (config) => {
            expect(buildHeaderOptions(config)).toEqual({})
        }
    )
})
