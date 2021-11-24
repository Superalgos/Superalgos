
class PlatformApp
{   servers = {}
    networkInterfaces = []
    global = ''
    run(servers, networkInterfaces, initialWorkspace, global)
    {
        this.servers = servers;
        this.networkInterfaces = networkInterfaces;
        this.global = global
        try {
            this.setupEvents();
            this.setupGlobals();
            this.setupServers();
            this.setupNetworkInterfaces(initialWorkspace);
            this.logMessage();
        }
        catch(err)
        {
            console.log('[ERROR] Platform App -> Error = ' + err.stack)
        }
    }
    logMessage()
    {
        console.log('')
        console.log("You are running Superalgos Beta 12")
        console.log('')
        console.log("What's new? These are the main new features in this version:")
        console.log('')
        console.log('Governance System ........................................... Automates the distribution of SA Tokens and allow users to vote on the direction of the project.')
        console.log('TensorFlow Integration ...................................... Allows creating and training ML models and use them in trading strategies.')
        console.log('')
        console.log("What's next? This is the current development pipeline:")
        console.log('')
        console.log('Superalgos P2P Network ...................................... Will allow algo-traders to share trading signals with Superalgos users consuming these signals via a mobile app.')
        console.log('Real-time Trading Signals ................................... Will allow users to emit trading signals and be rewarded with SA Tokens.')
        console.log('Superalgos Mobile ........................................... Will allow users to consume trading signals for free and autonomously execute trades from their mobile phones.')
        console.log('Ethereum Integration ........................................ Will allow mining data from an Ethereum network node, and bring it into the Superalgos workflow. [Looking for an Ethereum dev that would like to continue this line of development.]')

        console.log('')
    }
    setupEvents()
    {
        console.log('Binding Platform App events')
        process.on('uncaughtException', this.uncaughtException)
        process.on('unhandledRejection', this.unhandledRejection)
    }
    setupServers()
    {
        this.global.servers = {}
        console.log('SUPERALGOS PLATFORM CLIENT SERVERS:')
        console.log('')
        Object.keys(this.servers).forEach((key) => this.launchServer(key, this.servers[key]));
    }
    launchServer(key, klass)
    {
        this.global.servers[key] = klass
        klass.initialize()
        klass.run()
        this.paddedLog(this.global.servers[key].name, 'Started')
    }
    setupNetworkInterfaces(initialWorkspace)
    {
        console.log('')
        console.log('SUPERALGOS PLATFORM CLIENT INTERFACES:')
        console.log('')
        this.networkInterfaces.forEach((networkInterface) => {
            this.launchNetworkInterface(networkInterface, initialWorkspace);
        });
    }
    launchNetworkInterface(networkInterface, initialWorkspace)
    {
        networkInterface.initialize(initialWorkspace)
        this.paddedLog(networkInterface.name, `Listening at port ${networkInterface.port}`)
    }
    paddedLog(start, end)
    {
        start = `${start} `
        start = start.padEnd(61, '.')
        console.log(`${start} ${end}`)
    }
    setupGlobals()
    {
        /* Callbacks default responses. */
        global.DEFAULT_OK_RESPONSE = {
            result: "Ok",
            message: "Operation Succeeded"
        };

        global.DEFAULT_FAIL_RESPONSE = {
            result: "Fail",
            message: "Operation Failed"
        };

        global.DEFAULT_RETRY_RESPONSE = {
            result: 'Retry',
            message: 'Retry Later'
        }

        global.CUSTOM_OK_RESPONSE = {
            result: 'Ok, but check Message',
            message: 'Custom Message'
        }

        global.CUSTOM_FAIL_RESPONSE = {
            result: 'Fail Because',
            message: 'Custom Message'
        }
    }
    uncaughtException(err)
    {
        if (err.message && err.message.indexOf("EADDRINUSE") > 0) {
            console.log("The Superalgos Platform Client cannot be started. Reason: the port configured migth be being used by another application, or Superalgos Platform Client might be already running.")
            return
        }
        console.log('[ERROR] Platform App -> uncaughtException');
        console.log('[ERROR] Platform App -> uncaughtException -> err.message = ' + err.message)
        console.log('[ERROR] Platform App -> uncaughtException -> err.stack = ' + err.stack)
        console.log('[ERROR] Platform App -> uncaughtException -> err = ' + err)
        process.exit(1)
    }
    unhandledRejection(reason)
    {
        // Signal user that a necessary node module is missing
        if (reason.code == 'MODULE_NOT_FOUND') {
            console.log("[ERROR] Dependency library not found. Please try running the 'node setup' command and then restart the Superalgos Platform Client.")
            console.log('[ERROR] Platform App -> reason = ' + JSON.stringify(reason))
            process.exit(1)
        }
        console.log('[ERROR] Platform App -> unhandledRejection');
        console.log('[ERROR] Platform App -> unhandledRejection -> reason = ' + JSON.stringify(reason))
        console.log('[ERROR] Platform App -> unhandledRejection -> p = ' + JSON.stringify(p))
        process.exit(1)
    }
}
module.exports = PlatformApp;