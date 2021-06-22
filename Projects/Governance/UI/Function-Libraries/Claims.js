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

        /* Claim Count Follows */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch.claimsProgram === undefined) { continue }
            userProfile.payload.claims = {
                awarded: {
                    tokens: 0
                },
                count: 0
            }
            countForNode(userProfile.tokenPowerSwitch.claimsProgram)
        }

        /* Claim Calculation Follows */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.payload === undefined) { continue }
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            if (userProfile.tokenPowerSwitch.claimsProgram === undefined) { continue }
            calculateForNode(userProfile.tokenPowerSwitch.claimsProgram, userProfile)
        }

        function resetClaims(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (
                node.type !== 'Asset Class' &&
                node.type !== 'Feature Class' &&
                node.type !== 'Position Class'
            ) {
                if (node.payload.votes !== undefined) {
                    node.payload.claims = {
                        count: 0,
                        votes: 0
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

        function countForNode(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (
                node.type !== 'Asset Claims Folder' &&
                node.type !== 'Feature Claims Folder' &&
                node.type !== 'Position Claims Folder' &&
                node.type !== 'Claims Program'
            ) {
                if (node.payload.claims === undefined) {
                    node.payload.claims = {
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
                }

                if (
                    node.payload.votes !== undefined &&
                    node.payload.votes > 0 &&
                    node.payload.referenceParent !== undefined &&
                    node.payload.referenceParent.payload !== undefined &&
                    node.payload.referenceParent.payload.votes !== undefined &&
                    node.payload.referenceParent.payload.votes > 0 &&
                    node.payload.referenceParent.payload.weight !== undefined &&
                    node.payload.referenceParent.payload.weight > 0 &&
                    node.payload.referenceParent.payload.claims.count !== undefined &&
                    node.payload.referenceParent.payload.claims.votes !== undefined
                ) {
                    node.payload.referenceParent.payload.claims.count++
                    node.payload.referenceParent.payload.claims.votes = node.payload.referenceParent.payload.claims.votes + node.payload.votes
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
                            countForNode(childNode)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    countForNode(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function calculateForNode(node, userProfile) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            if (
                node.type !== 'Asset Claims Folder' &&
                node.type !== 'Feature Claims Folder' &&
                node.type !== 'Position Claims Folder' &&
                node.type !== 'Claims Program'
            ) {
                if (
                    node.payload.claims !== undefined &&
                    node.payload.votes !== undefined &&
                    node.payload.votes > 0 &&
                    node.payload.referenceParent !== undefined &&
                    node.payload.referenceParent.payload !== undefined &&
                    node.payload.referenceParent.payload.votes !== undefined &&
                    node.payload.referenceParent.payload.votes > 0 &&
                    node.payload.referenceParent.payload.weight !== undefined &&
                    node.payload.referenceParent.payload.weight > 0 &&
                    node.payload.referenceParent.payload.claims.count !== undefined &&
                    node.payload.referenceParent.payload.claims.votes !== undefined
                ) {
                    /*
                    We will use the concept of Vote Reward Claims Ratio for the situation in which the 
                    total votes in claims exeeds the amount of votes of the reward. When this happens 
                    the Votes Rewards Claims Ratio will be used to redude the amount of tokens awarded 
                    proportionally to how much was exeeded.
                    */
                    let votesRatio = node.payload.referenceParent.payload.votes / node.payload.referenceParent.payload.claims.votes
                    if (votesRatio > 1) { votesRatio = 1 }
                    /*
                    Share Count means the amount to claims pointing to the same potential tokens reward.
                    */
                    node.payload.claims.share.count = node.payload.referenceParent.payload.claims.count
                    node.payload.claims.share.percentage = node.payload.votes * 100 / node.payload.referenceParent.payload.claims.votes
                    node.payload.claims.awarded.tokens =
                        Math.min(
                            node.payload.votes / node.payload.referenceParent.payload.votes * node.payload.referenceParent.payload.tokens * votesRatio,
                            node.payload.votes
                        )
                    node.payload.claims.awarded.percentage = node.payload.claims.awarded.tokens / node.payload.referenceParent.payload.tokens * 100

                    userProfile.payload.claims.awarded.tokens = userProfile.payload.claims.awarded.tokens + node.payload.claims.awarded.tokens
                    userProfile.payload.claims.count++

                    drawClaims(node, userProfile)
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
                            calculateForNode(childNode, userProfile)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    calculateForNode(childNode, userProfile)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function drawClaims(node, userProfile) {
            let satatus =
                new Intl.NumberFormat().format(node.payload.claims.awarded.tokens) +
                ' ' + 'SA Tokens Awarded' + ' - ' +
                'From Reward: ' + node.payload.claims.awarded.percentage.toFixed(2) + '%' + ' - ' +
                'Shared Between: ' + node.payload.claims.share.count + ' claims' + ' - ' +
                'Share of Claims: ' + node.payload.claims.share.percentage.toFixed(2) + '%'

            node.payload.uiObject.setStatus(satatus)

            satatus = new Intl.NumberFormat().format(userProfile.payload.claims.awarded.tokens) +
                ' ' + 'SA Tokens Awarded' +
                ' from ' + userProfile.payload.claims.count + ' Claims'

            userProfile.payload.uiObject.setValue(satatus)
        }
    }

    function installMissingClaims(node, rootNodes) {
        if (node.payload === undefined) { return }
        if (node.payload.referenceParent === undefined) {
            node.payload.uiObject.setErrorMessage('To Install Missing Claims you need a Reference Parent')
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
                            let originNodeChild = UI.projects.foundations.utilities.children.findChildReferencingThisNode(originNode, destinationNodeChild)

                            if (originNodeChild === undefined) {
                                originNodeChild = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                            }
                            originNodeChild.payload.referenceParent = destinationNodeChild
                            scanNodeBranch(originNodeChild, destinationNodeChild)
                        }
                            break
                        case 'array': {
                            let propertyArray = destinationNode[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {

                                    let destinationNodeChild = propertyArray[m]

                                    let originNodeChildType = getOriginNodeChildType(destinationNodeChild)
                                    let originNodeChild = UI.projects.foundations.utilities.children.findChildReferencingThisNode(originNode, destinationNodeChild)

                                    if (originNodeChild === undefined) {
                                        originNodeChild = UI.projects.foundations.functionLibraries.uiObjectsFromNodes.addUIObject(originNode, originNodeChildType)
                                    }
                                    originNodeChild.payload.referenceParent = destinationNodeChild
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