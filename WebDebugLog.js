 ﻿
function newWebDebugLog () {
  let thisObject = {
    write: write,
    fileName: 'undefined'
  }

  return thisObject

  function write (pText) {
    console.log(spacePad(thisObject.fileName, 50) + ' : ' + pText)

    function spacePad (str, max) {
      str = str.toString()
      return str.length < max ? spacePad(' ' + str, max) : str
    }
  }
}
