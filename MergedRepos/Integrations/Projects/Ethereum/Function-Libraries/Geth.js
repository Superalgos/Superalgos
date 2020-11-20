function newGeth() {
    thisObject = {
        install: install,
        run: run,
        stop: stop 
    }

    return thisObject

    function install(node) {
        callWebServer('ExecuteTerminalCommand/dir')
    }

    function run(node) {

    }

    function stop(node) {

    }
}
