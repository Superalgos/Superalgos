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
            case 'IT': {
                languageLabel = 'Italian'
                break
            }
            case 'CN': {
                languageLabel = 'Simplified Chinese-Mandarin'
                break
            }
            case 'ID': {
                languageLabel = 'Bahasa'
                break
            }
            case 'TR': {
                languageLabel = 'Turkish'
                break
            }
        }
        return languageLabel 
    }    
}