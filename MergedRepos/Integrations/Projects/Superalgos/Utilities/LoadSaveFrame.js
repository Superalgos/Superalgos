function newSuperalgosUtilitiesLoadSaveFrame() {
    thisObject = {
        saveFrame: saveFrame,
        loadFrame: loadFrame
    }

    return thisObject

    function saveFrame(payload, frame) {
        payload.frame = {
            position: {
                x: frame.position.x,
                y: frame.position.y
            },
            width: frame.width,
            height: frame.height,
            radius: frame.radius
        }
    }

    function loadFrame(payload, frame) {
        if (payload.node.savedPayload !== undefined) {
            if (payload.node.savedPayload.frame !== undefined) {
                frame.position.x = payload.node.savedPayload.frame.position.x
                frame.position.y = payload.node.savedPayload.frame.position.y
                frame.width = payload.node.savedPayload.frame.width
                frame.height = payload.node.savedPayload.frame.height
                frame.radius = payload.node.savedPayload.frame.radius
                payload.node.savedPayload.frame = undefined
            }
        }
    }
}