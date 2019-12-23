function newOnFocus () {
  thisObject = {
    getNodeThatIsOnFocus: getNodeThatIsOnFocus
  }
  return thisObject

  function getNodeThatIsOnFocus (node) {
    if (node === undefined) { return }
    if (node.payload === undefined) { return }
    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
    if (nodeDefinition !== undefined) {
      /* First we ask the question to ourself */
      if (node.payload.uiObject.isOnFocus === true) {
        return node
      }

      /* Then we check all of its own children nodes. */
      if (node.payload.floatingObject.isCollapsed !== true) {
        if (nodeDefinition.properties !== undefined) {
          for (let i = 0; i < nodeDefinition.properties.length; i++) {
            let property = nodeDefinition.properties[i]

            switch (property.type) {
              case 'node': {
                if (node[property.name] !== undefined) {
                  let child
                  child = getNodeThatIsOnFocus(node[property.name])
                  if (child !== undefined) {
                    return child
                  }
                }
              }
                break
              case 'array': {
                let nodePropertyArray = node[property.name]
                if (nodePropertyArray !== undefined) {
                  for (let m = 0; m < nodePropertyArray.length; m++) {
                    child = getNodeThatIsOnFocus(nodePropertyArray[m])
                    if (child !== undefined) {
                      return child
                    }
                  }
                }
              }
                break
            }
          }
        }
      }
    }
  }
}
