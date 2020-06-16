/*
This function scans a node hiriatchy recursively. At each node it calls the callback
provided with the corresponfing value of the array.
*/

function evalNode (node, array, index, callback) {
  if (node === undefined) { return }
  if (array === undefined) { return }
  if (index === undefined) { return }
  if (callback === undefined) { return }

  callback(node, array[index])

  /* Now we go down through all this node children */
  let nodeDefinition = APP_SCHEMA_MAP.get(node.type)
  if (nodeDefinition === undefined) { return }

  if (nodeDefinition.properties !== undefined) {
    let previousPropertyName // Since there are cases where there are many properties with the same name,because they can hold nodes of different types but only one at the time, we have to avoind counting each property of those as individual children.
    for (let i = 0; i < nodeDefinition.properties.length; i++) {
      let property = nodeDefinition.properties[i]

      switch (property.type) {
        case 'node': {
          if (property.name !== previousPropertyName) {
            if (node[property.name] !== undefined) {
              evalNode(node[property.name], array, index + 1, callback)
            }
            previousPropertyName = property.name
          }
          break
        }
        case 'array': {
          if (node[property.name] !== undefined) {
            let nodePropertyArray = node[property.name]
            for (let m = 0; m < nodePropertyArray.length; m++) {
              evalNode(nodePropertyArray[m], array, index + 1, callback)
            }
          }
          break
        }
      }
    }
  }
}
