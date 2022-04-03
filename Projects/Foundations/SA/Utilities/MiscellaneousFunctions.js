exports.newFoundationsUtilitiesMiscellaneousFunctions = function () {

    let thisObject = {
        genereteUniqueId: genereteUniqueId,
        pad: pad
    }

    return thisObject

    function genereteUniqueId() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8)
            return v.toString(16)
        })
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }
}