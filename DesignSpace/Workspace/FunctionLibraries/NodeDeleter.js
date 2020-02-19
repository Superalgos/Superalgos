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
    if (node.id === '0726a9e4-23b6-4d27-a8de-e91a9665a8ba') {
      console.log('a')
    }
    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
    if (nodeDefinition !== undefined) {
      /* Remove all of its own children nodes. */
      if (nodeDefinition.properties !== undefined) {
        let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]

          switch (property.type) {
            case 'node': {
              if (property.name !== previousPropertyName) {
                if (node[property.name] !== undefined) {
                  deleteUIObject(node[property.name], rootNodes)
                }
                previousPropertyName = property.name
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

      if (node.payload === undefined) {
        console.log('a')
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
                          /* If this object is chained to the ones of the same type we need to give the next in the chain the reference to the current chain parent */
                          if (nodeDefinition.chainedToSameType === true) {
                            if (j < nodePropertyArray.length - 1) {
                              let nextArrayItem = nodePropertyArray[j + 1]
                              nextArrayItem.payload.chainParent = node.payload.chainParent
                            }
                          }

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
    if (node.id === '52d55987-e468-43fb-a93e-f92d720fa67e') {
      console.log('a')
    }
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
