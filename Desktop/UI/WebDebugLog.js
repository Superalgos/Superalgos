function newWebDebugLog() {
    try {
        let thisObject = {
            write: write,
            fileName: 'undefined'
        }

        return thisObject

        function write(pText) {
            console.log(spacePad(thisObject.fileName, 50) + ' : ' + pText)

            function spacePad(str, max) {
                str = str.toString()
                return str.length < max ? spacePad(' ' + str, max) : str
            }
        }
    } catch (err) {
        console.log(spacePad(MODULE_NAME, 50) + ' : ' + '[ERROR]  WebDebugLog --> err = ' + err.stack)
    }
}
