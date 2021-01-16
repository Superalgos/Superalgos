function newSuperalgosUtilitiesStatusBar() {
    thisObject = {
        changeStatus: changeStatus
    }

    return thisObject

    function changeStatus(newStatus) {
        let statusParagraph = document.getElementById('credits-page-status-paragraph')
        statusParagraph.lastChild.data = newStatus

        try {
            UI.projects.superalgos.spaces.cockpitSpace.setStatus(newStatus, 50, UI.projects.superalgos.spaces.cockpitSpace.statusTypes.ALL_GOOD)
        } catch(err) {
            // this means that the cockpitSpace is not ready...
        }
    }
}