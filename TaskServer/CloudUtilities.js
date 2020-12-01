
exports.newCloudUtilities = function newCloudUtilities() {

    const MODULE_NAME = "Cloud Utilities";

    let utilities = {
        pad: pad
    };

    return utilities;

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }
}
