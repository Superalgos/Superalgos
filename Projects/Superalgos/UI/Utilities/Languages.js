function newSuperalgosUtilitiesLanguages() {
    thisObject = {
        getLaguageLabel: getLaguageLabel
    }

    return thisObject

    function getLaguageLabel(language) {
        let languageLabel
        switch (language) {
            case 'EN': {
                languageLabel = 'English'
                break
            }
            case 'ES': {
                languageLabel = 'Spanish'
                break
            }
            case 'RU': {
                languageLabel = 'Russian'
                break
            }
        }
        return languageLabel 
    }    
}