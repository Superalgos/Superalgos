function newSuperalgosUtilitiesCreditsPage() {
    thisObject = {
        changeStatus: changeStatus
    }

    return thisObject

    function changeStatus(newStatus) {
        let statusParagraph = document.getElementById('credits-page-status-paragraph')
        statusParagraph.lastChild.data = newStatus
        
    }
}