function newSuperalgosUtilitiesDocs() {
    thisObject = {
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
        addCodeToCamelCase: addCodeToCamelCase,
        addItalics: addItalics, 
        addToolTips: addToolTips
    }

    const TAGGING_STRING_SEPARATOR = '~>'

    return thisObject

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
        return
    }

    function parseGIF(text) {
        return '<img class="docs-gif" src="' + text + '">'
    }

    function reverseParseGIF(HTML) {
        let result = HTML
        result = result.replace(' <img class="docs-gif" src="', '')
        result = result.replace('">  ', '')
        return result
    }

    function parsePNG(text) {
        return '<img class="docs-png" src="' + text + '">'
    }

    function reverseParsePNG(HTML) {
        let result = HTML
        result = result.replace(' <img class="docs-png" src="', '')
        result = result.replace('">  ', '')
        return result
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
        HTML = '<a  params="' + text + '" href="http://' + splittedText[1] + '" target="_" class="docs-link">' + splittedText[0] + '</a>'
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

    function reverseParseTable(HTML) {
        text = removeRGB(HTML)

        /* Single occurrance replacements */
        text = text.replace('<table class="docs-info-table"> ', '')
        text = text.replace('  </table>', '')
        text = text.replace('<thead>', '')
        text = text.replace('</thead>', '')
        text = text.replace('<tbody>', '')
        text = text.replace('</tbody>', '')

        /* All instances replacements */
        text = text.replaceAll('<tr>', '')
        text = text.replaceAll('<tr class="docs-info-table-alt-bg">', '')
        text = text.replaceAll('</td><td>', '|')
        text = text.replaceAll('</th><th>', '|')
        text = text.replaceAll('<th>', '|')
        text = text.replaceAll('</th>', '|')
        text = text.replaceAll('<td>', '|')
        text = text.replaceAll('</td>', '|')
        text = text.replaceAll('</tr>', '')

        /* We break lines where needed */
        text = text.replaceAll('||', '|' + String.fromCharCode(10) + '|')
        return text

        function removeRGB(HTML) {
            let text = HTML
            text = text.replaceAll('<div style="display: block; background: ', '')
            text = text.replaceAll('; border: 1px solid black;">&nbsp;&nbsp;&nbsp;</div>', '')
            return text
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

    function addCodeToCamelCase(text) {
        let expandedText = text
            .replaceAll('{', ' { ')
            .replaceAll('}', ' } ')
            .replaceAll('(', ' ( ')
            .replaceAll(')', ' ) ')
            .replaceAll('[', ' [ ')
            .replaceAll(']', ' ] ')
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
        return result
    }

    function addItalics(text) {

        let words = text.split(' ')
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
            We will search across all DOC and CONCEPT SCHEMAS
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
        let words = text.split(' ')
        let taggedText = ''
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

            for (let j = 0; j < PROJECTS_ARRAY.length; j++) {
                let project = PROJECTS_ARRAY[j]

                /* Search in docsNodeSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludedType) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, TAGGING_STRING_SEPARATOR + 'Node' + '|' + cleanPhrase4 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludedType) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, TAGGING_STRING_SEPARATOR + 'Node' + '|' + cleanPhrase3 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludedType) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, TAGGING_STRING_SEPARATOR + 'Node' + '|' + cleanPhrase2 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsNodeSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludedType) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, TAGGING_STRING_SEPARATOR + 'Node' + '|' + cleanPhrase1 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase1 + ' '
                    }
                    found = true
                    break
                }

                /* Search in docsConceptSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludedType) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, TAGGING_STRING_SEPARATOR + 'Concept' + '|' + cleanPhrase4 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludedType) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, TAGGING_STRING_SEPARATOR + 'Concept' + '|' + cleanPhrase3 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludedType) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, TAGGING_STRING_SEPARATOR + 'Concept' + '|' + cleanPhrase2 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsConceptSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludedType) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, TAGGING_STRING_SEPARATOR + 'Concept' + '|' + cleanPhrase1 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase1 + ' '
                    }
                    found = true
                    break
                }

                /* Search in docsTopicSchema */
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase4) !== undefined) {
                    if (cleanPhrase4 !== excludedType) {
                        taggedText = taggedText + phrase4.replace(cleanPhrase4, TAGGING_STRING_SEPARATOR + 'Topic' + '|' + cleanPhrase4 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase4 + ' '
                    }
                    i = i + 3
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase3) !== undefined) {
                    if (cleanPhrase3 !== excludedType) {
                        taggedText = taggedText + phrase3.replace(cleanPhrase3, TAGGING_STRING_SEPARATOR + 'Topic' + '|' + cleanPhrase3 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase3 + ' '
                    }
                    i = i + 2
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase2) !== undefined) {
                    if (cleanPhrase2 !== excludedType) {
                        taggedText = taggedText + phrase2.replace(cleanPhrase2, TAGGING_STRING_SEPARATOR + 'Topic' + '|' + cleanPhrase2 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase2 + ' '
                    }
                    i = i + 1
                    found = true
                    break
                }
                if (SCHEMAS_BY_PROJECT.get(project).map.docsTopicSchema.get(cleanPhrase1) !== undefined) {
                    if (cleanPhrase1 !== excludedType) {
                        taggedText = taggedText + phrase1.replace(cleanPhrase1, TAGGING_STRING_SEPARATOR + 'Topic' + '|' + cleanPhrase1 + '|' + project + TAGGING_STRING_SEPARATOR) + ' '
                    } else {
                        taggedText = taggedText + phrase1 + ' '
                    }
                    found = true
                    break
                }
            }

            if (found === false) {
                taggedText = taggedText + phrase1 + ' '
            }
        }
        return taggedText
    }

    function cleanPhrase(phrase) {
        return phrase.replace(',', '')
            .replace(';', '')
            .replace('(', '')
            .replace(')', '')
            .replace('-', '')
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