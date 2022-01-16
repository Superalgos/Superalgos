exports.newFoundationsGlobalsNodeJSConstants = function () {

    let thisObject = {
        REQUIRE_ROOT_DIR:  './',
        EXECUTION_DATETIME: new Date()
    }

    return thisObject
}