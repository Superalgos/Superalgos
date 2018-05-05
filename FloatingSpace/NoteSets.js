
function newNoteSets() {

    const MODULE_NAME = "Note Sets";
    const INFO_LOG = false;
    const ERROR_LOG = true;
    const logger = newDebugLog();
    logger.fileName = MODULE_NAME;

    let thisObject = {
        createNoteSet: createNoteSet,
        destroyNoteSet: destroyNoteSet,
        initialize: initialize
    };

    let noteSets = [];
    let floatingLayer;

    return thisObject;

    function initialize(pFloatingLayer, callBackFunction) {

        try {

            if (INFO_LOG === true) { logger.write("[INFO] initialize -> Entering function."); }

            floatingLayer = pFloatingLayer;

            callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE);

        } catch (err) {

            if (ERROR_LOG === true) { logger.write("[ERROR] initialize -> err = " + err); }
            callBackFunction(GLOBAL.CUSTOM_FAIL_RESPONSE);
        }
    }

    function createNoteSet(pPayload, pEventHandler, callBackFunction) {

        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> Entering function."); }

        let noteSet = {
            imageId: pPayload.profile.imageId,
            floatingNotes: [],
            payload: pPayload,
            handle: Math.floor((Math.random() * 10000000) + 1)
        };

        noteSets.push(noteSet);

        pEventHandler.listenToEvent("Notes Changed", onNotesChanged, noteSets.length - 1)

        callBackFunction(GLOBAL.CUSTOM_OK_RESPONSE, noteSet.handle);

        function onNotesChanged(pNewNotes, pNoteSetIndex) {

            if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Entering function."); }
            if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> pNewNotes.length = " + pNewNotes.length); }
            if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> pNoteSetIndex = " + pNoteSetIndex); }

            let noteSet = noteSets[pNoteSetIndex];
            let found = false;
            let newFloatingNotes;

            /* First we remove the old notes. */

            if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes."); }

            newFloatingNotes = []; // We will create a new array of Floating Notes as a result of this operation.

            for (let j = 0; j < noteSet.floatingNotes.length; j++) {

                found = false;

                let floatingNote = noteSet.floatingNotes[j];
                let floatingNoteKey = floatingNote.date.toString() + floatingNote.rate.toString();

                if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> j = " + j); }

                let i;

                for (i = 0; i < pNewNotes.length; i++) {

                    let plotterNote = pNewNotes[i];
                    let plotterNoteKey = plotterNote.date.toString() + plotterNote.rate.toString();

                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> i = " + i); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingNoteKey = " + floatingNoteKey); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> plotterNoteKey = " + plotterNoteKey); }

                    if (plotterNoteKey === floatingNoteKey) {

                        found = true;

                        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> found = " + found); }
                        break;
                    }
                }

                if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> End of For i."); }
                if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> found = " + found); }

                if (found === false) {

                    floatingLayer.killFloatingObject(floatingNote.floatingHandle);

                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingNote.floatingHandle = " + floatingNote.floatingHandle); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> Removed from Layer."); }

                } else {

                    newFloatingNotes.push(floatingNote);

                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingNote.floatingHandle = " + floatingNote.floatingHandle); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> Added to newFloatingNotes."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> newFloatingNotes.length = " + newFloatingNotes.length); }

                    let floatingObject = floatingLayer.getFloatingObject(floatingNote.floatingHandle);
                    floatingObject.payloadNoteIndex = i;

                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingObject index updated."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> floatingObject.payloadNoteIndex = " + i); }

                }
            }

            noteSet.floatingNotes = newFloatingNotes;

            if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Remove old Notes -> noteSet.floatingNotes.length = " + noteSet.floatingNotes.length); }

            /* Second we add the new notes. */

            if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes."); }

            newFloatingNotes = []; // We will create a new array of Floating Notes as a result of this operation.

            for (let i = 0; i < pNewNotes.length; i++) {

                found = false;

                let plotterNote = pNewNotes[i];
                let plotterNoteKey = plotterNote.date.toString() + plotterNote.rate.toString();
                let floatingNote;
                let floatingNoteKey;

                if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> i = " + i); }

                for (let j = 0; j < noteSet.floatingNotes.length; j++) {

                    floatingNote = noteSet.floatingNotes[j];
                    floatingNoteKey = floatingNote.date.toString() + floatingNote.rate.toString();

                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> j = " + j); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> floatingNoteKey = " + floatingNoteKey); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> plotterNoteKey = " + plotterNoteKey); }

                    if (plotterNoteKey === floatingNoteKey) {

                        found = true;

                        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> found = " + found); }
                        break;
                    }
                }

                if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> End of For j."); }
                if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> found = " + found); }

                if (found === false) {

                    let floatingObject = newFloatingObject();
                    floatingObject.initialize("Note", onInitialized);

                    function onInitialized(err) {

                        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> Entering function."); }

                        floatingObject.payload = noteSet.payload;
                        floatingObject.payloadNoteIndex = i;
                        floatingObject.payloadImageId = noteSet.imageId;

                        floatingObject.friction = .995;

                        floatingObject.initializeMass(200);

                        //let bodyText = pNewNotes[i].body;
                        let radius;

                        /*
                        if (bodyText.length < 100) {
                            radius = 100;
                        } else {
                            radius = bodyText.length;
                        }
                        */
                        radius = 50;

                        floatingObject.initializeRadius(radius);
                        floatingObject.initializeImageSize(15);

                        floatingObject.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        floatingObject.labelStrokeStyle = 'rgba(60, 60, 60, 0.50)';

                        floatingLayer.addFloatingObject(floatingObject);

                        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> New Note added to Layer."); }

                        plotterNote.floatingHandle = floatingObject.handle;

                        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> plotterNote.floatingHandle = " + plotterNote.floatingHandle); }

                        newFloatingNotes.push(plotterNote);

                        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> Added to newFloatingNotes."); }
                        if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> newFloatingNotes.length = " + newFloatingNotes.length); }

                    }

                } else {

                    newFloatingNotes.push(floatingNote);

                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> Old Note Kept."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> floatingNote.floatingHandle = " + floatingNote.floatingHandle); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> Added to newFloatingNotes."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> newFloatingNotes.length = " + newFloatingNotes.length); }

                    let floatingObject = floatingLayer.getFloatingObject(floatingNote.floatingHandle);
                    floatingObject.payloadNoteIndex = i;

                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> floatingObject index updated."); }
                    if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> onInitialized -> floatingObject.payloadNoteIndex = " + i); }

                }
            }

            noteSet.floatingNotes = newFloatingNotes;

            if (INFO_LOG === true) { logger.write("[INFO] createNoteSet -> onNotesChanged -> Add new Notes -> noteSet.floatingNotes.length = " + noteSet.floatingNotes.length); }

        }
    }

    function destroyNoteSet(pHandle) {

        if (INFO_LOG === true) { logger.write("[INFO] destroyNoteSet -> Entering function."); }

        for (let i = 0; i < noteSets.length; i++) {

            let noteSet = noteSets[i];

            if (noteSet.handle === pHandle) {

                for (let j = 0; j < noteSet.floatingNotes.length; j++) {

                    let floatingNote = noteSet.floatingNotes[j];

                    floatingLayer.killFloatingObject(floatingNote.floatingHandle);
                }

                noteSets.splice(i, 1);  // Delete item from array.
                return;
            }
        }
    }
}


