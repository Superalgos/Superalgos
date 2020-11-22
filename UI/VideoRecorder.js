function newVideoRecorder() {
    let thisObject = {
        recordCanvas: recordCanvas,
        physics: physics
    }
    let lastAction
    let wheelAnimationCounter = 0
    let lastWheelPointerIcon
    return thisObject

    function physics() {
        wheelAnimationCounter--
        if (wheelAnimationCounter < 0) {
            wheelAnimationCounter = 0
        }
    }

    function recordCanvas() {
        {
            const DISTANCE_BETWEEN_ICONS = 35
            const ICON_SIZES = 50

            let mousePointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'mouse-pointer')
            let draggingIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'hand-drag')

            let leftClickIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'mouse-left-click')
            let rightClickIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'mouse-right-click')
            let wheelClickIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'mouse-wheel-click')

            let imagePosition
            let buttonPressedIcon

            if (canvas.mouse.action === 'key down' && lastAction === 'dragging') {
                canvas.mouse.action = 'dragging'
            }
            switch (canvas.mouse.action) {
                case 'moving': {
                    pointerIcon = mousePointerIcon
                    break
                }
                case 'dragging': {
                    pointerIcon = draggingIcon
                    break
                }
                case 'wheel': {
                    wheelAnimationCounter = 25
                    if (canvas.mouse.event.delta > 0) {
                        pointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'mouse-wheel-up')
                        lastWheelPointerIcon = pointerIcon
                    } else {
                        pointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'mouse-wheel-down')
                        lastWheelPointerIcon = pointerIcon
                    }

                    break
                }
                case 'key down': {
                    if (wheelAnimationCounter > 0) {
                        pointerIcon = lastWheelPointerIcon
                    } else {
                        pointerIcon = mousePointerIcon
                    }
                    let key = canvas.mouse.event.key
                    if (key === undefined) { break }
                    switch (key.toLowerCase()) {
                        case 'escape':
                            {
                                pointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-m')
                                break
                            }
                        case 'm':
                            {
                                pointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-m')
                                break
                            }
                        case 'a':
                            {
                                pointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-a')
                                break
                            }
                        case 'r':
                            {
                                pointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-r')
                                break
                            }
                        case 'c':
                            {
                                pointerIcon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-r')
                                break
                            }
                    }
                    break
                }
                case 'key up': {
                    pointerIcon = mousePointerIcon
                    break
                }
            }

            lastAction = canvas.mouse.action

            imagePosition = {
                x: canvas.mouse.position.x,
                y: canvas.mouse.position.y
            }
            drawMousePointer(pointerIcon, imagePosition, ICON_SIZES)

            switch (canvas.mouse.event.buttons) {
                case 0: {
                    buttonPressedIcon = undefined
                    break
                }
                case 1: {
                    buttonPressedIcon = leftClickIcon
                    break
                }
                case 2: {
                    buttonPressedIcon = rightClickIcon
                    break
                }
                case 3: {
                    buttonPressedIcon = undefined
                    break
                }
                case 4: {
                    buttonPressedIcon = wheelClickIcon
                    break
                }
            }

            let firstRow = DISTANCE_BETWEEN_ICONS * 1 + ICON_SIZES * 1
            let secondRow = DISTANCE_BETWEEN_ICONS * 1 + ICON_SIZES * 2
            let icon

            imagePosition = {
                x: canvas.mouse.position.x + DISTANCE_BETWEEN_ICONS * 2,
                y: canvas.mouse.position.y
            }
            drawMousePointer(buttonPressedIcon, imagePosition, ICON_SIZES)

            if (canvas.mouse.event.shiftKey === true) {
                icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-shift')
                imagePosition = {
                    x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS * 3,
                    y: canvas.mouse.position.y + firstRow
                }
                drawMousePointer(icon, imagePosition, ICON_SIZES)
            }

            if (canvas.mouse.event.ctrlKey === true || canvas.mouse.event.metaKey === true) {
                icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-ctrl')
                imagePosition = {
                    x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS * 3,
                    y: canvas.mouse.position.y + secondRow
                }
                drawMousePointer(icon, imagePosition, ICON_SIZES)
            }

            if (canvas.mouse.event.altKey === true) {
                icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-alt')
                imagePosition = {
                    x: canvas.mouse.position.x + DISTANCE_BETWEEN_ICONS * 3 + ICON_SIZES * 0,
                    y: canvas.mouse.position.y + secondRow
                }
                drawMousePointer(icon, imagePosition, ICON_SIZES)
            }

            if (canvas.mouse.event.code === 'ArrowUp') {
                icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-up')
                imagePosition = {
                    x: canvas.mouse.position.x - 0,
                    y: canvas.mouse.position.y + firstRow
                }
                drawMousePointer(icon, imagePosition, ICON_SIZES)
            }

            if (canvas.mouse.event.code === 'ArrowDown') {
                icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-down')
                imagePosition = {
                    x: canvas.mouse.position.x - 0,
                    y: canvas.mouse.position.y + secondRow
                }
                drawMousePointer(icon, imagePosition, ICON_SIZES)
            }

            if (canvas.mouse.event.code === 'ArrowLeft') {
                icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-left')
                imagePosition = {
                    x: canvas.mouse.position.x - DISTANCE_BETWEEN_ICONS * 0 - ICON_SIZES * 1,
                    y: canvas.mouse.position.y + secondRow
                }
                drawMousePointer(icon, imagePosition, ICON_SIZES)
            }

            if (canvas.mouse.event.code === 'ArrowRight') {
                icon = UI.projects.superalgos.spaces.designSpace.getIconByProjectAndName( 'Superalgos', 'key-right')
                imagePosition = {
                    x: canvas.mouse.position.x + DISTANCE_BETWEEN_ICONS * 0 + ICON_SIZES * 1,
                    y: canvas.mouse.position.y + secondRow
                }
                drawMousePointer(icon, imagePosition, ICON_SIZES)
            }

            function drawMousePointer(icon, imagePosition, imageSize) {
                if (icon !== undefined) {
                    if (icon.canDrawIcon === true) {
                        browserCanvasContext.drawImage(
                            icon, imagePosition.x,
                            imagePosition.y,
                            imageSize,
                            imageSize)
                    }
                }
            }
            mediaRecorder.capture(browserCanvas)
        }
    }
}
