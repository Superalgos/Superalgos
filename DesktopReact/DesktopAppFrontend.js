exports.newDesktopAppFrontend = function newDesktopAppFrontend() {

    let thisObject = {
        run: run
    }

    return thisObject

    async function run() {

        await setupServices()

        async function setupServices() {

            let react = require('./frontend/scripts/start')
            let port = 33249;
            react.start(port); // todo get port from node config
            console.log(`react Interface ................................................ Listening at port ${port}`);

        }
    }
}
