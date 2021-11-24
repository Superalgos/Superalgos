const {app, Menu, BrowserWindow} = require('electron')

const path = require('path')
const fs = require('fs')
// To check for update on Github repo
const {autoUpdater} = require("electron-updater")

// Enable non contribution mode (test)
process.env.SA_MODE = 'gitDisable'
process.env.PACKAGED_PATH = app.getAppPath()
process.env.DATA_PATH = app.getPath('documents')

const WINDOW_WIDTH = null
const WINDOW_HEIGHT = null

let window;

var app_ready = false
var server_ready = false

const port = 34248 // Default HTTP port

run()

function run() {
  const { fork } = require('child_process')
  const platform = fork(path.join(__dirname, '/PlatformRoot.js'), ["noBrowser"], {stdio: ['pipe', 'pipe', 'pipe', 'ipc'], env: process.env})
  platform.on('message', message => {
    if(message == "Running") {
      open()
    }
  })
}

function open () {
  let bw_options = {
    width: WINDOW_WIDTH ? WINDOW_WIDTH : 1280,
    height: WINDOW_HEIGHT ? WINDOW_HEIGHT : 768,
    resizable: true
  }

  app.window = new BrowserWindow(
      bw_options
  )

  app.window.setResizable(true)

  app.window.loadURL("http://localhost:" + port)

  // w.webContents.openDevTools()

  app.window.on('closed', function () {
    window = null
  })
}

app.on('ready', function () {
  app_ready = true
  autoUpdater.checkForUpdatesAndNotify();
  create_menus()
  if (server_ready) open()
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

function create_menus () {
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
        {role: 'pasteandmatchstyle'},
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
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}