function newGeth() {
    thisObject = {
        install: install,
        run: run,
        stop: stop 
    }

    return thisObject

    function install(node) {
        httpRequest('ExecuteTerminalCommand/dir')
    }

    function run(node) {

    }

    function stop(node) {

    }
}
