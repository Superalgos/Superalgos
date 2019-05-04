 ﻿
function newFloatingLayer () {
    /*
    This module represent one layer of many possible layers that could be at the Floating Space. Objects in the same layer are subject to
    the same physics, and by being at the same level, they interact with each other. For example, they can bounce when one hit the other.
    This module posesses its own physics engine. There are different types of floating objects, but this layer takes care of each of them.

    Floating Objects Types:

    1. Profile Balls: These are small balls with a profile picture, and two levels, one above and one below the ball. They are usually used
                      to specify the location of a bot instance.

    2. Notes:         Notes are a rectangular area where some text is posted. It has a subject and a body.

    3. Strategy Parts: These are small balls that represent parts of an strategy.
    */

  const MODULE_NAME = 'Floating Layer'
  const INFO_LOG = false
  let INTENSIVE_LOG = false
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    addFloatingObject: addFloatingObject,
    killFloatingObject: killFloatingObject,
    getFloatingObject: getFloatingObject,
    physicsLoop: physicsLoop,
    isInside: isInside,
    isInsideFloatingObject: isInsideFloatingObject,
    changeTargetRepulsion: changeTargetRepulsion,
    getContainer: getContainer,
    initialize: initialize,
    finalize: finalize
  }

    /*
    When objects are added to this layer they are added to the invisibleFloatingObjects array and they stay there because they are invisible.
    Visibility of objects is not decided at this layer, but outside. The ones who decides which object is visible or not are plotters, because
    they know the position of objects and the coordinate system which these positions belong to.

    To save resources, the physics engine only apply its calculations to visible floating objects.
    */

  let invisibleFloatingObjects = []

    /*
    Floating objects are accesible to plotters because they carry a "payload" object that was creted by them. This object includes the position
    and visible property. When visible turns to true, this layer module will move the reference of the floating object from the invisible array
    to the visibleFloatingObjects array. If the plotter decides that the object is to far from the what the user is seeing, it can eventually
    turn the visible property off again, forcing the layer to remove the object from the visibleFloatingObjects and place it again at the invisible
    array.
    */

  let visibleFloatingObjects = []

    /*
    The creator of the floatingObject at any time can decide to get rid of it and kill it. But we dont want the object just to dissapear because
    that doesnt look good. What this module does is to remove it from the visible or invisible layer where they are and move them to the
    dyingFloatingObjects array. Object in this array have a short animation until they finally graphically dissapear and at thay point they are also
    removed from the dying array for good.
    */

  let dyingFloatingObjects = []

  let maxTargetRepulsionForce = 0.001
  let currentHandle = 0

  return thisObject

  function finalize () {
    try {
      if (INFO_LOG === true) { logger.write('[INFO] finalize -> Entering function.') }

      invisibleFloatingObjects = []
      visibleFloatingObjects = []
      dyingFloatingObjects = []
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] finalize -> err = ' + err.stack) }
    }
  }

  function initialize () {

        /* We dont need to initialize anything right now. */
  }

  function getContainer (point) {
    let container

    for (let i = 0; i < visibleFloatingObjects.length; i++) {
      let floatingObject = visibleFloatingObjects[i]
      container = floatingObject.getContainer(point)
      if (container !== undefined) { return container }
    }

    return container
  }

  function addFloatingObject (pFloatingObject, callBackFunction) {
        /*
        As you can see here, even though the floating objects are created outside this layer, its creator it is not supossed to keep
        the reference to the object, so that the managment of the objects references can live entirely inside this module. What the
        creator keeps, is a handle to the object which it can use to retrieve the floating object when needed.
        */

    try {
      if (INFO_LOG === true) { logger.write('[INFO] addFloatingObject -> Entering function.') }

      invisibleFloatingObjects.push(pFloatingObject)

      if (INFO_LOG === true) { logger.write('[INFO] addFloatingObject -> invisibleFloatingObjects.length = ' + invisibleFloatingObjects.length) }

      currentHandle++

      pFloatingObject.handle = currentHandle // Math.floor((Math.random() * 10000000) + 1);

      if (INFO_LOG === true) { logger.write('[INFO] addFloatingObject -> pFloatingObject.handle = ' + pFloatingObject.handle) }
      if (INFO_LOG === true) { logger.write('[INFO] addFloatingObject -> pFloatingObject.type = ' + pFloatingObject.type) }

      if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE) }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] addFloatingObject -> err.message = ' + err.message) }
      if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE) }
    }
  }

  function killFloatingObject (pFloatingObjectHandle, callBackFunction) {
    try {
            /*
            The floting object to be killed can be either at the visible or the invisible array. What we do here is look for it
            at each of the arrays until we find it. Once found, we remove it and is sent to the dying floating objects array.
            */

      if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> Entering function.') }

      for (let i = 0; i < invisibleFloatingObjects.length; i++) {
        let floatingObject = invisibleFloatingObjects[i]

        if (floatingObject.handle === pFloatingObjectHandle) {
          invisibleFloatingObjects.splice(i, 1)  // Delete item from array.

          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> floatingObject.handle = ' + floatingObject.handle) }
          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> Removing floatingObject from invisibleFloatingObjects.') }
          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> invisibleFloatingObjects.length = ' + invisibleFloatingObjects.length) }

          sendToDie(floatingObject)
          return
        }
      }

      for (let i = 0; i < visibleFloatingObjects.length; i++) {
        let floatingObject = visibleFloatingObjects[i]

        if (floatingObject.handle === pFloatingObjectHandle) {
          visibleFloatingObjects.splice(i, 1)  // Delete item from array.

          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> floatingObject.handle = ' + floatingObject.handle) }
          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> Removing floatingObject from visibleFloatingObjects.') }
          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> visibleFloatingObjects.length = ' + visibleFloatingObjects.length) }

          sendToDie(floatingObject)
          return
        }
      }

      if (ERROR_LOG === true) { logger.write('[ERROR] killFloatingObject -> Floating Object Not Found.') }
      if (ERROR_LOG === true) { logger.write('[ERROR] killFloatingObject -> Floating Object cannot be killed.') }
      if (ERROR_LOG === true) { logger.write('[ERROR] killFloatingObject -> pFloatingObjectHandle = ' + pFloatingObjectHandle) }

      if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE) }

      function sendToDie (pFloatingObject) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> sendToDie -> Entering function.') }

                    /* Lets mofigy the targerRadius */

          pFloatingObject.targetRadius = 0

                    /* Lets transfer the payload to a new payload structure. */

          let payload = {}

          switch (pFloatingObject.type) {

            case 'Profile Ball': {
              if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> sendToDie -> Profile Ball -> Entering function.') }

              if (pFloatingObject.payload.profile.visible === false) { return }

              payload.profile = {
                position: {
                  x: pFloatingObject.payload.profile.position.x,
                  y: pFloatingObject.payload.profile.position.y
                },
                visible: pFloatingObject.payload.profile.visible,
                botAvatar: pFloatingObject.payload.profile.botAvatar
              }

              pFloatingObject.payload = payload
              break
            }
            case 'Note': {
              if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> sendToDie -> Note -> Entering function.') }

              if (pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].visible === false) { return }

              payload.notes = []
              let note = {
                title: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].title,
                body: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].body,
                date: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].date,
                rate: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].rate,
                position: {
                  x: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.x,
                  y: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].position.y
                },
                visible: pFloatingObject.payload.notes[pFloatingObject.payloadNoteIndex].visible
              }
              payload.notes.push(note)
              pFloatingObject.payloadNoteIndex = 0

              pFloatingObject.payload = payload
              break
            }
            case 'Strategy Part': {
              if (pFloatingObject.payload.profile.visible === false) { return }

              payload.profile = {
                position: {
                  x: pFloatingObject.payload.profile.position.x,
                  y: pFloatingObject.payload.profile.position.y
                },
                visible: pFloatingObject.payload.profile.visible,
                botAvatar: pFloatingObject.payload.profile.botAvatar
              }

              pFloatingObject.payload = payload
              break
            }
            default: {
              break
            }
          }

          dyingFloatingObjects.push(pFloatingObject)

          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> sendToDie -> Adding floatingObject to dyingFloatingObjects.') }
          if (INFO_LOG === true) { logger.write('[INFO] killFloatingObject -> sendToDie -> dyingFloatingObjects.length = ' + dyingFloatingObjects.length) }

          if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_OK_RESPONSE) }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] killFloatingObject -> err.message = ' + err.message) }
          if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] killFloatingObject -> err.message = ' + err.message) }
      if (callBackFunction !== undefined) { callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE) }
    }
  }

  function getFloatingObject (pFloatingObjectHandle, pFloatingObjectIndex) {
        /*
        There are two ways to look for a floating object: by handle or by index. The search by handle is done on the visible and invisible array.
        The search by index is done only on the visible ones. The search by index is usually needed when mouse events occurs. In those cases
        only objects visible to the end usser matters.
        */

    try {
      if (INFO_LOG === true) { logger.write('[INFO] getFloatingObject -> Entering function.') }

      if (pFloatingObjectHandle !== undefined) {
        for (let i = 0; i < invisibleFloatingObjects.length; i++) {
          let floatingObject = invisibleFloatingObjects[i]

          if (floatingObject.handle === pFloatingObjectHandle) {
            return floatingObject
          }
        }

        for (let i = 0; i < visibleFloatingObjects.length; i++) {
          let floatingObject = visibleFloatingObjects[i]

          if (floatingObject.handle === pFloatingObjectHandle) {
            return floatingObject
          }
        }
      }

      if (pFloatingObjectIndex !== undefined) {
        for (let i = 0; i < visibleFloatingObjects.length; i++) {
          let floatingObject = visibleFloatingObjects[i]

          if (i === pFloatingObjectIndex) {
            return floatingObject
          }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] getFloatingObject -> err.message = ' + err.message) }
    }
  }

    /******************************************/
    /*                                        */
    /*        Physics Engine Follows          */
    /*                                        */
    /******************************************/

  function physicsLoop () {
        /*
        The Physics engine is hooked at the animation loop, so it executes very very often. According to this Physics engine, each
        floating object has a position and a speed. In fact, each floating object has two positions at the same time:

        1. The current position: is the position of the ball, floating around.
        2. The anchor position: is the position of where the ball is achored on the plot. This one is inside the payload object controlled by the
           plotter.

        The anchor position influences the current position, since the Physics engine will apply a gravity force to the ball's position in order
        to make it gravitate towards the anchor position. At the same time there will be a repulsion force that will prevent the ball reaching
        the anchor position, so that the anchor point keeps visible to the user.

        */

    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> Entering function.') }

      applyPhysics()

      function applyPhysics () {
                /* This function makes all the calculations to apply phisycs on all visible floatingObjects in this layer. */

        try {
          if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> applyPhysics -> Entering function.') }

          for (let i = 0; i < visibleFloatingObjects.length; i++) {
            let floatingObject = visibleFloatingObjects[i]

            if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> Change position based on speed.') }

            floatingObject.currentPosition.x = floatingObject.currentPosition.x + floatingObject.currentSpeed.x
            floatingObject.currentPosition.y = floatingObject.currentPosition.y + floatingObject.currentSpeed.y

            if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> Apply some friction to desaccelerate.') }

            floatingObject.currentSpeed.x = floatingObject.currentSpeed.x * floatingObject.friction  // Desaceleration factor.
            floatingObject.currentSpeed.y = floatingObject.currentSpeed.y * floatingObject.friction  // Desaceleration factor.

            if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> Gives a minimun speed towards their taget.') }

            let payload = {
              position: undefined,
              visible: false
            }

            switch (floatingObject.type) {

              case 'Profile Ball': {
                payload.position = floatingObject.payload.profile.position
                payload.visible = floatingObject.payload.profile.visible
                break
              }
              case 'Note': {
                payload.position = floatingObject.payload.notes[floatingObject.payloadNoteIndex].position
                payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible

                break
              }
              case 'Strategy Part': {
                payload.position = floatingObject.payload.profile.position
                payload.visible = floatingObject.payload.profile.visible
                break
              }
              default: {
                break
              }
            }

            if (floatingObject.currentPosition.x < payload.position.x) {
              floatingObject.currentSpeed.x = floatingObject.currentSpeed.x + 0.005
            } else {
              floatingObject.currentSpeed.x = floatingObject.currentSpeed.x - 0.005
            }

            if (floatingObject.currentPosition.y < payload.position.y) {
              floatingObject.currentSpeed.y = floatingObject.currentSpeed.y + 0.005
            } else {
              floatingObject.currentSpeed.y = floatingObject.currentSpeed.y - 0.005
            }

            if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> Set a maximun speed.') }

            const MAX_SPEED = 50

            if (floatingObject.currentSpeed.x > MAX_SPEED) {
              floatingObject.currentSpeed.x = MAX_SPEED
            }

            if (floatingObject.currentSpeed.y > MAX_SPEED) {
              floatingObject.currentSpeed.y = MAX_SPEED
            }

            if (floatingObject.currentSpeed.x < -MAX_SPEED) {
              floatingObject.currentSpeed.x = -MAX_SPEED
            }

            if (floatingObject.currentSpeed.y < -MAX_SPEED) {
              floatingObject.currentSpeed.y = -MAX_SPEED
            }

                        // The radius also have a target.

            if (Math.abs(floatingObject.currentRadius - floatingObject.targetRadius) >= 1) {
              if (floatingObject.currentRadius < floatingObject.targetRadius) {
                floatingObject.currentRadius = floatingObject.currentRadius + 0.5
              } else {
                floatingObject.currentRadius = floatingObject.currentRadius - 0.5
              }
            }

                        // The imageSize also have a target.

            if (Math.abs(floatingObject.currentImageSize - floatingObject.targetImageSize) >= 1) {
              if (floatingObject.currentImageSize < floatingObject.targetImageSize) {
                floatingObject.currentImageSize = floatingObject.currentImageSize + 1
              } else {
                floatingObject.currentImageSize = floatingObject.currentImageSize - 1
              }
            }

                        // The fontSize also have a target.

            if (Math.abs(floatingObject.currentFontSize - floatingObject.targetFontSize) >= 0.2) {
              if (floatingObject.currentFontSize < floatingObject.targetFontSize) {
                floatingObject.currentFontSize = floatingObject.currentFontSize + 0.2
              } else {
                floatingObject.currentFontSize = floatingObject.currentFontSize - 0.2
              }
            }

                        // We let the Floating Object animate the physics loops by itself.

            floatingObject.physicsLoop()

                        /* Collision Control */

            for (let k = i + 1; k < visibleFloatingObjects.length; k++) {
              if (colliding(visibleFloatingObjects[i], visibleFloatingObjects[k])) {
                resolveCollision(visibleFloatingObjects[k], visibleFloatingObjects[i])
              }
            }

                        /* Calculate repulsion force produced by all other floatingObjects */

            currentRepulsionForce(i)

            targetRepulsionForce(i)

            gravityForce(floatingObject, payload)
          }

          drawVisibleObjects()
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] physicsLoop -> applyPhysics -> err.message = ' + err.message) }
        }
      }

      function drawVisibleObjects () {
        try {
          if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> drawVisibleObjects -> Entering function.') }

                    /* We draw all the visibleFloatingObjects. */

          for (let i = 0; i < visibleFloatingObjects.length; i++) {
            let floatingObject = visibleFloatingObjects[i]
            floatingObject.drawBackground()
          }

          for (let i = 0; i < visibleFloatingObjects.length; i++) {
            let floatingObject = visibleFloatingObjects[visibleFloatingObjects.length - i - 1]
            floatingObject.drawForeground()
          }

          makeVisible()
        } catch (err) {
          if (ERROR_LOG === true && INTENSIVE_LOG === true) { logger.write('[ERROR] physicsLoop -> drawVisibleObjects -> err.message = ' + err.message) }
        }
      }

      function makeVisible () {
        try {
          if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> makeVisible -> Entering function.') }

                    /* Now we check if any of the created FloatingObjects where enabled to run under the Physics Engine. */

          for (let i = 0; i < invisibleFloatingObjects.length; i++) {
            let floatingObject = invisibleFloatingObjects[i]

            let payload = {
              position: undefined,
              visible: false
            }

            switch (floatingObject.type) {

              case 'Profile Ball': {
                payload.position = floatingObject.payload.profile.position
                payload.visible = floatingObject.payload.profile.visible
                break
              }
              case 'Note': {
                if (floatingObject.payload.notes[floatingObject.payloadNoteIndex] !== undefined) {
                  payload.position = floatingObject.payload.notes[floatingObject.payloadNoteIndex].position
                  payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible
                }
                break
              }
              case 'Strategy Part': {
                payload.position = floatingObject.payload.profile.position
                payload.visible = floatingObject.payload.profile.visible
                break
              }
              default: {
                break
              }
            }

            if (payload.visible === true) {
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> payload.visible = ' + payload.visible) }

                            /* The first time that the floatingObject becomes visible, we need to do this. */

              floatingObject.radomizeCurrentPosition(payload.position)
              floatingObject.radomizeCurrentSpeed()

              visibleFloatingObjects.push(floatingObject)

              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject.handle = ' + floatingObject.handle) }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject added to visibleFloatingObjects') }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> visibleFloatingObjects.length = ' + visibleFloatingObjects.length) }

              invisibleFloatingObjects.splice(i, 1)  // Delete item from array.

              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject.handle = ' + floatingObject.handle) }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject removed from invisibleFloatingObjects') }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> invisibleFloatingObjects.length = ' + invisibleFloatingObjects.length) }

              return                     // Only one at the time.
            }
          }

          makeInvisible()
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] physicsLoop -> makeVisible -> err.message = ' + err.message) }
        }
      }

      function makeInvisible () {
        try {
          if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> makeInvisible -> Entering function.') }

                    /* Finally we check if any of the currently visible floatingObjects has become invisible and must be removed from the Physics Engine. */

          for (let i = 0; i < visibleFloatingObjects.length; i++) {
            let floatingObject = visibleFloatingObjects[i]

            let payload = {
              position: undefined,
              visible: true
            }

            switch (floatingObject.type) {

              case 'Profile Ball': {
                payload.visible = floatingObject.payload.profile.visible
                break
              }
              case 'Note': {
                payload.visible = floatingObject.payload.notes[floatingObject.payloadNoteIndex].visible
                break
              }
              case 'Strategy Part': {
                payload.visible = floatingObject.payload.profile.visible
                break
              }
              default: {
                break
              }
            }

            if (payload.visible === false) {
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> payload.visible = ' + payload.visible) }

              invisibleFloatingObjects.push(floatingObject)

              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject.handle = ' + floatingObject.handle) }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject added to invisibleFloatingObjects') }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> invisibleFloatingObjects.length = ' + invisibleFloatingObjects.length) }

              visibleFloatingObjects.splice(i, 1)  // Delete item from array.

              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject.handle = ' + floatingObject.handle) }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> floatingObject removed from visibleFloatingObjects') }
              if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> visibleFloatingObjects.length = ' + visibleFloatingObjects.length) }

              return                     // Only one at the time.
            }
          }

          animateDyingObjects()
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] physicsLoop -> makeInvisible -> err.message = ' + err.message) }
        }
      }

      function animateDyingObjects () {
        try {
          if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> animateDyingObjects -> Entering function.') }

                    /* We animate some parts of the dying objects */

          for (let i = 0; i < dyingFloatingObjects.length; i++) {
            let floatingObject = dyingFloatingObjects[i]

            if (Math.abs(floatingObject.currentRadius - floatingObject.targetRadius) >= 5) {
              let speed = Math.random()

              floatingObject.currentRadius = floatingObject.currentRadius - speed * 3
            } else {
                            /* Here is when the floatingObjects are definetelly killed. */

              dyingFloatingObjects.splice(i, 1)  // Delete item from array.
              break  // only one at the time.
            }
          }

          drawDyingObjects()
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] physicsLoop -> animateDyingObjects -> err.message = ' + err.message) }
        }
      }

      function drawDyingObjects () {
        try {
          if (INTENSIVE_LOG === true) { logger.write('[INFO] physicsLoop -> drawDyingObjects -> Entering function.') }

                    /* We also draw all the dyingFloatingObjects */

          for (let i = 0; i < dyingFloatingObjects.length; i++) {
            let floatingObject = dyingFloatingObjects[i]
            floatingObject.drawBackground()
          }

          for (let i = 0; i < dyingFloatingObjects.length; i++) {
            let floatingObject = dyingFloatingObjects[dyingFloatingObjects.length - i - 1]
            floatingObject.drawForeground()
          }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] physicsLoop -> drawDyingObjects -> err.message = ' + err.message) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] physicsLoop -> err.message = ' + err.message) }
    }
  }

  function gravityForce (floatingObject, payload) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] gravityForce -> Entering function.') }

            /* We simulate a kind of gravity towards the target point of each floatingObject. This force will make the floatingObject to keep pushing to reach that point. */

      const coulomb = 0.00001
      const minForce = 0.01

      var d = Math.sqrt(Math.pow(payload.position.x - floatingObject.currentPosition.x, 2) + Math.pow(payload.position.y - floatingObject.currentPosition.y, 2))  // ... we calculate the distance ...

      var force = coulomb * d * d / floatingObject.currentMass  // In this case the mass of the floatingObject affects the gravity force that it receives, that gives priority to target position to bigger floatingObjects.

      if (force < minForce) { // We need this attraction force to overcome the friction we imposed to the system.
        force = minForce
      }

      var pos1 = {
        x: floatingObject.currentPosition.x,
        y: floatingObject.currentPosition.y
      }

      var pos2 = {
        x: payload.position.x,
        y: payload.position.y
      }

      var posDiff = {             // Next we need the vector resulting from the 2 positions.
        x: pos2.x - pos1.x,
        y: pos2.y - pos1.y
      }

      var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
        x: posDiff.x / d,
        y: posDiff.y / d
      }

      var forceVector = {
        x: unitVector.x * force,
        y: unitVector.y * force
      }

            /* We add the force vector to the speed vector */

      floatingObject.currentSpeed.x = floatingObject.currentSpeed.x + forceVector.x
      floatingObject.currentSpeed.y = floatingObject.currentSpeed.y + forceVector.y
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] gravityForce -> err.message = ' + err.message) }
    }
  }

  function currentRepulsionForce (currentFloatingObject) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] currentRepulsionForce -> Entering function.') }

            /* We generate a repulsion force between floatingObjects, that prevents them to be collisioning so often. */

      const coulomb = 2

      var floatingObject1 = visibleFloatingObjects[currentFloatingObject]

      for (var i = 0; i < visibleFloatingObjects.length; i++) {
  // The force to be applied is considering all other floatingObjects...

        if (i !== currentFloatingObject) {
  // ... except for the current one.

          var floatingObject2 = visibleFloatingObjects[i]   // So, for each floatingObject...

          var d = Math.sqrt(Math.pow(floatingObject2.currentPosition.x - floatingObject1.currentPosition.x, 2) + Math.pow(floatingObject2.currentPosition.y - floatingObject1.currentPosition.y, 2))  // ... we calculate the distance ...

          var force = coulomb * floatingObject2.currentMass / (d * d)  // ... and with it the repulsion force.

                    /* We need to put a hard limit to this force, in order to to eject very little floatingObjects to the infinite and beyond. */

          if (force > 1) {
            force = 1
          }

          var pos1 = {
            x: floatingObject1.currentPosition.x,
            y: floatingObject1.currentPosition.y
          }

          var pos2 = {
            x: floatingObject2.currentPosition.x,
            y: floatingObject2.currentPosition.y
          }

          var posDiff = {             // Next we need the vector resulting from the 2 positions.
            x: pos2.x - pos1.x,
            y: pos2.y - pos1.y
          }

          var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
            x: posDiff.x / d,
            y: posDiff.y / d
          }

          var forceVector = {
            x: unitVector.x * force,
            y: unitVector.y * force
          }

                    /* We substract the force vector to the speed vector of the current floatingObject */

          floatingObject1.currentSpeed.x = floatingObject1.currentSpeed.x - forceVector.x
          floatingObject1.currentSpeed.y = floatingObject1.currentSpeed.y - forceVector.y
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] currentRepulsionForce -> err.message = ' + err.message) }
    }
  }

  function targetRepulsionForce (currentFloatingObject) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] targetRepulsionForce -> Entering function.') }

            /* We generate a repulsion force between floatingObjects, that prevents them to be collisioning so often. */

      const coulomb = 2

      var floatingObject1 = visibleFloatingObjects[currentFloatingObject]

      for (var i = 0; i < visibleFloatingObjects.length; i++) {
  // The force to be applied is considering all other floatingObjects...

        var floatingObject2 = visibleFloatingObjects[i]   // So, for each floatingObject...

        let payload = {
          position: undefined
        }

        switch (floatingObject2.type) {

          case 'Profile Ball': {
            payload.position = floatingObject2.payload.profile.position
            break
          }
          case 'Note': {
            payload.position = floatingObject2.payload.notes[floatingObject2.payloadNoteIndex].position
            break
          }
          case 'Strategy Part': {
            payload.position = floatingObject2.payload.profile.position
            break
          }
          default: {
            break
          }
        }

        var d = Math.sqrt(Math.pow(payload.position.x - floatingObject1.currentPosition.x, 2) + Math.pow(payload.position.y - floatingObject1.currentPosition.y, 2))  // ... we calculate the distance ...

        var force = coulomb * floatingObject2.currentMass / (d * d)  // ... and with it the repulsion force.

                /* We need to put a hard limit to this force, in order to to eject very little floatingObjects to the infinite and beyond. */

        if (force > maxTargetRepulsionForce) {
          force = maxTargetRepulsionForce
        }

        var pos1 = {
          x: floatingObject1.currentPosition.x,
          y: floatingObject1.currentPosition.y
        }

        var pos2 = {
          x: payload.position.x,
          y: payload.position.y
        }

        var posDiff = {             // Next we need the vector resulting from the 2 positions.
          x: pos2.x - pos1.x,
          y: pos2.y - pos1.y
        }

        var unitVector = {          // To find the unit vector, we divide each component by the magnitude of the vector.
          x: posDiff.x / d,
          y: posDiff.y / d
        }

        var forceVector = {
          x: unitVector.x * force,
          y: unitVector.y * force
        }

                /* We substract the force vector to the speed vector of the current floatingObject */

        floatingObject1.currentSpeed.x = floatingObject1.currentSpeed.x - forceVector.x
        floatingObject1.currentSpeed.y = floatingObject1.currentSpeed.y - forceVector.y
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] targetRepulsionForce -> err.message = ' + err.message) }
    }
  }

  function changeTargetRepulsion (pDelta) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] changeTargetRepulsion -> Entering function.') }

      if (pDelta > 0) {
        pDelta = 1
      } else {
        pDelta = -1
      }

      maxTargetRepulsionForce = maxTargetRepulsionForce + pDelta / 10000

      if (maxTargetRepulsionForce < 0.0001) {
        maxTargetRepulsionForce = 0.0001
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] changeTargetRepulsion -> err.message = ' + err.message) }
    }
  }

  function colliding (floatingObject1, floatingObject2) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] colliding -> Entering function.') }

            /* This function detects weather 2 floatingObjects collide with each other. */

      var r1 = floatingObject1.currentRadius
      var r2 = floatingObject2.currentRadius

      var distance = Math.sqrt(Math.pow(floatingObject2.currentPosition.x - floatingObject1.currentPosition.x, 2) + Math.pow(floatingObject2.currentPosition.y - floatingObject1.currentPosition.y, 2))

      if (distance > (r1 + r2)) {
                // No solutions, the circles are too far apart.
        return false
      } else if (distance <= r1 + r2) {
                // One circle contains the other.
        return true
      } else if ((distance === 0) && (r1 === r2)) {
                // the circles coincide.
        return true
      } else return true
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] colliding -> err.message = ' + err.message) }
    }
  }

  function isInside (x, y) {
    try {
            /* This function detects weather the point x,y is inside any of the floatingObjects. */

      for (var i = 0; i < visibleFloatingObjects.length; i++) {
        var floatingObject = visibleFloatingObjects[i]
        var distance = Math.sqrt(Math.pow(floatingObject.currentPosition.x - x, 2) + Math.pow(floatingObject.currentPosition.y - y, 2))

        if (distance < floatingObject.currentRadius) {
          return i
        }
      }
      return -1
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] isInside -> err.message = ' + err.message) }
    }
  }

  function isInsideFloatingObject (floatingObjectIndex, x, y) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] isInsideFloatingObject -> Entering function.') }

            /* This function detects weather the point x,y is inside one particular floatingObjects. */

      var floatingObject = visibleFloatingObjects[floatingObjectIndex]
      var distance = Math.sqrt(Math.pow(floatingObject.currentPosition.x - x, 2) + Math.pow(floatingObject.currentPosition.y - y, 2))

      if (distance < floatingObject.currentRadius) {
        return true
      }

      return false
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] isInsideFloatingObject -> err.message = ' + err.message) }
    }
  }

  function distance (x1, y1, x2, y2) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] distance -> Entering function.') }

      return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] distance -> err.message = ' + err.message) }
    }
  }

  function resolveCollision (floatingObject1, floatingObject2) {
    try {
      if (INTENSIVE_LOG === true) { logger.write('[INFO] resolveCollision -> Entering function.') }

            /* This function changes speed and position of floatingObjects that are in collision */

      var collisionision_angle = Math.atan2((floatingObject2.currentPosition.y - floatingObject1.currentPosition.y), (floatingObject2.currentPosition.x - floatingObject1.currentPosition.x))

      var speed1 = Math.sqrt(floatingObject1.currentSpeed.x * floatingObject1.currentSpeed.x + floatingObject1.currentSpeed.y * floatingObject1.currentSpeed.y)  // Magnitude of Speed Vector for floatingObject 1
      var speed2 = Math.sqrt(floatingObject2.currentSpeed.x * floatingObject2.currentSpeed.x + floatingObject2.currentSpeed.y * floatingObject2.currentSpeed.y)  // Magnitude of Speed Vector for floatingObject 2

      var direction_1 = Math.atan2(floatingObject1.currentSpeed.y, floatingObject1.currentSpeed.x)
      var direction_2 = Math.atan2(floatingObject2.currentSpeed.y, floatingObject2.currentSpeed.x)

      var new_xspeed_1 = speed1 * Math.cos(direction_1 - collisionision_angle)
      var new_yspeed_1 = speed1 * Math.sin(direction_1 - collisionision_angle)
      var new_xspeed_2 = speed2 * Math.cos(direction_2 - collisionision_angle)
      var new_yspeed_2 = speed2 * Math.sin(direction_2 - collisionision_angle)

      var final_xspeed_1 = ((floatingObject1.currentMass - floatingObject2.currentMass) * new_xspeed_1 + (floatingObject2.currentMass + floatingObject2.currentMass) * new_xspeed_2) / (floatingObject1.currentMass + floatingObject2.currentMass)
      var final_xspeed_2 = ((floatingObject1.currentMass + floatingObject1.currentMass) * new_xspeed_1 + (floatingObject2.currentMass - floatingObject1.currentMass) * new_xspeed_2) / (floatingObject1.currentMass + floatingObject2.currentMass)
      var final_yspeed_1 = new_yspeed_1
      var final_yspeed_2 = new_yspeed_2

      var cosAngle = Math.cos(collisionision_angle)
      var sinAngle = Math.sin(collisionision_angle)

      floatingObject1.currentSpeed.x = cosAngle * final_xspeed_1 - sinAngle * final_yspeed_1
      floatingObject1.currentSpeed.y = sinAngle * final_xspeed_1 + cosAngle * final_yspeed_1

      floatingObject2.currentSpeed.x = cosAngle * final_xspeed_2 - sinAngle * final_yspeed_2
      floatingObject2.currentSpeed.y = sinAngle * final_xspeed_2 + cosAngle * final_yspeed_2

      var pos1 = {
        x: floatingObject1.currentPosition.x,
        y: floatingObject1.currentPosition.y
      }

      var pos2 = {
        x: floatingObject2.currentPosition.x,
        y: floatingObject2.currentPosition.y
      }

            // get the mtd
      var posDiff = {
        x: pos1.x - pos2.x,
        y: pos1.y - pos2.y
      }

      var d = Math.sqrt(Math.pow(floatingObject2.currentPosition.x - floatingObject1.currentPosition.x, 2) + Math.pow(floatingObject2.currentPosition.y - floatingObject1.currentPosition.y, 2))

            // minimum translation distance to push floatingObjects apart after intersecting
      var scalar = (((floatingObject1.currentRadius + floatingObject2.currentRadius) - d) / d)

      var minTD = {
        x: posDiff.x * scalar,
        y: posDiff.y * scalar
      }

            // resolve intersection --
            // computing inverse mass quantities
      var im1 = 1 / floatingObject1.currentMass
      var im2 = 1 / floatingObject2.currentMass

            // push-pull them apart based off their mass

      pos1.x = pos1.x + minTD.x * (im1 / (im1 + im2))
      pos1.y = pos1.y + minTD.y * (im1 / (im1 + im2))
      pos2.x = pos2.x - minTD.x * (im2 / (im1 + im2))
      pos2.y = pos2.y - minTD.y * (im2 / (im1 + im2))

      floatingObject1.currentPosition = pos1
      floatingObject2.currentPosition = pos2
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] resolveCollision -> err.message = ' + err.message) }
    }
  }
}
