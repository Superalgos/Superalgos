function newGovernanceFunctionLibraryUserReferrals() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        pools,
        userProfiles
    ) {
        let tokensReward
        let totalReferralsPower = 0

        /* Scan Pools Until finding the User-Referrlas Pool */
        for (let i = 0; i < pools.length; i++) {
            let poolsNode = pools[i]
            findPool(poolsNode)
        }
        if (tokensReward === undefined || tokensReward === 0) { return }
        /*
        We will first reset all the referral combinedPower, and then distribute it.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            resetUserReferrals(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            distributeForProfile(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            calculateAwardedForProfile(userProfile)
        }

        function findPool(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            /*
            When we reach certain node types, we will halt the distribution, because these are targets for 
            voting combinedPower.
            */
            if (
                node.type === 'Pool'
            ) {
                let codeName = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(node.payload, 'codeName')
                if (codeName === "User-Referrals") {
                    tokensReward = node.payload.tokens
                    return
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
                            findPool(childNode)
                        }
                            break
                        case 'array': {
                            let propertyArray = node[property.name]
                            if (propertyArray !== undefined) {
                                for (let m = 0; m < propertyArray.length; m++) {
                                    let childNode = propertyArray[m]
                                    findPool(childNode)
                                }
                            }
                            break
                        }
                    }
                }
            }
        }

        function resetUserReferrals(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload.referring = {
                count: 0,
                combinedPower: 0,
                ownPower: 0,
                referralsPower: 0,
                awarded: {
                    tokens: 0,
                    percentage: 0
                }
            }
            /*
            If the node is a User Profile, we will check if it has a User Referrer child defined.
            */
            if (
                node.userReferrer !== undefined &&
                node.type === 'User Profile'
            ) {
                resetUserReferrals(node.userReferrer)
                return
            }
            /*
            If there is a reference parent defined, this means that the referral combinedPower is 
            transfered to it.
            */
            if (
                node.payload.referenceParent !== undefined &&
                node.type === 'User Referrer'
            ) {
                resetUserReferrals(node.payload.referenceParent)
                return
            }
        }

        function distributeForProfile(userProfile) {
            if (userProfile === undefined || userProfile.payload === undefined) { return }
            let referringPower = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'tokens')
            let referringCount = 0
            userProfile.payload.referring.ownPower = referringPower
            distributeUserReferrals(userProfile, referringPower, referringCount)
        }

        function distributeUserReferrals(node, referringPower, referringCount) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            node.payload.referring.count = node.payload.referring.count + referringCount
            node.payload.referring.combinedPower = node.payload.referring.combinedPower + referringPower
            /*
            If the node is a User Profile, we will check if it has a User Referrer child defined.
            */
            totalReferralsPower = totalReferralsPower - node.payload.referring.referralsPower
            node.payload.referring.referralsPower = node.payload.referring.combinedPower - node.payload.referring.ownPower
            totalReferralsPower = totalReferralsPower + node.payload.referring.referralsPower
            if (
                node.userReferrer !== undefined &&
                node.type === 'User Profile'
            ) {
                distributeUserReferrals(node.userReferrer, referringPower, 1, 0)
                return
            }
            /*
            If there is a reference parent defined, this means that the referral combinedPower is 
            transfered to it.
            */
            if (
                node.payload.referenceParent !== undefined &&
                node.type === 'User Referrer'
            ) {
                drawUserReferrals(node)
                distributeUserReferrals(node.payload.referenceParent, referringPower / 10, 1)
                return
            }
        }

        function calculateAwardedForProfile(userProfile) {
            let totalPowerRewardRation = tokensReward / totalReferralsPower
            if (totalPowerRewardRation < 1) { totalPowerRewardRation = 1 }

            userProfile.payload.referring.awarded.tokens = userProfile.payload.referring.referralsPower * totalPowerRewardRation
            drawUserProfiles(userProfile)
        }

        function drawUserReferrals(node) {
            if (node.payload !== undefined) {
                const powerText = new Intl.NumberFormat().format(node.payload.referring.combinedPower)

                node.payload.uiObject.valueAngleOffset = 0
                node.payload.uiObject.valueAtAngle = false

                node.payload.uiObject.setStatus(powerText + ' ' + 'Combined Referring Power')
                return
            }
        }

        function drawUserProfiles(node) {
            if (node.payload !== undefined) {
                const powerText = new Intl.NumberFormat().format(node.payload.referring.combinedPower)
                const awardedTokens = new Intl.NumberFormat().format(node.payload.referring.awarded.tokens)
                const referralPower = new Intl.NumberFormat().format(node.payload.referring.referralsPower)

                node.payload.uiObject.valueAngleOffset = 0
                node.payload.uiObject.valueAtAngle = false

                if (
                    (
                        node.userReferrer !== undefined &&
                        node.userReferrer.payload !== undefined &&
                        node.userReferrer.payload.referenceParent !== undefined)
                    ||
                    node.payload.referring.combinedPower >= 10000000
                ) {
                    let status =
                        powerText + ' ' + 'Combined Referring Power' + ' - ' +
                        node.payload.referring.count + ' Referrals' + ' - ' +
                        referralPower + ' Referrals Power' + ' - ' +
                        awardedTokens + ' ' + 'SA Tokens Awarded'

                    node.payload.uiObject.setStatus(status)
                    return
                } else {
                    node.payload.referring.awarded.tokens = 0
                    node.payload.uiObject.setStatus(awardedTokens + ' SA Tokens not Awarded, because you have not defined your referrer yet.')
                }
            }
        }
    }
}