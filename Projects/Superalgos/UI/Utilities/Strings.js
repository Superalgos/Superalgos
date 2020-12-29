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

        /* Check that there are not invalid symbols */
        let result = /^[A-Za-z0-9.]+$/.test(text)
        if (result === false) { return false }

        /* Check that first char is a letter in lower case*/
        result = /^[a-z]+$/.test(text[0])
        if (result === false) { return false }

        let upperCaseDetected = false
        let numbersDetected = false
        let dotsDetected = false
        for (let i = 1; i < text.length; i++) {
            let character = text[i]

            result = /^[0-9]+$/.test(character)
            if (result === true) {
                numbersDetected = true
                if (text[i - 1] === '.') { return false }
            }

            result = /^[A-Z]+$/.test(character)
            if (result === true) { 
                upperCaseDetected = true 
                if (text[i - 1] === '.') { return false }
            }

            if (character === '.') { dotsDetected = true }

        }
        /* Check that there is at lest one upper case before numbers or dots */
        if (upperCaseDetected === false) {
            return false
        }
        return true
    }
}