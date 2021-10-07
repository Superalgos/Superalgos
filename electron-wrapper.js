const {app, Menu, BrowserWindow} = require('electron')

const path = require('path')
const fs = require('fs')

const WINDOW_WIDTH = null
const WINDOW_HEIGHT = null

var w

var app_ready = false
var server_ready = false

const port = 34248 // Default HTTP port

/* To check if the folders where user data do exist. If not, create them */
function userData() {
  const dataStorage = path.join(process.cwd(), '/Platform/My-Data-Storage')
  const logFiles = path.join(process.cwd(), '/Platform/My-Log-Files')
  const workspace = path.join(process.cwd(), '/Platform/My-Workspaces')

  if (!fs.existsSync(dataStorage)) {
      fs.mkdirSync(dataStorage)
  }

  if (!fs.existsSync(logFiles)) {
      fs.mkdirSync(logFiles)
  }

  if (!fs.existsSync(workspace)) {
      fs.mkdirSync(workspace)
  }
}
run()

function run() {
  userData()
  const { fork } = require('child_process')
  fork(path.join(__dirname, './PlatformRoot.js'), {
    execArgv: ['noBrowser']
  })

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
  create_menus()
  if (server_ready) open()
})

app.on('window-all-closed', function () {
  app.quit()
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