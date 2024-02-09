function newFoundationsUtilitiesStatusBar() {
    let thisObject = {
        changeStatus: changeStatus
    }

    return thisObject

    function changeStatus(newStatus) {
        let statusParagraph = document.getElementById('splash-text-status-paragraph')
        statusParagraph.lastChild.data = newStatus

        try {
            UI.projects.foundations.spaces.cockpitSpace.setStatus(newStatus, 50, UI.projects.foundations.spaces.cockpitSpace.statusTypes.ALL_GOOD)
        } catch(err) {
            // this means that the cockpitSpace is not ready...
        }
    }
}

exports.newFoundationsUtilitiesStatusBar = newFoundationsUtilitiesStatusBar