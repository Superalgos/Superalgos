 ﻿
/*

We call displacement to the offset we can produce to the object which the displcement object is is a child from.
The displacement is a vector that displaces everything static drawn on on the context of the parent object.

*/

function newDisplacement () {
  let displacement = {
    containerName: '',                      // This is for debugging purposes only.
    parentDisplacement: undefined,          // Here we store the displacement object of the parent cointainer, if exists.
    container: undefined,
    x: 0,                                   // This is the actual x displacement.
    y: 0,                                   // This is the actual y displacement.
    displace: displace,
    undisplaceThisPoint: undisplaceThisPoint,
    displaceThisPoint: displaceThisPoint
  }

  return displacement

  function displace (amountX, amountY) {
        /* First we check if by allowing this displacement we would produce the current frame to be beyond its limit. */

    tempDisplacement = newDisplacement()
    tempDisplacement.x = amountX
    tempDisplacement.y = amountY

    if (this.container.frame.canYouMoveHere(tempDisplacement)) {
            /* Now we displace */

      displacement.x = displacement.x + amountX
      displacement.y = displacement.y + amountY

      return true
    }

    return false
  }

  function displaceThisPoint (point) {
    if (this.parentDisplacement !== undefined) {
      point = this.parentDisplacement.displaceThisPoint(point)
    }

    point.x = point.x + displacement.x
    point.y = point.y + displacement.y

    return point
  }

  function undisplaceThisPoint (point) {
    if (this.parentDisplacement !== undefined) {
      point = this.parentDisplacement.undisplaceThisPoint(point)
    }

    point.x = point.x - displacement.x
    point.y = point.y - displacement.y

    return point
  }
}

