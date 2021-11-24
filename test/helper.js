const Application = require('spectron').Application
const electronPath = require('electron')
const path = require('path')
const sinon = require('sinon')
const chaiAsPromised = require("chai-as-promised");
const sinonChai = require('sinon-chai')
const chai = require("chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);
require('chai/register-expect');

afterEach(async function() {
    Sinon.restore();
})

before(function() {

    global.Application = Application
    global.ElectronPath = electronPath
    global.env = {
        NETWORK_WEB_SOCKETS_INTERFACE_PORT: 1
    }
    global.Path = path
    global.Sinon = sinon
    global.startApp = function startApp()
    {
        this.app = new Application({
            path: ElectronPath,
            args: [Path.join(__dirname, '..')]
        })
        return this.app.start()
    }
    global.stopApp = async function stopApp()
    {
        if (this.app && this.app.isRunning()) {
            this.app.browserWindow.close();
            return this.app.stop();
        }
    }
})



