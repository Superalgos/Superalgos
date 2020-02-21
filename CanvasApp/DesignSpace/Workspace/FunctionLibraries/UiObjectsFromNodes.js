function newUiObjectsFromNodes () {
  thisObject = {
    recreateWorkspace: recreateWorkspace,
    tryToConnectChildrenWithReferenceParents: tryToConnectChildrenWithReferenceParents,
    createUiObjectFromNode: createUiObjectFromNode,
    addUIObject: addUIObject,
    addMissingChildren: addMissingChildren
  }

  let mapOfReferenceChildren = new Map()
  let mapOfNodes
  let tasksToRun
  let sessionsToRun

  return thisObject

  function recreateWorkspace (node, replacingCurrentWorkspace) {
    mapOfNodes = new Map()
    tasksToRun = []
    sessionsToRun = []

   /* Create the workspace UI OBject and then continue with the root nodes. */
    createUiObject(false, 'Workspace', node.name, node, undefined, undefined, 'Workspace')
    if (node.rootNodes !== undefined) {
      for (let i = 0; i < node.rootNodes.length; i++) {
        let rootNode = node.rootNodes[i]
        createUiObjectFromNode(rootNode, undefined, undefined)
      }
    }

    tryToConnectChildrenWithReferenceParents()

    if (replacingCurrentWorkspace === true) {
      // We need to wait all tasks that were potentially running to stop
      setTimeout(runTasks, 70000)
      // We give a few seconds for the tasks to start
      setTimeout(runSessions, 80000)
    } else {
      runTasks()
      // We give a few seconds for the tasks to start
      setTimeout(runSessions, 10000)
    }
  }

  function runTasks () {
    for (let i = 0; i < tasksToRun.length; i++) {
      let node = tasksToRun[i]
      node.payload.uiObject.menu.internalClick('Run Task')
    }
    tasksToRun = undefined
  }

  function runSessions () {
    for (let i = 0; i < sessionsToRun.length; i++) {
      let node = sessionsToRun[i]
      node.payload.uiObject.menu.internalClick('Run Session')
    }
    sessionsToRun = undefined
  }

  function tryToConnectChildrenWithReferenceParents () {
    /* We reconstruct here the reference relationships. */
    for (const [key, node] of mapOfNodes) {
      if (node.payload === undefined) { continue }
      if (node.payload.referenceParent !== undefined) {
        if (node.payload.referenceParent.cleaned === true) {
          node.payload.referenceParent = mapOfNodes.get(node.payload.referenceParent.id)
          continue  // We were referencing a deleted node, so we replace it potentially with a newly created one.
        } else {
          continue  // In this case the reference is already good.
        }
      }
      if (node.savedPayload !== undefined) {
        if (node.savedPayload.referenceParent !== undefined) { // these are children recreated
          node.payload.referenceParent = mapOfNodes.get(node.savedPayload.referenceParent.id)
        }
      }
    }
  }

  function createUiObjectFromNode (node, parentNode, chainParent, positionOffset) {
    /* Get node definition */
    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
    if (nodeDefinition !== undefined) {
      /* Resolve Initial Values */
      if (nodeDefinition.initialValues !== undefined) {
        if (nodeDefinition.initialValues.code !== undefined) {
          if (node.code === undefined) {
            node.code = nodeDefinition.initialValues.code
          }
        }
      }

      /* For the cases where an node is not chained to its parent but to the one at the parent before it at its collection */
      if (nodeDefinition.chainedToSameType === true) {
        if (parentNode !== undefined) {
          let parentNodeDefinition = APP_SCHEMA_MAP.get(parentNode.type)
          if (parentNodeDefinition !== undefined) {
            if (parentNodeDefinition.properties !== undefined) {
              for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
                let property = parentNodeDefinition.properties[i]
                if (property.childType === node.type) {
                  if (property.type === 'array') {
                    if (parentNode[property.name] !== undefined) {
                      if (parentNode[property.name].length > 1) {
                        let nodeChildren = parentNode[property.name]
                        for (let j = 0; j < nodeChildren.length; j++) {
                          if (node.id === nodeChildren[j].id) {
                            if (j > 0) {
                              chainParent = nodeChildren[j - 1]
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      /* Create Self */
      createUiObject(false, node.type, node.name, node, parentNode, chainParent, node.type, positionOffset)

      /* Create Children */
      if (nodeDefinition.properties !== undefined) {
        let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]
          if (node[property.name] !== undefined) {
            switch (property.type) {
              case 'node': {
                if (property.name !== previousPropertyName) {
                  createUiObjectFromNode(node[property.name], node, node, positionOffset)
                  previousPropertyName = property.name
                }
              }
                break
              case 'array': {
                let nodePropertyArray = node[property.name]
                for (let m = 0; m < nodePropertyArray.length; m++) {
                  let arrayItem = nodePropertyArray[m]
                  createUiObjectFromNode(arrayItem, node, node, positionOffset)
                }
              }
                break
            }
          }
        }
      }
    }
  }

  function addUIObject (parentNode, type) {
    let object = {
      name: 'New ' + type,
      type: type
    }

    let parentNodeDefinition = APP_SCHEMA_MAP.get(parentNode.type)
    if (parentNodeDefinition !== undefined) {
      /* Resolve Initial Values */
      let nodeDefinition = APP_SCHEMA_MAP.get(object.type)

      if (nodeDefinition.isHierarchyHead === true) {
        parentNode.rootNodes.push(object)
        createUiObject(true, object.type, object.name, object, parentNode, undefined)
        return object
      }

      /* For the cases where an node is not chained to its parent but to the one at the parent before it at its collection */
      let chainParent = parentNode
      if (nodeDefinition.chainedToSameType === true) {
        if (parentNodeDefinition.properties !== undefined) {
          for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
            let property = parentNodeDefinition.properties[i]
            if (property.childType === type) {
              if (property.type === 'array') {
                if (parentNode[property.name] !== undefined) {
                  if (parentNode[property.name].length > 0) {
                    let nodeChildren = parentNode[property.name]
                    chainParent = nodeChildren[nodeChildren.length - 1]
                  }
                }
              }
            }
          }
        }
      }

      /* Create Empty Arrays for properties of type Array */
      if (nodeDefinition.properties !== undefined) {
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]
          if (property.type === 'array') {
            object[property.name] = []
          }
        }
      }

      if (nodeDefinition !== undefined) {
        if (nodeDefinition.initialValues !== undefined) {
          if (nodeDefinition.initialValues.code !== undefined) {
            object.code = nodeDefinition.initialValues.code
          }
        }
      }

      /* Connect to Parent */
      if (parentNodeDefinition.properties !== undefined) {
        let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
        for (let i = 0; i < parentNodeDefinition.properties.length; i++) {
          let property = parentNodeDefinition.properties[i]
          if (property.childType === type) {
            switch (property.type) {
              case 'node': {
                if (property.name !== previousPropertyName) {
                  parentNode[property.name] = object
                  previousPropertyName = property.name
                }
              }
                break
              case 'array': {
                if (parentNode[property.name] === undefined) {
                  parentNode[property.name] = []
                }
                if (property.maxItems !== undefined) {
                  if (parentNode[property.name].length < property.maxItems) {
                    parentNode[property.name].push(object)
                  } else {
                    return // Object can not be created.
                  }
                } else {
                  parentNode[property.name].push(object)
                }
              }
                break
            }
          }
        }
      }

      createUiObject(true, object.type, object.name, object, parentNode, chainParent)

      /* Auto Add more Children */
      if (nodeDefinition.properties !== undefined) {
        let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]

          switch (property.type) {
            case 'node': {
              if (property.name !== previousPropertyName) {
                if (property.autoAdd === true) {
                  addUIObject(object, property.childType)
                  previousPropertyName = property.name
                }
              }
            }
              break
            case 'array': {
              if (property.autoAdd === true) {
                if (object[property.name] === undefined) {
                  object[property.name] = []
                }
                addUIObject(object, property.childType)
              }
            }
              break
          }
        }
      }
    }
    return object
  }

  function addMissingChildren (node) {
    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)

      /* Connect to Parent */
    if (nodeDefinition.properties !== undefined) {
      let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
      for (let i = 0; i < nodeDefinition.properties.length; i++) {
        let property = nodeDefinition.properties[i]
        if (property.type === 'node') {
          if (property.name !== previousPropertyName) {
            if (node[property.name] === undefined) {
              addUIObject(node, property.childType)
              previousPropertyName = property.name
            }
          }
        }
      }
    }
  }

  function createUiObject (userAddingNew, uiObjectType, name, node, parentNode, chainParent, title, positionOffset) {
    let payload = {}

    /* Mechanism related to keeping references when cloning */
    if (node.id === undefined) {
      node.id = newUniqueId()
    } else {
      let testNode = mapOfNodes.get(node.id)
      if (testNode !== undefined && testNode.cleaned !== true) {
        node.id = newUniqueId()
      }
    }

    /* Default Naming */
    if (name === '' || name === undefined) { name = 'My ' + uiObjectType }

    /* If we are creating this object as the result of restoring a backup, share or clone, we will bring some of the saved properties to the new running instance. */
    if (userAddingNew === false && uiObjectType !== 'Workspace') {
      /* This following info can not be missing. */
      if (node.savedPayload === undefined) {
        console.log('Node ' + node.type + ' without savedPayload.', node)
        return
      }
      if (node.savedPayload.position === undefined) {
        console.log('Node ' + node.type + ' without savedPayload.position.', node)
        return
      }
      if (node.savedPayload.targetPosition === undefined) {
        console.log('Node ' + node.type + ' without savedPayload.targetPosition.', node)
        return
      }

      /* If there is not a position offset, which happens when we are dropping a node into the designer, we create a cero vector then. */
      if (positionOffset === undefined) {
        positionOffset = {
          x: 0,
          y: 0
        }
      }

      /* Adding the offset to the saved positions. */
      node.savedPayload.targetPosition.x = node.savedPayload.targetPosition.x + positionOffset.x
      node.savedPayload.targetPosition.y = node.savedPayload.targetPosition.y + positionOffset.y
      node.savedPayload.position.x = node.savedPayload.position.x + positionOffset.x
      node.savedPayload.position.y = node.savedPayload.position.y + positionOffset.y

      /* Transferring the saved payload properties into the running instance being created. */
      payload.targetPosition = {
        x: node.savedPayload.targetPosition.x,
        y: node.savedPayload.targetPosition.y
      }
      node.savedPayload.targetPosition = undefined

      /* Reference children connection to parents */
      if (node.savedPayload.referenceParent !== undefined) {
        payload.referenceParent = mapOfNodes.get(node.savedPayload.referenceParent.id)

        if (payload.referenceParent !== undefined) {
          mapOfReferenceChildren.set(node.id, node)
        }
      }
    }

    /* If we are adding a new object, then we set the initial values for position and targetPosition */
    if (userAddingNew === true || uiObjectType === 'Workspace') {
      /* Workspace allways to the spawn position */
      if (uiObjectType === 'Workspace') {
        payload.position = {
          x: spawnPosition.x,
          y: spawnPosition.y
        }
      }

      /* Chain parent pointing to the position of the chain parent if defined. */
      if (chainParent === undefined) {
        payload.targetPosition = {
          x: spawnPosition.x,
          y: spawnPosition.y
        }
      } else {
        payload.targetPosition = {
          x: chainParent.payload.position.x,
          y: chainParent.payload.position.y
        }
      }
    }

    /* Setting the title */
    if (title !== undefined) {
      payload.subTitle = title
    } else {
      payload.subTitle = uiObjectType
    }

    payload.visible = true
    payload.title = name
    payload.node = node
    payload.parentNode = parentNode
    payload.chainParent = chainParent
    payload.onMenuItemClick = canvas.designSpace.workspace.onMenuItemClick

    node.payload = payload
    node.type = uiObjectType

    /* Now we mount the floating object where the UIOBject will be laying on top of */
    canvas.floatingSpace.uiObjectConstructor.createUiObject(userAddingNew, payload)

    mapOfNodes.set(node.id, node)

    /* Check if there are tasks to run */
    if (userAddingNew === false && uiObjectType === 'Task' && node.savedPayload !== undefined) {
      if (node.savedPayload.uiObject.isRunning === true) {
        tasksToRun.push(node)
      }
    }

        /* Check if there are sessions to run */
    if (userAddingNew === false && node.savedPayload !== undefined) {
      if (uiObjectType === 'Live Trading Session' || uiObjectType === 'Fordward Testing Session' || uiObjectType === 'Backtesting Session' || uiObjectType === 'Paper Trading Session') {
        if (node.savedPayload.uiObject.isRunning === true) {
          sessionsToRun.push(node)
        }
      }
    }
  }
}
