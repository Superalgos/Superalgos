function newSuperalgosUtilitiesMenu() {
    thisObject = {
        menuClickOfNodeArray: menuClickOfNodeArray,
        menuClick: menuClick
    }

    return thisObject

    function menuClickOfNodeArray(nodeArray, action, confirm) {
        for (let j = 0; j < nodeArray.length; j++) {
            let node = nodeArray[j]
            menuClick(node, action, confirm)
        }
    }

    function menuClick(node, action, confirm) {
        let menu = node.payload.uiObject.menu
        menu.internalClick(action)
        if (confirm === true) {
            menu.internalClick(action)
        }
    }
}