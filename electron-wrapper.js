const {app, Menu, BrowserWindow} = require('electron')

const path = require('path')
const fs = require('fs')
// To check for update on Github repo
const {autoUpdater} = require("electron-updater");

// Enable non contribution mode (test)
process.env.SA_MODE = 'gitDisable'
process.env.PACKAGED_PATH = app.getAppPath()

const WINDOW_WIDTH = null
const WINDOW_HEIGHT = null

var w

var app_ready = false
var server_ready = false

const port = 34248 // Default HTTP port

run()

function run() {
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    process.env.PORTABLE_USER_DOCUMENTS = app.getPath("documents")
  }  

  const { fork } = require('child_process')
  fork(path.join(__dirname, './PlatformRoot.js'), ["noBrowser"])

  server_ready = true
  if (app_ready) open()
}

function open () {
  let bw_options = {
    width: WINDOW_WIDTH ? WINDOW_WIDTH : 1280,
    height: WINDOW_HEIGHT ? WINDOW_HEIGHT : 720,
    resizable: true
  }

  w = new BrowserWindow(
    bw_options
  )

  w.setResizable(true)
  
  w.loadURL("http://localhost:" + port)

  // w.webContents.openDevTools()

  w.on('closed', function () {
    w = null
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
      label: app.getName(),
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