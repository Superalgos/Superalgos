function newSuperalgosUtilitiesStrings() {
    thisObject = {
        fromCamelCaseToUpperWithSpaces: fromCamelCaseToUpperWithSpaces,
        isCamelCase: isCamelCase
    }

    return thisObject

    function fromCamelCaseToUpperWithSpaces(text) {
        let result = text.replace(/([A-Z])/g, " $1");
        return result.charAt(0).toUpperCase() + result.slice(1);
    }

    function isCamelCase(text) {
        /*
        We are not only going to detect standard Camel Case, but also
        we will accept strings with numbers and dots, so that 
        object paths test positive.
        */
        const result = /^[A-Za-z0-9.]+$/.test(text)
        if (result === false) { return false }

        let character = text[0]
        if (character !== character.toLowerCase()) {
            return false
        }
        return true
    }
}