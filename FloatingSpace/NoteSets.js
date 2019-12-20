 ﻿
function newNoteSets () {
    /*
    Different plotters will identify sets of notes whithin the data they are plotting. They will create with them arrays of Notes data.
    On the other hand the floating space, and a floting layer in particular, manages Notes floating objects, which are visible entities
    that floats on the screen. These entities are animated at a certain peace, and their life cycle differs from the life cycle of the
    arrays of raw data plotters have.

    The purpose of this module, is to provide a mechnism of syncronization between the raw data and the visible floating objects and a
    data structure wheere to store these floating objects.

    A NoteSet in this context is an array of Notes floating objects belonging to the same owner, which could be a certain bot for instance.
    This module is capable of managing an array of NoteSets.
    */

  const MODULE_NAME = 'Note Sets'
  const INFO_LOG = false
  const INFO_WARN = true
  const ERROR_LOG = true
  const logger = newWebDebugLog()
  logger.fileName = MODULE_NAME

  let thisObject = {
    createNoteSet: createNoteSet,
    destroyNoteSet: destroyNoteSet,
    initialize: initialize,
    finalize: finalize
  }

  let noteSets = []
  let floatingLayer

  return thisObject

  function initialize (pFloatingLayer) {
    floatingLayer = pFloatingLayer
  }

  function finalize () {
    floatingLayer.finalize()
    floatingLayer = undefined
  }

  function createNoteSet (pPayload, pEventHandler, callBackFunction) {
    try {
            /*
            During the creating of a NoteSet, no floating objects are created yet. What we do here is to create the data structure which will allocate
            the Notes floating objects, once we receive the array of notes raw data from the plotter. This array will come as an event raised by the
            plotter everytime it's set of raw data changes. Remember that the plotter is not only filtering out notes based on how far they are from the
            position the user gives to the viewport, but also, the plotter can be receiving actually new notes from its datasource.
            */

      if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> Entering function.') }

      let noteSet = {
        imageId: pPayload.profile.imageId,
        floatingNotes: [],
        payload: pPayload,
        handle: Math.floor((Math.random() * 10000000) + 1)
      }

      noteSets.push(noteSet)

      pEventHandler.listenToEvent('Notes Changed', onNotesChanged, noteSets.length - 1)

      callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE, noteSet.handle)

      function onNotesChanged (pNewNotes, pNoteSetIndex) {
        try {
          if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Entering function.') }
          if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> pNewNotes.length = ' + pNewNotes.length) }
          if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> pNoteSetIndex = ' + pNoteSetIndex) }

          let noteSet = noteSets[pNoteSetIndex]
          let found = false
          let newFloatingNotes

                    /*
                    First we remove the old notes. This means that we are going to scan all the floating objects that we have, and see one by one if they
                    are still present on the raw data sent by the plotter. If it is not there, that means that the floating object must be discarded.
                    */

          if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes.') }

          newFloatingNotes = [] // We will create a new array of Floating Notes as a result of this operation.

                    /*
                    Here we scan the curren array of floating objects. We use the date + rate to create a unique key for each one, in order to be able to
                    compare it with the raw data. You will notice that instead of deleting from the current array what we actually do is to add the ones
                    that are still at the raw data array to a new array, and not adding the ones that are not.
                    */

          for (let j = 0; j < noteSet.floatingNotes.length; j++) {
            found = false

            let floatingNote = noteSet.floatingNotes[j]
            let floatingNoteKey = floatingNote.date.toString() + floatingNote.rate.toString()

            if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> j = ' + j) }

            let i

            for (let i = 0; i < pNewNotes.length; i++) {
              let plotterNote = pNewNotes[i]
              let plotterNoteKey = plotterNote.date.toString() + plotterNote.rate.toString()

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> i = ' + i) }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingNoteKey = ' + floatingNoteKey) }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> plotterNoteKey = ' + plotterNoteKey) }

              if (plotterNoteKey === floatingNoteKey) {
                found = true

                if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> found = ' + found) }
                break
              }
            }

            if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> End of For i.') }
            if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> found = ' + found) }

            if (found === false) {
                            /*
                            Each time we identify a floatingObject that is not at the raw data anymore, we request the floatinglayer to kill it.
                            */

              floatingLayer.removeFloatingObject(floatingNote.floatingHandle)
            } else {
              newFloatingNotes.push(floatingNote)

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingNote.floatingHandle = ' + floatingNote.floatingHandle) }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> Added to newFloatingNotes.') }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> newFloatingNotes.length = ' + newFloatingNotes.length) }

                            /*
                            We set a property at each floatingObject of which is the index of the note at the raw data array, so that it can later evaluate its position or its visibility.
                            */

              let floatingObject = floatingLayer.getFloatingObject(floatingNote.floatingHandle)
              floatingObject.payloadNoteIndex = i

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingObject index updated.') }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingObject.payloadNoteIndex = ' + i) }
            }
          }

                    /*
                    We replace the current array, with the new one that only contains the surviving floating objects, meaning the ones that are still at the raw data received.
                    */

          noteSet.floatingNotes = newFloatingNotes

          if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> noteSet.floatingNotes.length = ' + noteSet.floatingNotes.length) }

                    /*
                    Second we add the new notes. There might be new notes at the raw data received that we didnt have before at the NodeSet array. To figure out which
                    ones are, we need to scan the raw data array and compare each element with the ones of the NodeSet array. Whenever we find one that is not there,
                    we add it.
                    */

          if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes.') }

          newFloatingNotes = [] // We will create a new array of Floating Notes as a result of this operation.

                    /*
                    We are using the date and rate as a unique key to identify each note. To prevent the cases of duplicate keys, we will check that at
                    least to consecutive records dont have the same key, and if they do, will ignore the second one.
                    */

          let lastPlotterKey = ''

          for (let i = 0; i < pNewNotes.length; i++) {
            found = false

            let plotterNote = pNewNotes[i]
            let plotterNoteKey = plotterNote.date.toString() + plotterNote.rate.toString()
            let floatingNote
            let floatingNoteKey

            if (lastPlotterKey === plotterNoteKey) {
              if (INFO_WARN === true) { logger.write('[WARN] createNoteSet -> onNotesChanged -> Add new Notes -> Duplicate record detected. Discarding it.') }
              if (INFO_WARN === true) { logger.write('[WARN] createNoteSet -> onNotesChanged -> Add new Notes -> i = ' + i) }
              continue
            }

            lastPlotterKey = plotterNoteKey

            if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> i = ' + i) }

            for (let j = 0; j < noteSet.floatingNotes.length; j++) {
              floatingNote = noteSet.floatingNotes[j]
              floatingNoteKey = floatingNote.date.toString() + floatingNote.rate.toString()

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> j = ' + j) }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> floatingNoteKey = ' + floatingNoteKey) }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> plotterNoteKey = ' + plotterNoteKey) }

              if (plotterNoteKey === floatingNoteKey) {
                found = true

                if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> found = ' + found) }
                break
              }
            }

            if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> End of For j.') }
            if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> found = ' + found) }

            if (found === false) {
                            /*
                            Before adding a new item to the array, we need to create a floatingObject of type Note. Once we set its basic parameters
                            we can it to our array and to the floating layer.
                            */

              let floatingObject = newFloatingObject()
              floatingObject.initialize('Note', '', floatingLayer)

              floatingObject.payload = noteSet.payload
              floatingObject.payloadNoteIndex = i
              floatingObject.payloadImageId = noteSet.imageId

              floatingObject.friction = 0.995

              floatingObject.initializeMass(200)

                                // let bodyText = pNewNotes[i].body;
              let radius

                                /*
                                if (bodyText.length < 100) {
                                    radius = 100;
                                } else {
                                    radius = bodyText.length;
                                }
                                */
              radius = 50

              floatingObject.initializeRadius(radius)
              floatingObject.initializeImageSize(15)

              floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 0.5)'
              floatingObject.labelStrokeStyle = 'rgba(60, 60, 60, 0.50)'

              floatingLayer.addFloatingObject(floatingObject)

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> New Note added to Layer.') }

              plotterNote.floatingHandle = floatingObject.handle

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> plotterNote.floatingHandle = ' + plotterNote.floatingHandle) }

              newFloatingNotes.push(plotterNote)

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> Added to newFloatingNotes.') }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> newFloatingNotes.length = ' + newFloatingNotes.length) }
            } else {
              newFloatingNotes.push(floatingNote)

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> Old Note Kept.') }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> floatingNote.floatingHandle = ' + floatingNote.floatingHandle) }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> Added to newFloatingNotes.') }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> newFloatingNotes.length = ' + newFloatingNotes.length) }

              let floatingObject = floatingLayer.getFloatingObject(floatingNote.floatingHandle)
              floatingObject.payloadNoteIndex = i

              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> floatingObject index updated.') }
              if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> floatingObject.payloadNoteIndex = ' + i) }
            }
          }

          noteSet.floatingNotes = newFloatingNotes

          if (INFO_LOG === true) { logger.write('[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> noteSet.floatingNotes.length = ' + noteSet.floatingNotes.length) }
        } catch (err) {
          if (ERROR_LOG === true) { logger.write('[ERROR] createNoteSet -> onNotesChanged -> err = ' + err.stack) }
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] createNoteSet -> err = ' + err.stack) }
      callBackFunction(GLOBAL.DEFAULT_FAIL_RESPONSE)
    }
  }

  function destroyNoteSet (pHandle) {
    try {
            /*
            Usually when a bot is disabled by the end user, or the zoom level changes to one where the notes must not be seen, this method
            to destroy an entire NoteSet is executed. What we do in this situation is to localize the NoteSet to be destroyed and we need to
            kill, one by one the floating objects in it. Finally we remove this NoteSet item from the NoteSets array.
            */

      if (INFO_LOG === true) { logger.write('[INFO] destroyNoteSet -> Entering function.') }

      for (let i = 0; i < noteSets.length; i++) {
        let noteSet = noteSets[i]

        if (noteSet.handle === pHandle) {
          for (let j = 0; j < noteSet.floatingNotes.length; j++) {
            let floatingNote = noteSet.floatingNotes[j]

            floatingLayer.removeFloatingObject(floatingNote.floatingHandle)
          }

          noteSets.splice(i, 1)  // Delete item from array.
          return
        }
      }
    } catch (err) {
      if (ERROR_LOG === true) { logger.write('[ERROR] destroyNoteSet -> err = ' + err.stack) }
    }
  }
}

