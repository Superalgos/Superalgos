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

let translationsButtons = document.getElementsByClassName('translation-options')
let languageClasses = []
for (let i = 0; i < translationsButtons.length; i++) {
    let ele = translationsButtons[i]
    let matchingClass = ele.getAttribute('language') + '-translation'
    ele.addEventListener('click', function toggleLanguage() {
        toggleTranlations(matchingClass)
    })
}

function toggleTranlations(selector) {
    let translations = document.getElementsByClassName('translation')
    for(let i = 0; i < translations.length; i++) {
        if(translations[i].classList.contains(selector)) {
            translations[i].classList.remove('hidden')
        }
        else {
            translations[i].classList.add('hidden')
        }
    }
}