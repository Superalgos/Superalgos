function saveTutorial(payload, tutorial) {
    payload.tutorial = {
        status: tutorial.status
    }
}

function loadTutorial(payload, tutorial) {
    if (payload.tutorial !== undefined) {
        tutorial.status = payload.tutorial.status
        return
    }
    if (payload.node.savedPayload !== undefined) {
        if (payload.node.savedPayload.tutorial !== undefined) {
            tutorial.status = payload.node.savedPayload.tutorial.status
            payload.node.savedPayload.tutorial = undefined
        }
    }
}
