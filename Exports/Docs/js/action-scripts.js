let collapsibleElementsArray = document.getElementsByClassName("docs-collapsible-element")

for (let i = 0; i < collapsibleElementsArray.length; i++) {
    collapsibleElementsArray[i].addEventListener("click", function collapseElement() {
        this.classList.toggle("docs-collapsible-active")
        let content = this.nextElementSibling
        if (content.style.display === "block") {
            content.style.display = "none"
        } else {
            content.style.display = "block"
        }
    })
}

const translationsButtons = document.getElementsByClassName('translation-options')
const languageClasses = []
for (let i = 0; i < translationsButtons.length; i++) {
    const ele = translationsButtons[i]
    const language = ele.getAttribute('language')
    ele.addEventListener('click', function toggleLanguage() {
        toggleTranlationGroups(language)
    })
}

function toggleTranlationGroups(selector) {
    const translationGroups = document.getElementsByClassName('translation-group')
    for(let i = 0; i < translationGroups.length; i++) {
        if(!toggleTranlationChildren(translationGroups[i].children, selector)) {
            toggleTranlationChildren(translationGroups[i].children, 'EN')
        }
    }

    function toggleTranlationChildren(children, selector) {
        let found = false
        for(let i = 0; i < children.length; i++) {
            const child = children[i]
            if(child.getAttribute('language') == selector) {
                child.classList.remove('hidden')
                found = true
            }
            else {
                child.classList.add('hidden')
            }
        }
        return found
    }
}