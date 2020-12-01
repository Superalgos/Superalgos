
exports.newCloudUtilities = function newCloudUtilities() {

    const MODULE_NAME = "Cloud Utilities";

    let utilities = {
        pad: pad,
        calculatePresicion: calculatePresicion
    };

    return utilities;

    function calculatePresicion(number) {

        for (let i = -10; i <= 10; i++) {
            if (number < Math.pow(10, i)) {
                return Math.pow(10, i - 3);
            }
        }
    }

    function pad(str, max) {
        str = str.toString();
        return str.length < max ? pad("0" + str, max) : str;
    }
}
