const createShortcut = require('../../Launch-Scripts/createShortcut')
const os = require('os')

// ****** IMPORTANT NOTE ******
// unless strictly necessary, do not use mockReturnValueOnce and instead
// use mockReturnValue. otherwise when you are console.logging or calling it
// anywhere else and your test depends on it, the test will fail!!!

// base mock for happy path
jest.mock('child_process', () => {
  const path = require("path")

  let cwd = '/this/path'
  let dir = cwd.split(path.sep)
  let target = path.join('root/path', "launch-windows.bat")
  let icon = path.join('root/path', "superalgos.ico")
  let name = dir[dir.length - 2]
  return {
    // assuming exit code 0 is success
    execSync: jest.fn((command) => {
      if (command === `$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut("${dir}"); $S.TargetPath = "${target}"; $S.IconLocation = "${icon}"; $S.Save()`) {
        return 0
      }
      if (command === `cp ${name}.desktop ~/Social-Trading/${name}.desktop & cp ${name}.desktop ~/.local/share/applications/${name}.desktop`) {
        return 0
      }
      if (command === `chmod +x ${name}.command & cp ${name}.command ~/Social-Trading/${name}.command`) {
        return 0
      }
      if (command === `npm install -g fileicon`) {
        return 0
      }
      if (command === `./node_modules/fileicon/bin/fileicon set ~/Social-Trading/${name}.command ./Launch-Scripts/superalgos.ico`) {
        return 0
      }
      if (command === `npm uninstall -g fileicon`) {
        return 0
      }
    })
  }
})

jest.createMockFromModule('fs')

afterEach(() => {
  jest.clearAllMocks()
})

describe('createShortcut()', () => {
  it('should create a new shortcut for windows system', () => {
    jest.spyOn(os, 'platform').mockReturnValue('win32')
    jest.spyOn(os, 'version').mockReturnValue('10')

    expect(createShortcut()).toEqual(
      "Shortcuts created for windows system"
    )
  })
  it('should warn shortcuts not supported on non-ubuntu linux', () => {
    jest.spyOn(os, 'platform').mockReturnValue('linux')
    jest.spyOn(os, 'version').mockReturnValue('Fedora')

    expect(createShortcut()).toEqual(
      'Linux shortcuts supported for Ubuntu only'
      )
  })
  it('should create shortcuts for ubuntu system', () => {
    jest.spyOn(os, 'platform').mockReturnValue('linux')
    jest.spyOn(os, 'version').mockReturnValue('Ubuntu') 

    expect(createShortcut()).toEqual(
      "Shortcuts created for Ubuntu"
      )
  })
  it('should create shortcuts and run all commands on darwin', () => {
    jest.spyOn(os, 'platform').mockReturnValue('darwin')

    expect(createShortcut()).toEqual(
      "Shortcuts created for Mac"
    )
  })
  it('should warn shortcuts not supported on non-darwin, non-linux, non-win32', () => {
    jest.spyOn(os, 'platform').mockReturnValue('windows95')
    jest.spyOn(os, 'version').mockReturnValue('95')

    expect(createShortcut()).toEqual(
      'Shortcuts not supported on your system'
    )
  })
})
