const {app, Menu, BrowserWindow, ipcMain} = require('electron')

const path = require('path')
const fs = require('fs')
// To check for update on Github repo
const {autoUpdater} = require("electron-updater")
const { windowsStore } = require('process')

// Enable non contribution mode (test)
process.env.SA_MODE = 'gitDisable'
process.env.PACKAGED_PATH = app.getAppPath()
process.env.DATA_PATH = app.getPath('documents')

const WINDOW_WIDTH = null
const WINDOW_HEIGHT = null

let mainWindow, consoleWindow, platform

var app_ready = false
var server_ready = false

const port = 34248 // Default HTTP port

run()

//var platform = null

function run() {
  const { fork } = require('child_process')
  platform = fork(path.join(__dirname, '/PlatformRoot.js'), ["noBrowser"], {stdio: ['pipe', 'pipe', 'pipe', 'ipc'], env: process.env})

  //var consoleOutput = ""

  platform.on('message', _ => {
    open()
  })
}

ipcMain.on("toMain", (event, args) => {
  platform.stdout.setEncoding('utf8')
  platform.stdout.on('data', (data) => {
    //data = data.toString()
    //consoleOutput += data
    consoleWindow.webContents.send("fromMain", data);
  })
})


function open () {
  let bw_options = {
    width: WINDOW_WIDTH ? WINDOW_WIDTH : 1280,
    height: WINDOW_HEIGHT ? WINDOW_HEIGHT : 768,
    resizable: true,
    webPreferences: {
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
    }
  }

  mainWindow = new BrowserWindow(
    bw_options
  )

  //mainWindow.setResizable(true)
  
  mainWindow.loadURL("http://localhost:" + port)

  // w.webContents.openDevTools()

  mainWindow.on('closed', function () {
    mainWindow = null
  })
}

function openConsoleWindow() {
  createConsoleMenus()
  if(consoleWindow) {
    consoleWindow.focus()
    return
  }

  newWindow = 
  consoleWindow = new BrowserWindow({
    resizable: true,
    title: 'Platform Logs',
    minimizable: false,
    fullscreenable: false,
    width: 1024,
    webPreferences: {
      devTools: true,
      nodeIntegration: false, // is default value after Electron v5
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, "preload.js") // use a preload script
    }
  })

  consoleWindow.setBackgroundColor('#000000')
  consoleWindow.loadFile('./console.html')

  /* consoleWindow.on('ready'), _ => {
    platform.stdout.setEncoding('utf8')
    platform.stdout.on('data', (data) => {
      //data = data.toString()
      //consoleOutput += data
      consoleWindow.webContents.send("fromMain", data);
    })
  } */

  consoleWindow.on('closed', function() {
    consoleWindow = null
  })
}

app.on('ready', function () {
  app_ready = true
  autoUpdater.checkForUpdatesAndNotify();
  createMainMenus()
  if (server_ready) open()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

function createMainMenus () {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Open in Browser...',
          click () {
            require('electron').shell.openExternal('http://localhost:' + port)
          }
        },
        {
          type: 'separator'
        },
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    },
    {
      label: 'Logs',
      click () {
        openConsoleWindow()
      }
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function createConsoleMenus () {
  const template = [
    {
      label: 'File',
      submenu: [
        {
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'},
        {role: 'delete'},
        {role: 'selectall'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {role: 'reload'},
        {role: 'forcereload'},
        {role: 'toggledevtools'},
        {type: 'separator'},
        {role: 'resetzoom'},
        {role: 'zoomin'},
        {role: 'zoomout'},
        {type: 'separator'},
        {role: 'togglefullscreen'}
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}