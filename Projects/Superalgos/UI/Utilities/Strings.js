function newSuperalgosUtilitiesStrings() {
    thisObject = {
        allWordsToUpper: allWordsToUpper, 
        fromCamelCaseToUpperWithSpaces: fromCamelCaseToUpperWithSpaces,
        isCamelCase: isCamelCase,
        replaceSpecialCharactersForSpaces: replaceSpecialCharactersForSpaces,
        cleanTextOfCommonWordEndings: cleanTextOfCommonWordEndings
    }

    return thisObject

    function allWordsToUpper(text) {
        let splittedText = text.split(' ')
        let result = ''
        for (let i = 0; i < splittedText.length; i++) {
            let word = splittedText[i]
            word = word.charAt(0).toUpperCase() + word.slice(1)
            result = result + ' ' + word
        }
        return result.trim()
    }

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

            if (character === '.') { 
                dotsDetected = true
                 if (text[i-1] !== undefined && text[i+1] !== undefined && text[i-1] !== '.' && text[i+1] !== '.'){
                     return true
                 }
            }

        }
        /* Check that there is at lest one upper case before numbers or dots */
        if (upperCaseDetected === false) {
            return false
        }
        return true
    }

    function replaceSpecialCharactersForSpaces(text) {
        let result = text
        result = result.replaceAll('. ', ' ')
        result = result.replaceAll(', ', ' ')
        result = result.replaceAll('- ', ' ')
        result = result.replaceAll('/ ', ' ')
        result = result.replaceAll('_ ', ' ')
        result = result.replaceAll(': ', ' ')
        result = result.replaceAll('; ', ' ')
        result = result.replaceAll('( ', ' ')
        result = result.replaceAll(') ', ' ')
        result = result.replaceAll('{ ', ' ')
        result = result.replaceAll('} ', ' ')
        result = result.replaceAll('[ ', ' ')
        result = result.replaceAll('] ', ' ')
        result = result.replaceAll('" ', ' ')
        result = result.replaceAll('\\n ', ' ')
        result = result.replaceAll('\\ ', ' ')

        result = result.replaceAll('.', ' ')
        result = result.replaceAll(',', ' ')
        result = result.replaceAll('-', ' ')
        result = result.replaceAll('/', ' ')
        result = result.replaceAll('_', ' ')
        result = result.replaceAll(':', ' ')
        result = result.replaceAll(';', ' ')
        result = result.replaceAll('(', ' ')
        result = result.replaceAll(')', ' ')
        result = result.replaceAll('{', ' ')
        result = result.replaceAll('}', ' ')
        result = result.replaceAll('[', ' ')
        result = result.replaceAll(']', ' ')
        result = result.replaceAll('"', ' ')
        result = result.replaceAll('\\n', ' ')
        result = result.replaceAll("\\", ' ')

        result = result.replaceAll('@', ' ')
        result = result.replaceAll('    ', ' ')
        result = result.replaceAll('   ', ' ')
        result = result.replaceAll('  ', ' ')
        return result
    }

    function cleanTextOfCommonWordEndings(text) {
        let result = UI.projects.superalgos.utilities.strings.replaceSpecialCharactersForSpaces(text)
        result = result.replaceAll(' ', '')
        result = result.replaceAll('s', '')
        result = result.replaceAll('ing', '')
        result = result.replaceAll('ed', '')
        result = result.replaceAll('y', '')
        result = result.replaceAll('ies', '')
        return result
    }
}