function newUIControl () {
  let thisObject = {
    drawFunction: undefined,
    paramsArray: undefined,
    container: undefined,
    draw: draw,
    parentContainer: undefined,
    getContainer: getContainer,     // returns the inner most container that holds the point received by parameter.
    initialize: initialize
  }

  let isInitialized = false
   /* Cointainer stuff */

  let container = newContainer()

  container.name = 'UI Control'
  container.initialize()

  container.isClickeable = true

  thisObject.container = container
  thisObject.container.frame.containerName = 'Panel Tab Button'

  return thisObject

  function initialize () {
    isInitialized = true
  }

  function draw () {
    if (isInitialized === false) { return }

    if (thisObject.drawFunction !== undefined && thisObject.paramsArray !== undefined) {
      thisObject.drawFunction(thisObject.paramsArray)
    }
  }

  function getContainer (point) {
    var container

       /* First we check if thisObject point is inside thisObject space. */

    if (thisObject.container.frame.isThisPointHere(point, true) === true) {
           /* Now we see which is the inner most container that has it */

      return thisObject.container
    } else {
           /* This point does not belong to thisObject space. */

      return undefined
    }
  }
}

