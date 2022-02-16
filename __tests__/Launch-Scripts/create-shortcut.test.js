const createShortcut = require('../../Launch-Scripts/create-shortcut')
const child_process = require('child_process')
const os = require('os')

// base mock for happy path assuming windows system
// jest.mock('child_process', () => {
//     const path = require("path")

//     let cwd = __dirname
//     let dir = cwd.split(path.sep)
//     let target = path.join( __dirname, "launch-windows.bat")
//     let icon = path.join( __dirname, "superalgos.ico")
//     return {
//         execSync: jest.fn((command) => {
//             if (command === `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut("${dir}"); $S.TargetPath = "${target}"; $S.IconLocation = "${icon}"; $S.Save()`) {
//                 return true
//             }
//         })
//     }
// })

afterEach(() => {
    jest.clearAllMocks()
})

describe('createShortcut', () => {
    it('should create a new shortcut for windows system', () => {
        const spyWindows = jest.spyOn(os, 'platform').mockReturnValueOnce('win32')
        const spyWindows10 = jest.spyOn(os, 'version').mockReturnValueOnce('10')

        expect(createShortcut()).toEqual(
            "Shortcuts created for windows system"
        )
    })
    it.skip('should warn shortcuts not supported on non-ubuntu linux', () => {
        const spyLinux = jest.spyOn(os, 'platform').mockReturnValueOnce('linux')
        const spyFedora = jest.spyOn(os, 'version').mockReturnValueOnce('Fedora')

        expect(createShortcut()).toEqual(
            'Linux shortcuts supported for Ubuntu only'
            )
    })
    it.skip('should warn shortcuts not supported on non-darwin, non-linux, non-win32', () => {
        const spyOs = jest.spyOn(os, 'platform').mockReturnValueOnce('windows95')
        const spyWin95 = jest.spyOn(os, 'version').mockReturnValueOnce('95')

        expect(createShortcut()).toEqual(
            'Shortcuts not supported on your system'
        )
    })
    it.skip('should create shortcuts for ubuntu system', () => {
        const spyOs = jest.spyOn(os, 'platform').mockReturnValueOnce('linux')
        const spyUbuntu = jest.spyOn(os, 'version').mockReturnValueOnce('Ubuntu') 
        
        expect(createShortcut()).toEqual(false)
    })
})