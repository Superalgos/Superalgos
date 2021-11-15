
function newUiObjectConstructor() {
    const MODULE_NAME = 'UI Object Constructor'
    const ERROR_LOG = true
    const logger = newWebDebugLog()
    

    let thisObject = {
        createUiObject: createUiObject,
        destroyUiObject: destroyUiObject,
        initialize: initialize,
        finalize: finalize
    }

    let floatingLayer

    return thisObject

    function finalize() {
        floatingLayer = undefined
    }

    function initialize(pFloatingLayer) {
        floatingLayer = pFloatingLayer
    }

    function createUiObject(userAddingNew, payload) {
        
        /*
        In case we are replacing an existing uiObject and floatingObject
        */
        if (payload.floatingObject !== undefined) {
            payload.floatingObject.finalize()
        }
        if (payload.uiObject !== undefined) {
            payload.uiObject.finalize()
        }

        let floatingObject = newFloatingObject()
        floatingObject.fitFunction = UI.projects.foundations.spaces.floatingSpace.fitIntoVisibleArea
        floatingObject.container.connectToParent(UI.projects.foundations.spaces.floatingSpace.container, false, false, false, false, false, false, false, false)
        floatingObject.initialize('UI Object', payload)

        payload.floatingObject = floatingObject

        /*
        When this object is created based on a backup, share or clone, 
        we will have a savedPayload that we will use to set the initial properties.
        If it is a new object being created out of the user interface, 
        we just continue with the construction process.
        */
        if (userAddingNew === false && payload.node.type !== 'Workspace') {
            let position = {
                x: 0,
                y: 0
            }

            position = {
                x: payload.node.savedPayload.position.x,
                y: payload.node.savedPayload.position.y
            }

            floatingObject.setPosition(position)
            payload.node.savedPayload.position = undefined
            if (payload.node.savedPayload.floatingObject.isPinned === true) {
                floatingObject.pinToggle()
            }
            if (payload.node.savedPayload.floatingObject.isFrozen === true) {
                floatingObject.freezeToggle()
            }
            if (payload.node.savedPayload.floatingObject.isCollapsed === true) {
                floatingObject.collapseToggle()
            }
            if (payload.node.savedPayload.floatingObject.angleToParent !== undefined) {
                floatingObject.angleToParent = payload.node.savedPayload.floatingObject.angleToParent
            }
            if (payload.node.savedPayload.floatingObject.distanceToParent !== undefined) {
                floatingObject.distanceToParent = payload.node.savedPayload.floatingObject.distanceToParent
            }
            if (payload.node.savedPayload.floatingObject.arrangementStyle !== undefined) {
                floatingObject.arrangementStyle = payload.node.savedPayload.floatingObject.arrangementStyle
            }
        }

        /*
        For brand new objects being created directly by the user, 
        we will make them inherit some properties
        from their closest siblings, and if they don't have, from their parents.
        */

        if (userAddingNew === true) {
            let definition = getSchemaDocument(payload.parentNode)
            if (definition.childrenNodesProperties !== undefined) {
                for (let i = 0; i < definition.childrenNodesProperties.length; i++) {
                    let property = definition.childrenNodesProperties[i]
                    if (property.childType === payload.node.type) {
                        if (property.type === 'array') {
                            let parentNode = payload.parentNode
                            let parentNodeArray = parentNode[property.name]
                            if (parentNodeArray.length > 1) { // the new node was already added
                                let closestSibling = parentNodeArray[parentNodeArray.length - 2]
                                if (closestSibling !== undefined) {
                                    floatingObject.angleToParent = closestSibling.payload.floatingObject.angleToParent
                                    floatingObject.distanceToParent = closestSibling.payload.floatingObject.distanceToParent
                                    floatingObject.arrangementStyle = closestSibling.payload.floatingObject.arrangementStyle
                                    break
                                }
                            }
                        }
                        if (floatingObject.angleToParent === undefined) {
                            for (let j = i - 1; j >= 0; j--) {
                                let siblingProperty = definition.childrenNodesProperties[j]
                                let parentNode = payload.parentNode
                                let parentNodeProperty = parentNode[siblingProperty.name]
                                if (parentNodeProperty !== undefined) {
                                    if (siblingProperty.type === 'array') {
                                        if (parentNodeProperty.length > 0) {
                                            let closestSibling = parentNodeProperty[parentNodeProperty.length - 1]
                                            if (closestSibling !== undefined) {
                                                floatingObject.angleToParent = closestSibling.payload.floatingObject.angleToParent
                                                floatingObject.distanceToParent = closestSibling.payload.floatingObject.distanceToParent
                                                floatingObject.arrangementStyle = closestSibling.payload.floatingObject.arrangementStyle
                                                break
                                            }
                                        }
                                    } else {
                                        let closestSibling = parentNodeProperty
                                        if (closestSibling !== undefined) {
                                            floatingObject.angleToParent = closestSibling.payload.floatingObject.angleToParent
                                            floatingObject.distanceToParent = closestSibling.payload.floatingObject.distanceToParent
                                            floatingObject.arrangementStyle = closestSibling.payload.floatingObject.arrangementStyle
                                            break
                                        }
                                    }
                                }
                            }
                            for (let j = i + 1; j < definition.childrenNodesProperties.length; j++) {
                                let siblingProperty = definition.childrenNodesProperties[j]
                                let parentNode = payload.parentNode
                                let parentNodeProperty = parentNode[siblingProperty.name]
                                if (parentNodeProperty !== undefined) {
                                    if (siblingProperty.type === 'array') {
                                        if (parentNodeProperty.length > 0) {
                                            let closestSibling = parentNodeProperty[parentNodeProperty.length - 1]
                                            if (closestSibling !== undefined) {
                                                floatingObject.angleToParent = closestSibling.payload.floatingObject.angleToParent
                                                floatingObject.distanceToParent = closestSibling.payload.floatingObject.distanceToParent
                                                floatingObject.arrangementStyle = closestSibling.payload.floatingObject.arrangementStyle
                                                break
                                            }
                                        }
                                    } else {
                                        let closestSibling = parentNodeProperty
                                        if (closestSibling !== undefined) {
                                            floatingObject.angleToParent = closestSibling.payload.floatingObject.angleToParent
                                            floatingObject.distanceToParent = closestSibling.payload.floatingObject.distanceToParent
                                            floatingObject.arrangementStyle = closestSibling.payload.floatingObject.arrangementStyle
                                            break
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if (floatingObject.angleToParent === undefined) {
                floatingObject.angleToParent = payload.parentNode.payload.floatingObject.angleToParent
                floatingObject.distanceToParent = payload.parentNode.payload.floatingObject.distanceToParent
                floatingObject.arrangementStyle = payload.parentNode.payload.floatingObject.arrangementStyle
            }
        }

        /* Default Values in case there was no way to set a value previous to this. */
        if (floatingObject.angleToParent === undefined) {
            floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_360
        }
        if (floatingObject.distanceToParent === undefined) {
            floatingObject.distanceToParent = DISTANCE_TO_PARENT.PARENT_100X
        }
        if (floatingObject.arrangementStyle === undefined) {
            floatingObject.arrangementStyle = ARRANGEMENT_STYLE.CONCAVE
        }

        let uiObject = newUiObject()
        payload.uiObject = uiObject
        uiObject.fitFunction = UI.projects.foundations.spaces.floatingSpace.fitIntoVisibleArea
        uiObject.isVisibleFunction = UI.projects.foundations.spaces.floatingSpace.isThisPointVisible
        let menuItemsInitialValues = getMenuItemsInitialValues(uiObject, floatingObject, payload)

        let schemaNode = getSchemaDocument(payload.node)
        if (schemaNode === undefined) {
            console.log(payload.node.type + ' node found at App Schema. This node will not be created. ')
            return
        }
        let menuItems = schemaNode.menuItems
        for (let j = 0; j < menuItems.length; j++) {
            let item = menuItems[j]
            item.angle = undefined
            if (item.action !== undefined) {
                if (item.action.indexOf('Add Missing Children') >= 0) {
                    item.action = 'Add Missing Children'
                }
            }
            if (item.actionFunction === undefined) {
                // item.actionFunction = 'payload.executeAction'
            }
        }

        uiObject.initialize(payload, menuItemsInitialValues)
        uiObject.container.connectToParent(floatingObject.container, false, false, true, true, false, false, true, true, true, true, true)

        setFloatingObjectBasicProperties(floatingObject, payload)

        if (payload.node.savedPayload !== undefined) {
            if (payload.node.savedPayload.uiObject !== undefined) {
                payload.uiObject.shortcutKey = payload.node.savedPayload.uiObject.shortcutKey
            }
        }

        floatingLayer.addFloatingObject(floatingObject)

        return
    }

    function addLeftIcons(menuItemsInitialValues, floatingObject, schemaDocument) {
        menuItemsInitialValues.push(
            {
                action: 'Pin / Unpin',
                actionFunction: floatingObject.pinToggle,
                actionStatus: floatingObject.getPinStatus,
                currentStatus: false,
                label: undefined,
                visible: true,
                iconPathOn: 'pinned-node',
                iconPathOff: 'unpinned-node',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 1
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Change Tension Level',
                actionFunction: floatingObject.angleToParentToggle,
                actionStatus: floatingObject.getAngleToParent,
                currentStatus: true,
                label: undefined,
                visible: true,
                icons: ['remove-angle-to-parent-node', 'set-angle-to-parent-node-to-360-degrees', 'set-angle-to-parent-node-to-180-degrees', 'set-angle-to-parent-node-to-90-degrees', 'set-angle-to-parent-node-to-45-degrees'],
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 1
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Change Distance to Parent',
                actionFunction: floatingObject.distanceToParentToggle,
                actionStatus: floatingObject.getDistanceToParent,
                currentStatus: true,
                label: undefined,
                visible: true,
                icons: ['remove-distance-to-parent-node', 'set-distance-to-parent-node-to-one-fourth', 'set-distance-to-parent-node-to-one-half', 'set-distance-to-parent-node-to-one', 'set-distance-to-parent-node-to-one-and-a-half', 'set-distance-to-parent-node-to-two'],
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 1
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Change Arrangement Style',
                actionFunction: floatingObject.arrangementStyleToggle,
                actionStatus: floatingObject.getArrangementStyle,
                currentStatus: true,
                label: undefined,
                visible: true,
                icons: ['set-node-arrangement-to-concave', 'set-node-arrangement-to-convex', 'set-node-arrangement-to-vertical-right', 'set-node-arrangement-to-vertical-left', 'set-node-arrangement-to-horizontal-bottom', 'set-node-arrangement-to-horizontal-top'],
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 1
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Freeze / Unfreeze',
                actionFunction: floatingObject.freezeToggle,
                actionStatus: floatingObject.getFreezeStatus,
                currentStatus: true,
                label: undefined,
                visible: true,
                iconPathOn: 'unfreeze-structure-of-nodes',
                iconPathOff: 'freeze-structure-of-nodes',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 1
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Collapse / Uncollapse',
                actionFunction: floatingObject.collapseToggle,
                actionStatus: floatingObject.getCollapseStatus,
                currentStatus: false,
                label: undefined,
                visible: true,
                iconPathOn: 'expand-structure-of-nodes',
                iconPathOff: 'collapse-structure-of-nodes',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 1
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Backup',
                actionFunction: floatingObject.payload.executeAction,
                actionProject: 'Visual-Scripting',
                label: undefined,
                visible: true,
                iconPathOn: 'backup-entity',
                iconPathOff: 'backup-entity',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 2
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Clone',
                actionFunction: floatingObject.payload.executeAction,
                actionProject: 'Visual-Scripting',
                label: undefined,
                visible: true,
                iconPathOn: 'clone-entity',
                iconPathOff: 'clone-entity',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 2
            }
        )
        if (schemaDocument.isPersonalData !== true) {
            menuItemsInitialValues.push(
                {
                    action: 'Share',
                    actionFunction: floatingObject.payload.executeAction,
                    actionProject: 'Visual-Scripting',
                    label: undefined,
                    visible: true,
                    iconPathOn: 'share-entity',
                    iconPathOff: 'share-entity',
                    rawRadius: 12,
                    targetRadius: 0,
                    currentRadius: 0,
                    ring: 2
                }
            )
        }
        menuItemsInitialValues.push(
            {
                action: 'Save node to be moved',
                actionFunction: floatingObject.payload.executeAction,
                actionProject: 'Foundations',
                label: undefined,
                visible: true,
                //placeholder icon : https://www.iconpacks.net/free-icon/pin-48.html
                iconPathOn: 'copy-position',
                iconPathOff: 'copy-position',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 2
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Snap saved node to position',
                actionFunction: floatingObject.payload.executeAction,
                actionProject: 'Foundations',
                label: undefined,
                visible: true,
                //placeholder icon: https://www.iconpacks.net/free-icon/pins-53.html
                iconPathOn: 'snap-position',
                iconPathOff: 'snap-position',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 2
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Parent Detach',
                askConfirmation: true,
                confirmationLabel: "Confirm to Detach",
                actionFunction: floatingObject.payload.executeAction,
                actionProject: 'Visual-Scripting',
                label: undefined,
                visible: true,
                iconPathOn: 'detach-node',
                iconPathOff: 'detach-node',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 3
            }
        )
        menuItemsInitialValues.push(
            {
                action: 'Reference Detach',
                askConfirmation: true,
                confirmationLabel: "Confirm to Detach",
                actionFunction: floatingObject.payload.executeAction,
                actionProject: 'Visual-Scripting',
                label: undefined,
                visible: true,
                iconPathOn: 'delink-node',
                iconPathOff: 'delink-node',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 3
            }
        )
        if (schemaDocument.referencingRules !== undefined) {
            menuItemsInitialValues.push(
                {
                    action: 'Create Reference',
                    actionFunction: floatingObject.payload.executeAction,
                    actionProject: 'Visual-Scripting',
                    label: undefined,
                    visible: true,
                    iconPathOn: 'create-reference',
                    iconPathOff: 'create-reference',
                    rawRadius: 12,
                    targetRadius: 0,
                    currentRadius: 0,
                    ring: 3
                }
            )
        }

        menuItemsInitialValues.push(
            {
                action: 'Open Documentation',
                actionFunction: floatingObject.payload.executeAction,
                actionProject: 'Foundations',
                label: undefined,
                visible: true,
                iconPathOn: 'help',
                iconPathOff: 'help',
                rawRadius: 12,
                targetRadius: 0,
                currentRadius: 0,
                ring: 4
            }
        )
    }

    function getMenuItemsInitialValues(uiObject, floatingObject, payload) {
        let menuItemsInitialValues = []

        let schemaDocument = getSchemaDocument(payload.node)
        if (schemaDocument !== undefined) {
            if (schemaDocument.editors !== undefined) {
                if (schemaDocument.editors.config === true) {
                    uiObject.configEditor = newConfigEditor()
                    uiObject.configEditor.initialize()
                }
                if (schemaDocument.editors.code === true) {
                    uiObject.codeEditor = newCodeEditor()
                    uiObject.codeEditor.initialize()
                }
                if (schemaDocument.editors.formula === true) {
                    uiObject.formulaEditor = newFormulaEditor()
                    uiObject.formulaEditor.initialize()
                }
                if (schemaDocument.editors.list === true) {
                    uiObject.listSelector = newListSelector()
                    uiObject.listSelector.isVisibleFunction = uiObject.isVisibleFunction
                    uiObject.listSelector.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)
                    uiObject.listSelector.initialize()
                }
                if (schemaDocument.editors.condition === true) {
                    uiObject.conditionEditor = newConditionEditor()
                    uiObject.conditionEditor.isVisibleFunction = uiObject.isVisibleFunction
                    uiObject.conditionEditor.container.connectToParent(uiObject.container, false, false, false, true, false, false, false, false)
                    uiObject.conditionEditor.initialize()
                }
            }
            if (schemaDocument.referencingRules !== undefined) {
                uiObject.listSelector = newListSelector()
                uiObject.listSelector.isVisibleFunction = uiObject.isVisibleFunction
                uiObject.listSelector.container.connectToParent(uiObject.container, false, false, true, true, false, false, false, false)
                uiObject.listSelector.initialize()
            }
            if (schemaDocument.addLeftIcons === true) {
                addLeftIcons(menuItemsInitialValues, floatingObject, schemaDocument)
            }
            if (schemaDocument.isPinned === true) {
                floatingObject.isPinned = true
            }
            if (schemaDocument.positionLocked === true) {
                floatingObject.positionLocked = true
            }

            for (let i = 0; i < schemaDocument.menuItems.length; i++) {
                let menutItemDefinition = schemaDocument.menuItems[i]
                let newMenuItem = JSON.parse(JSON.stringify(menutItemDefinition))

                /* We need to reference the real function based on its name */
                if (menutItemDefinition.actionFunction !== undefined) {
                    try {
                        newMenuItem.actionFunction = eval(menutItemDefinition.actionFunction)
                    } catch (err) {
                        console.log('Error at Menu Item Action Function: ' + menutItemDefinition.actionFunction + ' ' + err.stack)
                        continue
                    }
                }

                /* Adding default values */
                if (newMenuItem.visible === undefined) {
                    newMenuItem.visible = true
                }

                if (newMenuItem.rawRadius === undefined) {
                    newMenuItem.rawRadius = 12
                }

                if (newMenuItem.targetRadius === undefined) {
                    newMenuItem.targetRadius = 0
                }

                if (newMenuItem.currentRadius === undefined) {
                    newMenuItem.currentRadius = 0
                }

                if (newMenuItem.actionProject === undefined) {
                    newMenuItem.actionProject = payload.node.project
                }

                menuItemsInitialValues.push(newMenuItem)
            }
        } else {
            if (ERROR_LOG === true) { logger.write('[ERROR] getMenuItemsInitialValues -> UI Object Type not Recognized -> type = ' + payload.node.type) }
        }

        return menuItemsInitialValues
    }

    function setFloatingObjectBasicProperties(floatingObject, payload) {
        const FRICTION = 0.95
        const INITIAL_FRICTION = 0.97
        const INITIAL_FONT_SIZE = 12 * 1.5
        const INITIAL_RADIOUS = 70
        const INITIAL_IMAGE_SIZE = 80 * 1.2

        let schemaDocument = getSchemaDocument(payload.node)
        if (schemaDocument === undefined) {
            console.log('[WARN] Set up of the object ' + payload.node.name + ' of type ' + payload.node.type + ' can not be completed becasue its definition can not be found at the APP SCHEMA.')
            return
        }

        if (schemaDocument.isProjectHead === true) {
            level_0()
            floatingObject.angleToParent = ANGLE_TO_PARENT.RANGE_360
            return
        }

        switch (schemaDocument.level) {
            case 0: {
                level_0()
                break
            }
            case 1: {
                level_1()
                break
            }
            case 2: {
                level_2()
                break
            }
            case 3: {
                level_3()
                break
            }
            case 4: {
                level_4()
                break
            }
            case 5: {
                level_5()
                break
            }
        }

        function level_0() {
            floatingObject.targetFriction = 0.93
            floatingObject.friction = INITIAL_FRICTION

            floatingObject.initializeMass(500)
            floatingObject.initializeRadius(INITIAL_RADIOUS)
            floatingObject.initializeImageSize(INITIAL_IMAGE_SIZE)
            floatingObject.initializeFontSize(INITIAL_FONT_SIZE)

            floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'
        }
        function level_1() {
            floatingObject.targetFriction = 0.94
            floatingObject.friction = INITIAL_FRICTION

            floatingObject.initializeMass(600)
            floatingObject.initializeRadius(INITIAL_RADIOUS)
            floatingObject.initializeImageSize(INITIAL_IMAGE_SIZE)
            floatingObject.initializeFontSize(INITIAL_FONT_SIZE)

            floatingObject.fillStyle = 'rgba(' + UI_COLOR.WHITE + ', 1)'

            if (payload.node.savedPayload === undefined) {
                // floatingObject.angleToParentToggle()
            }
        }
        function level_2() {
            floatingObject.targetFriction = FRICTION
            floatingObject.friction = INITIAL_FRICTION

            floatingObject.initializeMass(300)
            floatingObject.initializeRadius(INITIAL_RADIOUS - 1)
            floatingObject.initializeImageSize(INITIAL_IMAGE_SIZE - 10)
            floatingObject.initializeFontSize(INITIAL_FONT_SIZE)

            floatingObject.fillStyle = 'rgba(' + UI_COLOR.GREEN + ', 1)'

            if (payload.node.savedPayload === undefined) {
                // floatingObject.angleToParentToggle()
            }
        }
        function level_3() {
            floatingObject.targetFriction = FRICTION
            floatingObject.friction = INITIAL_FRICTION

            floatingObject.initializeMass(150)
            floatingObject.initializeRadius(INITIAL_RADIOUS - 2)
            floatingObject.initializeImageSize(INITIAL_IMAGE_SIZE - 20)
            floatingObject.initializeFontSize(INITIAL_FONT_SIZE)

            floatingObject.fillStyle = 'rgba(' + UI_COLOR.RUSTED_RED + ', 1)'

            if (payload.node.savedPayload === undefined) {
                // floatingObject.angleToParentToggle()
            }
        }
        function level_4() {
            floatingObject.targetFriction = FRICTION
            floatingObject.friction = INITIAL_FRICTION

            floatingObject.initializeMass(75)
            floatingObject.initializeRadius(INITIAL_RADIOUS - 3)
            floatingObject.initializeImageSize(INITIAL_IMAGE_SIZE - 30)
            floatingObject.initializeFontSize(INITIAL_FONT_SIZE)

            floatingObject.fillStyle = 'rgba(' + UI_COLOR.TITANIUM_YELLOW + ', 1)'

            if (payload.node.savedPayload === undefined) {
                // floatingObject.angleToParentToggle()
            }
        }
        function level_5() {
            floatingObject.targetFriction = FRICTION
            floatingObject.friction = INITIAL_FRICTION

            floatingObject.initializeMass(50)
            floatingObject.initializeRadius(INITIAL_RADIOUS - 4)
            floatingObject.initializeImageSize(INITIAL_IMAGE_SIZE - 40)
            floatingObject.initializeFontSize(INITIAL_FONT_SIZE)

            floatingObject.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'
        }
        function level_6() {
            floatingObject.targetFriction = FRICTION
            floatingObject.friction = INITIAL_FRICTION

            floatingObject.initializeMass(25)
            floatingObject.initializeRadius(INITIAL_RADIOUS - 5)
            floatingObject.initializeImageSize(INITIAL_IMAGE_SIZE - 50)
            floatingObject.initializeFontSize(INITIAL_FONT_SIZE)

            floatingObject.fillStyle = 'rgba(' + UI_COLOR.RED + ', 1)'
        }
    }

    function destroyUiObject(payload) {
        if (payload === undefined) { return }
        floatingLayer.removeFloatingObject(payload.floatingObject.handle)

        payload.floatingObject.finalize()
        payload.floatingObject = undefined

        payload.uiObject.finalize()
        payload.uiObject = undefined

        payload.referenceParent = undefined
        payload.parent = undefined
        payload.chainParent = undefined
        payload.node.savedPayload = undefined
    }
}
