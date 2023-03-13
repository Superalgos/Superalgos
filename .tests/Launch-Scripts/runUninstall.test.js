const uninstall = require('../../Launch-Scripts/runUninstall')
const os = require('os')

jest.mock('child_process', () => {
  const os = require('os')
  const path = require('path')

  let cwd = __dirname
  let dirs = cwd.split(path.sep)
  let name = dirs[dirs.length - 1]
  let desktop = path.join(os.homedir(), "SocialTrading", `${name}.lnk`)
  let startMenu = path.join(os.homedir(), "AppData", "Roaming", "Microsoft", "Windows", "Start Menu", "Programs", `${name}.lnk`)
  
  return {
    // assuming exit code 0 is success
    exec: jest.fn((command) => {
      if (command === `del "${desktop}" & del "${startMenu}"`) {
        return 0
      }
      if (command === `rm ~/SocialTrading/${name}.command`) {
        return 0
      }
      if (command === `rm ~/SocialTrading/${name}.desktop & rm ~/.local/share/applications/${name}.desktop`) {
        return 0
      }
    })
  }
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('uninstall()', () => {
  it('should uninstall successfully on windows', () => {
    jest.spyOn(os, 'platform').mockReturnValue('win32')
    jest.spyOn(os, 'homedir').mockReturnValue('C:\\\\user\\username')

    expect(uninstall()).toEqual('Uninstall successful (Windows)')
  })
  it('should uninstall successfully on Ubuntu', () => {
    jest.spyOn(os, 'platform').mockReturnValue('linux')
    jest.spyOn(os, 'version').mockReturnValue('Ubuntu')

    expect(uninstall()).toEqual('Uninstall successful (Ubuntu)')
  })
  it('should warn user uninstall not supported on non-Ubuntu linux', () => {
    jest.spyOn(os, 'platform').mockReturnValue('linux')
    jest.spyOn(os, 'version').mockReturnValue('Fedora')

    expect(uninstall()).toEqual(
      'Uninstall not supported on non-Ubuntu Linux systems'
      )
  })
  it('shoud uninstall successfully on Mac', () => {
    jest.spyOn(os, 'platform').mockReturnValue('darwin')

    expect(uninstall()).toEqual('Uninstall successuful (MacOS)')
  })
})