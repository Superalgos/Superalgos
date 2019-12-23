function newNodeDeleter () {
  thisObject = {
    deleteWorkspace: deleteWorkspace,
    deleteUIObject: deleteUIObject
  }

  return thisObject

  function destroyUiObject (node) {
    canvas.floatingSpace.uiObjectConstructor.destroyUiObject(node.payload)
  }

  function deleteWorkspace (node, rootNodes) {
    if (node.rootNodes !== undefined) {
      while (node.rootNodes.length > 0) {
        let rootNode = node.rootNodes[0]
        deleteUIObject(rootNode, rootNodes)
      }
    }

    completeDeletion(node, rootNodes)
    destroyUiObject(node)
    cleanNode(node)
  }

  function deleteUIObject (node, rootNodes) {
    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
    if (nodeDefinition !== undefined) {
      /* Remove all of its own children nodes. */
      if (nodeDefinition.properties !== undefined) {
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]

          switch (property.type) {
            case 'node': {
              if (node[property.name] !== undefined) {
                deleteUIObject(node[property.name], rootNodes)
              }
            }
              break
            case 'array': {
              let nodePropertyArray = node[property.name]
              if (nodePropertyArray !== undefined) {
                while (nodePropertyArray.length > 0) {
                  deleteUIObject(nodePropertyArray[0], rootNodes)
                }
              }
            }
              break
          }
        }
      }

      /* Remove node from parent */
      if (node.payload.parentNode !== undefined) {
        let parentNodeDefinition = APP_SCHEMA_MAP.get(node.payload.parentNode.type)
        if (parentNodeDefinition !== undefined) {
          if (parentNodeDefinition.properties !== undefined) {
            for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
              let property = parentNodeDefinition.properties[i]
              if (nodeDefinition.propertyNameAtParent === property.name) {
                switch (property.type) {
                  case 'node': {
                    node.payload.parentNode[property.name] = undefined
                  }
                    break
                  case 'array': {
                    let nodePropertyArray = node.payload.parentNode[property.name]
                    if (nodePropertyArray !== undefined) {
                      for (let j = 0; j < nodePropertyArray.length; j++) {
                        let arrayItem = nodePropertyArray[j]
                        if (arrayItem.id === node.id) {
                          nodePropertyArray.splice(j, 1)
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

      completeDeletion(node, rootNodes)
      destroyUiObject(node)
      cleanNode(node)
    }
  }

  function completeDeletion (node, rootNodes) {
    for (let i = 0; i < rootNodes.length; i++) {
      let rootNode = rootNodes[i]
      if (rootNode.id === node.id) {
        rootNodes.splice(i, 1)
        return
      }
    }
  }

  function cleanNode (node) {
    node.payload.targetPosition.x = undefined
    node.payload.targetPosition.y = undefined
    node.payload.visible = undefined
    node.payload.subTitle = undefined
    node.payload.title = undefined
    node.payload.node = undefined
    node.payload.parentNode = undefined
    node.payload.chainParent = undefined
    node.payload.onMenuItemClick = undefined
    node.handle = undefined
    node.payload = undefined
    node.cleaned = true
  }
}
