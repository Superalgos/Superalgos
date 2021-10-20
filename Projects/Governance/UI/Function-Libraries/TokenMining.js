function newGovernanceFunctionLibraryTokenMining() {
    let thisObject = {
        calculate: calculate
    }

    return thisObject

    function calculate(
        userProfiles
    ) {
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]
            if (userProfile.tokenPowerSwitch === undefined) { continue }
            resetTokensMined(userProfile)
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Referral Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "referralProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Support Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "supportProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Mentorship Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "mentorshipProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Influencer Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "influencerProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Claims Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "claimsProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Voting Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "votingProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Staking Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "stakingProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Delegation Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "delegationProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Github Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "githubProgram")
        }
        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }
            let program = UI.projects.governance.utilities.validations.onlyOneProgram(userProfile, "Airdrop Program")
            if (program === undefined) { continue }
            if (program.payload === undefined) { continue }

            calculateProgram(userProfile, program, "airdropProgram")
        }

        for (let i = 0; i < userProfiles.length; i++) {
            let userProfile = userProfiles[i]

            if (userProfile.tokenPowerSwitch === undefined) { continue }

            drawTokensMined(userProfile)
        }

        function resetTokensMined(userProfile) {
            if (userProfile === undefined) { return }
            if (userProfile.payload === undefined) { return }
            if (userProfile.tokensMined === undefined) { return }
            if (userProfile.tokensMined.payload === undefined) { return }
            if (userProfile.tokensMined.payload.tokensMined === undefined) {
                userProfile.tokensMined.payload.tokensMined = {
                    awarded: 0,
                    bonus: 0,
                    total: 0
                }
            } else {
                userProfile.tokensMined.payload.tokensMined.awarded = 0
                userProfile.tokensMined.payload.tokensMined.bonus = 0
                userProfile.tokensMined.payload.tokensMined.total = 0
            }
        }

        function calculateProgram(userProfile, programNode, programPropertyName) {
            /*
            Here we will look into the program node and add their token awarded and token bonus 
            to the subtotals at the Tokens Mined node.
            */
            if (userProfile === undefined) { return }
            if (userProfile.payload === undefined) { return }
            if (userProfile.tokensMined === undefined) { return }
            if (userProfile.tokensMined.payload === undefined) { return }
            
            if (programNode.payload === undefined) { return }
            if (programNode.payload[programPropertyName] === undefined) { return }

            if (programNode.tokensAwarded !== undefined && programNode.payload[programPropertyName].awarded !== undefined) {
                let awarded = programNode.payload[programPropertyName].awarded.tokens | 0
                userProfile.tokensMined.payload.tokensMined.awarded = userProfile.tokensMined.payload.tokensMined.awarded + awarded
            }
            if (programNode.tokensBonus !== undefined && programNode.payload[programPropertyName].bonus !== undefined) {
                let bonus = programNode.payload[programPropertyName].bonus.tokens | 0
                userProfile.tokensMined.payload.tokensMined.bonus = userProfile.tokensMined.payload.tokensMined.bonus + bonus
            }
            userProfile.tokensMined.payload.tokensMined.total = userProfile.tokensMined.payload.tokensMined.awarded + userProfile.tokensMined.payload.tokensMined.bonus
        }

        function drawTokensMined(userProfile) {
            if (userProfile === undefined) { return }
            if (userProfile.payload === undefined) { return }
            if (userProfile.tokensMined === undefined) { return }
            if (userProfile.tokensMined.payload === undefined) { return }

            const awarded = parseFloat(userProfile.tokensMined.payload.tokensMined.awarded.toFixed(0)).toLocaleString('en')
            const bonus = parseFloat(userProfile.tokensMined.payload.tokensMined.bonus.toFixed(0)).toLocaleString('en')
            const total = parseFloat(userProfile.tokensMined.payload.tokensMined.total.toFixed(0)).toLocaleString('en')
            const tokensAwardedBTC = ' ≃ ' + UI.projects.governance.utilities.conversions.estimateSATokensInBTC(userProfile.tokensMined.payload.tokensMined.total | 0) + '  BTC'

            userProfile.tokensMined.payload.uiObject.valueAngleOffset = 0
            userProfile.tokensMined.payload.uiObject.valueAtAngle = true

            userProfile.tokensMined.payload.uiObject.setStatus(awarded + ' Awarded + ' + bonus + ' Bonus', UI.projects.governance.globals.designer.SET_STATUS_COUNTER)
            userProfile.tokensMined.payload.uiObject.setValue(total + ' SA Tokens' + tokensAwardedBTC, UI.projects.governance.globals.designer.SET_VALUE_COUNTER)
        }
    }
}