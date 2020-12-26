function newSuperalgosUtilitiesStrings() {
    thisObject = {
        fromCamelCaseToUpperWithSpaces: fromCamelCaseToUpperWithSpaces,
        isCamelCase: isCamelCase
    }

    return thisObject

    function fromCamelCaseToUpperWithSpaces(text) {
        let result = text.replace( /([A-Z])/g, " $1" );
        return result.charAt(0).toUpperCase() + result.slice(1);
    }    

    function isCamelCase(text) {
        return /^([a-z]+)(([A-Z]([a-z]+))+)$/.test(text)
      }
}