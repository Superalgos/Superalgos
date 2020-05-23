function savePropertyAtNodeConfig (payload, propertyName, value) {
  try {
    let code = JSON.parse(payload.node.code)
    code[propertyName] = value
    payload.node.code = JSON.stringify(code, null, 4)
  } catch (err) {
     // we ignore errors here since most likely they will be parsing errors.
  }
}

function loadPropertyFromNodeConfig (payload, propertyName) {
  try {
    let code = JSON.parse(payload.node.code)
    return code[propertyName]
  } catch (err) {
     // we ignore errors here since most likely they will be parsing errors.
  }
}
