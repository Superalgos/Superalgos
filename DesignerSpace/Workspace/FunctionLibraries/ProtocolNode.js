function newProtocolNode () {
  const MODULE_NAME = 'Protocol Node'
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  thisObject = {
    getProtocolNode: getProtocolNode
  }
  return thisObject

  function getProtocolNode (node, removePersonalData, parseCode, includeIds, includePayload, includeReferencesInSavedPayload, lightingPath) {
    if (node === undefined) { return }
    if (node.payload === undefined) { return }

    let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
    if (nodeDefinition !== undefined) {
      if (removePersonalData === true && nodeDefinition.isPersonalData === true) { return }
      let object = {
        type: node.type,
        subType: node.subType,
        name: node.name,
        code: node.code
      }

      /* Children Nodes */
      if (nodeDefinition.properties !== undefined) {
        let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]

          switch (property.type) {
            case 'node': {
              if (node[property.name] !== undefined) {
                if (property.name !== previousPropertyName) {
                  if (lightingPath === undefined) {
                    object[property.name] = getProtocolNode(node[property.name], removePersonalData, parseCode, includeIds, includeReferencesInSavedPayload, includePayload)
                  } else {
                    let newLightingPath = getNewLightingPath(lightingPath, node.type, property.childType)
                    if (newLightingPath !== undefined) {
                      object[property.name] = getProtocolNode(node[property.name], removePersonalData, parseCode, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
                    }
                  }
                  previousPropertyName = property.name
                }
              }
              break
            }
            case 'array': {
              if (node[property.name] !== undefined) {
                if (lightingPath === undefined) {
                  let nodePropertyArray = node[property.name]
                  object[property.name] = []
                  for (let m = 0; m < nodePropertyArray.length; m++) {
                    let protocolNode = getProtocolNode(nodePropertyArray[m], removePersonalData, parseCode, includeIds, includeReferencesInSavedPayload, includePayload)
                    if (protocolNode !== undefined) {
                      object[property.name].push(protocolNode)
                    }
                  }
                } else {
                  let newLightingPath = getNewLightingPath(lightingPath, node.type, property.childType)
                  if (newLightingPath !== undefined) {
                    let nodePropertyArray = node[property.name]
                    object[property.name] = []
                    for (let m = 0; m < nodePropertyArray.length; m++) {
                      let protocolNode = getProtocolNode(nodePropertyArray[m], removePersonalData, parseCode, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
                      if (protocolNode !== undefined) {
                        object[property.name].push(protocolNode)
                      }
                    }
                  }
                }
              }
              break
            }
          }
        }
      }

      /* Parent Nodes */
      if (node.payload.parentNode !== undefined) {
        let newLightingPath = getNewLightingPath(lightingPath, node.type, node.payload.parentNode.type)
        if (newLightingPath !== undefined) {
          object.parentNode = getProtocolNode(node.payload.parentNode, removePersonalData, parseCode, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
        }
      }
      if (node.payload.referenceParent !== undefined) {
        let newLightingPath = getNewLightingPath(lightingPath, node.type, node.payload.referenceParent.type)
        if (newLightingPath !== undefined) {
          object.referenceParent = getProtocolNode(node.payload.referenceParent, removePersonalData, parseCode, includeIds, includePayload, includeReferencesInSavedPayload, newLightingPath)
        }
      }

      if (parseCode && object.code !== undefined && nodeDefinition.editors !== undefined) {
        if (nodeDefinition.editors.config === true) {
          try {
            object.code = JSON.parse(node.code)
          } catch (err) {
            if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> err = ' + err.stack) }
            if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.type = ' + node.type) }
            if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.name = ' + node.name) }
            if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.code = ' + node.code) }
            if (ERROR_LOG === true) { logger.write('[ERROR] getProtocolNode -> default -> node.id = ' + node.id) }
          }
        }
      }

      if (includeIds) {
        object.id = node.id
      }
      if (includePayload) {
        object.savedPayload = getSavedPayload(node, includeReferencesInSavedPayload)
      }

      return object
    }
  }

  function getNewLightingPath (lightingPath, currentNodeType, nextNodeType) {
    if (lightingPath === undefined) { return }

    if (currentNodeType === undefined) { return }
    if (nextNodeType === undefined) { return }

    let currentNodePosition = lightingPath.indexOf('->' + currentNodeType + '->')
    let nextNodePosition = lightingPath.indexOf('->' + nextNodeType + '->')

    let newLightingPath = lightingPath.substring(nextNodePosition, lightingPath.length + 1)

    if (nextNodePosition > currentNodePosition) {
      return newLightingPath
    } else {
      return
    }
  }

  function getSavedPayload (node, includeReferencesInSavedPayload) {
    if (node.payload === undefined) { return }
    let savedPayload = {
      position: {
        x: node.payload.position.x,
        y: node.payload.position.y
      },
      targetPosition: {
        x: node.payload.targetPosition.x,
        y: node.payload.targetPosition.y
      },
      floatingObject: {
        isPinned: node.payload.floatingObject.isPinned,
        isFrozen: (node.payload.floatingObject.isFrozen && node.payload.floatingObject.frozenManually),
        isCollapsed: (node.payload.floatingObject.isCollapsed && node.payload.floatingObject.collapsedManually),
        isTensed: (node.payload.floatingObject.isTensed && node.payload.floatingObject.tensedManually)
      },
      uiObject: {
        isRunning: node.payload.uiObject.isRunning,
        shortcutKey: node.payload.uiObject.shortcutKey
      }
    }

    if (includeReferencesInSavedPayload) {
      /* Next for the ones that have a reference parent, we include it */
      if (node.payload.referenceParent !== undefined) {
        savedPayload.referenceParent = {
          type: node.payload.referenceParent.type,
          subType: node.payload.referenceParent.subType,
          name: node.payload.referenceParent.name,
          id: node.payload.referenceParent.id
        }
      } else {
        /* The referenceParent property can be inherited from the previous saved payload. */
        if (node.savedPayload !== undefined) {
          savedPayload.referenceParent = node.savedPayload.referenceParent
        }
      }
    }
    return savedPayload
  }
}
