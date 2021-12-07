function newGovernanceFunctionLibraryClaimsProgram() {
    let thisObject = {
        calculate: calculate,
        installMissingClaims: installMissingClaims
    }

    return thisObject

    function calculate(
        features,
        assets,
        positions,
        userProfiles
    ) {

        /* Claim Reset Follows */
        for (let i = 0; i < assets.length; i++) {
            let assetsNode = assets[i]
            resetClaims(assetsNode)
        }

        /* Claim Reset Follows */
        for (let i = 0; i < features.length; i++) {
            let featuresNode = features[i]
            resetClaims(featuresNode)
        }

        /* Claim Reset Follows */
        for (let i = 0; i < positions.length; i++) {
            let positionsNode = positions[i]
            resetClaims(positionsNode)
        }

        /* Reset this Program */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Claims Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            resetProgram(program)
        }

        /* Claim Count Follows */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Claims Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            distributeProgram(program, true)
        }

        /* Claim Distribution Follows */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Claims Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            distributeProgram(program, false)
        }

        /* Claim Calculation Follows */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Claims Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }
            calculateProgram(program)
        }

        function resetClaims(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (
                node.type !== 'Asset Class' &&
                node.type !== 'Feature Class' &&
                node.type !== 'Position Class'
            ) {
                if (
                    node.payload.votingProgram !== undefined &&
                    node.payload.votingProgram.votes !== undefined
                ) {
                    node.payload.claimsProgram = {
                        count: 0,
                        votes: 0,
                        awarded: {
                            tokens: 0,
                            percentage: 0
                        }
                    }
                }
            }

            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]
                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            resetClaims(childNode)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    resetClaims(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function resetProgram(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            node.payload.claimsProgram = {
                count: 0,
                awarded: {
                    tokens: 0,
                    percentage: 0
                },
                share: {
                    count: 0,
                    percentage: 0
                }
            }

            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]
                    switch (property.type) {
                        case 'node': {
                            let childNode = node[property.name]
                            resetProgram(childNode)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    resetProgram(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function distributeProgram(programNode, countingMode) {
            if (programNode === undefined || programNode.payload === undefined) { return }
            /*
            Here we will convert Token Power into programPower. 
            As per system rules programPower = tokensPower
            */
            let programPower = programNode.payload.tokenPower
            /*
            The Own Power is the power generated by the same User Profile tokens, not inherited from others.
            */
            programNode.payload.claimsProgram.ownPower = programPower

            distributeProgramPower(programNode, programPower, undefined, countingMode)
        }

        function distributeProgramPower(
            node,
            programPower,
            percentage,
            countingMode
        ) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (
                node.type !== 'Asset Claims Folder' &&
                node.type !== 'Feature Claims Folder' &&
                node.type !== 'Position Claims Folder' &&
                node.type !== 'Claims Program'
            ) {
                if (
                    node.payload.votingProgram !== undefined &&
                    node.payload.votingProgram.votes !== undefined &&
                    node.payload.votingProgram.votes > 0 &&
                    node.payload.referenceParent !== undefined &&
                    node.payload.referenceParent.payload !== undefined &&
                    node.payload.referenceParent.payload.votingProgram !== undefined &&
                    node.payload.referenceParent.payload.votingProgram.votes !== undefined &&
                    node.payload.referenceParent.payload.votingProgram.votes > 0 &&
                    node.payload.referenceParent.payload.weight !== undefined &&
                    node.payload.referenceParent.payload.weight > 0 &&
                    node.payload.referenceParent.payload.claimsProgram !== undefined &&
                    node.payload.referenceParent.payload.claimsProgram.count !== undefined &&
                    node.payload.referenceParent.payload.claimsProgram.votes !== undefined
                ) {
                    /*                    
                        claimPowerToUse is the minimun between the Claim Power the user is assigning to 
                        his claim, and the votes the claim have from other user profiles.
                    */
                    let claimPowerToUse = Math.min(
                        programPower,
                        node.payload.votingProgram.votes
                    )
                    /*
                    If the claimPowerToUse is bigger than the token reward, then we cap it at the
                    token reward. In this way a user can put more claim power than needed and get
                    more votes from other users than needed, and still use a claim power that do not exceeds
                    the atual amount of tokens available to claim.
                    */
                    if (claimPowerToUse > node.payload.referenceParent.payload.tokens) {
                        claimPowerToUse = node.payload.referenceParent.payload.tokens
                    }

                    if (countingMode === true) {
                        /*
                        Counting mode is the first round of execution and it is used to accumulate at the
                        node being claimed all the claim poser of all cliams to that node
                        from any user profile. That will be used then to know how to split the reward
                        among all the claims, and to know how many claims in total there were.
                        */
                        node.payload.referenceParent.payload.claimsProgram.count++                                                                              // Add to the total amount of claims over a node.
                        node.payload.referenceParent.payload.claimsProgram.votes = node.payload.referenceParent.payload.claimsProgram.votes + claimPowerToUse   // Add to the total amount of claim power used.
                    } else {
                        /*
                        Non counting mode is the second round of execution and it is used to actually 
                        calculate the tokens awarded for each claim.
 
                        Share Count means the amount of claims pointing to the same potential tokens reward.

                        */
                        node.payload.claimsProgram.share.count = node.payload.referenceParent.payload.claimsProgram.count
                        node.payload.claimsProgram.share.percentage = claimPowerToUse / node.payload.referenceParent.payload.claimsProgram.votes * 100
                        /*
                        Here we calculate the tokens awarded.
                        */
                        node.payload.claimsProgram.awarded.tokens = Math.min(
                            node.payload.referenceParent.payload.tokens * node.payload.claimsProgram.share.percentage / 100,
                            claimPowerToUse)
                        /*
                        Share Percentage is which is the percentage of the tokens available to be claimed, that this
                        claim is going to get.
                        */
                        node.payload.claimsProgram.awarded.percentage = node.payload.claimsProgram.awarded.tokens / node.payload.referenceParent.payload.tokens * 100
                        drawClaims(node)
                        drawProgramPower(node, programPower, percentage)
                    }
                }
            } else {
                if (node.type === 'Claims Program') {
                    drawProgram(node)
                } else {
                    drawProgramPower(node, programPower, percentage)
                }

            }

            let schemaDocument = getSchemaDocument(node)
            if (schemaDocument === undefined) { return }
            if (schemaDocument.childrenNodesProperties === undefined) { return }
            /*
            Before distributing the claim power, we will calculate how the power 
            is going to be switched between all nodes. The first pass is about
            scanning all sibling nodes to see which ones have a percentage defined
            at their config, and check that all percentages don't add more than 100.
            */
            let totalPercentage = 0
            let totalNodesWithoutPercentage = 0
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]
                switch (property.type) {
                    case 'node': {
                        let childNode = node[property.name]
                        if (childNode === undefined) { continue }
                        if (childNode.type === "Tokens Awarded") { continue }

                        let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                        if (percentage !== undefined && isNaN(percentage) !== true && percentage >= 0) {
                            totalPercentage = totalPercentage + percentage
                        } else {
                            totalNodesWithoutPercentage++
                        }
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                if (childNode === undefined) { continue }
                                if (childNode.type === "Tokens Awarded") { continue }

                                let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                if (percentage !== undefined && isNaN(percentage) !== true && percentage >= 0) {
                                    totalPercentage = totalPercentage + percentage
                                } else {
                                    totalNodesWithoutPercentage++
                                }
                            }
                        }
                        break
                    }
                }
            }
            if (totalPercentage > 100) {
                node.payload.uiObject.setErrorMessage(
                    'Claim Power Switching Error. Total Percentage of children nodes is grater that 100.',
                    UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
                )
                return
            }
            let defaultPercentage = 0
            if (totalNodesWithoutPercentage > 0) {
                defaultPercentage = (100 - totalPercentage) / totalNodesWithoutPercentage
            }
            for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                let property = schemaDocument.childrenNodesProperties[i]
                switch (property.type) {
                    case 'node': {
                        let childNode = node[property.name]
                        if (childNode === undefined) { continue }
                        if (childNode.type === "Tokens Awarded") { continue }

                        let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                        if (percentage === undefined || isNaN(percentage) || percentage < 0 === true) {
                            percentage = defaultPercentage
                        }
                        distributeProgramPower(childNode, programPower * percentage / 100, percentage, countingMode)
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                if (childNode === undefined) { continue }
                                if (childNode.type === "Tokens Awarded") { continue }

                                let percentage = UI.projects.visualScripting.utilities.nodeConfig.loadConfigProperty(childNode.payload, 'percentage')
                                if (percentage === undefined || isNaN(percentage) || percentage < 0 === true) {
                                    percentage = defaultPercentage
                                }
                                distributeProgramPower(childNode, programPower * percentage / 100, percentage, countingMode)
                            }
                        }
                        break
                    }
                }
            }
        }

        function calculateProgram(programNode) {
            /*
            Up to here, we have the tokens awarded for each claim. We need to consolidate all 
            of that into the Program Node, so that it can then be correctly placed at the Tokens Awarded Node.
            */
            consolidate(programNode)
            drawTokensAwarded(programNode)

            function consolidate(node) {
                if (node === undefined) { return }
                if (node.payload === undefined) { return }

                programNode.payload.claimsProgram.awarded.tokens = programNode.payload.claimsProgram.awarded.tokens + node.payload.claimsProgram.awarded.tokens
                if (node.payload.claimsProgram.awarded.tokens > 0) {
                    programNode.payload.claimsProgram.count = programNode.payload.claimsProgram.count + 1
                }

                let schemaDocument = getSchemaDocument(node)
                if (schemaDocument === undefined) { return }

                if (schemaDocument.childrenNodesProperties !== undefined) {
                    for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                        let property = schemaDocument.childrenNodesProperties[i]
                        switch (property.type) {
                            case 'node': {
                                let childNode = node[property.name]
                                consolidate(childNode)
                            }
                                break
                            case 'array': {
                                let propertyArray = node[property.name]
                                if (propertyArray !== undefined) {
                                    for (let m = 0; m < propertyArray.length; m++) {
                                        let childNode = propertyArray[m]
                                        consolidate(childNode)
                                    }
                                }
                                break
                            }
                        }
                    }
                }
            }
        }

        function drawClaims(node) {
            let status =
                parseFloat(node.payload.claimsProgram.awarded.tokens.toFixed(0)).toLocaleString('en') +
                ' ' + 'SA Tokens Awarded' + ' - ' +
                'From Reward: ' + node.payload.claimsProgram.awarded.percentage.toFixed(2) + '%' + ' - ' +
                'Shared Between: ' + node.payload.claimsProgram.share.count + ' claims' + ' - ' +
                'Share of Claims: ' + node.payload.claimsProgram.share.percentage.toFixed(2) + '%'

            node.payload.uiObject.setStatus(status, UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
        }

        function drawProgram(node) {
            if (node.payload !== undefined) {

                const ownPowerText = parseFloat(node.payload.claimsProgram.ownPower.toFixed(0)).toLocaleString('en')

                node.payload.uiObject.statusAngleOffset = 0
                node.payload.uiObject.statusAtAngle = false

                node.payload.uiObject.setStatus(ownPowerText + ' Claim Power', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
        }

        function drawTokensAwarded(node) {
            if (node.tokensAwarded !== undefined && node.tokensAwarded.payload !== undefined) {

                const tokensAwardedText = parseFloat(node.payload.claimsProgram.awarded.tokens.toFixed(0)).toLocaleString('en')
                const tokensAwardedBTC = ' ≃ ' + UI.projects.governance.utilities.conversions.estimateSATokensInBTC(node.payload.claimsProgram.awarded.tokens | 0) + '  BTC'

                node.tokensAwarded.payload.uiObject.valueAngleOffset = 0
                node.tokensAwarded.payload.uiObject.valueAtAngle = true
                node.tokensAwarded.payload.uiObject.statusAngleOffset = 0
                node.tokensAwarded.payload.uiObject.statusAtAngle = true

                node.tokensAwarded.payload.uiObject.setValue(tokensAwardedText + ' SA Tokens' + tokensAwardedBTC, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)
                node.tokensAwarded.payload.uiObject.setStatus('From ' + node.payload.claimsProgram.count + ' Claims.', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            }
        }

        function drawProgramPower(node, programPower, percentage) {
            const programPowerText = parseFloat(programPower).toLocaleString('en') + ' ' + 'Claim Power'
            if (node.payload !== undefined) {

                node.payload.uiObject.valueAngleOffset = 180
                node.payload.uiObject.valueAtAngle = true
                node.payload.uiObject.percentageAngleOffset = 180
                node.payload.uiObject.percentageAtAngle = true

                node.payload.uiObject.setValue(programPowerText, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)

                if (percentage !== undefined) {
                    node.payload.uiObject.setPercentage(percentage.toFixed(2),
                        UI.projects.governance.globals.designer.SET_PERCENTAGE_COUNTER
                    )
                }
            }
        }
    }

    function installMissingClaims(node, rootNodes) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage(
                'To Install Missing Claims you need a Reference Parent',
                UI.projects.governance.globals.designer.SET_ERROR_COUNTER_FACTOR
            )
            return
        }
        scanNodeBranch(node, node.payload.referenceParent)

        function scanNodeBranch(originNode, destinationNode) {
            if (
                destinationNode.type === 'Asset' ||
                destinationNode.type === 'Feature' ||
                destinationNode.type === 'Position'
            ) {
                originNode.name = destinationNode.name + ' ' + destinationNode.type + ' ' + ' Claim'
            } else {
                originNode.name = destinationNode.name + ' ' + destinationNode.type
            }

            let schemaDocument = getSchemaDocument(destinationNode)
            if (schemaDocument === undefined) { return }

            if (schemaDocument.childrenNodesProperties !== undefined) {
                for (let i = 0; i < schemaDocument.childrenNodesProperties.length; i++) {
                    let property = schemaDocument.childrenNodesProperties[i]

                    switch (property.type) {
                        case 'node': {

                            let destinationNodeChild = destinationNode[property.name]

                            let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                            let originNodeChild = UI.projects.visualScripting.utilities.nodeChildren.findChildReferencingThisNode(originNode, destinationNodeChild)

                            if (originNodeChild === undefined) {
                                originNodeChild = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                            }
                            UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(originNodeChild, destinationNodeChild)
                            scanNodeBranch(originNodeChild, destinationNodeChild)
                        }
                            break
                        case 'array': {
                            let propertyArray = destinationNode[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {

                                    let destinationNodeChild = propertyArray[m]

                                    let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                                    let originNodeChild = UI.projects.visualScripting.utilities.nodeChildren.findChildReferencingThisNode(originNode, destinationNodeChild)

                                    if (originNodeChild === undefined) {
                                        originNodeChild = UI.projects.visualScripting.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                                    }
                                    UI.projects.visualScripting.functionLibraries.attachDetach.referenceAttachNode(originNodeChild, destinationNodeChild)
                                    scanNodeBranch(originNodeChild, destinationNodeChild)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function getOriginNodeChildType(destinationNode) {
            let originNodeType

            switch (destinationNode.type) {
                case 'Asset Class': {
                    originNodeType = 'Asset Claims Folder'
                    break
                }
                case 'Feature Class': {
                    originNodeType = 'Feature Claims Folder'
                    break
                }
                case 'Position Class': {
                    originNodeType = 'Position Claims Folder'
                    break
                }
                case 'Asset': {
                    originNodeType = 'Asset Contribution Claim'
                    break
                }
                case 'Feature': {
                    originNodeType = 'Feature Contribution Claim'
                    break
                }
                case 'Position': {
                    originNodeType = 'Position Contribution Claim'
                    break
                }
            }
            return originNodeType
        }
    }
}