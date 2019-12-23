function newShortcutKeys () {
  thisObject = {
    getNodeByShortcutKey: getNodeByShortcutKey
  }
  return thisObject

  function getNodeByShortcutKey (node, searchingKey) {
    if (node === undefined) { return }
    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
    if (nodeDefinition !== undefined) {
      /* Check Self first */
      if (node.payload.uiObject.shortcutKey === searchingKey) {
        return node
      }

      /* Check all of its own children nodes. */
      if (node.payload.floatingObject.isCollapsed !== true) {
        if (nodeDefinition.properties !== undefined) {
          for (let i = 0; i < nodeDefinition.properties.length; i++) {
            let property = nodeDefinition.properties[i]

            switch (property.type) {
              case 'node': {
                if (node[property.name] !== undefined) {
                  let child
                  child = getNodeByShortcutKey(node[property.name], searchingKey)
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
                    child = getNodeByShortcutKey(nodePropertyArray[m], searchingKey)
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
