function newGovernanceFunctionLibraryUserReferrals() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        userProfiles
    ) {
        /*
        We will first reset all the referral power, and then distribute it.
        */
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            resetUserReferrals(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            distributeForProfile(userProfile)
        }

        function resetUserReferrals(node) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }
            node.payload.referring = {
                count: 0,
                power: 0
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
            If there is a reference parent defined, this means that the referral power is 
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
            let referringPower = UI.projects.foundations.utilities.nodeConfig.loadConfigProperty(userProfile.payload, 'tokens')
            let referringCount = 0
            distributeUserReferrals(userProfile, referringPower, referringCount)
        }

        function distributeUserReferrals(node, referringPower, referringCount) {
            if (node === undefined) { return }
            if (node.payload === undefined) { return }

            node.payload.referring = {
                count: node.payload.referring.count + referringCount,
                power: node.payload.referring.power + referringPower
            }

            drawUserReferrals(node, node.payload.referring.count, node.payload.referring.power)
            /*
            If the node is a User Profile, we will check if it has a User Referrer child defined.
            */
            if (
                node.userReferrer !== undefined &&
                node.type === 'User Profile'
            ) {
                distributeUserReferrals(node.userReferrer, referringPower, 1, 0)
                return
            }
            /*
            If there is a reference parent defined, this means that the referral power is 
            transfered to it.
            */
            if (
                node.payload.referenceParent !== undefined &&
                node.type === 'User Referrer'
            ) {
                distributeUserReferrals(node.payload.referenceParent, referringPower / 10, 1)
                return
            }
        }

        function drawUserReferrals(node, count, power) {
            const powerText = new Intl.NumberFormat().format(power) + ' ' + 'Referring Power'
            if (node.payload !== undefined) {

                node.payload.uiObject.valueAngleOffset = 0
                node.payload.uiObject.valueAtAngle = false

                if (node.type === 'User Referrer') {
                    node.payload.uiObject.setStatus(powerText)
                    return
                }
                if (
                    (node.type === 'User Profile' &&
                        node.userReferrer !== undefined &&
                        node.userReferrer.payload !== undefined &&
                        node.userReferrer.payload.referenceParent !== undefined)
                    ||
                    power >= 10000000
                ) {
                    node.payload.uiObject.setStatus(powerText + ' - ' + count + ' Referrals')
                    return
                } else {
                    node.payload.uiObject.setStatus('Define your referrer to collect tokens from your referrals.')
                }
            }
        }
    }
}