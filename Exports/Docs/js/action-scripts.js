let collapsibleElementsArray = document.getElementsByClassName("docs-collapsible-element")

for (let i = 0; i < collapsibleElementsArray.length; i++) {
    collapsibleElementsArray[i].addEventListener("click", function () {
        this.classList.toggle("docs-collapsible-active")
        let content = this.nextElementSibling
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    })
}