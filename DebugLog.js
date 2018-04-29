
function newDebugLog() {

    let thisObject = {
        write: write,
        fileName: undefined
    }

    return thisObject;

    function write(pText) {

        console.log(thisObject.fileName + " : " + pText);
 
    }
}