const createShortcut = require('../../Launch-Scripts/create-shortcut')
const child_process = require('child_process')
const os = require('os')

afterEach(() => {
    jest.clearAllMocks()
})

describe('createShortcut', () => {
    it('should create shortcut for windows system', () => {
        const mockOs = jest.spyOn(os, 'platform').mockReturnValueOnce('win32')
        expect(createShortcut()).toEqual(true)
    })
})