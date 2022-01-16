exports.newDesktopFrontendRoot = function newDesktopFrontendRoot() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {

        run()

        async function run() {
            let app = require('./DesktopAppFrontend').newDesktopAppFrontend()
            await app.run()
            console.log('Superalgos Desktop Frontend App is Running!')
        }
    }
}