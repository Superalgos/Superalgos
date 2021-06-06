function newGovernanceFunctionLibraryClaims() {
    let thisObject = {
        calculate: calculate
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
            let userProfilesNode = userProfiles[i]
            countForNode(userProfilesNode.contributionClaims)
        }

        /* Claim Calculation Follows */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfilesNode = userProfiles[i]
            calculateForNode(userProfilesNode.contributionClaims)
        }
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
                node.payload.claimsCount = 0
                node.payload.claimsVotes = 0
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
            node.type !== 'Asset Contributions Folder' &&
            node.type !== 'Feature Contributions Folder' &&
            node.type !== 'Position Contributions Folder' &&
            node.type !== 'Contribution Claims'
        ) {
            if (
                node.payload.votes !== undefined &&
                node.payload.votes > 0 &&
                node.payload.referenceParent !== undefined &&
                node.payload.referenceParent.payload.votes !== undefined &&
                node.payload.referenceParent.payload.votes > 0 &&
                node.payload.referenceParent.payload.weight !== undefined &&
                node.payload.referenceParent.payload.weight > 0 &&
                node.payload.referenceParent.payload.claimsCount !== undefined &&
                node.payload.referenceParent.payload.claimsVotes !== undefined
            ) {
                node.payload.referenceParent.payload.claimsCount++
                node.payload.referenceParent.payload.claimsVotes = node.payload.referenceParent.payload.claimsVotes + node.payload.votes
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

    function calculateForNode(node) {
        if (node === undefined) { return }
        if (node.payload === undefined) { return }

        if (
            node.type !== 'Asset Contributions Folder' &&
            node.type !== 'Feature Contributions Folder' &&
            node.type !== 'Position Contributions Folder' &&
            node.type !== 'Contribution Claims'
        ) {
            if (
                node.payload.votes !== undefined &&
                node.payload.votes > 0 &&
                node.payload.referenceParent !== undefined &&
                node.payload.referenceParent.payload.votes !== undefined &&
                node.payload.referenceParent.payload.votes > 0 &&
                node.payload.referenceParent.payload.weight !== undefined &&
                node.payload.referenceParent.payload.weight > 0 &&
                node.payload.referenceParent.payload.claimsCount !== undefined &&
                node.payload.referenceParent.payload.claimsVotes !== undefined
            ) {
                /*
                We will use the concept of Vote Ratio for the situation in which the total votes in claims exeeds the
                amount of votes for wigthing. When this happen the Votes Ratio will be used to redude the amount of 
                tokens awarded proportionally to how much was exeeded.
                */
                let votesRatio = node.payload.referenceParent.payload.votes / node.payload.referenceParent.payload.claimsVotes
                if (votesRatio > 1) { votesRatio = 1 }
                /*
                 Share Count means the amount to claims pointing to the same potential tokens reward.
                */
                let shareCount = node.payload.referenceParent.payload.claimsCount
                let sharePercentage = node.payload.votes * 100 / node.payload.referenceParent.payload.claimsVotes
                let awarded = node.payload.votes / node.payload.referenceParent.payload.votes * node.payload.referenceParent.payload.tokens * votesRatio
                let awardedPercentage = node.payload.votes / node.payload.referenceParent.payload.votes * 100 * votesRatio

                drawClaims(node, shareCount, sharePercentage, awarded, awardedPercentage)
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
                        calculateForNode(childNode)
                    }
                        break
                    case 'array': {
                        let propertyArray = node[property.name]
                        if (propertyArray !== undefined) {
                            for (let m = 0; m < propertyArray.length; m++) {
                                let childNode = propertyArray[m]
                                calculateForNode(childNode)
                            }
                        }
                        break
                    }
                }
            }
        }
    }

    function drawClaims(node, shareCount, sharePercentage, awarded, awardedPercentage) {
        let satatus =
            'Awarded: ' +
            new Intl.NumberFormat().format(awarded) +
            ' ' + 'SA Tokens' + ' - ' +
            'From Reward: ' + awardedPercentage.toFixed(2) + '%' + ' - ' +
            'Shared Between: ' + shareCount + ' claims' + ' - ' +
            'Share of Claims: ' + sharePercentage.toFixed(2) + '%'
        node.payload.uiObject.setStatus(satatus)
    }
}