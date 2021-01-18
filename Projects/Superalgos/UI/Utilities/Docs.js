function newSuperalgosUtilitiesDocs() {
    thisObject = {
        buildOrderedPageIndex: buildOrderedPageIndex,
        addWarningIfTranslationIsOutdated: addWarningIfTranslationIsOutdated,
        getTextBasedOnLanguage: getTextBasedOnLanguage,
        setTextBasedOnLanguage: setTextBasedOnLanguage,
        parseGIF: parseGIF,
        reverseParseGIF: reverseParseGIF,
        parsePNG: parsePNG,
        reverseParsePNG: reverseParsePNG,
        parseTable: parseTable,
        parseLink: parseLink,
        parseYoutube: parseYoutube,
        reverseParseLink: reverseParseLink,
        reverseParseYoutube: reverseParseYoutube,
        reverseParseHierarchy: reverseParseHierarchy,
        reverseParseTable: reverseParseTable,
        addBold: addBold,
        addKeyboard: addKeyboard,
        addCodeToCamelCase: addCodeToCamelCase,
        addCodeToWhiteList: addCodeToWhiteList,
        addItalics: addItalics,
        addToolTips: addToolTips
    }

    const TAGGING_STRING_SEPARATOR = '~>'

    return thisObject

    function buildOrderedPageIndex(project, category, query) {
        let array = []
        let schemaArray

        switch (category) {
            case 'Topic': {
                schemaArray = SCHEMAS_BY_PROJECT.get(project).array.docsTopicSchema
                break
            }
            case 'Tutorial': {
                schemaArray = SCHEMAS_BY_PROJECT.get(project).array.docsTutorialSchema
                break
            }
            case 'Review': {
                schemaArray = SCHEMAS_BY_PROJECT.get(project).array.docsReviewSchema
                break
            }
        }

        for (let i = 0; i < schemaArray.length; i++) {
            let arrayItem = schemaArray[i]

            switch (category) {
                case 'Topic': {
                    if (arrayItem.topic !== query) { continue }
                    break
                }
                case 'Tutorial': {
                    if (arrayItem.tutorial !== query) { continue }
                    break
                }
                case 'Review': {
                    if (arrayItem.review !== query) { continue }
                    break
                }
            }

            let itemAdded = false
            if (array.length === 0) {
                array.push(arrayItem)
                itemAdded = true
            } else {
                for (let j = 0; j < array.length; j++) {
                    let orderedArrayItem = array[j]
                    if (Number(arrayItem.pageNumber) < Number(orderedArrayItem.pageNumber)) {
                        array.splice(j, 0, arrayItem)
                        itemAdded = true
                        break
                    }
                }
            }
            if (itemAdded === false) {
                array.push(arrayItem)
            }

        }
        return array
    }

    function addWarningIfTranslationIsOutdated(paragraph) {
        if (paragraph === undefined) { return '' }
        if (paragraph.updated === undefined) { return '' }
        if (paragraph.translations === undefined) { return '' }
        if (paragraph.translations.length === 0) { return '' }
        for (let i = 0; i < paragraph.translations.length; i++) {
            let translation = paragraph.translations[i]
            if (translation.updated === undefined) { continue }
            if (translation.language === UI.projects.superalgos.spaces.docsSpace.language) {
                if (paragraph.updated < translation.updated) {
                    return ''
                } else {
                    return ' <b>Warning!!!</b> This translation is outdated. English version is... <i>' + paragraph.text + '</i> Please update this translation.'
                }
            }
        }
        return ''
    }

    function getTextBasedOnLanguage(paragraph) {
        if (paragraph === undefined) { return }
        if (paragraph.translations === undefined) { return paragraph.text }
        if (paragraph.translations.length === 0) { return paragraph.text }
        for (let i = 0; i < paragraph.translations.length; i++) {
            let translation = paragraph.translations[i]
            if (translation.language === UI.projects.superalgos.spaces.docsSpace.language) { return translation.text }
        }
        return paragraph.text
    }

    function setTextBasedOnLanguage(paragraph, text) {
        if (UI.projects.superalgos.spaces.docsSpace.language === UI.projects.superalgos.globals.docs.DEFAULT_LANGUAGE) {
            if (paragraph.text !== text) {

                /* This will make the Client to save this in a file overwritting the previous version*/
                UI.projects.superalgos.spaces.docsSpace.documentPage.docsSchemaDocument.updated = true

                paragraph.text = text
                paragraph.updated = (new Date()).valueOf()

            }
            return
        } else {
            /* 
            We will avoid setting up a new language if the text is 
            the same as the text at the default language.
            */
            if (paragraph.text === text) {
                return
            }
        }
        if (paragraph.translations === undefined) {
            paragraph.translations = []
        }
        for (let i = 0; i < paragraph.translations.length; i++) {
            let translation = paragraph.translations[i]
            if (translation.language === UI.projects.superalgos.spaces.docsSpace.language) {
                if (translation.text !== text) {

                    /* This will make the Client to save this in a file overwritting the previous version*/
                    UI.projects.superalgos.spaces.docsSpace.documentPage.docsSchemaDocument.updated = true

                    translation.text = text
                    translation.updated = (new Date()).valueOf()
                }
                return
            }
        }
        let translation = {
            language: UI.projects.superalgos.spaces.docsSpace.language,
            text: text,
            updated: (new Date()).valueOf()
        }
        paragraph.translations.push(translation)

        /* This will make the Client to save this in a file overwritting the previous version*/
        UI.projects.superalgos.spaces.docsSpace.documentPage.docsSchemaDocument.updated = true
        return
    }

    function parseGIF(text) {
        return '<img class="docs-gif" src="' + text + '">'
    }

    function reverseParseGIF(HTML) {
        let result = HTML
        result = result.replace(' <img class="docs-gif" src="', '')
        result = result.replace('">', '')
        return result.trim()
    }

    function parsePNG(text) {
        return '<img class="docs-png" src="' + text + '">'
    }

    function reverseParsePNG(HTML) {
        let result = HTML
        result = result.replace(' <img class="docs-png" src="', '')
        result = result.replace('">', '')
        return result.trim()
    }

    function parseTable(text) {
        let HTML = ''
        let odd = false
        /* When the text is not formatted as a table, we auto format it as a single cell table */
        if (text.indexOf('|') < 0) {
            text = "|" + text + "|"
        }

        /* We process the text based table*/
        let rows = text.split(String.fromCharCode(10))
        for (let i = 0; i < rows.length; i++) {
            let row = rows[i]
            if (row === '') {
                if (i === rows.length - 1) {
                    HTML = HTML + '</tbody>'
                }
                continue
            }
            let colums = row.split('|')
            if (i === 0) {
                HTML = HTML + '<thead>'
            }
            if (i === 1) {
                HTML = HTML + '<tbody>'
            }
            if (odd === true) {
                HTML = HTML + '<tr class="docs-info-table-alt-bg">'
                odd = false
            } else {
                HTML = HTML + '<tr>'
                odd = true
            }
            if (colums.length < 2) {
                continue
            } else {
                /* We discard anything before the first | and after the last | */
                for (let j = 1; j < colums.length - 1; j++) {
                    let column = colums[j]
                    column = addRGB(column)

                    if (i === 0) {
                        HTML = HTML + '<th>' + column + '</th>'
                    } else {
                        HTML = HTML + '<td>' + column + '</td>'
                    }
                }
            }

            HTML = HTML + '</tr>'
            if (i === 0) {
                HTML = HTML + '</thead>'
            }
            if (i === rows.length - 1) {
                HTML = HTML + '</tbody>'
            }
        }
        return HTML

        function addRGB(text) {
            const RGB_HTML = '<div style=\"display: block; background: RGB; border: 1px solid black;\">&nbsp;&nbsp;&nbsp;</div>'
            let splittedText = text.split('RGB(')
            if (splittedText.length === 1) { return text }
            let remainderSplit = splittedText[1].split(')')
            if (remainderSplit.length === 1) { return text }
            let RGBFound = 'RGB(' + remainderSplit[0] + ')'
            let span = RGB_HTML.replace('RGB', RGBFound)
            let result = text.replace(RGBFound, span)
            return result
        }
    }

    function parseLink(text) {
        let HTML = ''
        let splittedText = text.split('->')
        if (splittedText.length < 1) { return }
        HTML = '<a  params="' + text + '" href="http://' + splittedText[1] + '" target="_" class="docs-external-link">' + splittedText[0] + '</a>'
        return HTML
    }

    function parseYoutube(text) {
        let HTML = ''

        HTML = HTML + '<div params="' + text + '" class="docs-youtube-video-container">'
        HTML = HTML + '<iframe width="830" height="465" src="https://www.youtube.com/embed/' + text + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
        HTML = HTML + '</div>'

        return HTML
    }

    function reverseParseLink(HTML) {
        let splittedHTML = HTML.split('"')
        return splittedHTML[1]
    }

    function reverseParseYoutube(HTML) {
        let splittedHTML = HTML.split('"')
        return splittedHTML[1]
    }

    function reverseParseHierarchy(HTML) {
        let splittedHTML = HTML.split('"')
        return splittedHTML[3]
    }

    function reverseParseTable(paragraphNode) {

        let tableNode = paragraphNode.childNodes[0]
        let thead
        let tbody
        let result = ''

        for (let i = 0; i < tableNode.childNodes.length; i++) {
            let childNode = tableNode.childNodes[i]
            if (childNode.nodeName === "THEAD") {
                thead = childNode
            }
            if (childNode.nodeName === "TBODY") {
                tbody = childNode
            }
        }
        if (thead !== undefined) { processTRs(thead) }
        if (tbody !== undefined) { processTRs(tbody) }

        function processTRs(TRs) {
            for (let i = 0; i < TRs.childNodes.length; i++) {
                let TR = TRs.childNodes[i]
                for (let j = 0; j < TR.childNodes.length; j++) {
                    let TD = TR.childNodes[j]
                    if (TD.innerText.trim() === "") {
                        let RGB = removeRGB(TD.innerHTML)
                        result = result + '|' + RGB
                    } else {
                        result = result + '|' + TD.innerText
                    }
                }
                result = result + '|'
            }
        }

        /* We break lines where needed */
        result = result.replaceAll('||', '|' + String.fromCharCode(10) + '|')
        return result.trim()

        function removeRGB(HTML) {
            let text = HTML
            text = text.replaceAll('<div style="display: block; background: ', '')
            text = text.replaceAll('; border: 1px solid black;">&nbsp;&nbsp;&nbsp;</div>', '')
            text = text.replaceAll('&nbsp;', '')
            return text.trim()
        }
    }

    function addBold(text) {
        let splittedText = text.split(':')
        if (text.indexOf(':') >= 0) {
            return '<b>' + text.substring(0, text.indexOf(':') + 1) + '</b>' + text.substring(text.indexOf(':') + 1, text.length)
        } else {
            return text
        }
    }

    function addKeyboard(text) {
        let expandedText = text
            .replaceAll('{', ' { ')
            .replaceAll('}', ' } ')
            .replaceAll('(', ' ( ')
            .replaceAll(')', ' ) ')
            .replaceAll('[', ' [ ')
            .replaceAll(']', ' ] ')
            .replaceAll(',', ' , ')
            .replaceAll('.', ' . ')
        let splittedText = expandedText.split(' ')
        let result = ''
        for (let i = 0; i < splittedText.length; i++) {
            let word = splittedText[i]
            if (
                word === 'Ctrl' ||
                word === 'Alt' ||
                word === 'Shift' ||
                word === 'Cmd' ||
                word === 'F1' ||
                word === 'F2' ||
                word === 'F3' ||
                word === 'F4' ||
                word === 'F5' ||
                word === 'F6' ||
                word === 'F7' ||
                word === 'F8' ||
                word === 'F9' ||
                word === 'F10' ||
                word === 'F11' ||
                word === 'F12' ||
                word === 'Del' ||
                word === '←' ||
                word === '→' ||
                word === '↑' ||
                word === '↓' ||
                word === 'Key-A' ||
                word === 'Key-B' ||
                word === 'Key-C' ||
                word === 'Key-D' ||
                word === 'Key-E' ||
                word === 'Key-F' ||
                word === 'Key-G' ||
                word === 'Key-H' ||
                word === 'Key-I' ||
                word === 'Key-J' ||
                word === 'Key-K' ||
                word === 'Key-L' ||
                word === 'Key-M' ||
                word === 'Key-N' ||
                word === 'Key-O' ||
                word === 'Key-P' ||
                word === 'Key-Q' ||
                word === 'Key-R' ||
                word === 'Key-S' || // S
                word === 'Key-T' ||
                word === 'Key-U' ||
                word === 'Key-V' ||
                word === 'Key-W' ||
                word === 'Key-X' ||
                word === 'Key-Y' ||
                word === 'Key-Z'
            ) {
                word = '<kbd>' + word + '</kbd>'
            }
            if (i === 0) {
                result = word
            } else {
                result = result + ' ' + word
            }
        }
        result = result
            .replaceAll(' { ', '{')
            .replaceAll(' } ', '}')
            .replaceAll(' ( ', '(')
            .replaceAll(' ) ', ')')
            .replaceAll(' [ ', '[')
            .replaceAll(' ] ', ']')
            .replaceAll(' , ', ',')
            .replaceAll(' . ', '.')
        return result.trim()
    }

    function addCodeToCamelCase(text) {
        let expandedText = text
            .replaceAll('{', ' { ')
            .replaceAll('}', ' } ')
            .replaceAll('(', ' ( ')
            .replaceAll(')', ' ) ')
            .replaceAll('[', ' [ ')
            .replaceAll(']', ' ] ')
            .replaceAll(',', ' , ')
        let splittedText = expandedText.split(' ')
        let result = ''
        for (let i = 0; i < splittedText.length; i++) {
            let word = splittedText[i]
            if (UI.projects.superalgos.utilities.strings.isCamelCase(word) === true) {
                word = '<code class="docs-code">' + word + '</code>'
            }
            if (i === 0) {
                result = word
            } else {
                result = result + ' ' + word
            }
        }
        result = result
            .replaceAll(' { ', '{')
            .replaceAll(' } ', '}')
            .replaceAll(' ( ', '(')
            .replaceAll(' ) ', ')')
            .replaceAll(' [ ', '[')
            .replaceAll(' ] ', ']')
            .replaceAll(' , ', ',')
        return result
    }

    function addCodeToWhiteList(text) {
        let result = text
            .replaceAll('true', '<code class="docs-code">true</code>')
            .replaceAll('false', '<code class="docs-code">false</code>')
        return result
    }

    function addItalics(text) {
        let cleanText = text.replace(/'/g, ' AMPERSAND ') // scaping ampersands, separating them from other words
        let words = cleanText.split(' ')
        let changedText = ''
        for (let i = 0; i < words.length; i++) {
            let phrase1 = words[i]
            let phrase2 = words[i] + ' ' + words[i + 1]
            let phrase3 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2]
            let phrase4 = words[i] + ' ' + words[i + 1] + ' ' + words[i + 2] + ' ' + words[i + 3]

            let cleanPhrase1 = cleanPhrase(phrase1)
            let cleanPhrase2 = cleanPhrase(phrase2)
            let cleanPhrase3 = cleanPhrase(phrase3)
            let cleanPhrase4 = cleanPhrase(phrase4)

            let found = false

            if (found === false && UI.projects.superalgos.spaces.docsSpace.menuLabelsMap.get(cleanPhrase4) === true) {
                changedText = changedText + phrase4.replace(cleanPhrase4, '<i>' + cleanPhrase4 + '</i>') + ' '
                i = i + 3
                found = true
            }

            if (found === false && UI.projects.superalgos.spaces.docsSpace.menuLabelsMap.get(cleanPhrase3) === true) {
                changedText = changedText + phrase3.replace(cleanPhrase3, '<i>' + cleanPhrase3 + '</i>') + ' '
                i = i + 2
                found = true
            }

            if (found === false && UI.projects.superalgos.spaces.docsSpace.menuLabelsMap.get(cleanPhrase2) === true) {
                changedText = changedText + phrase2.replace(cleanPhrase2, '<i>' + cleanPhrase2 + '</i>') + ' '
                i = i + 1
                found = true
            }

            if (found === false && UI.projects.superalgos.spaces.docsSpace.menuLabelsMap.get(cleanPhrase1) === true) {
                changedText = changedText + phrase1.replace(cleanPhrase1, '<i>' + cleanPhrase1 + '</i>') + ' '
                i = i + 0
                found = true
            }

            if (found === false) {
                changedText = changedText + phrase1 + ' '
            }
        }
        changedText = changedText.replaceAll(' AMPERSAND ', '\'')
        return changedText
    }

    function addToolTips(text, excludedType) {

        const TOOL_TIP_HTML = '<div onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'PROJECT\', \'CATEGORY\', \'TYPE\')" class="docs-tooltip">TYPE_LABEL<span class="docs-tooltiptext">DEFINITION</span></div>'
        const LINK_ONLY_HTML = '<div onClick="UI.projects.superalgos.spaces.docsSpace.navigateTo(\'PROJECT\', \'CATEGORY\', \'TYPE\')" class="docs-link">TYPE_LABEL<span class="docs-tooltiptext"></span></div>'

        let resultingText = ''
        text = tagDefinedTypes(text, excludedType)
        let splittedText = text.split(TAGGING_STRING_SEPARATOR)

        for (let i = 0; i < splittedText.length; i = i + 2) {
            let firstPart = splittedText[i]
            let taggedText = splittedText[i + 1]

            if (taggedText === undefined) {
                return resultingText + firstPart
            }

            let splittedTaggedText = taggedText.split('|')
            let category = splittedTaggedText[0]
            let type = splittedTaggedText[1]
            let project = splittedTaggedText[2]

            /*
            We will search across all DOC SCHEMAS
            */
            let found = false
            let docsSchemaDocument

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(type)
                if (docsSchemaDocument !== undefined) {
                    found = true
                    break
                }
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(type)
                if (docsSchemaDocument !== undefined) {
                    found = true
                    break
                }
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(type)
                if (docsSchemaDocument !== undefined) {
                    found = true
                    break
                }
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema.get(type)
                if (docsSchemaDocument !== undefined) {
                    found = true
                    break
                }
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema.get(type)
                if (docsSchemaDocument !== undefined) {
                    found = true
                    break
                }
                docsSchemaDocument = SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema.get(type)
                if (docsSchemaDocument !== undefined) {
                    found = true
                    break
                }
            }
            if (found === false) {
                return text
            }

            let definition = UI.projects.superalgos.utilities.docs.getTextBasedOnLanguage(docsSchemaDocument.definition)
            if (definition === undefined || definition === "") {
                let tooltip = LINK_ONLY_HTML
                    .replace('CATEGORY', category)
                    .replace('TYPE', type.replace(/'/g, 'AMPERSAND'))
                    .replace('PROJECT', project)
                    .replace('TYPE_LABEL', type)

                resultingText = resultingText + firstPart + tooltip
            } else {
                let tooltip = TOOL_TIP_HTML
                    .replace('CATEGORY', category)
                    .replace('TYPE', type.replace(/'/g, 'AMPERSAND'))
                    .replace('PROJECT', project)
                    .replace('TYPE_LABEL', type)
                    .replace('DEFINITION', definition)

                resultingText = resultingText + firstPart + tooltip
            }
        }
        return resultingText
    }

    /* Private Functions follow */
    function tagDefinedTypes(text, excludedType) {
        const MAX_NUMBER_OF_WORDS = 10
        text = text.trim()
        let cleanText = text.replace(/'/g, ' AMPERSAND ') // scaping ampersands, separating them from other words
            .replaceAll(':', ' :')
            .replaceAll(',', ' ,')
            .replaceAll('.', ' .')
            .replaceAll('!', ' !')
        let allWords = cleanText.split(' ')
        let words = []
        for (let i = 0; i < allWords.length; i++) {
            let word = allWords[i]
            if (word !== "") {
                words.push(word)
            }
        }
        let taggedText = ''
        for (let i = 0; i < words.length; i++) {

            let phrases = []
            let cleanPhrases = []
            let phrase = ''

            for (let j = 0; j < MAX_NUMBER_OF_WORDS; j++) {
                let word = words[i + j]
                if (word === "") { word = " " }
                if (word !== undefined) {
                    if (phrase === '') {
                        phrase = word
                    } else {
                        phrase = phrase + ' ' + word
                    }
                    if (phrase === undefined) { continue }
                    phrases.push(phrase)
                    cleanPhrases.push(cleanPhrase(phrase))
                }
            }

            let found = false

            for (let j = MAX_NUMBER_OF_WORDS - 1; j >= 0; j--) {
                for (let p = 0; p < PROJECTS_ARRAY.length; p++) {
                    let project = PROJECTS_ARRAY[p]

                    searchInSchema(SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema, 'Node')
                    searchInSchema(SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema, 'Concept')
                    searchInSchema(SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema, 'Topic')
                    searchInSchema(SCHEMAS_BY_PROJECT.get(project).map.docsTutorialSchema, 'Tutorial')
                    searchInSchema(SCHEMAS_BY_PROJECT.get(project).map.docsReviewSchema, 'Review')
                    searchInSchema(SCHEMAS_BY_PROJECT.get(project).map.docsBookSchema, 'Book')

                    function searchInSchema(docSchema, category) {
                        if (found === true) { return }

                        if (docSchema.get(cleanPhrases[j]) !== undefined) {
                            if (cleanPhrases[j] !== excludedType) {
                                taggedText = taggedText + phrases[j].replace(
                                    cleanPhrases[j],
                                    TAGGING_STRING_SEPARATOR + category + '|' + cleanPhrases[j] + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                            } else {
                                taggedText = taggedText + phrases[j] + ' '
                            }
                            i = i + j
                            found = true
                            return
                        }
                    }
                }
            }

            if (found === false) {
                taggedText = taggedText + phrases[0] + ' '
            }
        }
        taggedText = taggedText.replaceAll(' AMPERSAND ', '\'')
            .replaceAll(' :', ':')
            .replaceAll(' .', '.')
            .replaceAll(' ,', ',')
            .replaceAll(' !', '!')
            .replaceAll('  ', ' ')
        return taggedText
    }

    function cleanPhrase(phrase) {
        return phrase.replace(',', '')
            .replace(';', '')
            .replace('(', '')
            .replace(')', '')
            .replace('_', '')
            .replace('.', '')
            .replace('[', '')
            .replace(']', '')
            .replace('{', '')
            .replace('}', '')
            .replace('/', '')
            .replace('>', '')
            .replace('<', '')
    }
}