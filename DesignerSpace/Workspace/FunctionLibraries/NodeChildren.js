function newNodeChildren () {
  thisObject = {
    childrenCount: childrenCount
  }

  return thisObject

  function childrenCount (parentNode, childNode) {
    return countChildrenUiObject(parentNode, childNode)
  }

  function countChildrenUiObject (parentNode, childNode) {
    let response = {
      childrenCount: 0,
      childIndex: undefined
    }
    let nodeDefinition = APP_SCHEMA_MAP.get(parentNode.type)
    if (nodeDefinition !== undefined) {
      if (nodeDefinition.properties !== undefined) {
        let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.

        for (let i = 0; i < nodeDefinition.properties.length; i++) {
          let property = nodeDefinition.properties[i]
          if (parentNode[property.name] !== undefined) {
            switch (property.type) {
              case 'node': {
                if (property.name !== previousPropertyName) {
                  response.childrenCount++
                  if (parentNode[property.name].id === childNode.id) {
                    response.childIndex = response.childrenCount
                  }
                  previousPropertyName = property.name
                }
              }
                break
              case 'array': {
                let nodePropertyArray = parentNode[property.name]
                for (let j = 0; j < nodePropertyArray.length; j++) {
                  let child = nodePropertyArray[j]
                  response.childrenCount++
                  if (child.id === childNode.id) {
                    response.childIndex = response.childrenCount
                  }
                }
              }
                break
            }
          }
        }
      }
    }

    return response
  }
}
